import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "food_model.h5")
model = load_model(MODEL_PATH)

CLASSES = [
    "burger",
    "chicken_rice",
    "fried_rice",
    "laksa",
    "mee_goreng",
    "nasi_lemak",
    "pizza",
    "roti_canai",
    "salad",
    "satay"
]

def predict_food(image):
    """
    Predict the food class from a PIL Image.
    Returns (class_name: str, confidence: float)
    """
    image = image.convert("RGB")
    image = image.resize((224, 224))

    arr = np.array(image, dtype=np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)   # shape: (1, 224, 224, 3)

    prediction = model.predict(arr, verbose=0)

    idx = int(np.argmax(prediction))
    confidence = float(prediction[0][idx])

    return CLASSES[idx], confidence