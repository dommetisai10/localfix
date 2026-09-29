import time
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.models.models import User
from app.schemas.schemas import AiChatRequest, AiRecommendationRequest, AiProviderDescriptionRequest, AiComplaintSummaryRequest
from app.services.gemini import (
    generate_service_recommendation,
    call_gemini_api,
    generate_provider_description,
    summarize_complaint
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/ai", tags=["Gemini AI Features"])

# In-memory rate limiting store: ip_address -> list of timestamps
RATE_LIMIT_STORE: Dict[str, List[float]] = {}
MAX_REQUESTS_PER_MINUTE = 20
WINDOW_SECONDS = 60.0


def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    timestamps = RATE_LIMIT_STORE.get(client_ip, [])
    # Filter out timestamps older than WINDOW_SECONDS
    valid_timestamps = [t for t in timestamps if now - t < WINDOW_SECONDS]
    
    if len(valid_timestamps) >= MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a minute before making more AI requests."
        )
    
    valid_timestamps.append(now)
    RATE_LIMIT_STORE[client_ip] = valid_timestamps


@router.post("/service-recommendation")
def ai_service_recommendation(
    payload: AiRecommendationRequest,
    request: Request
):
    check_rate_limit(request)
    if len(payload.issue_description) > 1000:
        raise HTTPException(status_code=400, detail="Prompt exceeds maximum length of 1000 characters.")
    
    return generate_service_recommendation(payload.issue_description)


@router.post("/chat")
def ai_chat(
    payload: AiChatRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    check_rate_limit(request)
    if len(payload.prompt) > 1000:
        raise HTTPException(status_code=400, detail="Prompt exceeds maximum length of 1000 characters.")

    system_instruction = (
        "You are LocalFix AI Assistant powered by Google Gemini. "
        "Help customers identify the right home service category and provider. "
        "Do not allow AI to directly create bookings without user confirmation."
    )
    res = generate_service_recommendation(payload.prompt)
    ai_text = call_gemini_api(payload.prompt, system_instruction)
    
    return {
        "response": ai_text or res.get("recommendation"),
        "recommendedCategory": res.get("recommendedCategory"),
        "possibleIssue": res.get("possibleIssue")
    }


@router.post("/provider-description")
def ai_provider_description(
    payload: AiProviderDescriptionRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    check_rate_limit(request)
    desc = generate_provider_description(
        name=payload.name,
        category=payload.category,
        experience_years=int(payload.experienceYears),
        city=payload.city or "Local Area"
    )
    return {"description": desc}


@router.post("/complaint-summary")
def ai_complaint_summary(
    payload: AiComplaintSummaryRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    check_rate_limit(request)
    if len(payload.description) > 1000:
        raise HTTPException(status_code=400, detail="Description exceeds maximum length of 1000 characters.")

    summary = summarize_complaint(payload.description)
    return {"summary": summary}
