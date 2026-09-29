import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    PROVIDER = "PROVIDER"
    ADMIN = "ADMIN"


class ProviderStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    ON_THE_WAY = "ON_THE_WAY"
    STARTED = "STARTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ComplaintStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    mobile_number = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.CUSTOMER.value, nullable=False)
    location = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    provider_profile = relationship("Provider", back_populates="user", uselist=False, cascade="all, delete-orphan")
    customer_bookings = relationship("Booking", back_populates="customer", foreign_keys="[Booking.customer_id]")
    reviews = relationship("Review", back_populates="customer")
    complaints = relationship("Complaint", back_populates="customer")
    notifications = relationship("Notification", back_populates="user")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    active = Column(Boolean, default=True)
    count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    services = relationship("Service", back_populates="category")
    providers = relationship("Provider", back_populates="category_rel")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Float, default=0.0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    category = relationship("ServiceCategory", back_populates="services")
    provider_associations = relationship("ProviderService", back_populates="service")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    service_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    category = Column(String(100), nullable=True)
    experience_years = Column(Integer, default=1)
    hourly_rate = Column(Float, default=30.0)
    description = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    status = Column(String(20), default=ProviderStatus.PENDING.value, nullable=False)
    working_hours = Column(String(100), default="08:00 AM - 06:00 PM")
    available_days = Column(JSON, default=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    completed_bookings = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="provider_profile")
    category_rel = relationship("ServiceCategory", back_populates="providers")
    bookings = relationship("Booking", back_populates="provider", foreign_keys="[Booking.provider_id]")
    reviews = relationship("Review", back_populates="provider")
    services = relationship("ProviderService", back_populates="provider")
    availability = relationship("ProviderAvailability", back_populates="provider")


class ProviderService(Base):
    __tablename__ = "provider_services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)

    provider = relationship("Provider", back_populates="services")
    service = relationship("Service", back_populates="provider_associations")


class ProviderAvailability(Base):
    __tablename__ = "provider_availability"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False)
    start_time = Column(String(10), default="08:00")
    end_time = Column(String(10), default="18:00")
    is_available = Column(Boolean, default=True)

    provider = relationship("Provider", back_populates="availability")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(30), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    category_name = Column(String(100), nullable=True)
    date = Column(String(20), nullable=False)
    time = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    status = Column(String(20), default=BookingStatus.PENDING.value, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    customer = relationship("User", back_populates="customer_bookings", foreign_keys=[customer_id])
    provider = relationship("Provider", back_populates="bookings", foreign_keys=[provider_id])
    reviews = relationship("Review", back_populates="booking")
    complaints = relationship("Complaint", back_populates="booking")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    booking = relationship("Booking", back_populates="reviews")
    customer = relationship("User", back_populates="reviews")
    provider = relationship("Provider", back_populates="reviews")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_reference = Column(String(30), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    complaint_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default=ComplaintStatus.OPEN.value, nullable=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    booking = relationship("Booking", back_populates="complaints")
    customer = relationship("User", back_populates="complaints")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="system")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")
