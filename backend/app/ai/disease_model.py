"""
AI Crop Disease Detection Module
----------------------------------
Uses a mock intelligent classifier (Option B from spec).
Randomly selects from common diseases with realistic confidence
scores and returns proper treatment advice.

In production, replace `predict_disease()` with a real
TensorFlow/Keras model inference call.
"""

import random
from PIL import Image
import io

DISEASE_DATA = {
    "Leaf Blight": {
        "treatment": (
            "1. Remove and destroy infected leaves immediately.\n"
            "2. Apply copper-based fungicide (Copper Oxychloride) every 7-10 days.\n"
            "3. Ensure proper air circulation between plants.\n"
            "4. Avoid overhead irrigation; use drip irrigation instead.\n"
            "5. Apply neem-based pesticide as a preventive measure."
        ),
        "severity": "High",
    },
    "Powdery Mildew": {
        "treatment": (
            "1. Apply sulfur-based fungicide at the first sign of infection.\n"
            "2. Spray potassium bicarbonate solution (1 tbsp per quart water).\n"
            "3. Remove heavily infected plant parts.\n"
            "4. Improve air circulation by proper plant spacing.\n"
            "5. Avoid wetting foliage during watering.\n"
            "6. Use resistant varieties in future seasons."
        ),
        "severity": "Medium",
    },
    "Rust": {
        "treatment": (
            "1. Apply triazole or strobilurin fungicide immediately.\n"
            "2. Remove and burn infected plant debris.\n"
            "3. Rotate crops annually to break disease cycle.\n"
            "4. Apply preventive fungicide spray before wet season.\n"
            "5. Use disease-resistant seed varieties.\n"
            "6. Maintain proper field drainage."
        ),
        "severity": "High",
    },
    "Healthy": {
        "treatment": (
            "Your plant appears healthy! Maintain good practices:\n"
            "1. Water regularly but avoid waterlogging.\n"
            "2. Apply balanced NPK fertilizer as per schedule.\n"
            "3. Monitor weekly for any early signs of disease.\n"
            "4. Ensure proper sunlight and air circulation.\n"
            "5. Practice crop rotation each season."
        ),
        "severity": "None",
    },
    "Early Blight": {
        "treatment": (
            "1. Apply chlorothalonil or mancozeb fungicide.\n"
            "2. Remove lower infected leaves first.\n"
            "3. Mulch around plant base to reduce soil splash.\n"
            "4. Ensure proper plant nutrition, especially potassium.\n"
            "5. Spray every 7 days during humid conditions."
        ),
        "severity": "Medium",
    },
    "Bacterial Spot": {
        "treatment": (
            "1. Apply copper-based bactericide spray.\n"
            "2. Remove infected plant parts immediately.\n"
            "3. Avoid working with plants when wet.\n"
            "4. Disinfect tools with 10% bleach solution.\n"
            "5. Use certified disease-free seeds next season."
        ),
        "severity": "High",
    },
}


def validate_image(image_data: bytes) -> bool:
    """Basic image validation using Pillow"""
    try:
        img = Image.open(io.BytesIO(image_data))
        img.verify()
        return True
    except Exception:
        return False


def get_image_info(image_data: bytes) -> dict:
    """Extract basic image metadata"""
    try:
        img = Image.open(io.BytesIO(image_data))
        return {"width": img.width, "height": img.height, "format": img.format, "mode": img.mode}
    except Exception:
        return {}


def predict_disease(image_data: bytes) -> dict:
    """
    Mock intelligent disease classifier.

    In production, replace this with:
        model = tf.keras.models.load_model('disease_model.h5')
        img_array = preprocess_image(image_data)
        predictions = model.predict(img_array)
        ...
    """
    # Validate image first
    if not validate_image(image_data):
        raise ValueError("Invalid or corrupted image file")

    # Weighted random selection (Healthy slightly more common)
    diseases = list(DISEASE_DATA.keys())
    weights = [0.20, 0.18, 0.18, 0.28, 0.08, 0.08]  # matches disease list order

    selected_disease = random.choices(diseases, weights=weights, k=1)[0]
    data = DISEASE_DATA[selected_disease]

    # Healthy plants get higher confidence
    if selected_disease == "Healthy":
        confidence = round(random.uniform(0.88, 0.97), 4)
    else:
        confidence = round(random.uniform(0.80, 0.94), 4)

    return {
        "disease_name": selected_disease,
        "confidence": confidence,
        "treatment": data["treatment"],
        "severity": data["severity"],
    }
