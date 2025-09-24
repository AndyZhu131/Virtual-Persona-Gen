import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // For now, create a basic persona structure
    // In a real implementation, you would call an AI service to generate the persona details
    const newPersona = {
      name: `Persona from: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
      description: prompt.trim(),
      schema: {
        personality: 'Generated from prompt',
        tone: 'Friendly',
        expertise: ['General'],
        style: 'Conversational',
        generated_from_prompt: true,
        original_prompt: prompt.trim()
      },
      owner_id: user.id
    };

    // Insert the new persona into the database
    const { data, error: insertError } = await supabase
      .from('personas')
      .insert(newPersona)
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      message: 'Persona created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
