# conversation_generator/ConversationGenerator.py
# Requirements:
#   pip install openai==1.* python-dotenv
# Env:
#   export OPENAI_API_KEY=sk-xxx
#   export OPENAI_MODEL=gpt-4o-mini  # optional

import os
import json
import time
from typing import Dict, Any, Optional, List

from dotenv import load_dotenv
from openai import OpenAI


class ConversationGenerator:
    """
    A class for generating conversation opening lines based on persona characteristics.
    """
    
    # Global constant for max output tokens
    MAX_OUTPUT_TOKENS = 1000
    
    def __init__(self, api_key: str, model: str):
        """
        Initialize the ConversationGenerator.
        
        Args:
            api_key: OpenAI API key
            model: OpenAI model to use
        """
        self.api_key = api_key
        self.model = model
        
        # Initialize OpenAI client
        self.client = OpenAI(api_key=self.api_key)
    
    # --------- Factory Methods ---------
    @classmethod
    def from_env(
        cls,
        default_model: str = "gpt-5-mini"
    ) -> "ConversationGenerator":
        """
        Create a ConversationGenerator using environment variables.
        
        Args:
            default_model: Default model to use if OPENAI_MODEL is not set
            
        Returns:
            ConversationGenerator instance
            
        Raises:
            RuntimeError: If OPENAI_API_KEY is not set
        """
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")

        model = os.getenv("OPENAI_MODEL", default_model)

        return cls(
            api_key=api_key,
            model=model
        )
    
    def _build_conversation_prompt(self, persona: Dict[str, Any]) -> str:
        """
        Build a prompt for generating conversation opening lines based on persona.
        
        Args:
            persona: Dictionary containing persona information
            
        Returns:
            Formatted prompt string
        """
        prompt = f"""You are role-playing as this character:

Role: {persona.get('role', 'Unknown')}
Tone: {persona.get('tone', 'Neutral')}
Traits: {', '.join(persona.get('traits', ['Adaptable']))}
Dialogue Behavior: {persona.get('dialogue_behavior', 'Conversational')}

Generate an opening line (2-3 sentences) that this character would say to start a conversation. 
Keep it natural and in-character. Return only the dialogue text, no quotes or formatting."""

        # Add optional persona details if available
        if persona.get('name'):
            prompt += f"\n\nCharacter name: {persona['name']}"
        
        if persona.get('quirks'):
            prompt += f"\nQuirks: {', '.join(persona['quirks'])}"
        
        return prompt
    
    def _call_openai_function(self, 
                             api_input: List[Dict[str, str]], 
                             max_output_tokens: int = MAX_OUTPUT_TOKENS,
                             context: Optional[str] = None,
                             operation_type: str = "conversation",
                             reasoning_effort: Optional[str] = "low") -> Dict[str, Any]:
                             
        """
        Centralized method to call OpenAI API and handle response validation.
        
        Args:
            api_input: List of message dictionaries for the API call
            max_output_tokens: Maximum tokens for the response
            context: Optional context for the conversation
            operation_type: Type of operation for logging/debugging
            
        Returns:
            Dictionary with response content and metadata
            
        Raises:
            Exception: If API call fails or response is invalid
        """
        # Record start time
        start_time = time.time()
        
        try:
            # Call OpenAI Responses API
            resp = self.client.responses.create(
                model=self.model,
                input=api_input,
                max_output_tokens=max_output_tokens,
                reasoning={"effort": reasoning_effort}
            )
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Save response for debugging
            with open(f"response_{operation_type}.temp", "w", encoding="utf-8") as f:
                f.write(str(resp))
            
            # Extract and validate response content
            if not resp.output or len(resp.output) == 0:
                raise Exception(f"No output received from OpenAI for {operation_type}")

            # Look for content in the output
            response_content = None
            
            # Iterate through output items to find the message with content
            for output_item in resp.output:
                # Check if this is a message item with content
                if hasattr(output_item, 'content') and output_item.content:
                    # The content is a list, so iterate through it
                    for content_part in output_item.content:
                        if hasattr(content_part, 'text') and content_part.text:
                            text = content_part.text.strip()
                            if text:
                                response_content = text
                                break
                    if response_content:
                        break
                
                # Check if there's direct text content (fallback)
                if hasattr(output_item, 'text') and output_item.text:
                    content = output_item.text.strip()
                    if content:
                        response_content = content
                        break
            
            # If no content found, raise exception
            if not response_content:
                raise Exception(f"Could not extract content from OpenAI response for {operation_type}. Response structure: {resp.output}")
            
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
                "context": context,
                "operation_type": operation_type
            }
            
            return {
                "content": response_content,
                "metadata": metadata
            }
            
        except Exception as e:
            # Calculate response time even if there's an error
            response_time = time.time() - start_time
            raise Exception(f"OpenAI API call failed after {round(response_time, 3)}s: {str(e)}")
    
    def generate_opening_line(self, 
                             persona: Dict[str, Any], 
                             context: Optional[str] = None,
                             max_output_tokens: int = MAX_OUTPUT_TOKENS) -> Dict[str, Any]:
        """
        Generate an opening line for conversation based on persona.
        
        Args:
            persona: Dictionary containing persona information
            context: Optional context for the conversation (e.g., "at a coffee shop")
            max_output_tokens: Maximum output tokens for the response (default 100 for opening lines)
        
        Returns:
            Dictionary with opening_line and metadata
            
        Raises:
            RuntimeError: If API key is not set
            Exception: If OpenAI API call fails
        """
        # Build the prompt
        base_prompt = self._build_conversation_prompt(persona)
        if context:
            base_prompt += f"\n\nContext: {context}"
        
        # Create input for Responses API
        api_input = [
            {"role": "system", "content": "You are a conversation starter generator. Generate natural, in-character opening lines."},
            {"role": "user", "content": base_prompt}
        ]
        
        # Use centralized OpenAI call function
        result = self._call_openai_function(
            api_input=api_input,
            max_output_tokens=max_output_tokens,
            context=context,
            operation_type="opening_line"
        )
        
        return {
            "opening_line": result["content"],
            "metadata": result["metadata"]
        }

    def generate_conversation_response(self,
                                     persona: Dict[str, Any],
                                     conversation_history: List[Dict[str, str]],
                                     context: Optional[str] = None,
                                     max_output_tokens: int = MAX_OUTPUT_TOKENS) -> Dict[str, Any]:
        """
        Generate a response in an ongoing conversation based on persona and conversation history.
        
        Args:
            persona: Dictionary containing persona information
            conversation_history: List of previous messages in format [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
            context: Optional context for the conversation (e.g., "at a coffee shop")
            max_output_tokens: Maximum tokens for the response (default 150 for conversation responses)
        
        Returns:
            Dictionary with response and metadata
            
        Raises:
            RuntimeError: If API key is not set
            Exception: If OpenAI API call fails
        """
        # Build the prompt
        base_prompt = self._build_conversation_prompt(persona)
        
        # Create system message for ongoing conversation
        system_message = f"""You are role-playing as this character in an ongoing conversation. 
Stay in character at all times and respond naturally to what the other person is saying.
Keep responses conversational and engaging, typically 2-4 sentences.

{base_prompt}"""
        
        # Build conversation input
        api_input = [{"role": "system", "content": system_message}]
        
        # Add conversation history
        api_input.extend(conversation_history)
        
        # Add context if provided
        if context:
            api_input.append({"role": "system", "content": f"Context: {context}"})
        
        # Use centralized OpenAI call function
        result = self._call_openai_function(
            api_input=api_input,
            max_output_tokens=max_output_tokens,
            context=context,
            operation_type="conversation_response"
        )
        
        # Add conversation-specific metadata
        result["metadata"]["conversation_length"] = len(conversation_history)
        
        return {
            "conversation_response": result["content"],
            "metadata": result["metadata"]
        }