from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─────────────────── AUTH ───────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: str = "farmer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    is_approved: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─────────────────── PRODUCTS ───────────────────
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: str
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    category: str
    image_url: Optional[str]
    seller_id: int
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────── MACHINES ───────────────────
class MachineCreate(BaseModel):
    name: str
    description: Optional[str] = None
    daily_rate: float
    location: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class MachineOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    daily_rate: float
    location: Optional[str]
    category: Optional[str]
    image_url: Optional[str]
    owner_id: int
    is_available: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────── SERVICES ───────────────────
class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None


class ServiceOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category: Optional[str]
    provider_id: int
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────── BOOKINGS ───────────────────
class BookingCreate(BaseModel):
    machine_id: Optional[int] = None
    service_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    user_id: int
    machine_id: Optional[int]
    service_id: Optional[int]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    total_amount: Optional[float]
    status: str
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────── PAYMENTS ───────────────────
class PaymentCreate(BaseModel):
    booking_id: Optional[int] = None
    amount: float
    description: Optional[str] = None


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    id: int
    user_id: int
    booking_id: Optional[int]
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    amount: float
    currency: str
    status: str
    description: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────── REVIEWS ───────────────────
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    user_id: int
    product_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────────── AI ───────────────────
class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    timestamp: Optional[datetime] = None


class DiseaseResult(BaseModel):
    disease_name: str
    confidence: float
    treatment: str
    image_filename: Optional[str] = None


class ChatHistoryOut(BaseModel):
    id: int
    user_message: str
    bot_response: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class DiseasePredictionOut(BaseModel):
    id: int
    user_id: Optional[int]
    disease_name: str
    confidence: float
    treatment: str
    image_filename: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
