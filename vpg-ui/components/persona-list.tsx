"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Persona } from '@/lib/types';

interface PersonaListProps {
  items: Persona[];
  onSelect: (persona: Persona) => void;
  onCreate: () => void;
  onSearch?: (query: string) => void;
}

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  icon: React.ReactNode;
}

function NavItem({ href, children, isActive = false, icon }: NavItemProps) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push(href)}
      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
        isActive
          ? 'bg-[var(--color-sidebarHighlight)] text-[var(--color-textPrimary)]'
          : 'text-[var(--color-textSecondary)] hover:bg-[var(--color-sidebarHighlight)] hover:text-[var(--color-textPrimary)]'
      }`}
    >
      <span className="text-[var(--color-textSecondary)]">{icon}</span>
      <span className="text-sm">{children}</span>
    </button>
  );
}

export default function PersonaList({ items, onSelect, onCreate, onSearch }: PersonaListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    onSelect(persona);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] h-screen flex flex-col fixed left-0 top-0 z-10">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] h-screen flex flex-col fixed left-0 top-0 z-10">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-[var(--color-textPrimary)]">vpg</h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Create Button */}
        <button
          onClick={() => router.push('/personas/new')}
          className="w-full px-3 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center bg-[var(--color-sidebarDark)] text-[var(--color-textPrimary)] hover:bg-[var(--color-sidebarHighlight)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Create</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-2 space-y-1">
        <NavItem href="/" icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }>
          Home
        </NavItem>
        <NavItem href="/personas" icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }>
          Discover
        </NavItem>
      </nav>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[var(--color-input)] border border-[var(--color-inputBorder)] rounded-lg px-4 py-2 pl-10 text-[var(--color-textPrimary)] placeholder-[var(--color-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] text-sm"
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

      {/* Personas List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filteredItems.length > 0 ? (
          <div className="space-y-1">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handlePersonaSelect(item)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  selectedPersona?.id === item.id
                    ? 'bg-[var(--color-sidebarHighlight)]'
                    : 'hover:bg-[var(--color-sidebarHighlight)]'
                }`}
              >
                <div className="w-8 h-8 bg-[var(--color-purple)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-textPrimary)] truncate">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-[var(--color-textSecondary)] truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--color-textSecondary)] text-sm">No personas found</p>
          </div>
        )}
      </div>

      {/* User Block */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-purple)] rounded-full flex items-center justify-center text-white text-sm font-medium">
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-textPrimary)] truncate">
              VPG User
            </p>
          </div>
          <button className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
