import uuid
from datetime import datetime, date, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Booking, Provider, User, Notification, BookingStatus, UserRole
from app.schemas.schemas import BookingCreate, BookingStatusUpdate, BookingOut
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only CUSTOMER (or ADMIN) can create bookings
    if current_user.role == UserRole.PROVIDER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Service providers cannot create customer bookings."
        )

    provider = db.query(Provider).filter(Provider.id == payload.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Reject bookings for non-APPROVED providers
    if provider.status != "APPROVED":
        raise HTTPException(
            status_code=400,
            detail="Selected provider is not currently approved to accept bookings."
        )

    # Date and Time sanity check
    try:
        booking_date = datetime.strptime(payload.date, "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        if booking_date < today:
            raise HTTPException(status_code=400, detail="Booking date cannot be in the past.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if not payload.time or not payload.time.strip():
        raise HTTPException(status_code=400, detail="Time slot is required.")

    # DOUBLE BOOKING PREVENTION CHECK across all active statuses
    existing_conflict = db.query(Booking).filter(
        Booking.provider_id == payload.provider_id,
        Booking.date == payload.date,
        Booking.time == payload.time,
        Booking.status.in_([
            BookingStatus.PENDING.value,
            BookingStatus.ACCEPTED.value,
            BookingStatus.ON_THE_WAY.value,
            BookingStatus.STARTED.value
        ])
    ).first()

    if existing_conflict:
        raise HTTPException(
            status_code=400,
            detail=f"Provider is already booked for {payload.date} at {payload.time}. Please select another time slot."
        )

    ref = f"BK-{uuid.uuid4().hex[:6].upper()}"
    booking = Booking(
        booking_reference=ref,
        customer_id=current_user.id,
        provider_id=payload.provider_id,
        service_id=payload.service_id,
        category_name=provider.category,
        date=payload.date,
        time=payload.time,
        address=payload.address,
        description=payload.description,
        price=provider.hourly_rate,
        status=BookingStatus.PENDING.value
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Notify Provider & Customer
    prov_user = db.query(User).filter(User.id == provider.user_id).first()
    if prov_user:
        db.add(Notification(
            user_id=prov_user.id,
            title="New Booking Request!",
            message=f"New booking #{ref} received for {payload.date} at {payload.time}.",
            notification_type="booking"
        ))
    db.add(Notification(
        user_id=current_user.id,
        title="Booking Created",
        message=f"Your booking request #{ref} with {provider.category} is pending confirmation.",
        notification_type="booking"
    ))
    db.commit()

    provider_user = db.query(User).filter(User.id == provider.user_id).first()
    return BookingOut(
        id=booking.id,
        booking_reference=booking.booking_reference,
        customer_id=booking.customer_id,
        provider_id=booking.provider_id,
        provider_name=provider_user.full_name if provider_user else "Provider",
        category_name=booking.category_name,
        date=booking.date,
        time=booking.time,
        address=booking.address,
        description=booking.description,
        price=booking.price,
        status=booking.status,
        created_at=booking.created_at
    )


@router.get("/my", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.PROVIDER.value and current_user.provider_profile:
        bookings = db.query(Booking).filter(Booking.provider_id == current_user.provider_profile.id).order_by(Booking.id.desc()).all()
    else:
        bookings = db.query(Booking).filter(Booking.customer_id == current_user.id).order_by(Booking.id.desc()).all()

    results = []
    for b in bookings:
        p = db.query(Provider).filter(Provider.id == b.provider_id).first()
        p_user = db.query(User).filter(User.id == p.user_id).first() if p else None
        results.append(BookingOut(
            id=b.id,
            booking_reference=b.booking_reference,
            customer_id=b.customer_id,
            provider_id=b.provider_id,
            provider_name=p_user.full_name if p_user else "Provider",
            category_name=b.category_name,
            date=b.date,
            time=b.time,
            address=b.address,
            description=b.description,
            price=b.price,
            status=b.status,
            created_at=b.created_at
        ))
    return results


@router.put("/{id}/status", response_model=BookingOut)
def update_booking_status(
    id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_status = payload.status
    valid_statuses = [e.value for e in BookingStatus]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    is_admin = current_user.role == UserRole.ADMIN.value
    is_customer = current_user.id == booking.customer_id
    is_provider = current_user.provider_profile and current_user.provider_profile.id == booking.provider_id

    # Enforce Authorization
    if not (is_admin or is_customer or is_provider):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this booking."
        )

    if is_customer and not is_admin:
        if new_status != BookingStatus.CANCELLED.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customers may only cancel bookings."
            )
        if booking.status not in [BookingStatus.PENDING.value, BookingStatus.ACCEPTED.value]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel booking once it is in {booking.status} state."
            )

    if is_provider and not is_admin:
        allowed_provider_statuses = [
            BookingStatus.ACCEPTED.value,
            BookingStatus.REJECTED.value,
            BookingStatus.ON_THE_WAY.value,
            BookingStatus.STARTED.value,
            BookingStatus.COMPLETED.value
        ]
        if new_status not in allowed_provider_statuses:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Providers cannot set this status."
            )

    # State Machine Transitions Validation
    current_st = booking.status
    allowed_transitions = {
        BookingStatus.PENDING.value: [BookingStatus.ACCEPTED.value, BookingStatus.REJECTED.value, BookingStatus.CANCELLED.value],
        BookingStatus.ACCEPTED.value: [BookingStatus.ON_THE_WAY.value, BookingStatus.STARTED.value, BookingStatus.CANCELLED.value],
        BookingStatus.ON_THE_WAY.value: [BookingStatus.STARTED.value, BookingStatus.CANCELLED.value],
        BookingStatus.STARTED.value: [BookingStatus.COMPLETED.value],
        BookingStatus.COMPLETED.value: [],
        BookingStatus.REJECTED.value: [],
        BookingStatus.CANCELLED.value: []
    }

    if current_st != new_status and not is_admin:
        valid_next = allowed_transitions.get(current_st, [])
        if new_status not in valid_next:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid transition from '{current_st}' to '{new_status}'."
            )

    # Increment completed_bookings only once when entering COMPLETED status
    old_status = booking.status
    booking.status = new_status
    if old_status != BookingStatus.COMPLETED.value and new_status == BookingStatus.COMPLETED.value:
        p = db.query(Provider).filter(Provider.id == booking.provider_id).first()
        if p:
            p.completed_bookings = (p.completed_bookings or 0) + 1

    db.commit()
    db.refresh(booking)

    # Send Notification to Customer
    db.add(Notification(
        user_id=booking.customer_id,
        title=f"Booking {new_status.replace('_', ' ').title()}",
        message=f"Your booking #{booking.booking_reference} has been updated to {new_status}.",
        notification_type="booking"
    ))
    db.commit()

    p = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    p_user = db.query(User).filter(User.id == p.user_id).first() if p else None

    return BookingOut(
        id=booking.id,
        booking_reference=booking.booking_reference,
        customer_id=booking.customer_id,
        provider_id=booking.provider_id,
        provider_name=p_user.full_name if p_user else "Provider",
        category_name=booking.category_name,
        date=booking.date,
        time=booking.time,
        address=booking.address,
        description=booking.description,
        price=booking.price,
        status=booking.status,
        created_at=booking.created_at
    )
