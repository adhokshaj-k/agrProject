import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import DiseasePrediction, ChatHistory, User
from app.schemas import ChatMessage, DiseaseResult, ChatHistoryOut, DiseasePredictionOut
from app.auth import get_current_user, get_optional_user
from app.ai.disease_model import predict_disease, validate_image
from app.ai.chatbot import get_chatbot_response
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["AI Modules"])

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


# ───────── DISEASE DETECTION ─────────
@router.post("/disease-detect", response_model=DiseaseResult)
async def detect_disease(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    # Validate file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size
    image_data = await file.read()
    if len(image_data) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Validate it's actually an image
    if not validate_image(image_data):
        raise HTTPException(status_code=400, detail="Invalid or corrupted image")

    # Save the uploaded file
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(image_data)

    # Run prediction
    try:
        result = predict_disease(image_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Store in database
    prediction = DiseasePrediction(
        user_id=current_user.id if current_user else None,
        image_filename=filename,
        disease_name=result["disease_name"],
        confidence=result["confidence"],
        treatment=result["treatment"],
    )
    db.add(prediction)
    db.commit()

    return DiseaseResult(
        disease_name=result["disease_name"],
        confidence=result["confidence"],
        treatment=result["treatment"],
        image_filename=filename,
    )


@router.get("/disease-history", response_model=List[DiseasePredictionOut])
def disease_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(DiseasePrediction)
        .filter(DiseasePrediction.user_id == current_user.id)
        .order_by(DiseasePrediction.created_at.desc())
        .limit(20)
        .all()
    )


# ───────── CHATBOT ─────────
@router.post("/chat")
def chat(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    if not message.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    response = get_chatbot_response(message.message)

    # Store chat history
    history = ChatHistory(
        user_id=current_user.id if current_user else None,
        user_message=message.message,
        bot_response=response,
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    return {
        "response": response,
        "timestamp": history.created_at,
    }


@router.get("/chat-history", response_model=List[ChatHistoryOut])
def chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(50)
        .all()
    )
