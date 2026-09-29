from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Provider, Booking, Complaint, ServiceCategory, ProviderStatus, UserRole, BookingStatus, Notification
from app.schemas.schemas import UserOut, ProviderOut, BookingOut, ComplaintOut
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])


@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db), admin=Depends(get_current_admin)) -> Dict[str, Any]:
    total_users = db.query(User).filter(User.role == UserRole.CUSTOMER.value).count()
    total_providers = db.query(Provider).count()
    pending_providers = db.query(Provider).filter(Provider.status == ProviderStatus.PENDING.value).count()
    approved_providers = db.query(Provider).filter(Provider.status == ProviderStatus.APPROVED.value).count()
    total_bookings = db.query(Booking).count()
    completed_bookings = db.query(Booking).filter(Booking.status == BookingStatus.COMPLETED.value).count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == BookingStatus.CANCELLED.value).count()
    
    total_revenue = db.query(Booking).filter(Booking.status == BookingStatus.COMPLETED.value).all()
    revenue_sum = sum(b.price for b in total_revenue)

    active_services = db.query(ServiceCategory).filter(ServiceCategory.active == True).count()

    return {
        "total_users": total_users,
        "total_providers": total_providers,
        "pending_providers": pending_providers,
        "approved_providers": approved_providers,
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_revenue": revenue_sum,
        "active_services": active_services
    }


@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    users = db.query(User).all()
    return [
        UserOut(
            id=u.id,
            name=u.full_name,
            email=u.email,
            mobile=u.mobile_number,
            role=u.role,
            location=u.location,
            city=u.city
        ) for u in users
    ]


@router.get("/providers", response_model=List[ProviderOut])
def get_all_providers(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    providers = db.query(Provider).all()
    results = []
    for p in providers:
        u = db.query(User).filter(User.id == p.user_id).first()
        results.append(ProviderOut(
            id=p.id,
            userId=p.user_id,
            name=u.full_name if u else "Provider",
            email=u.email if u else "",
            mobile=u.mobile_number if u else "",
            avatar=p.avatar,
            category=p.category or "General",
            experienceYears=p.experience_years or 1,
            hourlyRate=p.hourly_rate or 30.0,
            city=p.city or "",
            location=p.location or "",
            rating=p.rating or 5.0,
            reviewCount=p.review_count or 0,
            completedBookings=p.completed_bookings or 0,
            status=p.status,
            description=p.description or "",
            bio=p.bio or "",
            availableDays=p.available_days or ["Monday", "Tuesday", "Wednesday"],
            workingHours=p.working_hours or "08:00 AM - 06:00 PM"
        ))
    return results


@router.put("/providers/{id}/approve")
def approve_provider(id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    provider = db.query(Provider).filter(Provider.id == id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    provider.status = ProviderStatus.APPROVED.value
    
    # Notify provider
    db.add(Notification(
        user_id=provider.user_id,
        title="Account Approved!",
        message="Congratulations! Your provider profile has been APPROVED by Admin. You can now accept live customer bookings.",
        notification_type="approval"
    ))
    db.commit()
    return {"message": "Provider approved successfully", "status": provider.status}


@router.put("/providers/{id}/reject")
def reject_provider(id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    provider = db.query(Provider).filter(Provider.id == id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider.status = ProviderStatus.REJECTED.value

    db.add(Notification(
        user_id=provider.user_id,
        title="Account Application Status",
        message="Your provider application was not approved. Please contact support.",
        notification_type="approval"
    ))
    db.commit()
    return {"message": "Provider rejected", "status": provider.status}


@router.get("/bookings", response_model=List[BookingOut])
def get_admin_bookings(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    bookings = db.query(Booking).order_by(Booking.id.desc()).all()
    results = []
    for b in bookings:
        p = db.query(Provider).filter(Provider.id == b.provider_id).first()
        pu = db.query(User).filter(User.id == p.user_id).first() if p else None
        results.append(BookingOut(
            id=b.id,
            booking_reference=b.booking_reference,
            customer_id=b.customer_id,
            provider_id=b.provider_id,
            provider_name=pu.full_name if pu else "Provider",
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


@router.get("/complaints", response_model=List[ComplaintOut])
def get_admin_complaints(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()
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
