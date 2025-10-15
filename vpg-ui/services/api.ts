const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PersonaResponse {
  persona: any;
}

interface ConversationStartResponse {
  persona: any;
  opening_line: string;
}

interface ConversationResponse {
  response: string;
}

interface ConversationMessage {
  role: string;
  content: string;
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const backendApi = {
  async createPersona(
    description: string,
    max_output_tokens?: number,
    reasoning_effort?: string
  ): Promise<PersonaResponse> {
    return apiCall<PersonaResponse>('/persona/generate', {
      method: 'POST',
      body: JSON.stringify({
        description,
        max_output_tokens,
        reasoning_effort,
      }),
    });
  },

  async startConversation(
    description: string,
    context?: string,
    max_output_tokens?: number,
    reasoning_effort?: string
  ): Promise<ConversationStartResponse> {
    return apiCall<ConversationStartResponse>('/conversation/start', {
      method: 'POST',
      body: JSON.stringify({
        description,
        context,
        max_output_tokens,
        reasoning_effort,
      }),
    });
  },

  async respondConversation(
    persona: any,
    conversation_history: ConversationMessage[],
    context?: string,
    max_output_tokens?: number
  ): Promise<ConversationResponse> {
    return apiCall<ConversationResponse>('/conversation/respond', {
      method: 'POST',
      body: JSON.stringify({
        persona,
        conversation_history,
        context,
        max_output_tokens,
      }),
    });
  },

  async healthCheck(): Promise<{ status: string }> {
    return apiCall<{ status: string }>('/health', {
      method: 'GET',
    });
  },
};
