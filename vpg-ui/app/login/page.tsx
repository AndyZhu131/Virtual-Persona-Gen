"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? `${location.origin}/app` : undefined }
    });
    if (error) alert(error.message);
    else setSent(true);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          className="w-full border rounded p-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full rounded bg-black text-white py-2">Send Magic Link</button>
        {sent && <p className="text-sm mt-2">Check your inbox for the login link.</p>}
      </form>
    </div>
  );
}
