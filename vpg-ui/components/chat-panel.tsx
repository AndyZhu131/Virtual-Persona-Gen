"use client";

import { useRef, useState, useEffect } from "react";
import type { Persona } from "@/lib/types";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function ChatPanel({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const userMsg: ChatMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId: persona.id, messages: [...messages, userMsg] })
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "…" }]);
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className="inline-block max-w-[75%] border rounded-2xl px-3 py-2">
              <div className="text-xs opacity-60 mb-1">{m.role}</div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something…"
        />
        <button className="rounded bg-black text-white px-4" onClick={send} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
