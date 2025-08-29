"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import PersonaList from '@/components/persona-list';
import ChatPanel from '@/components/chat-panel';
import type { Persona } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Resolve async params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

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

  // Fetch persona data
  useEffect(() => {
    if (!resolvedParams?.id) return;

    const fetchPersona = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('personas')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Persona not found');
          } else {
            setError('Failed to load persona');
          }
        } else {
          setPersona(data as Persona);
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [resolvedParams?.id, supabase]);

  // Loading state
  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-textSecondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-textSecondary)]">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--color-error)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[var(--color-textSecondary)] mb-4">{error || 'Persona not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[var(--color-button)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Left Fixed Sidebar */}
      <PersonaList 
        items={myPersonas} 
        onSelect={(persona) => router.push(`/personas/${persona.id}/chat`)}
        onCreate={() => router.push('/personas/new')}
        onSearch={() => {}}
      />

      {/* Main Content Area */}
      <div className="ml-80 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-textPrimary)]">{persona.name}</h1>
              {persona.description && (
                <p className="text-[var(--color-textSecondary)] text-sm">{persona.description}</p>
              )}
            </div>
          </div>
        </header>

        {/* Chat Panel */}
        <div className="flex-1">
          <ChatPanel persona={persona} />
        </div>
      </div>
    </div>
  );
}

