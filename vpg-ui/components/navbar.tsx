"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we're on the home route
  const isAppRoute = pathname === "/";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  // Initialize search query from URL params
  useEffect(() => {
    if (isAppRoute) {
      const query = searchParams.get("q") || "";
      setSearchQuery(query);
    }
  }, [searchParams, isAppRoute]);

  // Update URL when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (!isAppRoute) return;

    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <header className="border-b border-gray-700 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left - Brand */}
        <Link href="/" className="text-white font-bold text-xl hover:text-purple-300 transition-colors">
          VPG
        </Link>

        {/* Center - Search (only on /app route) */}
        {isAppRoute && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search personas..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <svg 
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" 
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
        )}

        {/* Right - Auth */}
        <nav className="flex items-center gap-3">
          {email ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm hidden sm:block">
                {email}
              </span>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 px-3 py-1.5 rounded-lg transition-colors text-sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  location.href = "/login";
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium" 
              href="/login"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
