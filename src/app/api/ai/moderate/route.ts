import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { extractJson, geminiGenerateText } from '@/lib/gemini';

export async function POST(req: Request) {
  const { errorResponse } = requirePermission(req, 'ai_content_generation');
  if (errorResponse) {
    return errorResponse;
  }
  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }
  const prompt = `Moderate the following blog content. Return ONLY valid JSON: { "verdict": "safe"|"flagged"|"needs review", "reason": string }.\nContent:\n${content}`;
  try {
    const text = await geminiGenerateText(prompt);
    const result = extractJson(text, { verdict: 'safe', reason: '' });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gemini API error' }, { status: 500 });
  }
} 