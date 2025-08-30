"use client";

import { useParams } from "next/navigation";
import { demoPersonas } from "@/lib/demos";
import PersonaCard from "@/components/persona-card";
import PersonaList from "@/components/persona-list";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DemoChatPage() {
  const params = useParams();
  const demoId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Find the demo persona
  const demoPersona = demoPersonas.find(p => p.id === demoId);
  
  if (!demoPersona) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] mb-4">
            Demo Persona Not Found
          </h1>
          <p className="text-[var(--color-textSecondary)]">
            The requested demo persona could not be found.
          </p>
        </div>
      </div>
    );
  }

  const generateEchoResponse = (userMessage: string): string => {
    return userMessage;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateEchoResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 500); // Random delay between 0.5-1 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* Left Fixed Sidebar */}
      <PersonaList 
        items={demoPersonas}
        onSelect={(persona) => {
          // Navigate to the demo chat for the selected persona
          window.location.href = `/demo/${persona.id}/chat`;
        }}
        onCreate={() => {
          // Navigate back to main page to create a real persona
          window.location.href = '/';
        }}
      />
      
      {/* Main Content Area */}
      <div className="ml-80 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
                Chat with {demoPersona.name}
              </h1>
            </div>
          </div>
        </div>

                 {/* Main Content */}
         <div className="flex-1 overflow-y-auto">
           <div className="w-full p-6 h-full">
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
               {/* Left: Chat Interface */}
               <div className="lg:col-span-3 h-full">
                 <div className="bg-[var(--color-background)] rounded-2xl flex flex-col h-full">
                   {/* Chat Messages */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-4">
                     {messages.length === 0 ? (
                       <div className="text-center py-12">
                         <div className="text-4xl mb-4">💬</div>
                         <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-2">
                           Start a conversation with {demoPersona?.name || 'this persona'}
                         </h3>
                         <p className="text-sm text-[var(--color-textSecondary)]">
                           This is a demo chat interface. Type a message below to see how {demoPersona?.name || 'this persona'} responds.
                         </p>
                       </div>
                     ) : (
                       messages.map((message) => (
                         <div
                           key={message.id}
                           className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                         >
                           <div
                             className={`max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--color-surface)] text-[var(--color-textPrimary)] border border-[var(--color-border)]`}
                           >
                             <p className="text-sm">{message.content}</p>
                             <p className="text-xs mt-2 text-[var(--color-textSecondary)]">
                               {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                           </div>
                         </div>
                       ))
                     )}
                     
                     {/* Typing Indicator */}
                     {isTyping && (
                       <div className="flex justify-start">
                         <div className="bg-[var(--color-surface)] text-[var(--color-textPrimary)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
                           <div className="flex items-center gap-1">
                             <span className="text-sm">Typing</span>
                             <div className="flex gap-1">
                               <div className="w-2 h-2 bg-[var(--color-textSecondary)] rounded-full animate-bounce"></div>
                               <div className="w-2 h-2 bg-[var(--color-textSecondary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                               <div className="w-2 h-2 bg-[var(--color-textSecondary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Chat Input */}
                   <div className="border-t border-[var(--color-border)] p-4 mt-auto">
                     <div className="flex gap-3">
                       <textarea
                         value={inputMessage}
                         onChange={(e) => setInputMessage(e.target.value)}
                         onKeyPress={handleKeyPress}
                         placeholder={`Message ${demoPersona?.name || 'this persona'}...`}
                         className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-button)] focus:border-transparent"
                         rows={1}
                         style={{ minHeight: '48px', maxHeight: '120px' }}
                       />
                       <button
                         onClick={handleSendMessage}
                         disabled={!inputMessage.trim() || isTyping}
                         className="px-6 py-3 bg-[var(--color-button)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                       >
                         Send
                       </button>
                     </div>
                   </div>
                 </div>
               </div>

                               {/* Right: Persona Info Sidebar */}
                <div className="lg:col-span-1 h-full">
                  <div className="bg-[var(--color-background)] rounded-2xl p-6 h-full border-l border-[var(--color-border)]">
                   {/* Avatar and Name */}
                   <div className="text-center mb-6">
                     <div className="w-24 h-24 bg-[var(--color-button)] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                       {demoPersona.name.charAt(0).toUpperCase()}
                     </div>
                     <h2 className="text-xl font-semibold text-[var(--color-textPrimary)]">
                       {demoPersona.name}
                     </h2>
                   </div>
                   
                   {/* Persona Details */}
                   <div className="space-y-4">
                     <div>
                       <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Description</h3>
                       <p className="text-sm text-[var(--color-textSecondary)]">
                         {demoPersona.description || 'No description available'}
                       </p>
                     </div>
                     
                     <div>
                       <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Personality</h3>
                       <p className="text-sm text-[var(--color-textSecondary)]">
                         {demoPersona.schema?.personality || 'Not specified'}
                       </p>
                     </div>
                     
                     <div>
                       <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Tone</h3>
                       <p className="text-sm text-[var(--color-textSecondary)]">
                         {demoPersona.schema?.tone || 'Not specified'}
                       </p>
                     </div>
                     
                     <div>
                       <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Expertise</h3>
                       <div className="flex flex-wrap gap-2">
                         {demoPersona.schema?.expertise?.map((skill: string, index: number) => (
                           <span
                             key={index}
                             className="px-2 py-1 bg-[var(--color-button)] text-white text-xs rounded-full"
                           >
                             {skill}
                           </span>
                         )) || 'Not specified'}
                       </div>
                     </div>
                     
                     <div>
                       <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Style</h3>
                       <p className="text-sm text-[var(--color-textSecondary)]">
                         {demoPersona.schema?.style || 'Not specified'}
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
