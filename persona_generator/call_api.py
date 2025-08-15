#!/usr/bin/env python3
"""
Minimal script to call the VPG API and print the response.

Usage:
  python call_api.py
"""

import json
import requests
from pathlib import Path

INPUT_CODE_START = 24
INPUT_CODE_END = 24

def call_api(input_file, output_file):
    url = "http://localhost:8000/persona/generate"
    input_filename = input_file.name
    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        return
    
    description = input_file.read_text(encoding="utf-8").strip()
    print(f"🎭 Using persona: {input_filename}")
    print(f"📝 Description: {description}")
    print()
    payload = {"description": description}

    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()  # Raises an exception for 4XX/5XX status codes
        
        # Parse and format the JSON response
        response_data = response.json()
        
        # Save formatted response to output file
        output_file.write_text(json.dumps(response_data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\n💾 Response saved to: {output_file}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Status code: {e.response.status_code}")
            print(f"Response: {e.response.text}")


def main() -> None:
    
    inputs_folder = Path("./persona_generator/testdata/inputs")
    outputs_folder = Path("./persona_generator/testdata/outputs")
    
    # Find input file using prefix matching for double-digit numbers
    for i in range(INPUT_CODE_START, INPUT_CODE_END+1):
        input_prefix = f"{i:02d}"  # Convert to 2-digit format (e.g., 1 -> "01")
        input_files = list(inputs_folder.glob(f"{input_prefix}_*.txt"))
        
        if not input_files:
            print(f"❌ No input file found with prefix '{input_prefix}' in {inputs_folder}")
            print("Available files:")
            for file in sorted(inputs_folder.glob("*.txt")):
                print(f"  - {file.name}")
            return
        input_file = input_files[0]
        input_filename = input_file.name
        
        output_filename = f"{input_filename.replace('.txt', '')}_response.json"
        output_file = outputs_folder / output_filename
        call_api(input_file, output_file)
    


if __name__ == "__main__":
    main()


