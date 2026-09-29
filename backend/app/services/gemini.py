import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def call_gemini_api(prompt: str, system_instruction: str = "") -> str:
    """
    Calls Google Gemini API using google-genai or direct fallback logic.
    Keep the Gemini API key ONLY in backend environment variables.
    NEVER expose API keys in frontend code.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_google_gemini_api_key_here":
        return None

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        full_prompt = f"{system_instruction}\n\nUser Request: {prompt}" if system_instruction else prompt
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt
        )
        return response.text
    except Exception as e:
        print(f"[Gemini API Error]: {e}")
        return None


def generate_service_recommendation(user_prompt: str) -> dict:
    system_prompt = (
        "You are an expert home service diagnostic system for LocalFix. "
        "Analyze the user's issue and return JSON with keys: "
        "'recommendedCategory', 'possibleIssue', 'recommendation'."
    )
    raw = call_gemini_api(user_prompt, system_prompt)
    if raw:
        try:
            # try to parse JSON
            cleaned = raw.strip().replace("```json", "").replace("```", "")
            return json.loads(cleaned)
        except Exception:
            pass

    # Fallback smart matching logic if API key is not configured or rate-limited
    text_lower = user_prompt.lower()
    if "ac" in text_lower or "cool" in text_lower or "air" in text_lower:
        return {
            "recommendedCategory": "AC Repair",
            "possibleIssue": "Low refrigerant, compressor fault, or dirty filter",
            "recommendation": "Your AC system appears to have a cooling efficiency drop. We recommend booking a certified AC Repair technician for diagnostics."
        }
    elif "leak" in text_lower or "pipe" in text_lower or "water" in text_lower or "plumb" in text_lower or "drain" in text_lower:
        return {
            "recommendedCategory": "Plumber",
            "possibleIssue": "Pipe joint failure or main line blockage",
            "recommendation": "Active plumbing leak detected. We recommend booking a licensed Plumber immediately to prevent water damage."
        }
    elif "wire" in text_lower or "spark" in text_lower or "light" in text_lower or "electric" in text_lower or "switch" in text_lower:
        return {
            "recommendedCategory": "Electrician",
            "possibleIssue": "Short circuit or overloaded circuit breaker",
            "recommendation": "Electrical fault detected. We recommend booking a certified Master Electrician."
        }
    elif "clean" in text_lower or "dust" in text_lower or "sofa" in text_lower:
        return {
            "recommendedCategory": "Home Cleaning",
            "possibleIssue": "Deep dust accumulation or carpet stain",
            "recommendation": "Deep home cleaning and sanitization recommended."
        }
    else:
        return {
            "recommendedCategory": "General Service",
            "possibleIssue": "Maintenance check required",
            "recommendation": f"Based on '{user_prompt}', we recommend browsing top-rated local professionals on LocalFix."
        }


def generate_provider_description(name: str, category: str, experience_years: int, city: str) -> str:
    prompt = f"Generate a professional, compelling 3-sentence service provider profile description for {name}, a certified {category} with {experience_years} years experience based in {city}."
    raw = call_gemini_api(prompt)
    if raw:
        return raw.strip()

    return (
        f"Certified {category} professional with over {experience_years} years of proven expertise serving {city} and surrounding areas. "
        f"Specializing in high-precision diagnostics, modern installations, and emergency repairs with 100% safety compliance. "
        f"Committed to punctual service, clean work ethics, and upfront transparent pricing."
    )


def summarize_complaint(description: str) -> str:
    prompt = f"Summarize this customer complaint in 2 concise professional sentences identifying the core failure: '{description}'"
    raw = call_gemini_api(prompt)
    if raw:
        return raw.strip()

    return f"AI Complaint Summary: Customer reported operational issue regarding '{description[:80]}...'. Requires admin investigation."
