# Persona Generator Roadmap

## 🎯 Project Goal
Build a module that transforms vague user descriptions into structured JSON persona profiles,
based on `persona_schema_v1.json`, ready for use in conversation generation.

---

## Phase 1 — MVP (Basic Persona Generator)
**Goal:** Take user input → Generate a valid persona JSON → Validate and return.

### Tasks
1. **Schema Definition**
   - [ ] Finalize `persona_schema_v1.json` (minimal but complete)
   - [ ] Ensure schema is compatible with JSON Schema Validator
   - **Deliverable:** `schema/persona_schema_v1.json`

2. **Prompt Builder**
   - [ ] Implement `prompt_builder.py` to construct system + user prompts for LLM
   - [ ] Include basic examples for different input cases
   - **Deliverable:** `core/prompt_builder.py`

3. **LLM Integration (Function Calling)**
   - [ ] Implement `generator.py` to call OpenAI API with function definition
   - [ ] Ensure generated output matches schema
   - **Deliverable:** `core/generator.py`

4. **Schema Validation**
   - [ ] Implement `validator.py` using `jsonschema`
   - [ ] Handle validation errors with retry/fallback
   - **Deliverable:** `core/validator.py`

5. **Example Data**
   - [ ] Create `examples/example_input.txt`
   - [ ] Create `examples/example_output.json` (valid sample)
   - **Deliverable:** `examples/`

6. **Testing**
   - [ ] Write unit tests for prompt building, generator, and validator
   - **Deliverable:** `tests/test_generator.py`

---

## Phase 2 — Usability & Developer Experience
**Goal:** Make it easy to test, debug, and extend.

### Tasks
1. **CLI Tool**
   - [ ] Simple CLI interface: `python generator.py --input "desc"`
   - [ ] Option to read from file and output JSON
   - **Deliverable:** CLI-enabled `generator.py`

2. **Config Management**
   - [ ] Use `.env` for API keys and default model
   - [ ] Configurable schema path and output folder
   - **Deliverable:** `.env` + config loader

3. **Logging & Debug**
   - [ ] Add debug mode to log tokens, cost estimates, and raw API output
   - **Deliverable:** Logging integrated into `generator.py`

---

## Phase 3 — Extension & Scaling
**Goal:** Support richer persona generation and integration with other modules.

### Tasks
1. **Background Story Support**
   - [ ] Add optional background generation (separate schema section)
   - [ ] Save to long-term memory store (vector DB)
   - **Deliverable:** Updated schema + retriever integration

2. **Multiple Output Formats**
   - [ ] Export persona in JSON + Markdown (readable profile)
   - [ ] Optional YAML support
   - **Deliverable:** Export utilities

3. **Predefined Templates**
   - [ ] Support “base personas” as starting points
   - [ ] Allow user to customize
   - **Deliverable:** Template storage + loader

4. **Conversation Generator Integration**
   - [ ] Provide persona JSON directly to Conversation Generator API
   - **Deliverable:** API contract for module handoff

---

## 📅 Estimated Timeline

| Phase  | Duration |
|--------|----------|
| MVP    | 3–5 days |
| Phase 2| 2–3 days |
| Phase 3| 5–7 days |

---

## ✅ Deliverables Summary
- `schema/persona_schema_v1.json`
- `core/prompt_builder.py`
- `core/generator.py`
- `core/validator.py`
- `examples/`
- `tests/`
- CLI-enabled entry point
- Documentation in `README.md`

---
