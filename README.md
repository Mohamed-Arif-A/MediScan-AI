# 🧠 MediScan AI – Facial Skin Health Advisor

**MediScan AI** is an intelligent web application that analyzes facial skin and identifies common skin conditions using deep learning.  
It leverages a lightweight **MobileNetV2** model and a fast **FastAPI** backend to provide instant, high-accuracy results.  
With a modern React frontend, MediScan AI offers an accessible and reliable tool for early skin health awareness.

---

## 🌟 Key Features

- 📷 **Image Upload** – Upload facial images directly from your device
- 🧠 **AI-Powered Diagnosis** – Detects 8 facial skin conditions using MobileNetV2
- ⚡ **Real-Time Prediction** – FastAPI backend provides instant results
- 💻 **Responsive Frontend** – Built with React for smooth user experience
- 📊 **High Accuracy** – Trained on custom, balanced skin condition dataset

---

## 🧬 Skin Conditions Covered

MediScan AI can identify the following skin conditions:

- 🟤 **Acne**  
- ⚫ **Blackheads**  
- ⚪ **Whiteheads**  
- 🔴 **Spots**  
- 🕳️ **Scars**  
- 🌾 **Dry Skin**  
- 💧 **Oily Skin**  
- ✅ **Clear (Healthy) Skin**

---

## 🧰 Tech Stack

| Layer        | Tools Used                               |
|--------------|-------------------------------------------|
| **Frontend** | React, HTML5, CSS3                        |
| **Backend**  | FastAPI (Python 3.10)                     |
| **Model**    | TensorFlow, Keras, MobileNetV2            |
| **Training** | Google Colab                              |
| **Markdown Rendering** | Marked.js                      |

---

## 🗂 Project Structure

```bash
MediScan-AI/
├── frontend/             # React frontend
│   └── src/
│       └── App.jsx       # Image upload & display
│
├── backend/              # FastAPI backend
│   └── main.py           # Prediction endpoint
│
├── model/                # Trained Keras model
│   └── facial_skin_model.keras
│
├── dataset/              # Organized dataset (local, not uploaded)
│
└── README.md             # Project documentation
