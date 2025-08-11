#!/usr/bin/env python3
"""
Minimal script to call the VPG API and print the response.

Usage:
  python call_api.py
"""

import json
import requests
from pathlib import Path


def main() -> None:
    url = "http://localhost:8000/persona/generate"
    
    inputs_folder = Path("./persona_generator/testdata/inputs")
    input_filename = "mentor.txt"
    input_file = inputs_folder / input_filename
    
    outputs_folder = Path("./persona_generator/testdata/outputs")
    output_filename = f"{input_filename.replace('.txt', '')}_response.json"
    output_file = outputs_folder / output_filename
    
    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        return
    
    description = input_file.read_text(encoding="utf-8").strip()
    payload = {"description": description}

    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()  # Raises an exception for 4XX/5XX status codes
        
        # Print response
        print(response.text)
        
        # Save response to output file
        output_file.write_text(response.text, encoding="utf-8")
        print(f"\n💾 Response saved to: {output_file}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Status code: {e.response.status_code}")
            print(f"Response: {e.response.text}")


if __name__ == "__main__":
    main()


