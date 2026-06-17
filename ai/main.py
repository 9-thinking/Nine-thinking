import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import sys
sys.path.insert(0, os.path.dirname(__file__))

# Load .env from project root (one level up from ai/)
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import io
import json
import base64
import re

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from google import genai
from google.genai import types

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Configure Gemini
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY is not set. Food scanning will fail.")

client = genai.Client(api_key=GEMINI_API_KEY)

# Use gemini-2.5-flash — confirmed working on this project
MODEL = "gemini-2.5-flash"

# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------
ANALYSIS_PROMPT = """You are a professional nutritionist and food recognition AI.

Analyse the food in this image and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

The JSON must have exactly these keys:
{
  "food_name": "short name of the food (e.g. 'Nasi Lemak', 'Caesar Salad', 'Pepperoni Pizza')",
  "description": "1-2 sentence description of what you see including visible ingredients, cooking method, and portion size",
  "weight_estimate_g": <integer — estimated total weight of the food portion in grams>,
  "calories": <number — estimated total kcal for the portion>,
  "protein": <number — grams of protein>,
  "carbs": <number — grams of carbohydrates>,
  "fats": <number — grams of fat>,
  "confidence": <integer 0-100 — your confidence in the estimate>,
  "confidence_note": "brief note explaining confidence level, e.g. 'Clear top-down photo of a standard serving'"
}

Rules:
- Base your estimates on the ACTUAL food visible in the image, not generic averages.
- Account for visible portion size, toppings, sauces, and ingredients.
- If you cannot identify any food at all, set "food_name" to "Unknown" and all numeric fields to 0.
- Return ONLY the raw JSON. No markdown. No extra text.
"""


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@app.post("/detect")
async def detect_food(file: UploadFile = File(...)):
    contents = await file.read()

    # Validate image
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        return {"success": False, "message": "Invalid image file"}

    if not GEMINI_API_KEY:
        return {
            "success": False,
            "message": "GEMINI_API_KEY is not configured on the AI server."
        }

    # Convert image to bytes for Gemini
    img_bytes = io.BytesIO()
    image.save(img_bytes, format="JPEG", quality=90)
    img_bytes.seek(0)

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(
                    data=img_bytes.read(),
                    mime_type="image/jpeg",
                ),
                ANALYSIS_PROMPT,
            ],
        )
        raw = response.text.strip()

        # Strip markdown code fences if model added them anyway
        raw = re.sub(r"^```[a-z]*\n?", "", raw, flags=re.IGNORECASE)
        raw = re.sub(r"\n?```$", "", raw, flags=re.IGNORECASE)
        raw = raw.strip()

        data = json.loads(raw)

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "message": f"Gemini returned non-JSON response: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Gemini API error: {str(e)}"
        }

    # Normalise types
    food_name = str(data.get("food_name", "Unknown"))
    if food_name.lower() == "unknown":
        return {
            "success": False,
            "message": "Could not identify any food in the image."
        }

    return {
        "success": True,
        "food_name": food_name,
        "description": str(data.get("description", "")),
        "weight": int(data.get("weight_estimate_g", 0)),
        "calories": round(float(data.get("calories", 0)), 1),
        "protein":  round(float(data.get("protein", 0)), 1),
        "carbs":    round(float(data.get("carbs", 0)), 1),
        "fats":     round(float(data.get("fats", 0)), 1),
        "confidence": int(data.get("confidence", 0)),
        "confidence_note": str(data.get("confidence_note", "")),
    }


@app.get("/")
def home():
    return {"status": "AI Food Scanner Running (Gemini Vision)"}