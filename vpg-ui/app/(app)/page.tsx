"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import PersonaCard from "@/components/persona-card";
import EmptyState from "@/components/empty-state";
import { demoPersonas } from "@/lib/demos";
import type { Persona, NewPersona } from "@/lib/types";

export default function AppPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSent, setLoginSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

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

  // Handle magic link login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: typeof window !== "undefined" ? `${location.origin}/auth/callback` : undefined }
    });
    
    if (error) {
      alert(error.message);
    } else {
      setLoginSent(true);
    }
    
    setLoginLoading(false);
  };

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

  // Show login form for unauthenticated users
  if (!userId) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[var(--color-textPrimary)] mb-2">
              Welcome to VPG
            </h1>
            <p className="text-[var(--color-textSecondary)] text-lg">
              Create and manage your virtual personas with AI-powered conversations
            </p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
            <h2 className="text-2xl font-semibold text-[var(--color-textPrimary)] mb-4 text-center">
              Get Started
            </h2>
            
            {!loginSent ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-button)] focus:border-transparent"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full px-4 py-3 bg-[var(--color-button)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loginLoading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-2">
                  Check Your Email
                </h3>
                <p className="text-[var(--color-textSecondary)] mb-4">
                  We&apos;ve sent a magic link to <strong>{loginEmail}</strong>
                </p>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  Click the link in your email to sign in and start creating personas.
                </p>
                <button
                  onClick={() => {
                    setLoginSent(false);
                    setLoginEmail("");
                  }}
                  className="mt-4 text-[var(--color-button)] hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>

          {/* Demo section for unauthenticated users */}
          <div className="mt-8 text-center">
            <p className="text-[var(--color-textSecondary)] mb-4">
              Want to see what VPG can do? Check out our demo personas below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-textPrimary)] mb-2">
          Welcome to VPG
        </h1>
        <p className="text-[var(--color-textSecondary)] text-lg">
          Create and manage your virtual personas with AI-powered conversations
        </p>
      </div>

      {/* Personas Section */}
      {userId && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-[var(--color-textPrimary)]">
              Your Personas
            </h2>
            <button
              onClick={createPersona}
              className="px-4 py-2 bg-[var(--color-button)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Persona
            </button>
          </div>

          {myPersonas.length === 0 ? (
            <EmptyState 
              onCreate={createPersona}
              onTryDemo={() => saveDemo({
                name: "Demo Character",
                description: "A friendly AI assistant ready to help with various tasks",
                schema: { demo: true, personality: "helpful", tone: "casual" }
              })}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onSelect={() => router.push(`/personas/${persona.id}/chat`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Demo Personas Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[var(--color-textPrimary)] mb-4">
          Explore Demo Personas
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2">
          {demoPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onSelect={() => router.push(`/personas/${persona.id}/chat`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
