from fastapi import APIRouter, Depends
from app.schemas.schemas import AiChatRequest, AiRecommendationRequest, AiProviderDescriptionRequest, AiComplaintSummaryRequest
from app.services.gemini import (
    generate_service_recommendation,
    call_gemini_api,
    generate_provider_description,
    summarize_complaint
)

router = APIRouter(prefix="/api/ai", tags=["Gemini AI Features"])


@router.post("/service-recommendation")
def ai_service_recommendation(payload: AiRecommendationRequest):
    result = generate_service_recommendation(payload.issue_description)
    return result


@router.post("/chat")
def ai_chat(payload: AiChatRequest):
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
def ai_provider_description(payload: AiProviderDescriptionRequest):
    desc = generate_provider_description(
        name=payload.name,
        category=payload.category,
        experience_years=int(payload.experienceYears),
        city=payload.city or "Local Area"
    )
    return {"description": desc}


@router.post("/complaint-summary")
def ai_complaint_summary(payload: AiComplaintSummaryRequest):
    summary = summarize_complaint(payload.description)
    return {"summary": summary}
