from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Provider, UserRole, ProviderStatus
from app.schemas.schemas import UserRegister, ProviderRegister, UserLogin, Token, UserOut
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_customer(payload: UserRegister, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        full_name=payload.name,
        email=clean_email,
        mobile_number=payload.mobile,
        password_hash=hash_password(payload.password.strip()),
        role=UserRole.CUSTOMER.value,
        location=payload.location,
        city=payload.city or payload.location
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    user_out = UserOut(
        id=user.id,
        name=user.full_name,
        email=user.email,
        mobile=user.mobile_number,
        role=user.role,
        location=user.location,
        city=user.city
    )
    return {"access_token": token, "token_type": "bearer", "user": user_out}


@router.post("/register-provider", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_provider(payload: ProviderRegister, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    existing = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        full_name=payload.name,
        email=clean_email,
        mobile_number=payload.mobile,
        password_hash=hash_password(payload.password.strip()),
        role=UserRole.PROVIDER.value,
        location=payload.address,
        city=payload.city
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Provider accounts start as PENDING per requirement!
    provider = Provider(
        user_id=user.id,
        category=payload.category,
        experience_years=payload.experienceYears,
        hourly_rate=payload.hourlyRate,
        description=payload.description,
        city=payload.city,
        location=f"{payload.address}, {payload.city}" if payload.address else payload.city,
        status=ProviderStatus.PENDING.value,
        working_hours=payload.workingHours
    )
    db.add(provider)
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    user_out = UserOut(
        id=user.id,
        name=user.full_name,
        email=user.email,
        mobile=user.mobile_number,
        role=user.role,
        location=user.location,
        city=user.city,
        status=provider.status
    )
    return {"access_token": token, "token_type": "bearer", "user": user_out}


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(payload.password.strip(), user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    provider_status = None
    if user.role == UserRole.PROVIDER.value and user.provider_profile:
        provider_status = user.provider_profile.status

    token = create_access_token({"sub": str(user.id), "role": user.role})
    user_out = UserOut(
        id=user.id,
        name=user.full_name,
        email=user.email,
        mobile=user.mobile_number,
        role=user.role,
        location=user.location,
        city=user.city,
        status=provider_status
    )
    return {"access_token": token, "token_type": "bearer", "user": user_out}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    status_val = None
    if current_user.role == UserRole.PROVIDER.value and current_user.provider_profile:
        status_val = current_user.provider_profile.status

    return UserOut(
        id=current_user.id,
        name=current_user.full_name,
        email=current_user.email,
        mobile=current_user.mobile_number,
        role=current_user.role,
        location=current_user.location,
        city=current_user.city,
        status=status_val
    )
