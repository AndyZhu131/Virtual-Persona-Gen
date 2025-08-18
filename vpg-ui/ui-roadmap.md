# VPG UI Project Roadmap

## 🌟 Project Overview
**VPG (Virtual Persona Generator)** transforms vague user descriptions into structured JSON persona profiles and enables conversational interactions. This roadmap outlines the MVP phase for internal testing and portfolio demonstration.

---

## ✅ **MVP Scope**

### Core Deliverables

#### Authentication
- [ ] **Supabase Auth (Email Magic Link/OTP)**
- [ ] **Basic white-listing for test users**

#### Persona Management
- [ ] **Create, view, edit Personas**
- [ ] **JSON schema editing with validation (Zod)**
- [ ] **Version snapshots (persona_versions table)**

#### Conversation Interface
- [ ] **Basic chat UI (message list, input box)**
- [ ] **Echo-based /api/chat endpoint as placeholder**
- [ ] **Persist messages in messages table**

#### Frontend
- [ ] **Next.js (App Router) + TypeScript**
- [ ] **TailwindCSS + shadcn/ui components**
- [ ] **React Query for data fetching and caching**

#### Deployment
- [ ] **Vercel deployment with environment variables**
- [ ] **Preview and production environments**

---

## 🛠️ **MVP Development Milestones**

### **M1: Project Setup & Auth (Week 1)**
- [ ] Initialize Next.js project with TypeScript & Tailwind
- [ ] Configure Supabase project & environment variables
- [ ] Implement login page with Magic Link
- [ ] Enforce Row-Level Security (RLS) for Personas & Messages

**Definition of Done:** Test user can log in successfully and land on empty /app page.

### **M2: Persona CRUD & Conversation (Weeks 2-3)**
- [ ] Persona list (ordered by updated_at)
- [ ] New Persona creation with default schema
- [ ] Edit Persona page with JSON validation
- [ ] Save updates into persona_versions
- [ ] Display last 5 versions
- [ ] Implement chat UI (input + message list)
- [ ] /api/chat Echo placeholder returning user input
- [ ] Persist messages in Supabase messages table
- [ ] Add loading/error states

**Definition of Done:** User can create, edit, and view Persona versions, then chat with a Persona and see messages saved across refreshes.

### **M3: Deployment & Testing (Week 4)**
- [ ] Deploy to Vercel (Preview + Production)
- [ ] White-list test users
- [ ] Integrate Sentry for error monitoring
- [ ] Run 1 core E2E test with Playwright (login → persona edit → chat)

**Definition of Done:** Friends can log in, create/edit Persona, and complete one chat session.

---

## 🚨 **Critical Blockers**

1. **Missing schema file** - `persona_schema_v1.1.json` for validation
2. **No testing suite** - Frontend testing needs to be implemented
3. **Error handling** - Minimal error handling, must add user-facing feedback

---

## 📊 **Success Metrics (MVP)**

| Metric | Target | Priority |
|--------|--------|----------|
| **Test Users** | 3+ users can log in and complete Persona creation + 1 conversation | 🔴 HIGH |
| **Onboarding Time** | < 3 minutes from login to first message | 🟡 MEDIUM |
| **Crash Rate** | <2% during tests (monitored via Sentry) | 🔴 HIGH |
| **E2E Testing** | All core flows validated by at least 1 E2E test | 🟡 MEDIUM |

---

## 💡 **Post-MVP (Future Considerations)**

### Advanced Features
- [ ] **Streaming chat** via LLM API
- [ ] **Persona sharing** (read-only links)
- [ ] **Rich JSON Schema editor** (monaco/json forms)
- [ ] **Cost tracking & analytics**

---

## 📅 **MVP Timeline**

| Milestone | Duration | Priority | Dependencies |
|-----------|----------|----------|--------------|
| **M1: Project Setup & Auth** | Week 1 | 🔴 **HIGH** | None |
| **M2: Persona CRUD & Conversation** | Weeks 2-3 | 🔴 **HIGH** | M1 completion |
| **M3: Deployment & Testing** | Week 4 | 🟡 **MEDIUM** | M2 completion |

**Total Estimated Time**: 4 weeks to MVP completion

