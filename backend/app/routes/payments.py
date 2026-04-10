import uuid
import hashlib
import hmac
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Payment, PaymentStatus, User
from app.schemas import PaymentCreate, PaymentVerify, PaymentOut
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post("/create-order", response_model=PaymentOut)
def create_order(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a Razorpay demo order (mock implementation)"""
    order_id = f"order_{uuid.uuid4().hex[:16]}"

    payment = Payment(
        user_id=current_user.id,
        booking_id=payment_data.booking_id,
        razorpay_order_id=order_id,
        amount=payment_data.amount,
        currency="INR",
        status=PaymentStatus.pending,
        description=payment_data.description,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.post("/verify")
def verify_payment(
    verify_data: PaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mock payment verification (demo mode - always succeeds)"""
    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == verify_data.razorpay_order_id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Order not found")

    # Demo mode: mark as success
    payment.razorpay_payment_id = verify_data.razorpay_payment_id
    payment.status = PaymentStatus.success
    db.commit()

    return {
        "success": True,
        "message": "Payment verified successfully (Demo mode)",
        "payment_id": payment.id,
        "order_id": payment.razorpay_order_id,
        "amount": payment.amount,
    }


@router.get("/my", response_model=List[PaymentOut])
def my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Payment).filter(Payment.user_id == current_user.id).all()


@router.get("/razorpay-key")
def get_razorpay_key():
    """Return Razorpay public key for frontend"""
    return {"key": settings.RAZORPAY_KEY_ID, "mode": "test"}
