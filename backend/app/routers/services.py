from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ServiceCategory, Service, Provider, ProviderStatus
from app.schemas.schemas import CategoryOut, CategoryCreate, CategoryUpdate, ServiceOut
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/api/services", tags=["Service Categories & Services"])


@router.get("", response_model=List[CategoryOut])
def get_service_categories(db: Session = Depends(get_db)):
    categories = db.query(ServiceCategory).filter(ServiceCategory.active == True).all()
    results = []
    for c in categories:
        prov_count = db.query(Provider).filter(
            Provider.category == c.name,
            Provider.status == ProviderStatus.APPROVED.value
        ).count()
        results.append(CategoryOut(
            id=c.id,
            name=c.name,
            description=c.description,
            image=c.image,
            active=c.active,
            count=prov_count
        ))
    return results


@router.get("/{id}", response_model=CategoryOut)
def get_service_category(id: int, db: Session = Depends(get_db)):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found")
    
    prov_count = db.query(Provider).filter(
        Provider.category == category.name,
        Provider.status == ProviderStatus.APPROVED.value
    ).count()

    return CategoryOut(
        id=category.id,
        name=category.name,
        description=category.description,
        image=category.image,
        active=category.active,
        count=prov_count
    )


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_service_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    category = ServiceCategory(
        name=payload.name,
        description=payload.description,
        image=payload.image,
        active=payload.active if payload.active is not None else True
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryOut(
        id=category.id,
        name=category.name,
        description=category.description,
        image=category.image,
        active=category.active,
        count=0
    )


@router.put("/{id}", response_model=CategoryOut)
def update_service_category(
    id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if payload.name is not None: category.name = payload.name
    if payload.description is not None: category.description = payload.description
    if payload.image is not None: category.image = payload.image
    if payload.active is not None: category.active = payload.active

    db.commit()
    db.refresh(category)

    prov_count = db.query(Provider).filter(
        Provider.category == category.name,
        Provider.status == ProviderStatus.APPROVED.value
    ).count()

    return CategoryOut(
        id=category.id,
        name=category.name,
        description=category.description,
        image=category.image,
        active=category.active,
        count=prov_count
    )


@router.delete("/{id}")
def delete_service_category(id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if category is linked to existing providers
    prov_count = db.query(Provider).filter(Provider.category == category.name).count()
    if prov_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{category.name}' because {prov_count} provider(s) are associated with it. Please deactivate the category instead."
        )

    try:
        db.delete(category)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category due to database constraints. Deactivate it instead."
        )

    return {"message": "Category deleted successfully"}
