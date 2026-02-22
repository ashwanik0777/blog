import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
  }
  const { title, keywords } = await req.json();
  if (!title && !keywords) {
    return NextResponse.json({ error: 'Missing title or keywords' }, { status: 400 });
  }

  // Get API key from environment or request
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' }, { status: 500 });
  }

  // Call Gemini API
  const prompt = `Generate a detailed, SEO-optimized blog post.\nTitle: ${title}\nKeywords: ${keywords || ''}\nReturn JSON with fields: content (markdown), summary, tags (array), categories (array).`;
  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
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