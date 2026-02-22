import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
  }
  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }
  // Call Gemini API
  const prompt = `Summarize the following blog content in 2-3 sentences, suitable for SEO meta description.\nContent:\n${content}`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!geminiRes.ok) {
    return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
  }
  const geminiData = await geminiRes.json();
  let summary = '';
  try {
    summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {}
  return NextResponse.json({ summary });
} 