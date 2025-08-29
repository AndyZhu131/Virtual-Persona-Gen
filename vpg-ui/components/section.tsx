"use client";

import { useRouter } from 'next/navigation';
import type { Persona } from '@/lib/types';
import PersonaCard from './persona-card';

interface SectionProps {
  title: string;
  personas: Persona[];
  onSelect: (persona: Persona) => void;
  showViewAll?: boolean;
  viewAllHref?: string;
}

export default function Section({ title, personas, onSelect, showViewAll = true, viewAllHref }: SectionProps) {
  const router = useRouter();

  const handleViewAll = () => {
    if (viewAllHref) {
      router.push(viewAllHref);
    }
  };

  if (personas.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {title}
        </h2>
        {showViewAll && (
          <button
            onClick={handleViewAll}
            className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] transition-colors font-medium"
          >
            View all
          </button>
        )}
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
