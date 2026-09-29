import os
import sys

# Ensure backend root is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.models import User, Provider, Booking

def print_database_summary():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        providers = db.query(Provider).all()
        bookings = db.query(Booking).all()

        print("\n=======================================================")
        print("          LOCALFIX BACKEND DATABASE USERS              ")
        print("=======================================================")
        print(f"Total Registered Users: {len(users)}\n")

        for u in users:
            print(f"- ID: {u.id:2d} | Role: {u.role:8s} | Name: {u.full_name:25s} | Email: {u.email}")

        print("\n=======================================================")
        print(f"Total Registered Providers: {len(providers)}")
        print(f"Total Bookings Logged: {len(bookings)}")
        print("=======================================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    print_database_summary()
