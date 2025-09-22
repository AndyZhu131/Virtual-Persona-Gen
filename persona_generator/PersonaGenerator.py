# persona_generator/PersonaGenerator.py
# Unified Persona Generator that combines persona generation and conversation starting line
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
from persona_generator.PersonaJsonGenerator import PersonaJsonGenerator
from conversation_generator.ConversationGenerator import ConversationGenerator


class PersonaGenerator:
    """
    Unified Persona Generator that combines:
    1) Persona generation using JSON schema validation
    2) Conversation starting line generation based on the persona
    
    This class provides a single interface for generating both persona and opening line
    from a user prompt, making it easier to use than the separate generators.
    """
    
    # Global constant for max output tokens
    MAX_OUTPUT_TOKENS = 1000

    def __init__(
        self,
        schema_path: str,
        model: str,
        api_key: str,
        persona_validator: Optional[Any] = None,
    ) -> None:
        """
        Args:
            schema_path: Path to the persona JSON schema file.
            model: OpenAI model name (e.g., 'gpt-5-nano').
            api_key: OpenAI API key.
            persona_validator: Optional PersonaValidator instance. If None, one will be created.
        """
        self.schema_path = schema_path
        self.model = model
        self.api_key = api_key

        # Initialize the JSON persona generator
        self._persona_generator = PersonaJsonGenerator(
            schema_path=schema_path,
            model=model,
            api_key=api_key,
            validator=persona_validator
        )
        
        # Initialize the conversation generator
        self._conversation_generator = ConversationGenerator(
            api_key=api_key,
            model=model
        )

    # --------- Factory Methods ---------
    @classmethod
    def from_env(
        cls,
        persona_validator: Optional[Any] = None,
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

        return cls(
            schema_path=schema_path,
            model=model,
            api_key=api_key,
            persona_validator=persona_validator,
        )

    # --------- Public API ---------
    def generate_persona_with_opening_line(
        self,
        user_input: str,
        context: Optional[str] = None,
        recommend_llm_prompt_injection: Optional[str] = None,
        extra_guidelines: Optional[List[str]] = None,
        clean_with_validator: bool = False,
        max_output_tokens: int = MAX_OUTPUT_TOKENS,
        reasoning_effort: Optional[str] = "low",
    ) -> Dict[str, Any]:
        """
        Generate both a persona and an opening line from a user description.
        
        Args:
            user_input: Free-form user description of the desired persona.
            context: Optional context for the conversation (e.g., "at a coffee shop").
            recommend_llm_prompt_injection: Optional extra instruction to include.
            extra_guidelines: Optional extra system instructions.
            clean_with_validator: If True, run PersonaValidator.clean_persona() before returning.
            max_output_tokens: Maximum tokens for the response.
            reasoning_effort: Reasoning effort level for the model (default: "low").
            
        Returns:
            Dictionary containing:
                - persona: The generated persona data
                - opening_line: The generated opening line for conversation
                - metadata: Combined metadata from both operations
        """
        # Record start time for the entire operation
        start_time = time.time()
        
        # Generate persona using the JSON generator
        persona_result = self._persona_generator.generate(
            user_input=user_input,
            recommend_llm_prompt_injection=recommend_llm_prompt_injection,
            extra_guidelines=extra_guidelines,
            clean_with_validator=clean_with_validator,
            max_output_tokens=max_output_tokens,
            reasoning_effort=reasoning_effort
        )
        
        # Generate opening line using the conversation generator
        opening_result = self._conversation_generator.generate_opening_line(
            persona=persona_result["persona"],
            context=context,
            max_output_tokens=max_output_tokens
        )
        
        # Calculate total response time
        total_response_time = time.time() - start_time
        
        # Combine metadata from both operations
        combined_metadata = {
            "total_response_time": round(total_response_time, 3),
            "persona_generation": persona_result["metadata"],
            "opening_line_generation": opening_result["metadata"],
            "operation_type": "unified_persona_generation"
        }
        
        return {
            "persona": persona_result["persona"],
            "opening_line": opening_result["opening_line"],
            "metadata": combined_metadata
        }

    def generate_persona_only(
        self,
        user_input: str,
        recommend_llm_prompt_injection: Optional[str] = None,
        extra_guidelines: Optional[List[str]] = None,
        clean_with_validator: bool = False,
        max_output_tokens: int = MAX_OUTPUT_TOKENS,
        reasoning_effort: Optional[str] = "low",
    ) -> Dict[str, Any]:
        """
        Generate only a persona (without opening line) from a user description.
        This provides access to the original persona generation functionality.
        
        Args:
            user_input: Free-form user description of the desired persona.
            recommend_llm_prompt_injection: Optional extra instruction to include.
            extra_guidelines: Optional extra system instructions.
            clean_with_validator: If True, run PersonaValidator.clean_persona() before returning.
            max_output_tokens: Maximum tokens for the response.
            reasoning_effort: Reasoning effort level for the model (default: "low").
            
        Returns:
            Dictionary containing:
                - persona: The generated persona data
                - metadata: Information about the generation process
        """
        return self._persona_generator.generate(
            user_input=user_input,
            recommend_llm_prompt_injection=recommend_llm_prompt_injection,
            extra_guidelines=extra_guidelines,
            clean_with_validator=clean_with_validator,
            max_output_tokens=max_output_tokens,
            reasoning_effort=reasoning_effort
        )

    def generate_conversation_response(
        self,
        persona: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        context: Optional[str] = None,
        max_output_tokens: int = MAX_OUTPUT_TOKENS
    ) -> Dict[str, Any]:
        """
        Generate a response in an ongoing conversation based on persona and conversation history.
        This provides access to the conversation generation functionality.
        
        Args:
            persona: Dictionary containing persona information
            conversation_history: List of previous messages in format [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
            context: Optional context for the conversation (e.g., "at a coffee shop")
            max_output_tokens: Maximum tokens for the response
        
        Returns:
            Dictionary with conversation_response and metadata
        """
        return self._conversation_generator.generate_conversation_response(
            persona=persona,
            conversation_history=conversation_history,
            context=context,
            max_output_tokens=max_output_tokens
        )

    # --------- Convenience Methods ---------
    def generate(
        self,
        user_input: str,
        context: Optional[str] = None,
        recommend_llm_prompt_injection: Optional[str] = None,
        extra_guidelines: Optional[List[str]] = None,
        clean_with_validator: bool = False,
        max_output_tokens: int = MAX_OUTPUT_TOKENS,
        reasoning_effort: Optional[str] = "low",
    ) -> Dict[str, Any]:
        """
        Main generation method that creates both persona and opening line.
        This is the primary method for the unified generator.
        
        Args:
            user_input: Free-form user description of the desired persona.
            context: Optional context for the conversation (e.g., "at a coffee shop").
            recommend_llm_prompt_injection: Optional extra instruction to include.
            extra_guidelines: Optional extra system instructions.
            clean_with_validator: If True, run PersonaValidator.clean_persona() before returning.
            max_output_tokens: Maximum tokens for the response.
            reasoning_effort: Reasoning effort level for the model (default: "low").
            
        Returns:
            Dictionary containing:
                - persona: The generated persona data
                - opening_line: The generated opening line for conversation
                - metadata: Combined metadata from both operations
        """
        return self.generate_persona_with_opening_line(
            user_input=user_input,
            context=context,
            recommend_llm_prompt_injection=recommend_llm_prompt_injection,
            extra_guidelines=extra_guidelines,
            clean_with_validator=clean_with_validator,
            max_output_tokens=max_output_tokens,
            reasoning_effort=reasoning_effort
        )
