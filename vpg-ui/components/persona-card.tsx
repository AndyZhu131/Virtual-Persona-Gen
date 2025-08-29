"use client";

import type { Persona } from '@/lib/types';

interface PersonaCardProps {
  persona: Persona;
  onSelect?: (persona: Persona) => void;
}

export default function PersonaCard({ persona, onSelect }: PersonaCardProps) {
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(persona);
    }
  };

  // Get avatar content - first letter of name or custom avatar
  const getAvatarContent = () => {
    if (persona.avatarUrl) {
      return (
        <img 
          src={persona.avatarUrl} 
          alt={`${persona.name} avatar`}
          className="w-full h-full object-cover rounded-full"
        />
      );
    }
    
    // Fallback to first letter
    return (
      <span className="text-lg font-bold text-white">
        {persona.name.charAt(0).toUpperCase()}
      </span>
    );
  };

  return (
    <div
      className="w-full h-[140px] bg-[var(--color-surface)] rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border border-[var(--color-border)] hover:border-[var(--color-borderHover)]"
      onClick={handleCardClick}
    >
      <div className="flex gap-4 h-full">
        {/* Left: Round Avatar */}
        <div className="flex-shrink-0 flex items-center">
          <div className="w-24 h-30 bg-[var(--color-button)] h-full rounded-2xl flex items-center overflow-hidden shadow-md object-cover object-center justify-center">
            {getAvatarContent()}
          </div>
        </div>

        {/* Right: Stacked Text Content */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Persona Name */}
          <h3 className="text-base font-bold text-[var(--color-textPrimary)] truncate mb-2">
            {persona.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-[var(--color-textSecondary)] leading-tight line-clamp-2">
            {persona.description || 'No description available'}
          </p>
        </div>
      </div>
    </div>
  );
}
