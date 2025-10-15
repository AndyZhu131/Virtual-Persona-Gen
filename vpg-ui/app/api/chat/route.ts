import { NextResponse } from "next/server";
import { demoPersonas } from "@/lib/demos";
import { backendApi } from "@/services/api";

type Msg = { role: "user" | "assistant"; content: string };
type Body = { personaId: string; messages: Msg[] };

export async function POST(req: Request) {
  const { personaId, messages } = (await req.json()) as Body;
  if (!personaId || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // Convert messages to the format expected by the backend
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Find the persona from demo data
    const persona = demoPersonas.find(p => p.id === personaId);
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Map the demo persona to the format expected by the backend
    const backendPersona = {
      id: persona.id,
      name: persona.name,
      description: persona.description,
      role: persona.schema?.personality || "assistant",
      tone: persona.schema?.tone || "friendly",
      traits: persona.schema?.traits || ["helpful"],
      dialogue_behavior: persona.schema?.style || "conversational",
      quirks: persona.schema?.expertise || []
    };

    // Call the Python backend using the centralized API service
    const data = await backendApi.respondConversation(
      backendPersona,
      conversationHistory,
      undefined, // context
      500 // max_output_tokens
    );
    
    return NextResponse.json({ 
      reply: data.response || "I'm sorry, I couldn't generate a response." 
    });

  } catch (error) {
    console.error("Error calling backend:", error);
    
    // Fallback to a simple response if backend is unavailable
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const reply = `I'm having trouble connecting to the AI service. You said: "${lastUser?.content ?? ""}"`;
    
    return NextResponse.json({ reply });
  }
}
