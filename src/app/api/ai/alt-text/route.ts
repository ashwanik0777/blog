import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { imageUrl, context } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
  }
  // Call Gemini API
  const prompt = `Describe the following image in a concise, SEO-friendly alt text for a blog (max 125 characters).
${context ? `Context: ${context}\n` : ''}Image URL: ${imageUrl}`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!geminiRes.ok) {
    return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
  }
  const geminiData = await geminiRes.json();
  let alt = '';
  try {
    alt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {}
  return NextResponse.json({ altText: alt });
} 