# conversation_generator/generator.py
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
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize the ConversationGenerator.
        
        Args:
            api_key: OpenAI API key (if not provided, will try to load from env)
            model: OpenAI model to use (if not provided, will use env or default)
        """
        # Load environment variables
        load_dotenv()
        
        # Set API key and model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("OPENAI_MODEL")
        
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY is not set. Please provide it or set it in environment variables.")
        
        # Initialize OpenAI client
        self.client = OpenAI(api_key=self.api_key)
    
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
                             temperature: float = 0.8,
                             max_tokens: int = 100) -> Dict[str, Any]:
        """
        Generate an opening line for conversation based on persona.
        
        Args:
            persona: Dictionary containing persona information
            context: Optional context for the conversation (e.g., "at a coffee shop")
            temperature: Creativity level for response generation (0.0 to 2.0)
            max_tokens: Maximum tokens for the response (default 100 for opening lines)
        
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
        
        # Create messages
        messages = [
            {"role": "system", "content": "You are a conversation starter generator. Generate natural, in-character opening lines."},
            {"role": "user", "content": base_prompt}
        ]
        
        # Record start time
        start_time = time.time()
        
        try:
            # Call OpenAI
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Extract the opening line
            opening_line = resp.choices[0].message.content.strip()
            
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
                "temperature": temperature,
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
                                     temperature: float = 0.8,
                                     max_tokens: int = 150) -> Dict[str, Any]:
        """
        Generate a response in an ongoing conversation based on persona and conversation history.
        
        Args:
            persona: Dictionary containing persona information
            conversation_history: List of previous messages in format [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
            context: Optional context for the conversation (e.g., "at a coffee shop")
            temperature: Creativity level for response generation (0.0 to 2.0)
            max_tokens: Maximum tokens for the response (default 150 for conversation responses)
        
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
        
        # Build conversation messages
        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history
        messages.extend(conversation_history)
        
        # Add context if provided
        if context:
            messages.append({"role": "system", "content": f"Context: {context}"})
        
        # Record start time
        start_time = time.time()
        
        try:
            # Call OpenAI
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Extract the conversation response
            conversation_response = resp.choices[0].message.content.strip()
            
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
                "temperature": temperature,
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