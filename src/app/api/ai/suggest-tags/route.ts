import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }
  // Call Gemini API
  const prompt = `Suggest 5 relevant tags and 2-3 categories for the following blog content. Return JSON: { tags: string[], categories: string[] }\nContent:\n${content}`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!geminiRes.ok) {
    return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
  }
  const geminiData = await geminiRes.json();
  let result = { tags: [], categories: [] };
  try {
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    result = JSON.parse(text);
  } catch {
    // fallback: try to extract tags/categories from plain text
  }
  return NextResponse.json(result);
} 