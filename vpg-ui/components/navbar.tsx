"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [supabase]);

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/app" className="font-semibold">VPG</Link>
        <nav className="flex items-center gap-3">
          <Link href="/app" className="opacity-80 hover:opacity-100">App</Link>
          {email ? (
            <button
              className="border px-3 py-1 rounded"
              onClick={async () => {
                await supabase.auth.signOut();
                location.href = "/login";
              }}
            >
              Logout
            </button>
          ) : (
            <Link className="border px-3 py-1 rounded" href="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
