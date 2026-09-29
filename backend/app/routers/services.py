from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ServiceCategory, Service
from app.schemas.schemas import CategoryOut, ServiceOut
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/api/services", tags=["Service Categories & Services"])


@router.get("", response_model=List[CategoryOut])
def get_service_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).filter(ServiceCategory.active == True).all()


@router.get("/{id}", response_model=CategoryOut)
def get_service_category(id: int, db: Session = Depends(get_db)):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Service category not found")
    return category


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_service_category(
    name: str,
    description: Optional[str] = None,
    image: Optional[str] = None,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    category = ServiceCategory(name=name, description=description, image=image)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{id}", response_model=CategoryOut)
def update_service_category(
    id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if name is not None: category.name = name
    if description is not None: category.description = description
    if active is not None: category.active = active

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{id}")
def delete_service_category(id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    category = db.query(ServiceCategory).filter(ServiceCategory.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}
