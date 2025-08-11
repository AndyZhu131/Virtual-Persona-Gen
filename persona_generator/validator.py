import json
import jsonschema
import os
from typing import Dict, Any

SCHEMA_PATH = os.getenv("SCHEMA_PATH")

def load_schema() -> Dict[str, Any]:
    """Load the MVP persona schema"""
    with open(SCHEMA_PATH, "r") as f:
        return json.load(f)

def validate_persona(persona: Dict[str, Any]) -> bool:
    """
    Validate persona against MVP schema.
    Returns True if valid, raises ValidationError if invalid.
    """
    schema = load_schema()
    try:
        jsonschema.validate(persona, schema)
        return True
    except jsonschema.ValidationError as e:
        raise ValueError(f"Persona validation failed: {e.message}")

def clean_persona(persona: Dict[str, Any]) -> Dict[str, Any]:
    """
    Clean and normalize persona data for MVP.
    Ensures traits array has 2-3 items and removes empty fields.
    """
    cleaned = {}
    
    # Required fields
    for field in ["role", "tone", "traits", "dialogue_behavior"]:
        if field in persona:
            cleaned[field] = persona[field]
    
    # Optional fields (only include if present and non-empty)
    for field in ["name", "quirks"]:
        if field in persona and persona[field]:
            cleaned[field] = persona[field]
    
    # Ensure traits is properly sized
    if "traits" in cleaned and isinstance(cleaned["traits"], list):
        # Limit to 3 traits max for MVP
        cleaned["traits"] = cleaned["traits"][:3]
        # Ensure at least 2 traits
        while len(cleaned["traits"]) < 2:
            cleaned["traits"].append("adaptable")
    
    return cleaned 