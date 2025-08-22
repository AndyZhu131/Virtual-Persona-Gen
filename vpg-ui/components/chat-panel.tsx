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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col h-full bg-gray-800">
      {/* Persona Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-gray-900">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {persona.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">{persona.name}</h3>
          {persona.description && (
            <p className="text-gray-400 text-sm truncate">{persona.description}</p>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Start a conversation with {persona.name}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}
            >
              <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md"
                      : "bg-gray-700 text-gray-200 rounded-bl-md border border-gray-600"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
                
                {/* Timestamp */}
                {message.timestamp && (
                  <div className={`text-xs text-gray-500 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator while sending */}
        {isSending && (
          <div className="flex justify-start group">
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-600 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-300">{persona.name} is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef as any}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${persona.name}...`}
              disabled={isSending}
              rows={1}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-32 scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-500"
              style={{
                minHeight: '48px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            
            {/* Send button inside input for mobile-friendly design */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                input.trim() && !isSending
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Helper text */}
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {input.length > 0 && (
            <span className={input.length > 1000 ? "text-yellow-500" : ""}>{input.length}/2000</span>
          )}
        </div>
      </div>
    </div>
  );
}
