"use client";

import { useTheme } from '@/lib/theme-context';

export default function ThemeDemo() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">
        Theme System Demo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Background Colors */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
            Background Colors
          </h3>
          <div className="space-y-2">
            <div className="h-16 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-textPrimary)]">Background</span>
            </div>
            <div className="h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-textPrimary)]">Surface</span>
            </div>
            <div className="h-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-textPrimary)]">Card</span>
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
            Text Colors
          </h3>
          <div className="space-y-2">
            <div className="h-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-textPrimary)] text-lg font-medium">Primary Text</span>
            </div>
            <div className="h-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-textSecondary)] text-lg">Secondary Text</span>
            </div>
            <div className="h-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-muted)] text-lg">Muted Text</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accent Colors */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
          Accent Colors
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="h-16 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">Accent</span>
          </div>
          <div className="h-16 bg-[var(--color-success)] rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">Success</span>
          </div>
          <div className="h-16 bg-[var(--color-warning)] rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">Warning</span>
          </div>
          <div className="h-16 bg-[var(--color-error)] rounded-lg flex items-center justify-center">
            <span className="text-white font-medium">Error</span>
          </div>
        </div>
      </div>

      {/* Input Demo */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
          Input Elements
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Type something..."
            className="w-full px-4 py-2 bg-[var(--color-input)] border border-[var(--color-inputBorder)] rounded-lg text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <textarea
            placeholder="Type a message..."
            rows={3}
            className="w-full px-4 py-2 bg-[var(--color-input)] border border-[var(--color-inputBorder)] rounded-lg text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
        <div>
          <p className="text-[var(--color-textPrimary)] font-medium">Current Theme: {theme}</p>
          <p className="text-[var(--color-textSecondary)] text-sm">
            Click the button to toggle between dark and light themes
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}
