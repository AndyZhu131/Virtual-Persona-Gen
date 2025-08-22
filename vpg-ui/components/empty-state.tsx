"use client";

import { useTheme } from '@/lib/theme-context';

interface EmptyStateProps {
  onCreate: () => void;
  onTryDemo: () => void;
}

export default function EmptyState({ onCreate, onTryDemo }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Persona Section */}
      <div className={`${colors.bg.card} rounded-xl border ${colors.border.primary} shadow-lg p-6`}>
        <div className="text-center">
          {/* Icon */}
          <div className={`w-12 h-12 mx-auto mb-4 ${colors.bg.tertiary} rounded-full flex items-center justify-center`}>
            <svg 
              className={`w-6 h-6 ${colors.text.muted}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold ${colors.text.primary} mb-3`}>
            Create your first Persona
          </h2>

          {/* Subtitle */}
          <p className={`${colors.text.muted} mb-4 text-sm leading-relaxed`}>
            Get started by creating a new persona. Your personas will appear here once created.
          </p>

          {/* Create Button */}
          <button
            onClick={onCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Create Persona
          </button>
        </div>
      </div>

      {/* Try Demo Section */}
      <div className={`${colors.bg.card} rounded-xl border ${colors.border.primary} shadow-lg p-6`}>
        <div className="text-center">
          {/* Demo Icon */}
          <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold ${colors.text.primary} mb-3`}>
            Try a Demo
          </h2>

          {/* Subtitle */}
          <p className={`${colors.text.muted} mb-4 text-sm leading-relaxed`}>
            Experience how personas work by trying out a demo character first.
          </p>

          {/* Try Demo Button */}
          <button
            onClick={onTryDemo}
            className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Try Demo
          </button>
        </div>
      </div>
    </div>
  );
}
