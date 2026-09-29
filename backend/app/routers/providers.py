from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Provider, User, ProviderStatus
from app.schemas.schemas import ProviderOut
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/providers", tags=["Service Providers"])


@router.get("", response_model=List[ProviderOut])
def get_providers(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    status_filter: Optional[str] = Query("APPROVED"),
    db: Session = Depends(get_db)
):
    query = db.query(Provider)
    if status_filter:
        query = query.filter(Provider.status == status_filter)

    if category:
        query = query.filter(Provider.category.ilike(f"%{category}%"))
    if location:
        query = query.filter(
            (Provider.location.ilike(f"%{location}%")) | (Provider.city.ilike(f"%{location}%"))
        )
    if min_rating is not None:
        query = query.filter(Provider.rating >= min_rating)
    if max_price is not None:
        query = query.filter(Provider.hourly_rate <= max_price)

    providers = query.all()
    results = []
    for p in providers:
        user = db.query(User).filter(User.id == p.user_id).first()
        results.append(ProviderOut(
            id=p.id,
            userId=p.user_id,
            name=user.full_name if user else "Provider",
            email=user.email if user else "",
            mobile=user.mobile_number if user else "",
            avatar=p.avatar,
            category=p.category or "General Service",
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
            availableDays=p.available_days or ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            workingHours=p.working_hours or "08:00 AM - 06:00 PM"
        ))
    return results


@router.get("/{id}", response_model=ProviderOut)
def get_provider_details(id: int, db: Session = Depends(get_db)):
    p = db.query(Provider).filter(Provider.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    user = db.query(User).filter(User.id == p.user_id).first()
    return ProviderOut(
        id=p.id,
        userId=p.user_id,
        name=user.full_name if user else "Provider",
        email=user.email if user else "",
        mobile=user.mobile_number if user else "",
        avatar=p.avatar,
        category=p.category or "General Service",
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
        availableDays=p.available_days or ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        workingHours=p.working_hours or "08:00 AM - 06:00 PM"
    )
