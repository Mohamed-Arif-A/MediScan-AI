import google.generativeai as genai

# Step 1: Configure your Gemini API key
genai.configure(api_key="AIzaSyDVKOnVvwbGylT7DMQX3ebxxbB43Om6C5Y")

# Step 2: List all available models
models = genai.list_models()

for model in models:
    print(f"🧠 Model Name: {model.name}")
    print(f"✅ Supported generation methods: {model.supported_generation_methods}")
    print("-" * 50)
