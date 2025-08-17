# persona_generator/generator.py
# Requirements:
#   pip install openai==1.* jsonschema python-dotenv
# Env:
#   export OPENAI_API_KEY=sk-xxx
#   export OPENAI_MODEL=gpt-4o-mini        # optional
#   export SCHEMA_PATH=path/to/persona_schema_v1.1.json  # optional

import os
import json
import time
from typing import Dict, Any, Optional, List

from dotenv import load_dotenv
from openai import OpenAI
from persona_generator.PersonaValidator import PersonaValidator  # <-- use the class-based validator


class PersonaGenerator:
    """
    Class-based persona generator that:
      1) loads a JSON Schema
      2) builds an OpenAI function definition from the schema
      3) builds messages
      4) calls OpenAI with function calling
      5) validates and returns the persona dict (via PersonaValidator)
    """

    def __init__(
        self,
        schema_path: str,
        model: str,
        api_key: str,
        validator: Optional[PersonaValidator] = None,
    ) -> None:
        """
        Args:
            schema_path: Path to the persona JSON schema file.
            model: OpenAI model name (e.g., 'gpt-5-nano').
            api_key: OpenAI API key.
            validator: Optional PersonaValidator instance. If None, one will be created.

        """
        self.schema_path = schema_path
        self.model = model
        self.api_key = api_key


        # Load schema once for building function definition
        self._schema: Dict[str, Any] = self._load_schema(schema_path)
        self._function_def: Dict[str, Any] = self._schema_to_function(self._schema)

        # OpenAI client
        self._client = OpenAI(api_key=self.api_key)

        # Validation strategy: always use PersonaValidator
        self._validator: PersonaValidator = validator or PersonaValidator(schema_path=self.schema_path)

    # --------- Factories ---------
    @classmethod
    def from_env(
        cls,
        validator: Optional[PersonaValidator] = None,
        default_model: str = "gpt-5-nano",
        default_schema_path: str = "persona_generator/schema/persona_schema_v1.1.json",

    ) -> "PersonaGenerator":
        """
        Create a PersonaGenerator using environment variables.
        """
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")

        model = os.getenv("OPENAI_MODEL", default_model)
        schema_path = os.getenv("SCHEMA_PATH", default_schema_path)

        # If no validator provided, create one bound to the same schema_path
        if validator is None:
            validator = PersonaValidator(schema_path=schema_path)

        return cls(
            schema_path=schema_path,
            model=model,
            api_key=api_key,
            validator=validator,

        )

    # --------- Core steps ---------
    @staticmethod
    def _load_schema(path: str) -> Dict[str, Any]:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def _schema_to_function(schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert JSON Schema (subset) into an OpenAI function definition.
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

    @staticmethod
    def _build_api_input(
        user_input: str,
        recommend_llm_prompt_injection: Optional[str] = None,
        extra_guidelines: Optional[List[str]] = None,
    ) -> List[Dict[str, str]]:
        """
        Build the system + user input for the Responses API.
        """
        guidelines = [
            "Return only by calling the function with a valid persona object.",
            "Keep values concise and specific.",
            "Do not add fields not defined in the schema.",
            "Do not generate optional fields if they are not necessary or relevant to the persona.",
            "Only include optional fields when they add meaningful value to the persona description.",
        ]
        if extra_guidelines:
            guidelines.extend(extra_guidelines)

        system_text = "You are a persona generator. " + " ".join(guidelines)

        user_lines = [
            "Create a persona for dialogue generation from this description:",
            user_input,
            "",
            "Required fields: role, tone, traits, dialogue_behavior.",
            "Optional fields: id, name, quirks, scenario_tags, llm_prompt_injection.",
            "Note: Only include optional fields if they are necessary and add meaningful value to the persona. Do not generate optional fields just to fill them out.",
        ]
        if recommend_llm_prompt_injection:
            user_lines.append(
                f"If appropriate, set 'llm_prompt_injection' to: {recommend_llm_prompt_injection}"
            )

        return [
            {"role": "system", "content": system_text},
            {"role": "user", "content": "\n".join(user_lines)},
        ]

    def _call_openai_function(self, api_input: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Call OpenAI Responses API with function calling and return parsed persona dict with metadata.
        """
        # Record start time
        start_time = time.time()
        
        try:
            # Responses API requires flattened tool structure
            resp = self._client.responses.create(
                model=self.model,
                input=api_input,
                tools=[{
                    "type": "function",
                    "name": self._function_def["name"],
                    "description": self._function_def["description"],
                    "parameters": self._function_def["parameters"]
                }],
                tool_choice={"type": "function", "name": self._function_def["name"]},
            )

            # Calculate response time
            response_time = time.time() - start_time

            # Extract the function call arguments from the OpenAI Responses API response
            tools = getattr(resp, "tools", None)
            if not tools or len(tools) == 0:
                raise ValueError("Model did not perform a function call. Check prompts and model.")

            # Iterate through the list of outputs and extract the arguments
            arguments_str = None
            outputs = getattr(resp, "output", None)
            if outputs and isinstance(outputs, list):
                for output in outputs:
                    args = getattr(output, "arguments", None)
                    if args:
                        arguments_str = args
                        break
            else:
                # Fallback for single output object (legacy or unexpected structure)
                arguments_str = resp.output.arguments

            if not arguments_str:
                raise ValueError("No function call arguments found in model response.")

            try:
                persona_data = json.loads(arguments_str)
            except json.JSONDecodeError as e:
                raise ValueError(f"Function call returned invalid JSON: {arguments_str}") from e

            # Extract token usage
            usage = resp.usage
            token_info = {
                "input_tokens": usage.input_tokens if usage else None,
                "output_tokens": usage.output_tokens if usage else None,
                "total_tokens": usage.total_tokens if usage else None
            }

            # Build metadata
            metadata = {
                "response_time": round(response_time, 3),
                "model": self.model,
                "tokens": token_info,
                "operation_type": "persona_generation"
            }

            return {
                "persona": persona_data,
                "metadata": metadata
            }

        except Exception as e:
            # Calculate response time even if there's an error
            response_time = time.time() - start_time
            raise Exception(f"OpenAI API call failed after {round(response_time, 3)}s: {str(e)}")

    # --------- Public API ---------
    def generate(
        self,
        user_input: str,    
        recommend_llm_prompt_injection: Optional[str] = None,
        extra_guidelines: Optional[List[str]] = None,
        clean_with_validator: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate a persona dict from user_input, validate it with PersonaValidator,
        and optionally clean it via validator.clean_persona before returning.

        Args:
            user_input: Free-form user description.
            recommend_llm_prompt_injection: Optional extra instruction to include.
            extra_guidelines: Optional extra system instructions.
            clean_with_validator: If True, run PersonaValidator.clean_persona() before returning.
            
        Returns:
            Dictionary containing:
                - persona: The generated persona data
                - metadata: Information about the generation process including timing and token usage
        """
        api_input = self._build_api_input(
            user_input=user_input,
            recommend_llm_prompt_injection=recommend_llm_prompt_injection,
            extra_guidelines=extra_guidelines,
        )
        
        result = self._call_openai_function(api_input)
        persona = result["persona"]
        metadata = result["metadata"]

        # Validate via PersonaValidator (raises ValueError if invalid)
        self._validator.validate_persona(persona)

        # Optional cleaning step using the same validator
        if clean_with_validator:
            persona = self._validator.clean_persona(persona)
            # Update metadata to indicate cleaning was performed
            metadata["cleaned_with_validator"] = True
        else:
            metadata["cleaned_with_validator"] = False

        return {
            "persona": persona,
            "metadata": metadata
        }



    def generate_with_metadata(
        self,
        user_input: str,    
        recommend_llm_prompt_injection: Optional[str] = None,
        extra_guidelines: Optional[List[str]] = None,
        clean_with_validator: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate a persona dict and return both persona and metadata.
        This method provides explicit access to the full result with metadata.
        
        Args:
            user_input: Free-form user description.
            recommend_llm_prompt_injection: Optional extra instruction to include.
            extra_guidelines: Optional extra system instructions.
            clean_with_validator: If True, run PersonaValidator.clean_persona() before returning.
            
        Returns:
            Dictionary containing:
                - persona: The generated persona data
                - metadata: Information about the generation process including timing and token usage
        """
        return self.generate(
            user_input=user_input,
            recommend_llm_prompt_injection=recommend_llm_prompt_injection,
            extra_guidelines=extra_guidelines,
            clean_with_validator=clean_with_validator,
        )