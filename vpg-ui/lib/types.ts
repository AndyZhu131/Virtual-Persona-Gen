export type Persona = {
    id: string;
    owner_id?: string;
    name: string;
    description?: string | null;
    schema?: Record<string, unknown> | null;
    created_at?: string;
    updated_at?: string;
  };
  
  export type Message = {
    id: string;
    persona_id: string;
    user_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
  };
  