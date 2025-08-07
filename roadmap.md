# 🧬 Persona Generator – Development Roadmap

This document outlines the development plan for the **Persona Generator** module of the Virtual Persona System. This module enables the generation of rich, structured personas from vague or abstract input descriptions using large language models (LLMs).

---

## ✅ Phase 1: MVP – Core Generation Pipeline

### 🎯 Goal
Enable users to input loose, high-level character descriptions and receive structured, coherent persona profiles in JSON format.

### 🔧 Key Tasks

- [x] **Input Processor**
  - Parse free-text input (e.g., "40-year-old introverted ex-nurse")  
  - Normalize and sanitize input before prompt injection

- [x] **Prompt Template Design**
  - Design structured prompts for persona generation  
  - Cover tone, personality, background, quirks, motivation

- [x] **LLM Integration**
  - Connect with OpenAI API (GPT-4o) or Claude API  
  - Include retry and error handling

- [x] **Output Structuring**
  - Standardize LLM output into JSON format  
  - Define `PersonaSchema` (e.g., name, age, tone, etc.)

- [x] **Minimal REST API**
  - `POST /persona/generate`  
  - Accepts user input, returns structured persona JSON

---

## 🚀 Phase 2: Output Quality + Expandability

### 🎯 Goal
Ensure output consistency, controllability, and future extensibility.

### 🔧 Key Tasks

- [ ] **Persona Schema v1.1**
  - Finalize schema with required and optional fields  
  - Add support for nested attributes (e.g., `communication_style`, `emotional_state`)

- [ ] **Multi-Language Prompt Support**
  - English + Chinese input/output  
  - Dual-language template support

- [ ] **Prompt Variants Library**
  - Create prompt sets for:
    - Realistic (e.g. LinkedIn-style)
    - Creative (e.g. for fiction writing)
    - Psychological profiling (e.g. MBTI style)

- [ ] **Attribute Confidence Estimation**
  - Add optional LLM-based self-evaluation on how "confident" each attribute is
  - e.g., `"confidence_score": 0.88`

- [ ] **Output Coherence Checker**
  - Validate LLM output consistency across attributes (e.g., introvert + "loud and aggressive" → conflict)

---

## 🌈 Phase 3: User Experience & Tooling

### 🎯 Goal
Enhance usability and developer integration.

### 🔧 Key Tasks

- [ ] **Web UI Prototype**
  - Input form for persona hints  
  - Rich output viewer (field-by-field display)

- [ ] **Persona Editor**
  - Allow users to edit attributes manually after generation  
  - Support JSON and visual form

- [ ] **Export Options**
  - JSON
  - Markdown profile
  - PDF (styled "character sheet")

- [ ] **Persona Library**
  - Store generated personas per user
  - Tagging and searching support

---

## 🧪 Stretch Goals (Future)

- [ ] **Persona Memory Engine**
  - Allow personas to "remember" past context in future modules

- [ ] **Persona Consistency Over Time**
  - Generate follow-up content to verify consistency in tone and behavior

- [ ] **Persona Seed Templates**
  - Predefined archetypes (e.g., “stern professor”, “rebellious teen”) as generation shortcuts

---

## 📌 Milestone Summary

| Milestone | Description | ETA |
|----------|-------------|-----|
| MVP Complete | Core generation working via API | ✅ Done |
| Schema v1.1 + Prompt Library | Improved structure and variant control | Week 2 |
| UI + Editor Tools | Rich editing and viewing experience | Week 4 |
| Export + Library | Persona management and output formats | Week 5–6 |

---

## 📄 Dependencies

- OpenAI API (GPT-4o) / Claude 3.5 / Gemini (LLM backend)
- Python + FastAPI backend
- JSON Schema validation
- Optional: React or Vue for UI

