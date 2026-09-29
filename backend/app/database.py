import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
DATABASE_URL = os.getenv("DATABASE_URL")

db_type = "SQLite" if (DATABASE_URL and DATABASE_URL.startswith("sqlite")) or not DATABASE_URL else "PostgreSQL"
print(f"[Database] Initializing connection to database type: {db_type}")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./localfix.db"

# Render / Heroku compatibility: Ensure postgresql+psycopg2:// scheme is used for psycopg2-binary
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    # Test connection attempt
    with engine.connect() as conn:
        pass
    print(f"[Database] Successfully connected to {db_type} database.")
except Exception as e:
    if ENVIRONMENT == "development":
        print(f"[Database Warning] Connection failed: {e}. Falling back to SQLite because ENVIRONMENT=development.")
        DATABASE_URL = "sqlite:///./localfix.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        print("[Database] Using SQLite fallback database.")
    else:
        print(f"[Database Error] Connection failed: {e}. Refusing SQLite fallback in {ENVIRONMENT} environment.")
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

