from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import io
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

    print("🚀 Starting MediScan AI backend...")

    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    try:
        print("📦 Loading Keras model...")
        model_path = "facial_skin_model.keras"
        model = load_model(model_path)
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")

    if GEMINI_ENABLED and api_key:
        try:
            genai.configure(api_key=api_key)
            gemini_model = genai.GenerativeModel("models/gemini-1.5-flash")
            print("✅ Gemini model loaded.")
        except Exception as e:
            print(f"⚠ Gemini configuration failed: {e}")
    else:
        print("⚠ Gemini not enabled or missing API key.")

async def get_health_advice(condition: str, lang: str) -> str:
    if not gemini_model:
        return f"ℹ Gemini not available. No remedy for '{condition}'."

    lang = lang.lower()

    if lang == "tamil":
        prompt = f"""
நீங்கள் ஒரு தோல் நிபுணர். "{condition}" என்ற தோல் நிலைமை பற்றி தமிழில் விளக்குங்கள்:

💡 விளக்கம்  
🔥 காரணங்கள்  
🌿 சிகிச்சைகள்  
📊 கடுமை நிலை  
👨‍⚕ மருத்துவர் ஆலோசனை  
"""
    elif lang == "tanglish":
        prompt = f"""
You are a skincare assistant. Explain the skin condition "{condition}" using Tanglish (Tamil in English script):

💡 Vilakkam (Description)  
🔥 Kaaranangal (Causes)  
🌿 Sikkichai (Remedies)  
📊 Kadumai Nilai (Severity)  
👨‍⚕ Maruthuva Alosanai (Doctor Advice)  
"""
    elif lang == "english":
        prompt = f"""
You are a professional skin care assistant. Explain the skin condition "{condition}" in English:

💡 Description  
🔥 Causes  
🌿 Remedies  
📊 Severity  
👨‍⚕ Doctor Advice  
"""
    else:
        return "❌ Invalid language selected. Choose from: 'tamil', 'english', or 'tanglish'."

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: gemini_model.generate_content(prompt))
        return response.text.strip()
    except Exception as e:
        return f"❌ Gemini error: {e}"

@app.post("/upload/")
async def upload_image(
    file: UploadFile = File(...),
    lang: str = Form("")
):
    try:
        print(f"📸 Received: {file.filename} ({file.content_type}), Language: {lang}")

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        prediction = model.predict(img_array)
        predicted_class = class_names[np.argmax(prediction)]

        advice = await get_health_advice(predicted_class, lang)

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



#Command for running Terminal
#uvicorn main:app --backend ---cd backend
#npm run start --frontend ---cd frontend
