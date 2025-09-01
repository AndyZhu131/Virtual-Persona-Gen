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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Truncate messages if too many (keep last 300)
  const truncateMessages = (msgs: ChatMsg[]) => {
    if (msgs.length > 500) {
      return msgs.slice(-300);
    }
    return msgs;
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    // Trim input to 4000 chars
    const trimmedInput = input.trim().slice(0, 4000);
    
    const userMsg: ChatMsg = { 
      role: "user", 
      content: trimmedInput, 
      timestamp: new Date() 
    };
    
    // Append user message immediately
    setMessages((prev) => truncateMessages([...prev, userMsg]));
    setInput("");
    setIsSending(true);

    try {
      // Keep last 30 messages for context
      const recentMessages = [...messages, userMsg].slice(-30);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          personaId: persona.id, 
          messages: recentMessages
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMsg = { 
          role: "assistant", 
          content: data.reply ?? "I'm sorry, I couldn't process that request.",
          timestamp: new Date()
        };
        setMessages((prev) => truncateMessages([...prev, assistantMsg]));
      } else {
        // Handle error
        const errorMsg: ChatMsg = { 
          role: "assistant", 
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date()
        };
        setMessages((prev) => truncateMessages([...prev, errorMsg]));
      }
    } catch (error) {
      const errorMsg: ChatMsg = { 
        role: "assistant", 
        content: "Network error. Please check your connection.",
        timestamp: new Date()
      };
      setMessages((prev) => truncateMessages([...prev, errorMsg]));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 144) + 'px'; // max 6 lines (24px * 6)
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Scrollable Message List */}
      <section 
        aria-label="Conversation"
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-white/5 dark:bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
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
              role="article"
              aria-live="polite"
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] break-words px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-textPrimary)]"
                    : "bg-white/5 dark:bg-black/5 text-[var(--color-textPrimary)]"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs text-[var(--color-textSecondary)] mt-2">
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
            <div className="bg-white/5 dark:bg-black/5 text-[var(--color-textPrimary)] rounded-2xl px-4 py-3">
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

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </section>

      {/* Sticky Input Bar */}
      <div className="sticky bottom-0 inset-x-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona.name}...`}
            aria-label="Message input"
            rows={1}
            maxLength={4000}
            className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent max-h-36 overflow-y-auto"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            aria-label="Send message"
            className={`px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
              input.trim() && !isSending
                ? "bg-[var(--color-accent)] text-white hover:opacity-90"
                : "bg-[var(--color-surface)] text-[var(--color-textSecondary)]"
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="mt-2 flex justify-between items-center text-xs text-[var(--color-textSecondary)]">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length}/4000</span>
        </div>
      </div>
    </div>
  );
}
