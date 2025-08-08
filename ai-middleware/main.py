from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create OpenAI client using env API key
client = OpenAI()

# Create FastAPI app
app = FastAPI()

# Enable CORS for frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class Query(BaseModel):
    message: str

# POST route to handle AI queries
@app.post("/ask-ai")
async def ask_ai(query: Query):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for the Helpdesk Lite project."},
                {"role": "user", "content": query.message}
            ]
        )
        reply = response.choices[0].message.content
        return {"reply": reply.strip() if reply else "⚠️ No response from AI."}
    except Exception as e:
        return {"error": str(e)}
