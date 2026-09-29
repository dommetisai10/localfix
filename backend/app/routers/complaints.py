import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Complaint, Booking, User, ComplaintStatus, UserRole, Notification
from app.schemas.schemas import ComplaintCreate, ComplaintStatusUpdate, ComplaintOut
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])


@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit complaints for your own bookings."
        )

    ref = f"CMP-{uuid.uuid4().hex[:6].upper()}"
    complaint = Complaint(
        complaint_reference=ref,
        booking_id=payload.booking_id,
        customer_id=current_user.id,
        complaint_type=payload.complaint_type,
        description=payload.description,
        status=ComplaintStatus.OPEN.value
    )
    db.add(complaint)

    # Notify Admins of new complaint
    admins = db.query(User).filter(User.role == UserRole.ADMIN.value).all()
    for admin in admins:
        db.add(Notification(
            user_id=admin.id,
            title="New Complaint Logged",
            message=f"New complaint #{ref} ({payload.complaint_type}) submitted by {current_user.full_name}.",
            notification_type="complaint"
        ))

    db.commit()
    db.refresh(complaint)

    return ComplaintOut(
        id=complaint.id,
        complaint_reference=complaint.complaint_reference,
        booking_id=complaint.booking_id,
        customer_id=complaint.customer_id,
        complaint_type=complaint.complaint_type,
        description=complaint.description,
        status=complaint.status,
        ai_summary=complaint.ai_summary,
        created_at=complaint.created_at
    )


@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.ADMIN.value:
        complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()
    else:
        complaints = db.query(Complaint).filter(Complaint.customer_id == current_user.id).order_by(Complaint.id.desc()).all()

    return [
        ComplaintOut(
            id=c.id,
            complaint_reference=c.complaint_reference,
            booking_id=c.booking_id,
            customer_id=c.customer_id,
            complaint_type=c.complaint_type,
            description=c.description,
            status=c.status,
            ai_summary=c.ai_summary,
            created_at=c.created_at
        ) for c in complaints
    ]


@router.put("/{id}", response_model=ComplaintOut)
def update_complaint_status(
    id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Only admins can update complaint status")

    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = payload.status
    db.commit()
    db.refresh(complaint)

    return ComplaintOut(
        id=complaint.id,
        complaint_reference=complaint.complaint_reference,
        booking_id=complaint.booking_id,
        customer_id=complaint.customer_id,
        complaint_type=complaint.complaint_type,
        description=complaint.description,
        status=complaint.status,
        ai_summary=complaint.ai_summary,
        created_at=complaint.created_at
    )
