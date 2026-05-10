export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const aiBinding = (process.env as any).AI;
    if (!aiBinding) {
      return NextResponse.json({ error: "AI binding not configured" }, { status: 500 });
    }

    const { prompt } = await request.json();
    
    // Using meta/llama-3-8b-instruct or your preferred text generation model
    const response = await aiBinding.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are an expert instructional designer for medical and RCM education. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ]
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
