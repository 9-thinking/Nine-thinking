import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import sys
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io

from model import predict_food
from nutrition_db import FOOD_DB

app = FastAPI()


def estimate_weight(width: int, height: int) -> int:
    """Estimate food portion weight (grams) from image pixel area."""
    area = width * height

    if area < 100_000:
        return 150
    if area < 250_000:
        return 300
    if area < 500_000:
        return 450
    return 600


@app.post("/detect")
async def detect_food(file: UploadFile = File(...)):
    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        return {"success": False, "message": "Invalid image file"}

    # Predict food class
    food_name, confidence = predict_food(image)

    # Fallback if predicted class not in nutrition DB
    if food_name not in FOOD_DB:
        return {
            "success": False,
            "message": f"No nutrition data for detected food: {food_name}"
        }

    # Estimate weight from image dimensions
    weight = estimate_weight(image.width, image.height)

    nutrition = FOOD_DB[food_name]
    factor = weight / 100

    return {
        "success": True,
        "food_name": food_name,
        "confidence": round(confidence * 100, 2),
        "weight": weight,
        "calories": round(nutrition["calories_per_100g"] * factor, 1),
        "protein":  round(nutrition["protein"]  * factor, 1),
        "carbs":    round(nutrition["carbs"]    * factor, 1),
        "fats":     round(nutrition["fats"]     * factor, 1),
    }


@app.get("/")
def home():
    return {"status": "AI Food Scanner Running"}