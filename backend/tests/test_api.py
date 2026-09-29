import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment
os.environ["ENVIRONMENT"] = "development"
os.environ["JWT_SECRET"] = "testsecret123456789012345678901234567890"
os.environ["ADMIN_EMAIL"] = "admin@test.com"
os.environ["ADMIN_PASSWORD"] = "Admin123!"

from app.main import app
from app.database import Base, get_db
from app.models.models import User, Provider, ServiceCategory, Booking, Review, UserRole, ProviderStatus, BookingStatus
from app.utils.security import hash_password
from app.services.gemini import generate_service_recommendation

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed category
    cat = ServiceCategory(name="AC Repair", description="Air conditioning repair", count=1)
    db.add(cat)
    
    # Seed Admin
    admin = User(
        full_name="Admin User",
        email="admin@test.com",
        password_hash=hash_password("Admin123!"),
        role=UserRole.ADMIN.value
    )
    db.add(admin)

    # Seed Customer
    customer = User(
        full_name="Test Customer",
        email="customer@test.com",
        password_hash=hash_password("Password123"),
        role=UserRole.CUSTOMER.value
    )
    db.add(customer)

    # Seed Approved Provider
    prov_user = User(
        full_name="Approved Provider",
        email="approved@test.com",
        password_hash=hash_password("Password123"),
        role=UserRole.PROVIDER.value
    )
    db.add(prov_user)
    db.flush()

    approved_prov = Provider(
        user_id=prov_user.id,
        category="AC Repair",
        status=ProviderStatus.APPROVED.value,
        hourly_rate=50.0
    )
    db.add(approved_prov)

    # Seed Unapproved Provider
    unprov_user = User(
        full_name="Pending Provider",
        email="pending@test.com",
        password_hash=hash_password("Password123"),
        role=UserRole.PROVIDER.value
    )
    db.add(unprov_user)
    db.flush()

    pending_prov = Provider(
        user_id=unprov_user.id,
        category="AC Repair",
        status=ProviderStatus.PENDING.value,
        hourly_rate=40.0
    )
    db.add(pending_prov)

    db.commit()
    db.close()

    yield
    Base.metadata.drop_all(bind=engine)


def get_token(email: str, password: str) -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


# 1. Login Success / Failure
def test_login_success_and_failure():
    # Success
    res = client.post("/api/auth/login", json={"email": "customer@test.com", "password": "Password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()

    # Wrong Password
    res = client.post("/api/auth/login", json={"email": "customer@test.com", "password": "WrongPassword"})
    assert res.status_code == 401
    assert "Invalid" in res.json()["detail"]

    # Nonexistent User
    res = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "Password123"})
    assert res.status_code == 401


# 2. Admin-only endpoints (403 for customers)
def test_admin_only_endpoints():
    cust_token = get_token("customer@test.com", "Password123")
    headers = {"Authorization": f"Bearer {cust_token}"}

    # Customer accessing admin endpoints should get 403
    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 403

    res = client.get("/api/admin/providers", headers=headers)
    assert res.status_code == 403

    # Admin accessing admin endpoints should succeed
    admin_token = get_token("admin@test.com", "Admin123!")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/admin/users", headers=admin_headers)
    assert res.status_code == 200


# 3. Booking for unapproved provider (should fail with 400)
def test_booking_unapproved_provider():
    cust_token = get_token("customer@test.com", "Password123")
    headers = {"Authorization": f"Bearer {cust_token}"}

    # Pending provider ID = 2
    res = client.post("/api/bookings", headers=headers, json={
        "provider_id": 2,
        "date": "2026-10-15",
        "time": "10:00 AM",
        "address": "123 Test St"
    })
    assert res.status_code == 400
    assert "not currently approved" in res.json()["detail"]


