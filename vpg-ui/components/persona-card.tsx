import type { Persona } from "@/lib/types";
import { useRouter } from "next/navigation";

interface PersonaCardProps {
  persona: Persona;
  onSelect: (p: Persona) => void;
}

export default function PersonaCard({ persona, onSelect }: PersonaCardProps) {
  const router = useRouter();
  
  // Generate a fake interaction count for demo purposes
  const generateFakeStats = (name: string): string => {
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
      return a;
    }, 0);
    const base = Math.abs(hash) % 1000;
    if (base < 100) return `${base + 50}k`;
    if (base < 500) return `${(base / 100).toFixed(1)}k`;
    return `${(base / 1000).toFixed(1)}M`;
  };

  const interactionCount = generateFakeStats(persona.name);
  const authorHandle = persona.owner_id ? `@${persona.owner_id.slice(0, 8)}` : "@anonymous";

  return (
    <div className="group relative bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-purple-500/50 hover:shadow-xl hover:-translate-y-1">
      {/* Image Placeholder with Overlay */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
        {/* Placeholder Image */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-6xl font-bold opacity-80">
            {persona.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Stats Dot */}
        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-white text-xs font-medium">{interactionCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-white font-semibold text-lg leading-tight truncate group-hover:text-purple-200 transition-colors duration-200">
          {persona.name}
        </h3>

        {/* Author Line */}
        <p className="text-gray-400 text-sm truncate">
          By {authorHandle}
        </p>

        {/* Description (if available) */}
        {persona.description && (
          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {persona.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onSelect(persona)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-lg"
          >
            Select
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/personas/${persona.id}/edit`);
            }}
            className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center"
            title="Edit persona"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}
