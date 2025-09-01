"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ChatPanel from '@/components/chat-panel';
import { demoPersonas } from '@/lib/demos';
import type { Persona } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Resolve async params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch persona data
  useEffect(() => {
    if (!resolvedParams?.id) return;

    const fetchPersona = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if this is a demo persona first
        const demoPersona = demoPersonas.find(p => p.id === resolvedParams.id);
        if (demoPersona) {
          setPersona(demoPersona);
          setLoading(false);
          return;
        }

        // If not a demo persona, fetch from Supabase
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 p-4 h-full">
      {/* Left: Chat Panel */}
      <div className="min-h-0">
        <ChatPanel persona={persona} />
      </div>

      {/* Right: Persona Info Panel */}
      <aside className="lg:sticky lg:top-20 h-fit lg:h-[calc(100vh-6rem)] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
        {/* Avatar and Name */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-[var(--color-button)] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
            {persona.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-textPrimary)]">
            {persona.name}
          </h2>
        </div>
        
        {/* Persona Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Description</h3>
            <p className="text-sm text-[var(--color-textSecondary)]">
              {persona.description || 'No description available'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Personality</h3>
            <p className="text-sm text-[var(--color-textSecondary)]">
              {(persona.schema as any)?.personality || 'Not specified'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Tone</h3>
            <p className="text-sm text-[var(--color-textSecondary)]">
              {(persona.schema as any)?.tone || 'Not specified'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray((persona.schema as any)?.expertise) ? (persona.schema as any).expertise.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[var(--color-button)] text-white text-xs rounded-full"
                >
                  {skill}
                </span>
              )) : 'Not specified'}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Style</h3>
            <p className="text-sm text-[var(--color-textSecondary)]">
              {(persona.schema as any)?.style || 'Not specified'}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
