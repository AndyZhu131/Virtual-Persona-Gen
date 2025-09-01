"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ThemeToggle from './theme-toggle';

interface NavbarProps {
  fullWidth?: boolean;
}

export default function Navbar({ fullWidth = false }: NavbarProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className={`${fullWidth ? 'w-full px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo and Search */}
          <div className="flex items-center space-x-8 flex-1">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-[var(--color-textPrimary)]">
                VPG
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search personas..."
                  className="w-full bg-[var(--color-input)] border border-[var(--color-inputBorder)] rounded-lg px-4 py-2 pl-10 text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-textSecondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right side - Theme Toggle and User */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {userEmail && (
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[var(--color-textSecondary)]">
                    {userEmail}
                  </span>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-textPrimary)] hover:bg-[var(--color-surface)] transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
