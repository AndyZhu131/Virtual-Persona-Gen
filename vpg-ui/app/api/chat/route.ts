import { NextResponse } from "next/server";

type Msg = { role: "user" | "assistant"; content: string };
type Body = { personaId: string; messages: Msg[] };

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

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

    // For now, we'll use a mock persona since we don't have persona storage yet
    // In a real implementation, you'd fetch the persona by ID from your database
    const mockPersona = {
      id: personaId,
      name: "AI Assistant",
      description: "A helpful AI assistant",
      personality: "Friendly and helpful",
      communication_style: "Conversational and engaging"
    };

    // Call the Python backend
    const response = await fetch(`${BACKEND_URL}/conversation/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona: mockPersona,
        conversation_history: conversationHistory,
        max_output_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      reply: data.conversation_response || "I'm sorry, I couldn't generate a response." 
    });

  } catch (error) {
    console.error("Error calling backend:", error);
    
    // Fallback to a simple response if backend is unavailable
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const reply = `I'm having trouble connecting to the AI service. You said: "${lastUser?.content ?? ""}"`;
    
    return NextResponse.json({ reply });
  }
}
