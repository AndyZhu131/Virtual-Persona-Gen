"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import PersonaList from "@/components/persona-list";
import PersonaCard from "@/components/persona-card";
import Section from "@/components/section";
import EmptyState from "@/components/empty-state";
import { demoPersonas } from "@/lib/demos";
import type { Persona, NewPersona } from "@/lib/types";

export default function AppPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  // Fetch personas for current user
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("personas")
      .select("*")
      .eq("owner_id", userId) // Filter by current user's ID
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setMyPersonas(data as Persona[]);
        }
      });
  }, [supabase, userId]);

  // Initialize search query from URL params
  useEffect(() => {
    const searchQuery = searchParams.get("q") || "";
    setQuery(searchQuery);
  }, [searchParams]);

  // Client-side search filtering (by name only)
  const filteredPersonas = myPersonas.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  // Callback functions
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

  const createFromTemplate = async (template: NewPersona): Promise<void> => {
    if (!userId) return;

    const newPersona = {
      ...template,
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
      // Navigate to edit page for the new persona from template
      router.push(`/personas/${persona.id}/edit`);
    }
  };

  const saveDemo = async (demo: NewPersona): Promise<void> => {
    if (!userId) return;

    const newPersona = {
      ...demo,
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
      // Navigate to edit page for the new persona from demo
      router.push(`/personas/${persona.id}/edit`);
    }
  };

  if (!userId) return <div className="p-6 text-white">Please login.</div>;

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Left Fixed Sidebar */}
      <PersonaList 
        items={myPersonas} 
        onSelect={(persona) => router.push(`/personas/${persona.id}/chat`)}
        onCreate={createPersona}
        onSearch={(q) => setQuery(q)}
      />

      {/* Main Content Area */}
      <div className="ml-80 flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {/* Top Navigation Bar Integrated */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
              <div className="text-3xl font-bold text-white">VPG</div>
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search personas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white">{userEmail || "Guest"}</span>
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Logout
                </button>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {userId ? "User" : "Guest"}!
              </h1>
              <p className="text-gray-400 text-lg">
                Create, discover, and chat with AI personas
              </p>
              
              {/* Search Results Info */}
              {query && (
                <div className="text-gray-400 text-sm mt-2">
                  {filteredPersonas.length} result{filteredPersonas.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                </div>
              )}

              {/* Action Buttons - Only show when there are personas */}
              {myPersonas.length > 0 && (
                <div className="mt-4 flex gap-4">
                  <button 
                    onClick={createPersona}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Persona
                  </button>
                  <button 
                    onClick={() => createFromTemplate({
                      name: "Template Character",
                      description: "A character created from template",
                      schema: { template: true }
                    })}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Use Template
                  </button>
                  <button 
                    onClick={() => saveDemo({
                      name: "Demo Character",
                      description: "A character created from demo data",
                      schema: { demo: true, personality: "friendly" }
                    })}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Demo
                  </button>
                </div>
              )}
            </div>

            {/* Content Sections or Empty State */}
            {myPersonas.length === 0 ? (
              <div className="space-y-12">
                <EmptyState 
                  onCreate={createPersona}
                  onTryDemo={() => saveDemo({
                    name: "Demo Character",
                    description: "A friendly AI assistant ready to help with various tasks",
                    schema: { demo: true, personality: "helpful", tone: "casual" }
                  })}
                />
                
                {/* Demos Section for Empty State */}
                <div className="border-t border-gray-700 pt-12">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Try a Demo</h2>
                    <p className="text-gray-400">Experience these legendary personas in action before creating your own</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {demoPersonas.map((demo) => (
                      <div
                        key={demo.id}
                        onClick={() => router.push(`/personas/${demo.id}/chat`)}
                        className={`bg-gray-800 border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-purple-500 hover:shadow-lg ${
                          'border-gray-700'
                        }`}
                      >
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{demo.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{demo.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* For You Section */}
                <Section title="For You">
                  {filteredPersonas.slice(0, 10).map((persona) => (
                    <PersonaCard 
                      key={persona.id} 
                      persona={persona} 
                      onSelect={(p) => router.push(`/personas/${p.id}/chat`)} 
                    />
                  ))}
                </Section>

                {/* Scenes Section */}
                <Section title="Scenes">
                  {filteredPersonas.slice(0, 8).map((persona) => (
                    <PersonaCard 
                      key={persona.id} 
                      persona={persona} 
                      onSelect={(p) => router.push(`/personas/${p.id}/chat`)} 
                    />
                  ))}
                </Section>

                {/* Featured Section */}
                <Section title="Featured">
                  {filteredPersonas.slice(0, 10).map((persona) => (
                    <PersonaCard 
                      key={persona.id} 
                      persona={persona} 
                      onSelect={(p) => router.push(`/personas/${p.id}/chat`)} 
                    />
                  ))}
                </Section>

                {/* Popular Section */}
                <Section title="Popular">
                  {filteredPersonas.slice(0, 8).map((persona) => (
                    <PersonaCard 
                      key={persona.id} 
                      persona={persona} 
                      onSelect={(p) => router.push(`/personas/${p.id}/chat`)} 
                    />
                  ))}
                </Section>

                {/* Trending Section */}
                <Section title="Trending">
                  {filteredPersonas.slice(0, 6).map((persona) => (
                    <PersonaCard 
                      key={persona.id} 
                      persona={persona} 
                      onSelect={(p) => router.push(`/personas/${p.id}/chat`)} 
                    />
                  ))}
                </Section>

                {/* Demos Section for Existing Users */}
                <div className="border-t border-gray-700 pt-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Try Famous Personas</h2>
                    <p className="text-gray-400">Chat with legendary historical figures and fictional characters</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {demoPersonas.map((demo) => (
                      <div
                        key={demo.id}
                        onClick={() => router.push(`/personas/${demo.id}/chat`)}
                        className={`bg-gray-800 border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-purple-500 hover:shadow-lg ${
                          'border-gray-700'
                        }`}
                      >
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{demo.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{demo.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
