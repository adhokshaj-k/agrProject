from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Product, Machine, Service, Payment, UserRole
from app.schemas import UserOut, PaymentOut
from app.auth import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])


@router.get("/users", response_model=List[UserOut])
def list_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return db.query(User).all()


@router.patch("/users/{user_id}/approve")
def approve_seller(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = True
    db.commit()
    return {"message": f"Seller {user.name} approved successfully"}


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.name} deactivated"}


@router.get("/transactions", response_model=List[PaymentOut])
def all_transactions(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return db.query(Payment).all()


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return {
        "total_users": db.query(User).count(),
        "total_farmers": db.query(User).filter(User.role == UserRole.farmer).count(),
        "total_sellers": db.query(User).filter(User.role == UserRole.seller).count(),
        "total_products": db.query(Product).count(),
        "total_machines": db.query(Machine).count(),
        "total_services": db.query(Service).count(),
        "total_payments": db.query(Payment).count(),
        "pending_approvals": db.query(User).filter(
            User.role == UserRole.seller, User.is_approved == False
        ).count(),
    }
