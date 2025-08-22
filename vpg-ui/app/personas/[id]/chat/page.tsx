"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/chat-panel";
import PersonaList from "@/components/persona-list";
import type { Persona } from "@/lib/types";
import { demoPersonas } from "@/lib/demos";

export default function PersonaChatPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Get user information
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  // Fetch personas for current user
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("personas")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setMyPersonas(data as Persona[]);
        }
      });
  }, [supabase, userId]);

  // Fetch the current persona
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      
      // Check if it's a demo persona first
      const demoPersona = demoPersonas.find(p => p.id === params.id);
      if (demoPersona) {
        setPersona(demoPersona);
        setIsLoading(false);
        return;
      }

      // If not demo, fetch from database
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (error) {
        console.error("Error fetching persona:", error);
        router.push("/");
        return;
      }

      if (data) {
        setPersona(data as Persona);
      }
      setIsLoading(false);
    })();
  }, [params.id, supabase, router]);

  const handleBack = () => {
    router.push("/");
  };

  const createPersona = async (): Promise<void> => {
    if (!userId) return;
    
    const newPersona = {
      name: "New Persona",
      description: "",
      schema: {},
      owner_id: userId
    };

    const { data, error } = await supabase
      .from("personas")
      .insert(newPersona)
      .select()
      .single();

    if (!error && data) {
      const persona = data as Persona;
      setMyPersonas(prev => [persona, ...prev]);
      // Navigate to edit page for the new persona
      router.push(`/personas/${persona.id}/edit`);
    }
  };

  const saveDemoAsPersona = async (demoPersona: Persona): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id || !demoPersona.isDemo) return;

    // Create a new persona without the demo-specific fields
    const newPersona = {
      name: demoPersona.name,
      description: demoPersona.description,
      schema: demoPersona.schema,
      owner_id: userData.user.id
    };

    const { data, error } = await supabase
      .from("personas")
      .insert(newPersona)
      .select()
      .single();

    if (!error && data) {
      // Navigate to the new persona's chat page
      router.push(`/personas/${data.id}/chat`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Persona not found</p>
          <button
            onClick={handleBack}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Fixed Sidebar - PersonaList */}
      <PersonaList 
        items={myPersonas} 
        onSelect={(selectedPersona) => router.push(`/personas/${selectedPersona.id}/chat`)}
        onCreate={createPersona}
        onSearch={(q) => setSearchQuery(q)}
      />

      {/* Main Content Area */}
      <div className="ml-80 flex flex-col flex-1 min-h-screen">
        {/* Header with back button */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <div className="w-px h-6 bg-gray-600" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {persona.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-white font-semibold">{persona.name}</h1>
                  {persona.description && (
                    <p className="text-gray-400 text-sm">{persona.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {persona.isDemo && (
              <button
                onClick={() => saveDemoAsPersona(persona)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Save as my persona
              </button>
            )}
          </div>
        </header>

        {/* Full-screen chat */}
        <div className="flex-1 flex">
          <div className="flex-1 max-w-4xl mx-auto">
            <ChatPanel persona={persona} />
          </div>
        </div>
      </div>
    </div>
  );
}

