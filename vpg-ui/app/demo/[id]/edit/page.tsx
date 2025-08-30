"use client";

import { useParams } from "next/navigation";
import { demoPersonas } from "@/lib/demos";
import PersonaCard from "@/components/persona-card";

export default function DemoEditPage() {
  const params = useParams();
  const demoId = params.id as string;
  
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

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
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
              View Demo Persona: {demoPersona.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Persona Card */}
          <div>
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4">
                Persona Overview
              </h2>
              <PersonaCard
                persona={demoPersona}
                onSelect={() => {}} // No action needed here
              />
            </div>
          </div>

          {/* Right: Persona Details */}
          <div>
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4">
                Persona Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Name</h3>
                  <p className="text-[var(--color-textSecondary)]">{demoPersona.name}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Description</h3>
                  <p className="text-[var(--color-textSecondary)]">{demoPersona.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Personality</h3>
                  <p className="text-[var(--color-textSecondary)]">
                    {demoPersona.schema?.personality || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Tone</h3>
                  <p className="text-[var(--color-textSecondary)]">
                    {demoPersona.schema?.tone || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {demoPersona.schema?.expertise?.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--color-button)] text-white text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    )) || 'Not specified'}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Style</h3>
                  <p className="text-[var(--color-textSecondary)]">
                    {demoPersona.schema?.style || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Background</h3>
                  <p className="text-[var(--color-textSecondary)]">
                    {demoPersona.schema?.background || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[var(--color-textPrimary)] mb-2">Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {demoPersona.schema?.traits?.map((trait: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[var(--color-background)] text-[var(--color-textPrimary)] text-sm rounded-full border border-[var(--color-border)]"
                      >
                        {trait}
                      </span>
                    )) || 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-textSecondary)]">
                  <strong>Note:</strong> This is a demo persona and cannot be edited. 
                  To create your own editable persona, use the &ldquo;Create Persona&rdquo; button on the main page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
