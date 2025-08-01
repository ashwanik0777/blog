import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
  }
  // Format for Gemini API
  const geminiMessages = messages.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] }));
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: geminiMessages }),
  });
  if (!geminiRes.ok) {
    return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
  }
  const geminiData = await geminiRes.json();
  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return NextResponse.json({ content: text });
} 