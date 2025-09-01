"use client";

import PersonaList from '@/components/persona-list';
import Navbar from '@/components/navbar';
import { demoPersonas } from '@/lib/demos';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Persona } from '@/lib/types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
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

  // Combine user personas with demo personas
  const allPersonas = [...myPersonas, ...demoPersonas];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Left Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-80">
        <PersonaList 
          items={allPersonas} 
          onSelect={(persona) => router.push(`/personas/${persona.id}/chat`)}
          onCreate={() => router.push('/personas/new')}
          onSearch={() => {}}
        />
      </aside>

      {/* Main Content Area */}
      <main className="ml-80 flex-1 flex flex-col">
        {/* Sticky Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <Navbar fullWidth={true} />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
