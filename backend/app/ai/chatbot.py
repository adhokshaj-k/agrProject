"""
Agriculture AI Chatbot
-----------------------
Rule-based intelligent chatbot for farming advice.
Handles common agricultural queries with keyword matching.
"""

from datetime import datetime

# Knowledge base for the chatbot
KNOWLEDGE_BASE = {
    "yellow": {
        "keywords": ["yellow", "yellowing", "pale", "chlorosis"],
        "response": (
            "🌿 **Nitrogen Deficiency Detected**\n\n"
            "Yellow leaves are a common sign of nitrogen deficiency. Here's what to do:\n\n"
            "• **Immediate Action**: Apply urea (46-0-0) at 20-25 kg/acre\n"
            "• **Organic Option**: Apply well-decomposed cow dung manure (2-3 tons/acre)\n"
            "• **Foliar Spray**: 2% urea solution spray on leaves\n"
            "• **Soil Test**: Get soil tested to confirm deficiency\n"
            "• **Prevention**: Apply split doses of nitrogen fertilizer\n\n"
            "⚠️ Note: Over-application can burn plants. Follow recommended doses."
        ),
    },
    "pest": {
        "keywords": ["pest", "insect", "bug", "worm", "larvae", "aphid", "caterpillar", "whitefly"],
        "response": (
            "🐛 **Pest Management Guide**\n\n"
            "For effective pest control in agriculture:\n\n"
            "• **Identify First**: Take a clear photo and consult a local agricultural officer\n"
            "• **Chemical Control**: Use recommended pesticides like Chlorpyrifos or Imidacloprid\n"
            "• **Bio-pesticides**: Neem oil spray (5ml/liter water) is eco-friendly\n"
            "• **Bt Sprays**: Bacillus thuringiensis for caterpillars\n"
            "• **Traps**: Use yellow sticky traps for whiteflies and aphids\n"
            "• **Timing**: Early morning or evening spraying is most effective\n\n"
            "✅ Always use PPE (gloves, mask) when handling pesticides."
        ),
    },
    "fungus": {
        "keywords": ["fungus", "fungal", "mold", "mould", "blight", "rot", "rust", "mildew"],
        "response": (
            "🍄 **Fungal Disease Treatment**\n\n"
            "Fungal diseases need prompt treatment:\n\n"
            "• **Copper Fungicides**: Copper oxychloride (3g/liter) for broad-spectrum control\n"
            "• **Mancozeb**: 2g/liter water, effective for blight and rust\n"
            "• **Trifloxystrobin**: For powdery mildew (systemic fungicide)\n"
            "• **Neem Extract**: 10ml/liter as an organic alternative\n"
            "• **Cultural Practices**: Remove infected plant material, improve drainage\n"
            "• **Preventive Spray**: Apply before rainy season starts\n\n"
            "📅 Spray schedule: Every 7-14 days during wet/humid conditions."
        ),
    },
    "season": {
        "keywords": ["season", "crop", "sow", "plant", "grow", "kharif", "rabi", "zaid", "monsoon"],
        "response": (
            "🌾 **Seasonal Crop Recommendations**\n\n"
            "**Kharif Season (June–November):**\n"
            "• Rice, Maize, Cotton, Soybean, Groundnut, Bajra\n\n"
            "**Rabi Season (November–April):**\n"
            "• Wheat, Barley, Mustard, Peas, Chickpea\n\n"
            "**Zaid Season (March–June):**\n"
            "• Watermelon, Muskmelon, Cucumber, Vegetables\n\n"
            "**Tips:**\n"
            "• Always check local mandi prices before deciding crop\n"
            "• Consult KVK (Krishi Vigyan Kendra) for region-specific advice\n"
            "• Consider drought-resistant varieties in water-scarce regions"
        ),
    },
    "water": {
        "keywords": ["water", "irrigation", "drip", "flood", "moisture", "rain", "drought", "sprinkler"],
        "response": (
            "💧 **Irrigation & Water Management**\n\n"
            "Efficient water use is critical for farming success:\n\n"
            "**Irrigation Methods:**\n"
            "• **Drip Irrigation**: Best for fruits and vegetables (90% efficiency)\n"
            "• **Sprinkler System**: Good for field crops, saves 30-40% water\n"
            "• **Flood Irrigation**: Traditional but wasteful; use for paddy only\n\n"
            "**Best Practices:**\n"
            "• Water in early morning or evening to reduce evaporation\n"
            "• Install soil moisture sensors for precision irrigation\n"
            "• Mulching reduces water need by 40-50%\n"
            "• Check government subsidy for drip/sprinkler installation\n\n"
            "🌦️ Rainfall data: Use IMD weather app for local forecasts."
        ),
    },
    "price": {
        "keywords": ["price", "rate", "mandi", "market", "cost", "sell", "profit", "MSP", "minimum"],
        "response": (
            "💰 **Market Price & Mandi Information**\n\n"
            "For current agricultural market prices:\n\n"
            "**Check Prices Online:**\n"
            "• Visit: agmarknet.gov.in for real-time mandi prices\n"
            "• eNAM Portal: enam.gov.in for national market\n"
            "• SMS: Send 'KISAN' to 51969\n\n"
            "**MSP 2024-25 (Indicative):**\n"
            "• Wheat: ₹2,275/quintal\n"
            "• Rice (Common): ₹2,300/quintal\n"
            "• Maize: ₹2,090/quintal\n"
            "• Cotton (Long): ₹7,121/quintal\n\n"
            "⚠️ Prices vary by region and quality. Contact local APMC mandi for accurate rates."
        ),
    },
    "fertilizer": {
        "keywords": ["fertilizer", "manure", "npk", "urea", "dap", "potash", "compost", "organic"],
        "response": (
            "🌱 **Fertilizer Guide**\n\n"
            "**Major Nutrients & Sources:**\n"
            "• **Nitrogen (N)**: Urea (46%), CAN (25%), farmyard manure\n"
            "• **Phosphorus (P)**: DAP, SSP, bone meal\n"
            "• **Potassium (K)**: MOP (Muriate of Potash), wood ash\n\n"
            "**General Recommendations:**\n"
            "• Always get soil tested before fertilizer application\n"
            "• Apply basal dose before planting, top-dress later\n"
            "• Organic manure improves soil health long-term\n"
            "• PM-KISAN scheme provides subsidy on fertilizers\n\n"
            "💡 Tip: Integrated Nutrient Management (INM) = chemical + organic = best results."
        ),
    },
    "soil": {
        "keywords": ["soil", "sand", "clay", "loam", "pH", "acidic", "alkaline", "drainage", "compost"],
        "response": (
            "🪱 **Soil Health Management**\n\n"
            "**Ideal Soil Parameters:**\n"
            "• pH: 6.0 – 7.5 (most crops)\n"
            "• Organic Carbon: > 0.5%\n"
            "• Good drainage + water retention balance\n\n"
            "**How to Improve Soil:**\n"
            "• Add organic matter (compost, vermicompost, FYM)\n"
            "• Use green manure crops (dhaincha, sun hemp)\n"
            "• Lime application for acidic soils\n"
            "• Gypsum for saline/alkaline soils\n\n"
            "**Government Resources:**\n"
            "• Soil Health Card Scheme – get free soil testing\n"
            "• Visit your local KVK for guidance"
        ),
    },
}

