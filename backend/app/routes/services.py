from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Service, Booking, BookingStatus, User
from app.schemas import ServiceCreate, ServiceOut, BookingCreate, BookingOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/services", tags=["Service Booking"])


@router.get("/", response_model=List[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.is_active == True).all()


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_service = Service(**service.model_dump(), provider_id=current_user.id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


@router.post("/{service_id}/book", response_model=BookingOut)
def book_service(
    service_id: int,
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service or not service.is_active:
        raise HTTPException(status_code=404, detail="Service not found or inactive")

    booking = Booking(
        user_id=current_user.id,
        service_id=service_id,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        total_amount=service.price,
        notes=booking_data.notes,
        status=BookingStatus.confirmed,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my/bookings", response_model=List[BookingOut])
def my_service_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id, Booking.service_id != None)
        .all()
    )
