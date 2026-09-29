import os
import re
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


# Keyword map with regex word boundary patterns for all seeded categories
CATEGORY_KEYWORD_MAP = [
    (
        r"\b(ac|a/c|air conditioner|air conditioning|cooling|refrigerant|chiller)\b",
        "AC Repair",
        "Low refrigerant, compressor fault, or dirty coil",
        "Cooling efficiency issue detected. We recommend booking a certified AC Repair technician."
    ),
    (
        r"\b(washing machine|washer|dryer)\b",
        "Washing Machine Repair",
        "Motor noise, drum vibration, or drain pump issue",
        "Washing machine malfunction detected. We recommend booking an Appliance Technician."
    ),
    (
        r"\b(ro|water purifier|purifier|aquaguard|water filter)\b",
        "RO Water Purifier",
        "Filter blockage or TDS membrane degradation",
        "Water purifier servicing required. We recommend booking an RO Purifier Specialist."
    ),
    (
        r"\b(laptop|macbook|trackpad)\b",
        "Laptop Repair",
        "Hardware error, battery degradation, or screen issue",
        "Laptop problem detected. We recommend booking a certified Laptop Repair Technician."
    ),
    (
        r"\b(computer|desktop|pc|motherboard|cpu)\b",
        "Computer Repair",
        "System freeze, power supply failure, or hardware fault",
        "Computer failure detected. We recommend booking a Computer Repair Specialist."
    ),
    (
        r"\b(mobile|smartphone|iphone|android|cellphone)\b",
        "Mobile Repair",
        "Screen damage, battery drain, or charging port fault",
        "Mobile device issue detected. We recommend booking a Mobile Repair Specialist."
    ),
    (
        r"\b(plumb|plumber|pipe|leaking|leak|faucet|tap|drain|drainage|sewer|sink|toilet)\b",
        "Plumber",
        "Pipe joint leak, blocked drain, or valve failure",
        "Plumbing issue detected. We recommend booking a licensed Plumber immediately."
    ),
    (
        r"\b(electric|electrician|wiring|wire|spark|switch|socket|fuse|mcb|short circuit)\b",
        "Electrician",
        "Short circuit, faulty wiring, or tripped breaker",
        "Electrical fault detected. We recommend booking a certified Master Electrician."
    ),
    (
        r"\b(clean|cleaning|sanitization|sofa|carpet|dusting)\b",
        "Home Cleaning",
        "Dust buildup or deep sanitization required",
        "Sanitization needed. We recommend booking a Home Cleaning team."
    ),
    (
        r"\b(carpenter|wood|wooden|furniture|door|hinge|cabinet|table|chair)\b",
        "Carpenter",
        "Woodwork repair, hinge adjustment, or custom fitting",
        "Carpentry work needed. We recommend booking an experienced Carpenter."
    ),
    (
        r"\b(painter|paint|painting|wallpaper|wall color|whitewash)\b",
        "Painter",
        "Wall paint peeling, surface prep, or repainting",
        "Wall surface issue detected. We recommend booking professional Painters."
    ),
    (
        r"\b(refrigerator|fridge|microwave|oven|stove|chimney|dishwasher)\b",
        "Appliance Repair",
        "Appliance component failure or heating issue",
        "Appliance issue detected. We recommend booking an Appliance Repair technician."
    ),
    (
        r"\b(tutor|tuition|teacher|coaching|maths|science|studies)\b",
        "Home Tutor",
        "Academic assistance required",
        "Home tutoring needed. We recommend connecting with qualified Home Tutors."
    ),
    (
        r"\b(beauty|salon|facial|makeup|haircut|waxing|manicure|pedicure)\b",
        "Beauty Services",
        "Personal grooming or salon service requested",
        "Beauty service requested. We recommend booking professional Beauty Specialists."
    ),
    (
        r"\b(pest|termite|cockroach|bugs|bug|rat|rats|rodent|ants|mosquito)\b",
        "Pest Control",
        "Pest infestation or preventative treatment needed",
        "Pest activity detected. We recommend booking certified Pest Control professionals."
    ),
]


def generate_service_recommendation(user_prompt: str) -> dict:
    system_prompt = (
        "You are an expert home service diagnostic system for LocalFix. "
        "Analyze the user's issue and return JSON with keys: "
        "'recommendedCategory', 'possibleIssue', 'recommendation'."
    )
    raw = call_gemini_api(user_prompt, system_prompt)
    if raw:
        try:
            cleaned = raw.strip().replace("```json", "").replace("```", "")
            return json.loads(cleaned)
        except Exception:
            pass

    # Whole-word regex matching
    text_lower = user_prompt.lower()
    for pattern, category, issue, recommendation in CATEGORY_KEYWORD_MAP:
        if re.search(pattern, text_lower):
            return {
                "recommendedCategory": category,
                "possibleIssue": issue,
                "recommendation": recommendation
            }

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
