import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Get system message if exists
    const systemMessage = messages.find((m: any) => m.role === 'system');
    const systemPrompt = systemMessage 
      ? systemMessage.content 
      : 'You are a helpful AI assistant for TechUpdatesZone Blog. Help users with questions about tech, programming, and blog content. Be concise and friendly.';

    // Filter out system messages and format for Gemini
    const conversationMessages = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    // Build the prompt with system instruction and conversation
    const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationMessages.map((m: any) => {
      return `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.parts[0].text}`;
    }).join('\n')}\n\nAssistant:`;

    // Format for Gemini API
    const geminiPayload = {
      contents: [{
        parts: [{ text: fullPrompt }]
      }]
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      }
    );

    if (!geminiRes.ok) {
      const errorData = await geminiRes.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ 
        error: errorData.error?.message || 'Gemini API error',
        details: errorData 
      }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    
    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
