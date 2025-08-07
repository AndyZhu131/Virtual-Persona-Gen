from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from persona_generator.generator import generate_persona

app = FastAPI(title="VPG MVP API", version="1.0.0")

class PersonaRequest(BaseModel):
    description: str
    
class PersonaResponse(BaseModel):
    role: str
    tone: str
    traits: List[str]
    dialogue_behavior: str
    name: Optional[str] = None
    quirks: Optional[List[str]] = None

@app.get("/")
async def root():
    return {"message": "VPG MVP API - Virtual Persona Generator", "version": "1.0.0"}

@app.post("/persona/generate", response_model=PersonaResponse)
async def create_persona(request: PersonaRequest):
    """Generate a persona from a text description"""
    try:
        persona = generate_persona(request.description)
        return PersonaResponse(**persona)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "MVP API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 