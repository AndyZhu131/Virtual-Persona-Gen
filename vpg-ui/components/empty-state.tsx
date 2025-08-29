"use client";

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  onCreate: () => void;
  onTryDemo: () => void;
}

export default function EmptyState({ onCreate, onTryDemo }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-lg p-6">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto mb-4 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--color-textSecondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-2">
          No personas yet
        </h3>
        <p className="text-[var(--color-textSecondary)] mb-6">
          Create your first persona to get started with AI-powered conversations
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onCreate}
            className="px-6 py-3 bg-[var(--color-button)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Create Persona
          </button>
          <button
            onClick={onTryDemo}
            className="px-6 py-3 bg-[var(--color-surface)] text-[var(--color-textPrimary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-input)] transition-colors font-medium"
          >
            Try Demo
          </button>
        </div>
      </div>
    </div>
  );
}
