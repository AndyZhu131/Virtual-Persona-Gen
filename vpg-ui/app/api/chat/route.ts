import { NextResponse } from "next/server";

type Msg = { role: "user" | "assistant"; content: string };
type Body = { personaId: string; messages: Msg[] };

export async function POST(req: Request) {
  const { personaId, messages } = (await req.json()) as Body;
  if (!personaId || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const reply = `Echo: ${lastUser?.content ?? ""}`;

  // NOTE: If you want to persist messages here via Supabase server-side,
  // you can add auth-helpers route handler client. For MVP, keep it simple.
  return NextResponse.json({ reply });
}
