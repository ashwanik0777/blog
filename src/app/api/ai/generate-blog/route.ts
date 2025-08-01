import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, keywords } = await req.json();
  if (!title && !keywords) {
    return NextResponse.json({ error: 'Missing title or keywords' }, { status: 400 });
  }
  // Call Gemini API
  const prompt = `Generate a detailed, SEO-optimized blog post.\nTitle: ${title}\nKeywords: ${keywords || ''}\nReturn JSON with fields: content (markdown), summary, tags (array), categories (array).`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!geminiRes.ok) {
    return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
  }
  const geminiData = await geminiRes.json();
  // Parse Gemini response (assume markdown in text)
  let result = { content: '', summary: '', tags: [], categories: [] };
  try {
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    result = JSON.parse(text);
  } catch {
    result.content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return NextResponse.json(result);
} 