GENERAL_ADVICE = (
    "🌾 **General Farming Advice**\n\n"
    "I'm your AgriConnect AI assistant! Here are some tips I can help with:\n\n"
    "• 💧 **Water**: Ask about irrigation methods\n"
    "• 🌿 **Yellow leaves**: Nitrogen deficiency solutions\n"
    "• 🐛 **Pest**: Pesticide & pest management\n"
    "• 🍄 **Fungus**: Fungicide treatments\n"
    "• 🌾 **Season**: Crop recommendations by season\n"
    "• 💰 **Price**: Mandi rates & MSP info\n"
    "• 🌱 **Fertilizer**: NPK and organic manure\n"
    "• 🪱 **Soil**: Soil health improvement\n\n"
    "Just ask your farming question in simple language!"
)


def get_chatbot_response(message: str) -> str:
    """
    Rule-based chatbot that matches keywords and returns relevant advice.
    """
    message_lower = message.lower().strip()

    for category, data in KNOWLEDGE_BASE.items():
        for keyword in data["keywords"]:
            if keyword in message_lower:
                return data["response"]

    # Greetings
    greetings = ["hello", "hi", "hey", "namaste", "good morning", "good evening"]
    if any(g in message_lower for g in greetings):
        return (
            "🙏 **Namaste! Welcome to AgriConnect AI**\n\n"
            "I'm your intelligent farming assistant. I can help with:\n"
            "• Crop diseases and treatments\n"
            "• Pest management\n"
            "• Irrigation advice\n"
            "• Market prices\n"
            "• Seasonal crop recommendations\n\n"
            "How can I help you today? Type your farming question!"
        )

    # Help request
    if "help" in message_lower or "?" in message_lower:
        return GENERAL_ADVICE

    # Default fallback
    return GENERAL_ADVICE
