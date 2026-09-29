from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Review, Booking, Provider, User, BookingStatus, Notification
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Reviews & Ratings"])


@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Rule: Only customers who completed a booking with that provider can review them
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review your own bookings")

    if booking.status != BookingStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Only COMPLETED bookings can be reviewed")

    existing = db.query(Review).filter(Review.booking_id == payload.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a review for this booking")

    review = Review(
        booking_id=payload.booking_id,
        customer_id=current_user.id,
        provider_id=booking.provider_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(review)

    # Dynamically recalculate provider average rating
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    if provider:
        all_reviews = db.query(Review).filter(Review.provider_id == provider.id).all()
        ratings = [r.rating for r in all_reviews] + [payload.rating]
        provider.rating = round(sum(ratings) / len(ratings), 2)
        provider.review_count = len(ratings)

        prov_user = db.query(User).filter(User.id == provider.user_id).first()
        if prov_user:
            db.add(Notification(
                user_id=prov_user.id,
                title="New Review Received!",
                message=f"You received a {payload.rating}-star review from {current_user.full_name}.",
                notification_type="review"
            ))

    db.commit()
    db.refresh(review)

    return ReviewOut(
        id=review.id,
        booking_id=review.booking_id,
        provider_id=review.provider_id,
        customer_name=current_user.full_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at
    )


@router.get("/providers/{id}/reviews", response_model=List[ReviewOut])
def get_provider_reviews(id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.provider_id == id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        c_user = db.query(User).filter(User.id == r.customer_id).first()
        results.append(ReviewOut(
            id=r.id,
            booking_id=r.booking_id,
            provider_id=r.provider_id,
            customer_name=c_user.full_name if c_user else "Customer",
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at
        ))
    return results
