# 🧠 VPG MVP - Virtual Persona Generator

**Cost-optimized MVP** for generating structured virtual personas from simple text descriptions. Built for quick deployment and minimal cost.

---

## 🚀 Quick Start (MVP)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set API Key
Create a `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

### 3. Run MVP
```bash
python run_mvp.py
```

---

## 🔧 MVP Features

### ✅ Persona Generator
- **Input**: "A friendly teacher who loves science"
- **Output**: Structured JSON persona

```json
{
  "persona": {
    "role": "Elementary School Teacher",
    "tone": "enthusiastic and patient",
    "traits": ["passionate", "nurturing", "curious"],
    "dialogue_behavior": "uses simple language, asks engaging questions"
  },
  "metadata": {
    "response_time": 2.345,
    "model": "gpt-4o-mini",
    "tokens": {
      "input_tokens": 150,
      "output_tokens": 89,
      "total_tokens": 239
    },
    "operation_type": "persona_generation",
    "cleaned_with_validator": false
  }
}
```

### ✅ REST API
- `POST /persona/generate` - Generate persona
- `GET /health` - Health check
- Auto-generated docs at `/docs`

### ✅ Schema Validation
- Required fields enforced
- Clean data output
- Error handling

### ✅ Metadata Collection
- Response time tracking
- Token usage monitoring
- Operation type logging
- Performance insights

---

## 📖 Example Usage

### Direct Function Call
```python
from persona_generator.PersonaGenerator import PersonaGenerator

# Generate with metadata (always collected)
generator = PersonaGenerator.from_env()
result = generator.generate("Grumpy old programmer")
print("Persona:", result["persona"])
print("Metadata:", result["metadata"])
```

### API Request
```bash
curl -X POST "http://localhost:8000/persona/generate" \
  -H "Content-Type: application/json" \
  -d '{"description": "Enthusiastic startup founder"}'
```

---

## 🏗️ MVP Architecture

```
vpg/
├── persona_generator/
│   ├── PersonaGenerator.py   # Persona generation logic
│   ├── PersonaValidator.py   # Schema validation  
│   └── schema/
│       └── persona_schema_v1.2.json
├── conversation_generator/
│   └── ConversationGenerator.py     # Conversation generation logic
├── api/
│   └── endpoints.py          # FastAPI server
├── run_mvp.py               # Startup script
└── requirements.txt         # Dependencies
```

---

## 🎯 Next Steps

After MVP validation:
1. Add conversation generator module
2. Improve persona quality
3. Add web UI
4. Scale infrastructure

**Current Status**: ✅ MVP Complete & Cost-Optimized
