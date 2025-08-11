# generator.py
# Requirements:
#   pip install openai==1.* jsonschema python-dotenv
# Env:
#   export OPENAI_API_KEY=sk-xxx
#   export OPENAI_MODEL=gpt-4o-mini  # optional

import os
import json
from typing import Dict, Any, Optional, List

from dotenv import load_dotenv
from openai import OpenAI
import persona_generator.validator as validator

# ---- Load env
load_dotenv()
MODEL = os.getenv("OPENAI_MODEL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ---- Paths
SCHEMA_PATH = os.getenv("SCHEMA_PATH")


def load_schema(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def schema_to_function(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert JSON Schema (subset) into OpenAI function definition.
    """
    return {
        "name": "generate_persona",
        "description": "Generate a conversation-ready persona.",
        "parameters": {
            "type": "object",
            "properties": schema.get("properties", {}),
            "required": schema.get("required", []),
            "additionalProperties": schema.get("additionalProperties", False),
        },
    }


def build_messages(user_input: str,
                   recommend_llm_prompt_injection: Optional[str] = None,
                   extra_guidelines: Optional[List[str]] = None) -> list:
    """
    Build messages. If 'recommend_llm_prompt_injection' is provided,
    we nudge the model to include that field (optional) in the persona.
    """
    guidelines = [
        "Return only by calling the function with a valid persona object.",
        "Keep values concise and specific.",
        "Do not add fields not defined in the schema.",
    ]
    if extra_guidelines:
        guidelines.extend(extra_guidelines)

    system_text = (
        "You are a persona generator. "
        + " ".join(guidelines)
    )

    user_lines = [
        "Create a persona for dialogue generation from this description:",
        user_input,
        "",
        "Required fields: role, tone, traits, dialogue_behavior.",
        "Optional fields: id, name, quirks, scenario_tags, llm_prompt_injection."
    ]
    if recommend_llm_prompt_injection:
        user_lines.append(
            f"If appropriate, set 'llm_prompt_injection' to: {recommend_llm_prompt_injection}"
        )

    return [
        {"role": "system", "content": system_text},
        {"role": "user", "content": "\n".join(user_lines)},
    ]


def call_openai_function(messages: list, function_def: Dict[str, Any],
                         temperature: float = 1) -> Dict[str, Any]:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=OPENAI_API_KEY)

    resp = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=[{"type": "function", "function": function_def}],
        tool_choice={"type": "function", "function": {"name": function_def["name"]}},
        temperature=temperature,
    )

    tool_calls = resp.choices[0].message.tool_calls
    if not tool_calls:
        raise ValueError("Model did not perform a function call. Check prompts and model.")
    arguments_str = tool_calls[0].function.arguments
    try:
        persona = json.loads(arguments_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Function call returned invalid JSON: {arguments_str}") from e
    return persona


def validate_persona(persona: Dict[str, Any], schema: Dict[str, Any]) -> None:
    # Delegate validation to central validator module
    # Note: schema argument is kept for API compatibility but ignored.
    validator.validate_persona(persona)


def generate_persona(user_input: str,
                     schema_path: str = SCHEMA_PATH,
                     recommend_llm_prompt_injection: Optional[str] = None) -> Dict[str, Any]:
    """
    Main entry:
      1) load schema
      2) build function definition from schema
      3) build messages
      4) call OpenAI (function calling)
      5) validate and return
    """
    print(f"Generating persona for user input: {user_input}")
    schema = load_schema(schema_path)
    function_def = schema_to_function(schema)
    messages = build_messages(
        user_input=user_input,
        recommend_llm_prompt_injection=recommend_llm_prompt_injection
    )

    persona = call_openai_function(messages, function_def)
    try:
        validate_persona(persona, schema)
    except ValueError as e:
        # Optionally: add repair/fallback logic here
        raise ValueError(f"Persona failed schema validation: {str(e)}") from e
    return persona


if __name__ == "__main__":
    # Example: mock interviewer persona with STAR feedback rule as injection
    example_input = (
        "A senior engineering manager who speaks concisely, probes for tradeoffs, "
        "and dislikes vague answers."
    )
    example_injection = "Evaluate answers using the STAR method; give brief feedback each turn."
    result = generate_persona(
        user_input=example_input,
        recommend_llm_prompt_injection=example_injection
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
