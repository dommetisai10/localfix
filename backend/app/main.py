import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base, SessionLocal
from app.seed import seed_database

from app.routers import (
    auth,
    services,
    providers,
    bookings,
    reviews,
    complaints,
    notifications,
    admin,
    ai
)

load_dotenv()

# Create SQL Tables automatically
Base.metadata.create_all(bind=engine)

# Seed initial database records
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="LocalFix API",
    description="Local Service Booking Platform API with Gemini AI features and role-based authorization",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup - support local and production frontend origins (including Vercel)
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

if "*" in origins or not origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register API Routers
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(providers.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(complaints.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(ai.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "LocalFix API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
