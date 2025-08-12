from fastapi import FastAPI, HTTPException
from typing import Dict, Any
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from persona_generator.PersonaGenerator import PersonaGenerator

app = FastAPI(title="VPG MVP API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "VPG MVP API - Virtual Persona Generator", "version": "1.0.0"}

@app.post("/persona/generate")
async def create_persona(request: Dict[str, Any]):
    """Generate a persona from a text description"""
    try:
        description = request.get("description")
        if not description:
            raise HTTPException(status_code=400, detail="Description is required")
            
        # Create PersonaGenerator instance using environment variables
        generator = PersonaGenerator.from_env()
        
        # Generate persona
        persona = generator.generate(
            user_input=description,
            clean_with_validator=False  # Clean the output using PersonaValidator
        )
        
        return persona
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "MVP API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 