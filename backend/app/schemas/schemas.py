from typing import Optional, List, Any, Union
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


# User Schemas
class UserRegister(BaseModel):
    name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john@example.com")
    mobile: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: Optional[str] = "CUSTOMER"
    location: Optional[str] = None
    city: Optional[str] = None


class ProviderRegister(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str
    address: Optional[str] = None
    city: str
    category: str
    experienceYears: int = 1
    hourlyRate: float = 30.0
    description: Optional[str] = None
    workingHours: Optional[str] = "08:00 AM - 06:00 PM"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    mobile: Optional[str] = None
    role: str
    location: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Service Schemas
class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image: Optional[str]
    active: bool
    count: int

    class Config:
        from_attributes = True


class ServiceOut(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str]
    base_price: float
    active: bool

    class Config:
        from_attributes = True


# Provider Schemas
class ProviderOut(BaseModel):
    id: int
    userId: int
    name: str
    email: str
    mobile: Optional[str]
    avatar: Optional[str]
    category: str
    experienceYears: int
    hourlyRate: float
    city: Optional[str]
    location: Optional[str]
    rating: float
    reviewCount: int
    completedBookings: int
    status: str
    description: Optional[str]
    bio: Optional[str]
    availableDays: List[str]
    workingHours: Optional[str]

    class Config:
        from_attributes = True


# Booking Schemas
class BookingCreate(BaseModel):
    provider_id: int
    service_id: Optional[int] = None
    date: str
    time: str
    address: str
    description: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: str  # PENDING, ACCEPTED, REJECTED, ON_THE_WAY, STARTED, COMPLETED, CANCELLED


class BookingOut(BaseModel):
    id: int
    booking_reference: str
    customer_id: int
    provider_id: int
    provider_name: Optional[str] = None
    category_name: Optional[str] = None
    date: str
    time: str
    address: str
    description: Optional[str]
    price: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Review Schemas
class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    provider_id: int
    customer_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Complaint Schemas
class ComplaintCreate(BaseModel):
    booking_id: int
    complaint_type: str
    description: str


class ComplaintStatusUpdate(BaseModel):
    status: str  # OPEN, IN_PROGRESS, RESOLVED, REJECTED


class ComplaintOut(BaseModel):
    id: int
    complaint_reference: str
    booking_id: int
    customer_id: int
    complaint_type: str
    description: str
    status: str
    ai_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# AI Request Schemas
class AiChatRequest(BaseModel):
    prompt: str


class AiRecommendationRequest(BaseModel):
    issue_description: str


class AiProviderDescriptionRequest(BaseModel):
    name: str
    category: str
    experienceYears: Union[int, str]
    city: Optional[str] = "Local Area"


class AiComplaintSummaryRequest(BaseModel):
    description: str
