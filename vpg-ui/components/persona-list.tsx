import type { Persona } from "@/lib/types";
import { useState } from "react";
import { useTheme } from "@/lib/theme-context";

// Helper component for avatar placeholders
function AvatarPlaceholder({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Helper component for navigation items
function NavItem({ 
  icon, 
  label, 
  isActive = false, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  isActive?: boolean; 
  onClick?: () => void;
}) {
  const { colors } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? `${colors.bg.secondary} ${colors.text.primary}` 
          : `${colors.text.muted} hover:${colors.bg.secondary} hover:${colors.text.primary}`
      }`}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface PersonaListProps {
  items: Persona[];
  onSelect: (p: Persona) => void;
  onCreate?: () => void;
  onSearch?: (query: string) => void;
}

export default function PersonaList({
  items,
  onSelect,
  onCreate,
  onSearch
}: PersonaListProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail] = useState("guest@example.com"); // This would come from your auth context

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Filter personas based on search
  const filteredItems = items.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Static avatar items for "This Month" section
  const staticAvatars = [
    { name: "Detective Stefano", description: "Mystery solver" },
    { name: "Susan B Anthony", description: "Historical figure" },
    { name: "The Crown Prince", description: "Royal advisor" },
    { name: "Tech Guru", description: "AI expert" }
  ];

  return (
    <div className={`w-80 ${colors.bg.primary} border-r ${colors.border.primary} h-screen flex flex-col fixed left-0 top-0 z-10`}>
      {/* Header with Logo and Collapse */}
      <div className={`p-4 border-b ${colors.border.primary}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={`${colors.text.primary} font-bold text-lg`}>vpg.ai</h1>
          <button className={`${colors.text.muted} hover:${colors.text.primary} transition-colors`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Create Button */}
        <button 
          onClick={onCreate}
          disabled={!onCreate}
          className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            onCreate 
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white cursor-pointer" 
              : `${colors.bg.secondary} ${colors.text.muted} cursor-not-allowed`
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        <NavItem 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>}
          label="Discover"
          isActive={true}
        />
        <NavItem 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>}
          label="AvatarFX"
          isActive={false}
        />
      </div>

      {/* Search Input */}
      <div className="px-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Q Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`w-full ${colors.bg.secondary} border ${colors.border.primary} rounded-lg px-4 py-2 pl-10 ${colors.text.primary} ${colors.text.muted} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          />
          <svg className={`absolute left-3 top-2.5 w-4 h-4 ${colors.text.muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* This Month Section */}
      <div className="px-4 mb-4">
        <h3 className={`${colors.text.muted} font-semibold text-sm mb-3`}>This Month</h3>
        <div className="space-y-3">
          {staticAvatars.map((avatar, index) => (
            <div key={index} className={`flex items-center gap-3 p-2 rounded-lg hover:${colors.bg.secondary} transition-colors cursor-pointer`}>
              <AvatarPlaceholder name={avatar.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className={`${colors.text.primary} text-sm font-medium truncate`}>{avatar.name}</p>
                <p className={`${colors.text.muted} text-xs truncate`}>{avatar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personas List */}
      <div className="flex-1 px-4 overflow-y-auto">
        <h3 className={`${colors.text.muted} font-semibold text-sm mb-3`}>Your Personas</h3>
        <div className="space-y-1">
          {filteredItems.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${colors.text.muted} hover:${colors.bg.secondary} hover:${colors.text.primary}`}
            >
              <div className="flex items-center gap-3">
                <AvatarPlaceholder name={p.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  {p.description && (
                    <p className="text-xs opacity-70 truncate">{p.description}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className={`text-center py-8 ${colors.text.muted}`}>
              <p className="text-sm">No personas found</p>
              {searchQuery && <p className="text-xs mt-1">Try adjusting your search</p>}
            </div>
          )}
        </div>
      </div>

      {/* User Block */}
      <div className={`p-4 border-t ${colors.border.primary}`}>
        <div className={`${colors.bg.secondary} rounded-lg p-3`}>
          <div className="flex items-center gap-3 mb-2">
            <AvatarPlaceholder name={userEmail} size="md" />
            <div className="flex-1 min-w-0">
              <p className={`${colors.text.primary} text-sm font-medium truncate`}>
                {userEmail === "guest@example.com" ? "Guest" : userEmail}
              </p>
              <p className={`${colors.text.muted} text-xs`}>User</p>
            </div>
            <button className={`${colors.text.muted} hover:${colors.text.primary} transition-colors`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button className={`w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 ${colors.text.primary} text-sm font-medium py-2 px-3 rounded-md transition-all duration-200`}>
            Upgrade to VPG+
          </button>
        </div>
      </div>
    </div>
  );
}
