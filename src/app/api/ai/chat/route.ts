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

    // Try different model names and API versions (fallback approach)
    const modelsToTry = [
      { model: 'gemini-pro', version: 'v1beta' }, // Original model
      { model: 'gemini-1.5-pro-latest', version: 'v1beta' },
      { model: 'gemini-1.5-flash-latest', version: 'v1beta' },
      { model: 'gemini-1.5-pro', version: 'v1beta' },
      { model: 'gemini-1.5-flash', version: 'v1beta' },
    ];

    let lastError: any = null;

    for (const { model, version } of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
          return NextResponse.json({ content: text });
        } else {
          const errorData = await geminiRes.json().catch(() => ({}));
          lastError = errorData;
          // Continue to next model if this one fails
          continue;
        }
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }

    // If all models failed, return error
    console.error('All Gemini models failed. Last error:', lastError);
    return NextResponse.json({ 
      error: lastError?.error?.message || 'Gemini API error: No available models',
      details: lastError 
    }, { status: 500 });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
