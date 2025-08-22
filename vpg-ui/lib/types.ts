export type Persona = {
    id: string;
    owner_id?: string;
    name: string;
    description?: string | null;
    schema?: Record<string, unknown> | null;
    created_at?: string;
    updated_at?: string;
    isDemo?: boolean; // For in-memory demo personas
  };

  // Helper type for creating new personas
  export type NewPersona = Omit<Persona, 'id' | 'owner_id' | 'created_at' | 'updated_at'>;
  
  export type Message = {
    id: string;
    persona_id: string;
    user_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
  };
  