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
    
    def generate_opening_line(self, 
                             persona: Dict[str, Any], 
                             context: Optional[str] = None,
                             max_completion_tokens: int = 300) -> Dict[str, Any]:
        """
        Generate an opening line for conversation based on persona.
        
        Args:
            persona: Dictionary containing persona information
            context: Optional context for the conversation (e.g., "at a coffee shop")
            max_completion_tokens: Maximum completion tokens for the response (default 100 for opening lines)
        
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
        
        # Debug: Print the prompt being sent to OpenAI
        print(f"🔍 DEBUG - ConversationGenerator Prompt:")
        print(f"📝 System: {api_input[0]['content']}")
        print(f"📝 User: {api_input[1]['content']}")
        print(f"🎛️ Settings: max_completion_tokens={max_completion_tokens}")
        print("=" * 60)
        
        # Record start time
        start_time = time.time()
        
        try:
            # Call OpenAI Responses API
            resp = self.client.responses.create(
                model=self.model,
                input=api_input,  # Responses API uses 'input' instead of 'messages'
                max_completion_tokens=max_completion_tokens
            )
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Extract the opening line (Responses API structure)
            opening_line = resp.output[0].content.strip()
            
            # Debug: Print the response from OpenAI
            print(f"🔍 DEBUG - OpenAI Response:")
            print(f"💬 Opening Line: '{opening_line}'")
            print(f"🏁 Finish Reason: {resp.output[0].finish_reason}")
            print(f"🎯 Response Length: {len(opening_line)} characters")
            print("=" * 60)
            
            # Extract token usage
            usage = resp.usage
            token_info = {
                "prompt_tokens": usage.prompt_tokens if usage else None,
                "completion_tokens": usage.completion_tokens if usage else None,
                "total_tokens": usage.total_tokens if usage else None
            }
            
            # Build metadata
            metadata = {
                "response_time": round(response_time, 3),
                "model": self.model,
                "tokens": token_info,
                "context": context
            }
            
            return {
                "opening_line": opening_line,
                "metadata": metadata
            }
            
        except Exception as e:
            # Calculate response time even if there's an error
            response_time = time.time() - start_time
            raise Exception(f"OpenAI API call failed after {round(response_time, 3)}s: {str(e)}")

    def generate_conversation_response(self,
                                     persona: Dict[str, Any],
                                     conversation_history: List[Dict[str, str]],
                                     context: Optional[str] = None,
                                     max_completion_tokens: int = 150) -> Dict[str, Any]:
        """
        Generate a response in an ongoing conversation based on persona and conversation history.
        
        Args:
            persona: Dictionary containing persona information
            conversation_history: List of previous messages in format [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
            context: Optional context for the conversation (e.g., "at a coffee shop")
            max_completion_tokens: Maximum tokens for the response (default 150 for conversation responses)
        
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
        
        # Record start time
        start_time = time.time()
        
        try:
            # Call OpenAI Responses API
            resp = self.client.responses.create(
                model=self.model,
                input=api_input,  # Responses API uses 'input' instead of 'messages'
                max_completion_tokens=max_completion_tokens
            )
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Extract the conversation response (Responses API structure)
            conversation_response = resp.output[0].content.strip()
            
            # Extract token usage
            usage = resp.usage
            token_info = {
                "prompt_tokens": usage.prompt_tokens if usage else None,
                "completion_tokens": usage.completion_tokens if usage else None,
                "total_tokens": usage.total_tokens if usage else None
            }
            
            # Build metadata
            metadata = {
                "response_time": round(response_time, 3),
                "model": self.model,
                "tokens": token_info,

                "context": context,
                "conversation_length": len(conversation_history)
            }
            
            return {
                "conversation_response": conversation_response,
                "metadata": metadata
            }
            
        except Exception as e:
            # Calculate response time even if there's an error
            response_time = time.time() - start_time
            raise Exception(f"OpenAI API call failed after {round(response_time, 3)}s: {str(e)}")