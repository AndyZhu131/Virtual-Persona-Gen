import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
from validator import validate_persona, clean_persona

load_dotenv()

MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def generate_persona(user_input: str) -> Dict[str, Any]:
    """
    Calls OpenAI with simple JSON parsing to generate a structured persona.
    Cost-optimized version for MVP.
    """
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=OPENAI_API_KEY)

    # Simplified prompt for cost efficiency
    system_prompt = """You are a persona generator. Generate a JSON persona from user input.
Return ONLY valid JSON with these required fields:
- "role": character's main role/job
- "tone": speaking style (e.g. "formal", "casual")  
- "traits": array of 2-3 personality traits
- "dialogue_behavior": how they speak in conversation

Optional fields: "name", "quirks" (array)

Example: {"role": "Teacher", "tone": "patient and encouraging", "traits": ["dedicated", "empathetic"], "dialogue_behavior": "speaks clearly, asks questions to check understanding"}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Create persona: {user_input}"}
        ],
        temperature=0.7,
        max_tokens=300  # Limit tokens to reduce cost
    )

    # Parse JSON from response
    try:
        content = response.choices[0].message.content.strip()
        # Remove any markdown formatting if present
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        
        persona = json.loads(content)
        
        # Clean and validate the persona
        persona = clean_persona(persona)
        validate_persona(persona)
        
        return persona
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from AI response: {e}")
    except ValueError as e:
        raise ValueError(f"Persona validation failed: {e}")


if __name__ == "__main__":
    example_input = "A 35-year-old introverted data scientist who speaks precisely and dislikes small talk."
    result = generate_persona(example_input)
    print(json.dumps(result, indent=2, ensure_ascii=False))
