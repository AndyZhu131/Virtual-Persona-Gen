"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import JsonEditor from "@/components/json-editor";
import type { Persona } from "@/lib/types";
import { validateSchemaJson } from "@/lib/validators";

export default function PersonaEditPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState("{}");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("personas").select("*").eq("id", params.id).single();
      if (data) {
        setPersona(data as Persona);
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setSchema(JSON.stringify(data.schema ?? {}, null, 2));
      }
    })();
  }, [params.id, supabase]);

  if (!persona) return <div className="p-6">Loading…</div>;

  const onSave = async () => {
    const parsed = validateSchemaJson(schema);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setError(null);
    const { error } = await supabase
      .from("personas")
      .update({ name, description, schema: parsed.value, updated_at: new Date().toISOString() })
      .eq("id", persona.id);
    if (error) return alert(error.message);

    await supabase.from("persona_versions").insert({
      persona_id: persona.id,
      schema: parsed.value,
      note: "manual edit",
      created_by: (await supabase.auth.getUser()).data.user?.id
    } as any);

    alert("Saved.");
  };

  return (
    <div className="space-y-3 max-w-3xl">
      <h1 className="text-xl font-semibold">Edit Persona</h1>
      <input
        className="w-full border rounded p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <textarea
        className="w-full border rounded p-2"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
      />
      <JsonEditor value={schema} onChange={setSchema} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={onSave} className="rounded bg-black text-white px-4 py-2">
        Save
      </button>
    </div>
  );
}
