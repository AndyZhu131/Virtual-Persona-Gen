#!/usr/bin/env python3
"""
Simple test script for VPG MVP
Tests the persona generator functionality
"""

import json
import sys
import os

# Add persona_generator to path
sys.path.append('persona_generator')

from persona_generator.generator import generate_persona

def test_persona_generation():
    """Test basic persona generation"""
    print("🧪 Testing VPG MVP Persona Generation...")
    
    test_cases = [
        "A friendly teacher who loves science",
        "Grumpy old programmer who drinks too much coffee",
        "Enthusiastic startup founder with big dreams"
    ]
    
    for i, description in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Input: {description}")
        
        try:
            persona = generate_persona(description)
            print("✅ Generated persona:")
            print(json.dumps(persona, indent=2, ensure_ascii=False))
            
            # Basic validation
            required_fields = ["role", "tone", "traits", "dialogue_behavior"]
            missing = [field for field in required_fields if field not in persona]
            if missing:
                print(f"❌ Missing required fields: {missing}")
            else:
                print("✅ All required fields present")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n🏁 MVP Test Complete!")

def test_cost_estimation():
    """Estimate costs for MVP usage"""
    print("\n💰 Cost Estimation for MVP:")
    print("Using GPT-3.5-turbo:")
    print("- Input: $0.0015 per 1K tokens")
    print("- Output: $0.002 per 1K tokens") 
    print("- Max 300 output tokens per request")
    print("- Estimated cost per persona: ~$0.0015")
    print("- 1000 personas: ~$1.50")
    print("- Very cost-effective for MVP! 🎉")

if __name__ == "__main__":
    test_persona_generation()
    test_cost_estimation()
