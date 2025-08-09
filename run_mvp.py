#!/usr/bin/env python3
"""
VPG MVP Runner
Starts the FastAPI server cleanly.
"""

import os
import uvicorn

def check_environment():
    """Check if environment is properly configured"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not set")
        print("Create a .env file with your OpenAI API key")
        return False
    
    print(f"✅ Using model: {os.getenv('OPENAI_MODEL')}")
    return True

def run_api():  
    """Start the FastAPI server via uvicorn"""
    print("\n🚀 Starting VPG MVP API server...")
    print("API: http://localhost:8000 | Docs: http://localhost:8000/docs")
    uvicorn.run("api.endpoints:app", host="0.0.0.0", port=8000)

def main():
    print("🧠 VPG MVP - Virtual Persona Generator")
    print("=" * 40)

    if not check_environment():
        return

    run_api()

if __name__ == "__main__":
    main()
