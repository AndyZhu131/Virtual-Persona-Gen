from fastapi import FastAPI, HTTPException
from typing import Dict, Any, List, Optional
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from persona_generator.PersonaGenerator import PersonaGenerator
from conversation_generator.ConversationGenerator import ConversationGenerator

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
        result = generator.generate(
            user_input=description,
            clean_with_validator=False  # Clean the output using PersonaValidator
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/conversation/start")
async def start_conversation(request: Dict[str, Any]):
    """Generate a persona and opening line for a new conversation"""
    try:
        description = request.get("description")
        context = request.get("context")  # Optional
        max_output_tokens = request.get("max_output_tokens")
        
        if not description:
            raise HTTPException(status_code=400, detail="Description is required")
        
        # Generate persona
        persona_generator = PersonaGenerator.from_env()
        persona_result = persona_generator.generate(
            user_input=description,
            clean_with_validator=False
        )
        
        # Generate opening line
        conversation_generator = ConversationGenerator.from_env()
        opening_result = conversation_generator.generate_opening_line(
            persona=persona_result["persona"],
            context=context,
            max_output_tokens=max_output_tokens
        )
        
        # Combine metadata from both operations
        combined_metadata = {
            "persona_generation": persona_result["metadata"],
            "opening_line_generation": opening_result["metadata"]
        }
        
        return {
            "persona": persona_result["persona"],
            "opening_line": opening_result["opening_line"],
            "metadata": combined_metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/conversation/respond")
async def continue_conversation(request: Dict[str, Any]):
    """Generate a response in an ongoing conversation"""
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
        
        # Generate conversation response
        conversation_generator = ConversationGenerator.from_env()
        response_result = conversation_generator.generate_conversation_response(
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