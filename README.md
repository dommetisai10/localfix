# LocalFix - Production-Ready Local Service Booking Platform

LocalFix is a full-stack, production-ready local service booking platform connecting customers with verified local professionals such as electricians, plumbers, AC technicians, cleaners, carpenters, painters, appliance repair technicians, computer repair technicians, tutors, and more.

---

## 🌟 Key Features

### 👤 Customer Features
- **Browse & Search Services**: Filter across 15 default service categories with real-time text search.
- **Provider Directory**: Filter professionals by Service Category, Location/City, Minimum Rating (4.0+, 4.5+), and Max Hourly Rate.
- **Interactive Booking Flow**: Select date, time slot, service address, and submit requests with **Double Booking Prevention**.
- **Role Dashboard**: Track booking statuses (`PENDING`, `ACCEPTED`, `STARTED`, `COMPLETED`, `CANCELLED`).
- **Reviews & Ratings**: Submit 1–5 star ratings and reviews for completed bookings (dynamically updates provider rating).
- **Complaints System**: Report issues with tracking status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`).

### 🛠️ Service Provider Features
- **Registration**: Sign up with category, experience, hourly rate, and location (initial status = `PENDING`).
- **Dashboard**: View total bookings, pending requests, accepted jobs, completed jobs, total earnings, and average rating.
- **Status Lifecycle**: Accept/Reject incoming bookings, mark service as `STARTED`, and mark as `COMPLETED`.
- **AI Profile Generator**: Generate a professional service description with one click powered by Gemini AI.

### 🛡️ Admin Features
- **Control Panel**: Overview metrics (Total Users, Providers, Pending Approvals, Total Bookings, Revenue).
- **Analytics**: Recharts graphs showing Monthly Revenue & Booking trends.
- **Provider Approvals**: Review pending provider applications (`APPROVE`, `REJECT`, `SUSPEND`).
- **AI Complaint Summarizer**: Generate 2-sentence executive complaint summaries powered by Gemini AI.

### 🤖 Gemini AI Integration
1. **Service Recommendation**: Analyzes natural language problem descriptions to identify issues and recommend service categories.
2. **AI Service Assistant**: Interactive Chatbot modal guiding customers through booking.
3. **Provider Description Generator**: Crafts compelling professional provider bios.
4. **Complaint Summarizer**: Synthesizes customer complaints for quick admin resolution.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts, SweetAlert2
- **Backend**: Python, FastAPI, Pydantic, SQLAlchemy, PostgreSQL / SQLite, JWT Authentication, Passlib/bcrypt, Uvicorn
- **AI**: Google Gemini API (`google-genai` SDK)
- **Deployment**: Vercel (Frontend), Render (Backend), PostgreSQL (Hosted DB)

---

## 📂 Folder Structure

```text
localfix/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, StarRating, ServiceCard, ProviderCard, AiAssistantModal
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── layouts/         # PublicLayout, DashboardLayout
│   │   ├── pages/           # Home, Services, Providers, Profile, Login, Register, Dashboards
│   │   ├── services/        # Axios API client
│   │   ├── utils/           # Mock data & helpers
│   │   ├── App.jsx          # React Router setup
│   │   ├── index.css        # Tailwind & Glassmorphism CSS
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json          # Vercel SPA routing
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── middleware/      # JWT Auth dependencies
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routers/         # auth, services, providers, bookings, reviews, complaints, notifications, admin, ai
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Gemini AI service
│   │   ├── utils/           # Security & hashing
│   │   ├── database.py      # Database engine
│   │   ├── main.py          # FastAPI app entrypoint
│   │   └── seed.py          # Database auto-seeder
│   ├── render.yaml          # Render deployment blueprint
│   ├── Procfile             # Web server entry
│   ├── requirements.txt     # Python dependencies
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🚀 Quick Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from .env.example
cp .env.example .env

# Run FastAPI backend server (Port 8000)
uvicorn app.main:app --reload --port 8000

# Run Pytest suite
python -m pytest
```
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Create .env file
cp .env.example .env

# Run ESLint validation
npm run lint

# Run Vite development server (Port 3000)
npm run dev

# Build for production
npm run build
```
- Open `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables & Configuration

### Backend (.env)
- `ENVIRONMENT`: `development` or `production`
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://user:pass@host/db`) or SQLite in dev (`sqlite:///./localfix.db`)
- `JWT_SECRET`: Random 32+ character secret key for JWT signing
- `JWT_ALGORITHM`: `HS256`
- `ADMIN_EMAIL`: Email address for admin login (e.g. `admin@localfix.com`)
- `ADMIN_PASSWORD`: Secure password for initial admin creation
- `CORS_ORIGINS`: Allowed origins separated by commas (e.g. `https://your-app.vercel.app`)
- `GEMINI_API_KEY`: Google Gemini API key

### Frontend (.env)
- `VITE_API_URL`: Backend API URL ending with `/api` (e.g. `https://your-app.onrender.com/api`)

---

## 🌐 Production Deployment Guide

### Backend → Render
1. Push repository to **GitHub**.
2. Log into **Render** and create a new **Web Service**.
3. Select your repository and choose environment **Python**.
4. Set `PYTHON_VERSION` to `3.11.9`.
5. Set Build Command: `pip install -r requirements.txt`
6. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Set Environment Variables:
   - `ENVIRONMENT`: `production`
   - `DATABASE_URL`: `postgresql://<user>:<pass>@<host>/<db>`
   - `JWT_SECRET`: `<your-random-secret-key>`
   - `ADMIN_EMAIL`: `<admin-email>`
   - `ADMIN_PASSWORD`: `<secure-admin-password>`
   - `GEMINI_API_KEY`: `<your-google-gemini-key>`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`

### Frontend → Vercel
1. Log into **Vercel** and click **Import Project**.
2. Select the `frontend` directory.
3. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
4. Trigger a new deployment (Vite bakes env vars into static JS at build time).
5. Verify setup: Visit `/api/health` on Render backend, `/docs`, and test login on Vercel.
