import uuid
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
    provider = db.query(Provider).filter(Provider.id == payload.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # DOUBLE BOOKING PREVENTION CHECK
    existing_conflict = db.query(Booking).filter(
        Booking.provider_id == payload.provider_id,
        Booking.date == payload.date,
        Booking.time == payload.time,
        Booking.status.in_([BookingStatus.PENDING.value, BookingStatus.ACCEPTED.value, BookingStatus.STARTED.value])
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

    valid_statuses = [e.value for e in BookingStatus]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    booking.status = payload.status
    if payload.status == BookingStatus.COMPLETED.value:
        p = db.query(Provider).filter(Provider.id == booking.provider_id).first()
        if p:
            p.completed_bookings = (p.completed_bookings or 0) + 1

    db.commit()
    db.refresh(booking)

    # Send Notification to Customer
    db.add(Notification(
        user_id=booking.customer_id,
        title=f"Booking {payload.status.replace('_', ' ').title()}",
        message=f"Your booking #{booking.booking_reference} has been updated to {payload.status}.",
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
