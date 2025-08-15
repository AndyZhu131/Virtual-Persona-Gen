# persona_generator/validator.py
# Requirements:
#   pip install jsonschema
# Env:
#   export SCHEMA_PATH=path/to/persona_schema_v1.1.json

import os
import json
from typing import Dict, Any, Optional

import jsonschema


class PersonaValidator:
    """
    Class-based validator that:
      - loads the MVP persona schema (from SCHEMA_PATH or provided path)
      - validates persona dicts, raising ValueError on failure
      - cleans/normalizes persona dicts for MVP usage
    """

    def __init__(self, schema_path: Optional[str] = None) -> None:
        self.schema_path = schema_path or os.getenv("SCHEMA_PATH")
        if not self.schema_path:
            raise RuntimeError("SCHEMA_PATH is not set. Please set env or pass schema_path.")
        self._schema: Optional[Dict[str, Any]] = None  # lazy-loaded

    def _load_schema(self) -> Dict[str, Any]:
        if self._schema is None:
            with open(self.schema_path, "r", encoding="utf-8") as f:
                self._schema = json.load(f)
        return self._schema

    # ---- Public API ----

    def validate_persona(self, persona: Dict[str, Any]) -> bool:
        """
        Validate persona against MVP schema.
        Returns True if valid, raises ValueError if invalid.
        """
        schema = self._load_schema()
        try:
            jsonschema.validate(persona, schema)
            return True
        except jsonschema.ValidationError as e:
            raise ValueError(f"Persona validation failed: {e.message}")

    def clean_persona(self, persona: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clean and normalize persona data for MVP.
        - Keep required fields if present: role, tone, traits, dialogue_behavior
        - Keep optional non-empty: name, quirks
        - Ensure traits length is between 2 and 3 (pad with 'adaptable' if needed)
        """
        cleaned: Dict[str, Any] = {}

        # Required fields (copy if present)
        for field in ["role", "tone", "traits", "dialogue_behavior"]:
            if field in persona:
                cleaned[field] = persona[field]

        # Optional fields (only include if present and non-empty)
        for field in ["name", "quirks"]:
            if field in persona and persona[field]:
                cleaned[field] = persona[field]

        # Ensure traits sizing
        if "traits" in cleaned and isinstance(cleaned["traits"], list):
            # Limit to 3 traits max for MVP
            cleaned["traits"] = cleaned["traits"][:3]
            # Ensure at least 2 traits
            while len(cleaned["traits"]) < 2:
                cleaned["traits"].append("adaptable")

        return cleaned


