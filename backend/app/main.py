import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.config import settings

# Import all models so they register with Base
import app.models  # noqa

# Import routers
from app.routes import auth, products, machines, services, payments, admin, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup"""
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="AgriConnect AI API",
    description="Smart Agriculture Platform with AI-powered features",
    version="2.0.0",
    lifespan=lifespan,
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static files (uploaded images) ───
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── Routers ───
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(machines.router)
app.include_router(services.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "message": "AgriConnect AI API is running!",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "AgriConnect AI Backend"}
