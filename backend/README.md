# LocalFix Backend API

FastAPI Backend service for LocalFix local service booking platform.

## Setup Instructions

1. Create Python Virtual Environment:
```bash
python -m venv venv
```

2. Activate Virtual Environment:
- Windows: `.\venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install Dependencies:
```bash
pip install -r requirements.txt
```

4. Set Environment Variables:
Copy `.env.example` to `.env` and fill in required variables (`ENVIRONMENT`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, `CORS_ORIGINS`).

5. Run Server:
```bash
uvicorn app.main:app --reload --port 8000
```

6. Run Pytest Suite:
```bash
python -m pytest
```

7. API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
