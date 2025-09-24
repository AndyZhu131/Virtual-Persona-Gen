"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import PersonaList from '@/components/persona-list';
import Navbar from '@/components/navbar';
import { demoPersonas } from '@/lib/demos';
import type { Persona } from '@/lib/types';

export default function NewPersonaPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.id) {
        // Navigate to the new persona page
        router.push(`/personas/${data.id}`);
      } else {
        throw new Error('No persona ID returned from server');
      }
    } catch (err) {
      console.error('Error creating persona:', err);
      setError(err instanceof Error ? err.message : 'Failed to create persona. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Redirect to login if not authenticated
  if (userId === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-textSecondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Left Fixed Sidebar */}
      <PersonaList 
        items={allPersonas} 
        onSelect={(persona) => router.push(`/personas/${persona.id}/chat`)}
        onCreate={() => router.push('/personas/new')}
        onSearch={() => {}}
      />

      {/* Main Content Area */}
      <div className="ml-80 flex-1 min-h-screen flex flex-col">
        {/* Sticky Top Navigation Bar - spans full width */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] w-full">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[var(--color-textPrimary)] mb-4">
                Create your persona
              </h1>
              <p className="text-lg text-[var(--color-textSecondary)]">
                Describe your persona in one prompt. We&apos;ll generate the details for you.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Create a friendly customer service representative who specializes in helping with technical issues. They should be patient, knowledgeable, and always try to find solutions..."
                  className="w-full min-h-28 p-4 bg-[var(--color-input)] border border-[var(--color-inputBorder)] rounded-lg text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none"
                  disabled={isLoading}
                  rows={4}
                />
                <div className="mt-2 text-sm text-[var(--color-textSecondary)]">
                  Press <kbd className="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs">Enter</kbd> to submit
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-[var(--color-error)] bg-opacity-10 border border-[var(--color-error)] border-opacity-20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-error)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--color-error)] text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="px-6 py-3 bg-[var(--color-button)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Persona'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}