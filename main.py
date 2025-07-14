from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import asyncio
from dotenv import load_dotenv

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image

try:
    import google.generativeai as genai
    GEMINI_ENABLED = True
except ImportError:
    GEMINI_ENABLED = False

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
gemini_model = None
class_names = ['Acne', 'Blackheads', 'Clear', 'Dry', 'Oily', 'Scars', 'Spots', 'Whiteheads']

@app.on_event("startup")
def load_dependencies():
    global model, gemini_model

    print("🔄 Starting up...")

    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    try:
        print("📦 Loading facial_skin_model.keras...")
        model_path = os.path.join(os.getcwd(), "facial_skin_model.keras")
        model = load_model(model_path)
        print("✅ Skin model loaded.")
    except Exception as e:
        print("❌ Model load error:", e)
        raise

    if GEMINI_ENABLED and api_key:
        try:
            genai.configure(api_key=api_key)
            gemini_model = genai.GenerativeModel("models/gemini-1.5-flash")
            print("✅ Gemini model ready.")
        except Exception as e:
            print("⚠️ Gemini load error:", e)
    else:
        print("⚠️ Gemini disabled or API key missing.")

async def get_health_advice(condition: str) -> str:
    if not gemini_model:
        return "ℹ️ Gemini not available."

    prompt = f"""
You are a medical assistant. Explain the skin condition: "{condition}" in both English and Tamil.

🔹 **English**  
💡 Description:  
🔥 Causes:  
🌿 Remedies:  
📊 Severity:  
👨‍⚕️ Doctor Advice:

🔹 **தமிழ்**  
💡 விளக்கம்:  
🔥 காரணங்கள்:  
🌿 வழிகள்:  
📊 நிலைமை:  
👨‍⚕️ மருத்துவர் ஆலோசனை:
    """

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: gemini_model.generate_content(prompt))
        return response.text
    except Exception as e:
        return f"❌ Gemini error: {e}"

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        prediction = model.predict(img_array)
        predicted_class = class_names[np.argmax(prediction)]

        advice = await get_health_advice(predicted_class)

        return {
            "filename": file.filename,
            "condition": predicted_class,
            "advice": advice
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
def root():
    return {"message": "Welcome to MediScan AI backend"}
