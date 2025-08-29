"use client";

import { useRef, useState, useEffect } from "react";
import type { Persona } from "@/lib/types";

type ChatMsg = { 
  role: "user" | "assistant"; 
  content: string; 
  timestamp?: Date;
};

export default function ChatPanel({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Format timestamp for display
  const formatTime = (date?: Date): string => {
    if (!date) return "";
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isSending || input.length > 2000) return;

    const userMsg: ChatMsg = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          personaId: persona.id, 
          messages: [...messages, userMsg] 
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMsg = { 
          role: "assistant", 
          content: data.reply ?? "I'm sorry, I couldn't process that request.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Handle error
        const errorMsg: ChatMsg = { 
          role: "assistant", 
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg: ChatMsg = { 
        role: "assistant", 
        content: "Network error. Please check your connection.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* Persona Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)] bg-[var(--color-input)]">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent)] to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {persona.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
            {persona.name}
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)]">
            {persona.description || "AI Persona"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[var(--color-input)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--color-textSecondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[var(--color-textSecondary)] text-sm">
              Start a conversation with {persona.name}
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-[var(--color-accent)] text-white rounded-br-md"
                    : "bg-[var(--color-input)] text-[var(--color-textPrimary)] rounded-bl-md border border-[var(--color-border)]"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-input)] text-[var(--color-textPrimary)] rounded-2xl rounded-bl-md px-4 py-3 border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[var(--color-textSecondary)] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[var(--color-textSecondary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[var(--color-textSecondary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-[var(--color-textSecondary)]">typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-input)]/95 backdrop-blur-sm">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            maxLength={2000}
            className="flex-1 bg-[var(--color-background)] border border-[var(--color-inputBorder)] rounded-xl px-4 py-3 pr-12 text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className={`px-4 py-3 rounded-xl transition-colors ${
              input.trim() && !isSending
                ? "bg-[var(--color-accent)] text-white hover:opacity-90"
                : "bg-[var(--color-surface)] text-[var(--color-textSecondary)] cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="mt-2 flex justify-between items-center text-xs text-[var(--color-textSecondary)]">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length}/2000</span>
        </div>
      </div>
    </div>
  );
}
