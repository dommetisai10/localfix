from sqlalchemy.orm import Session
from app.models.models import User, ServiceCategory, Provider, Booking, Review, UserRole, ProviderStatus, BookingStatus
from app.utils.security import hash_password

DEFAULT_CATEGORIES_DATA = [
  {
    "name": "Electrician",
    "description": "Wiring, circuit breaker repair, light installation, generator setup & electrical troubleshooting.",
    "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
    "count": 24
  },
  {
    "name": "Plumber",
    "description": "Pipe leak repairs, drain unblocking, faucet installation, water heater setup & bathroom plumbing.",
    "image": "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&q=80&w=600",
    "count": 31
  },
  {
    "name": "AC Repair",
    "description": "AC servicing, gas refilling, cooling issue repairs, compressor maintenance & installation.",
    "image": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600",
    "count": 19
  },
  {
    "name": "Home Cleaning",
    "description": "Deep home cleaning, sofa & carpet shampooing, kitchen degreasing & full house sanitation.",
    "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600",
    "count": 42
  },
  {
    "name": "Carpenter",
    "description": "Custom furniture repair, door lock installation, cabinet assembly, wood polishing & restoration.",
    "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600",
    "count": 15
  },
  {
    "name": "Painter",
    "description": "Interior & exterior wall painting, waterproof coating, texture design & wallpaper fixing.",
    "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600",
    "count": 18
  },
  {
    "name": "Appliance Repair",
    "description": "Refrigerator, microwave, washing machine & oven diagnostics & repair.",
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    "count": 27
  },
  {
    "name": "Computer Repair",
    "description": "PC building, OS formatting, malware removal, hardware upgrades & network setup.",
    "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600",
    "count": 22
  },
  {
    "name": "Laptop Repair",
    "description": "Laptop screen replacement, keyboard repair, motherboard chip-level repair & battery replacement.",
    "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600",
    "count": 16
  },
  {
    "name": "Mobile Repair",
    "description": "Smartphone screen replacement, charging port repair, water damage recovery & battery change.",
    "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
    "count": 35
  },
  {
    "name": "Home Tutor",
    "description": "Personalized tutoring for Math, Science, English, coding & competitive exams for grades K-12.",
    "image": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=600",
    "count": 29
  },
  {
    "name": "Beauty Services",
    "description": "At-home salon services, hair styling, facial treatments, manicure, pedicure & makeup.",
    "image": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=600",
    "count": 38
  },
  {
    "name": "Pest Control",
    "description": "Termite treatment, cockroach extermination, bed bug control & eco-friendly pest prevention.",
    "image": "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=600",
    "count": 14
  },
  {
    "name": "RO Water Purifier",
    "description": "Water purifier filter replacement, RO membrane cleaning, leak fix & annual maintenance.",
    "image": "https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&q=80&w=600",
    "count": 20
  },
  {
    "name": "Washing Machine Repair",
    "description": "Front-load & top-load washing machine drum repair, motor replacement & drainage fixes.",
    "image": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=600",
    "count": 17
  }
]


def seed_database(db: Session):
    # 1. Seed Categories if empty
    if db.query(ServiceCategory).count() == 0:
        for c in DEFAULT_CATEGORIES_DATA:
            cat = ServiceCategory(
                name=c["name"],
                description=c["description"],
                image=c["image"],
                count=c["count"]
            )
            db.add(cat)
        db.commit()

    # 2. Seed Admin user
    admin = db.query(User).filter(User.email == "dommetisai@localfix.com").first()
    if not admin:
        admin = User(
            full_name="Dommetisai Admin",
            email="dommetisai@localfix.com",
            mobile_number="+91 9573842155",
            password_hash=hash_password("Dommetisai"),
            role=UserRole.ADMIN.value,
            location="Ravulapalem",
            city="Ravulapalem"
        )
        db.add(admin)
    else:
        admin.password_hash = hash_password("Dommetisai")
        admin.role = UserRole.ADMIN.value

    # Also seed standard admin account for backup admin login
    admin_backup = db.query(User).filter(User.email == "admin@localfix.com").first()
    if not admin_backup:
        admin_backup = User(
            full_name="System Administrator",
            email="admin@localfix.com",
            mobile_number="+91 9573842155",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN.value,
            location="Main Office",
            city="Local Area"
        )
        db.add(admin_backup)
    else:
        admin_backup.password_hash = hash_password("admin123")
        admin_backup.role = UserRole.ADMIN.value

    # 3. Seed Sample Customer if missing
    customer = db.query(User).filter(User.email == "customer@example.com").first()
    if not customer:
        customer = User(
            full_name="Sarah Jenkins",
            email="customer@example.com",
            mobile_number="+91 9573842155",
            password_hash=hash_password("password123"),
            role=UserRole.CUSTOMER.value,
            location="Ravulapalem",
            city="Ravulapalem"
        )
        db.add(customer)

    db.commit()

    # 4. Remove any existing demo provider accounts from DB
    demo_prov_user = db.query(User).filter(User.email == "marcus.electric@example.com").first()
    if demo_prov_user:
        db.query(Provider).filter(Provider.user_id == demo_prov_user.id).delete()
        db.delete(demo_prov_user)
        db.commit()
