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
                             temperature: float = 0.8) -> Dict[str, Any]:
        """
        Generate an opening line for conversation based on persona.
        
        Args:
            persona: Dictionary containing persona information
            context: Optional context for the conversation (e.g., "at a coffee shop")
            temperature: Creativity level for response generation (0.0 to 2.0)
        
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
                max_tokens=100
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
    
    def generate_multiple_openings(self, 
                                  persona: Dict[str, Any], 
                                  count: int = 3,
                                  context: Optional[str] = None,
                                  temperature_range: Optional[tuple] = None) -> Dict[str, Any]:
        """
        Generate multiple opening lines for variety.
        
        Args:
            persona: Dictionary containing persona information
            count: Number of opening lines to generate
            context: Optional context for the conversation
            temperature_range: Optional tuple (min, max) for temperature variation
        
        Returns:
            Dictionary with list of opening lines and aggregated metadata
        """
        if count < 1:
            raise ValueError("Count must be at least 1")
        
        openings = []
        all_metadata = []
        
        # Set temperature range
        if temperature_range is None:
            temp_min, temp_max = 0.7, 1.1
        else:
            temp_min, temp_max = temperature_range
        
        for i in range(count):
            # Vary temperature within the range
            if count == 1:
                temp = (temp_min + temp_max) / 2
            else:
                temp = temp_min + (i / (count - 1)) * (temp_max - temp_min)
            
            try:
                result = self.generate_opening_line(persona, context, temperature=temp)
                openings.append(result["opening_line"])
                all_metadata.append(result["metadata"])
            except Exception as e:
                # Log error but continue with other generations
                print(f"Warning: Failed to generate opening {i+1}: {e}")
                continue
        
        if not openings:
            raise Exception("Failed to generate any opening lines")
        
        # Aggregate metadata
        total_tokens = sum(m["tokens"]["total_tokens"] or 0 for m in all_metadata)
        avg_response_time = sum(m["response_time"] for m in all_metadata) / len(all_metadata)
        
        aggregated_metadata = {
            "total_generated": len(openings),
            "requested_count": count,
            "average_response_time": round(avg_response_time, 3),
            "total_tokens": total_tokens,
            "model": self.model,
            "temperature_range": (temp_min, temp_max),
            "context": context,
            "individual_metadata": all_metadata
        }
        
        return {
            "opening_lines": openings,
            "metadata": aggregated_metadata
        }
