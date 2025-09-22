from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from persona_generator.PersonaGenerator import PersonaGenerator
from conversation_generator.ConversationGenerator import ConversationGenerator

app = FastAPI(title="VPG MVP API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        
        # Get optional parameters
        max_output_tokens = request.get("max_output_tokens")
        reasoning_effort = request.get("reasoning_effort", "low")
        
        # Generate persona only (without opening line)
        result = generator.generate_persona_only(
            user_input=description,
            clean_with_validator=False,  # Clean the output using PersonaValidator
            max_output_tokens=max_output_tokens,
            reasoning_effort=reasoning_effort
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/conversation/start")
async def start_conversation(request: Dict[str, Any]):
    """Generate a persona and opening line for a new conversation using unified generator"""
    try:
        description = request.get("description")
        context = request.get("context")  # Optional
        max_output_tokens = request.get("max_output_tokens")
        reasoning_effort = request.get("reasoning_effort", "low")
        
        if not description:
            raise HTTPException(status_code=400, detail="Description is required")
        
        # Use unified generator to generate both persona and opening line
        generator = PersonaGenerator.from_env()
        result = generator.generate_persona_with_opening_line(
            user_input=description,
            context=context,
            clean_with_validator=False,
            max_output_tokens=max_output_tokens,
            reasoning_effort=reasoning_effort
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/conversation/respond")
async def continue_conversation(request: Dict[str, Any]):
    """Generate a response in an ongoing conversation using unified generator"""
    try:
        persona = request.get("persona")
        conversation_history = request.get("conversation_history")
        context = request.get("context")  # Optional
        max_output_tokens = request.get("max_output_tokens")
        
        if not persona:
            raise HTTPException(status_code=400, detail="Persona is required")
        if not conversation_history:
            raise HTTPException(status_code=400, detail="Conversation history is required")
        if not isinstance(conversation_history, list):
            raise HTTPException(status_code=400, detail="Conversation history must be a list")
        
        # Use unified generator for conversation response
        generator = PersonaGenerator.from_env()
        response_result = generator.generate_conversation_response(
            persona=persona,
            conversation_history=conversation_history,
            context=context,
            max_output_tokens=max_output_tokens
        )
        
        return {
            "conversation_response": response_result["conversation_response"],
            "metadata": response_result["metadata"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "MVP API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 