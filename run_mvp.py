#!/usr/bin/env python3
"""
VPG MVP Startup Script
Quick way to run the persona generator MVP
"""

import os
import sys

def check_dependencies():
    """Check if required dependencies are installed"""
    required = ['openai', 'fastapi', 'uvicorn', 'jsonschema', 'dotenv']
    missing = []
    
    for package in required:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing dependencies: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    return True

def check_environment():
    """Check if environment is properly configured"""
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not set")
        print("Create a .env file with your OpenAI API key")
        return False
    
    print(f"✅ Using model: {os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')}")
    return True

def run_test():
    """Run basic functionality test"""
    print("\n🧪 Running MVP test...")
    os.system("python test_mvp.py")

def run_api():
    """Start the FastAPI server"""
    print("\n🚀 Starting VPG MVP API server...")
    print("API will be available at: http://localhost:8000")
    print("Docs available at: http://localhost:8000/docs")
    os.system("cd api && python endpoints.py")

def main():
    print("🧠 VPG MVP - Virtual Persona Generator")
    print("=" * 40)
    
    if not check_dependencies():
        return
    
    if not check_environment():
        return
    
    print("\nChoose an option:")
    print("1. Run test")
    print("2. Start API server") 
    print("3. Both (test then server)")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        run_test()
    elif choice == "2":
        run_api()
    elif choice == "3":
        run_test()
        input("\nPress Enter to start API server...")
        run_api()
    else:
        print("Invalid choice")

if __name__ == "__main__":
    main()
