from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Machine, Booking, BookingStatus, User
from app.schemas import MachineCreate, MachineOut, BookingCreate, BookingOut
from app.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/machines", tags=["Machinery Rental"])


@router.get("/", response_model=List[MachineOut])
def list_machines(db: Session = Depends(get_db)):
    return db.query(Machine).filter(Machine.is_available == True).all()


@router.get("/{machine_id}", response_model=MachineOut)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post("/", response_model=MachineOut, status_code=status.HTTP_201_CREATED)
def add_machine(
    machine: MachineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_machine = Machine(**machine.model_dump(), owner_id=current_user.id)
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine


@router.post("/{machine_id}/book", response_model=BookingOut)
def book_machine(
    machine_id: int,
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    if not machine.is_available:
        raise HTTPException(status_code=400, detail="Machine is not available")

    # Calculate total amount
    total = 0.0
    if booking_data.start_date and booking_data.end_date:
        delta = (booking_data.end_date - booking_data.start_date).days or 1
        total = machine.daily_rate * delta

    booking = Booking(
        user_id=current_user.id,
        machine_id=machine_id,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        total_amount=total,
        notes=booking_data.notes,
        status=BookingStatus.confirmed,
    )
    machine.is_available = False
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my/bookings", response_model=List[BookingOut])
def my_machine_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id, Booking.machine_id != None)
        .all()
    )
