# VPG (MVP)

Tech: Next.js (App Router) + TypeScript + Tailwind + Supabase + React Query

## Setup
1. Create a Supabase project; enable Auth (email magic link).
2. Create tables: personas, persona_versions, messages; enable RLS.
3. Copy `.env.local.example` to `.env.local` and fill values.
4. `pnpm i && pnpm dev` (Node 20+).

## Routes
- /login — email magic link
- /app — persona list + chat panel
- /personas/[id]/edit — edit persona JSON
- /api/chat — echo placeholder, writes messages
