from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from openai import OpenAI
import os
import json
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Smart Triage Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

print("✅ Backend Started")

# ================== DEMO DATA ==================
DOCTORS = [
    {"name": "Dr. Kwame Asante", "specialty": "General Medicine", "room": "Room 1"},
    {"name": "Dr. Abena Owusu", "specialty": "Emergency Care", "room": "Room 2"},
]

queue = [
    {"patientId": "PAT-1001", "name": "Aisha Mohammed", "urgency": "severe", "symptoms": "Chest pain and shortness of breath"},
    {"patientId": "PAT-1002", "name": "Kwame Osei", "urgency": "moderate", "symptoms": "High fever and vomiting"},
    {"patientId": "PAT-1003", "name": "Fatima Ali", "urgency": "minor", "symptoms": "Mild headache and runny nose"},
]

# ================== MODELS ==================
class SymptomRequest(BaseModel):
    symptoms: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict]] = None

class JoinQueueRequest(BaseModel):
    patientId: str
    name: str
    urgency: str
    symptoms: str

# ================== CHAT ==================
@app.post("/chat")
async def chat(body: ChatRequest):
    try:
        messages = [
            {
                "role": "system",
                "content": """You are TriageHelper. Help patients describe symptoms clearly.
Ask one question at a time.
When ready, end with exactly: [SYMPTOMS READY]: <short summary>"""
            }
        ]

        # Use a safe copy of incoming history and avoid unbounded growth
        incoming_history = body.conversation_history or []
        # Keep only the most recent N turns to limit payload size
        max_history_messages = 20
        truncated_history = incoming_history[-max_history_messages:]

        for msg in truncated_history:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": body.message})

        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=700
        )

        reply = response.choices[0].message.content.strip()

        # Return a bounded updated history so the frontend doesn't keep growing it indefinitely
        updated = (incoming_history + [{"role": "user", "content": body.message}, {"role": "assistant", "content": reply}])
        updated_history = updated[-(max_history_messages * 2):]

        return {
            "reply": reply,
            "updated_history": updated_history
        }
    except Exception as e:
        print("Chat Error:", str(e))
        # Provide a safe fallback reply so the frontend remains responsive
        fallback_reply = (
            "I couldn't reach the AI service right now. "
            "Please briefly summarize your main symptom and how long you've had it."
        )

        updated = (
            (incoming_history if 'incoming_history' in locals() and incoming_history else [])
            + [{"role": "user", "content": body.message}, {"role": "assistant", "content": fallback_reply}]
        )
        updated_history = updated[-(max_history_messages * 2):] if 'max_history_messages' in locals() else updated

        return {"reply": fallback_reply, "updated_history": updated_history}


# ================== TRIAGE (Reliable) ==================
@app.post("/triage")
async def triage(body: SymptomRequest):
    symptoms = body.symptoms.lower().strip()
    
    # Reliable Keyword Triage
    if any(word in symptoms for word in ["chest", "heart", "breath", "breathing", "unconscious", "seizure", "stroke", "bleed", "attack", "faint", "heart attack"]):
        urgency = "severe"
        message = "This sounds like a serious or emergency condition. Please go to the Emergency Room immediately or call for help."
    elif any(word in symptoms for word in ["fever", "vomiting", "pain", "cough", "headache", "infection", "dizzy", "weak", "high fever"]):
        urgency = "moderate"
        message = "Your symptoms are moderate. We recommend you come to the hospital for proper assessment soon."
    else:
        urgency = "minor"
        message = "Your symptoms appear mild. You can wait a bit, but it's best to get checked if they persist or worsen."

    return {
        "urgency": urgency,
        "message": message,
        "disclaimer": "This is AI-assisted triage. Please consult a real doctor for proper medical advice."
    }


# ================== QUEUE ==================
@app.post("/join-queue")
async def join_queue(body: JoinQueueRequest):
    new_patient = {
        "patientId": body.patientId,
        "name": body.name,
        "urgency": body.urgency,
        "symptoms": body.symptoms,
        "status": "Waiting"
    }
    queue.append(new_patient)
    queue.sort(key=lambda x: {"severe": 1, "moderate": 2, "minor": 3}.get(x["urgency"], 3))

    position = next(
        (index for index, patient in enumerate(queue, start=1) if patient["patientId"] == body.patientId),
        len(queue)
    )
    estimated_wait = max(0, (position - 1) * 10)
    assigned_doctor = DOCTORS[0] if body.urgency == "severe" else DOCTORS[1]

    return {
        "message": "Added to queue successfully",
        "position": position,
        "estimated_wait": estimated_wait,
        "doctors": [assigned_doctor],
    }

@app.post("/call-next")
async def call_next():
    next_patient = next((patient for patient in queue if patient.get("status") == "Waiting"), None)
    if not next_patient:
        return {"called": None}

    assigned_doctor = DOCTORS[0] if next_patient["urgency"] == "severe" else DOCTORS[1]
    next_patient["status"] = "In Consultation"
    next_patient["doctor"] = assigned_doctor

    return {"called": next_patient, "doctor": assigned_doctor}

@app.get("/queue")
async def get_queue():
    return {"queue": queue}


@app.get("/health")
async def health_check():
    return {"status": "ok"}