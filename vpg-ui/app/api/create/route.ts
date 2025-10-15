import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/services/api';

export async function POST(request: NextRequest) {
  try {

    // Parse the request body
    const { prompt, max_output_tokens, reasoning_effort } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    try {
      // Call the Python backend to generate persona
      const data = await backendApi.createPersona(
        prompt.trim(),
        max_output_tokens,
        reasoning_effort
      );

      // Return the generated persona without saving to database
      return NextResponse.json({
        message: 'Persona generated successfully',
        persona: data.persona
      });

    } catch (backendError) {
      console.error('Backend API error:', backendError);
      
      // Return error response without saving to database
      return NextResponse.json(
        { error: 'Failed to generate persona from backend' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