# 4. Double booking prevention
def test_double_booking_prevention():
    cust_token = get_token("customer@test.com", "Password123")
    headers = {"Authorization": f"Bearer {cust_token}"}

    booking_payload = {
        "provider_id": 1,
        "date": "2026-10-15",
        "time": "10:00 AM",
        "address": "123 Test St"
    }

    # First booking succeeds
    res1 = client.post("/api/bookings", headers=headers, json=booking_payload)
    assert res1.status_code == 201

    # Second booking for same provider/date/time fails
    res2 = client.post("/api/bookings", headers=headers, json=booking_payload)
    assert res2.status_code == 400
    assert "already booked" in res2.json()["detail"]


# 5. Booking authorization rules & state machine
def test_booking_authorization_rules():
    cust_token = get_token("customer@test.com", "Password123")
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Create booking
    res = client.post("/api/bookings", headers=cust_headers, json={
        "provider_id": 1,
        "date": "2026-10-16",
        "time": "02:00 PM",
        "address": "456 Oak St"
    })
    assert res.status_code == 201
    booking_id = res.json()["id"]

    # Customer tries to mark COMPLETED -> 403
    res_comp = client.put(f"/api/bookings/{booking_id}/status", headers=cust_headers, json={"status": "COMPLETED"})
    assert res_comp.status_code == 403

    # Customer cancels booking -> 200
    res_cancel = client.put(f"/api/bookings/{booking_id}/status", headers=cust_headers, json={"status": "CANCELLED"})
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "CANCELLED"


# 6. Review rules
def test_review_rules():
    cust_token = get_token("customer@test.com", "Password123")
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Create booking
    res = client.post("/api/bookings", headers=cust_headers, json={
        "provider_id": 1,
        "date": "2026-10-17",
        "time": "11:00 AM",
        "address": "789 Pine St"
    })
    booking_id = res.json()["id"]

    # Reviewing PENDING booking should fail with 400
    res_rev_fail = client.post("/api/reviews", headers=cust_headers, json={
        "booking_id": booking_id,
        "rating": 5,
        "comment": "Great service!"
    })
    assert res_rev_fail.status_code == 400
    assert "COMPLETED" in res_rev_fail.json()["detail"]

    # Admin completes booking
    admin_token = get_token("admin@test.com", "Admin123!")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    client.put(f"/api/bookings/{booking_id}/status", headers=admin_headers, json={"status": "ACCEPTED"})
    client.put(f"/api/bookings/{booking_id}/status", headers=admin_headers, json={"status": "STARTED"})
    client.put(f"/api/bookings/{booking_id}/status", headers=admin_headers, json={"status": "COMPLETED"})

    # Now customer reviews COMPLETED booking
    res_rev = client.post("/api/reviews", headers=cust_headers, json={
        "booking_id": booking_id,
        "rating": 5,
        "comment": "Excellent work!"
    })
    assert res_rev.status_code == 201

    # Double reviewing fails
    res_rev_dup = client.post("/api/reviews", headers=cust_headers, json={
        "booking_id": booking_id,
        "rating": 4,
        "comment": "Second review attempt"
    })
    assert res_rev_dup.status_code == 400
    assert "already submitted" in res_rev_dup.json()["detail"]


# 7. AI Fallback Keyword Matching
def test_ai_fallback_keyword_matching():
    # AC Repair whole word match
    res_ac = generate_service_recommendation("My AC is not cooling properly")
    assert res_ac["recommendedCategory"] == "AC Repair"

    # Laptop Repair vs AC Repair (avoiding 'ac' substring match bug)
    res_laptop = generate_service_recommendation("My laptop screen is cracked")
    assert res_laptop["recommendedCategory"] == "Laptop Repair"

    # Plumber match
    res_pipe = generate_service_recommendation("Water pipe is leaking in the kitchen")
    assert res_pipe["recommendedCategory"] == "Plumber"

    # General fallback
    res_gen = generate_service_recommendation("Fix my chair and inspect something")
    assert res_gen["recommendedCategory"] in ["Carpenter", "General Service"]
