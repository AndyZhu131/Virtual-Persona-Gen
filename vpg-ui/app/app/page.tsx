"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PersonaList from "@/components/persona-list";
import ChatPanel from "@/components/chat-panel";
import type { Persona } from "@/lib/types";

export default function AppPage() {
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [current, setCurrent] = useState<Persona | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("personas")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setPersonas(data as Persona[]);
          setCurrent((data as Persona[])[0] ?? null);
        }
      });
  }, [supabase, userId]);

  if (!userId) return <div className="p-6">Please login.</div>;

  return (
    <div className="grid grid-cols-[260px_1fr] gap-4 min-h-[70vh]">
      <aside className="border rounded p-3 overflow-auto">
        <button
          className="w-full mb-3 border rounded py-2"
          onClick={async () => {
            const { data, error } = await supabase
              .from("personas")
              .insert({ name: "New Persona", description: "", schema: {} })
              .select()
              .single();
            if (!error && data) {
              setPersonas((p) => [data as Persona, ...p]);
              setCurrent(data as Persona);
            }
          }}
        >
          New Persona
        </button>
        <PersonaList items={personas} currentId={current?.id} onSelect={(p) => setCurrent(p)} />
      </aside>
      <section className="border rounded p-3">
        {current ? (
          <ChatPanel persona={current} />
        ) : (
          <div className="opacity-70">Select a persona from the left.</div>
        )}
      </section>
    </div>
  );
}
