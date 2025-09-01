"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function NewPersonaPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      
      setUserId(data.user.id);
      
      // Create a new persona immediately and navigate to edit
      const newPersona = {
        name: "New Persona",
        description: "",
        schema: {},
        owner_id: data.user.id
      };

      const { data: personaData, error } = await supabase
        .from("personas")
        .insert(newPersona)
        .select()
        .single();

      if (!error && personaData) {
        // Navigate to edit page for the new persona
        router.push(`/personas/${personaData.id}/edit`);
      } else {
        // If creation fails, go back to home
        console.error("Error creating persona:", error);
        router.push("/");
      }
    })();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--color-textSecondary)]">Creating your new persona...</p>
      </div>
    </div>
  );
}
