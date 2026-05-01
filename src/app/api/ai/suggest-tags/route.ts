import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { extractJson, geminiGenerateText } from '@/lib/gemini';

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
  }
  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }
  const prompt = `Suggest 5-8 relevant tags and 2-3 categories for the following blog content.\nReturn ONLY valid JSON: { \"tags\": string[], \"categories\": string[] }.\nContent:\n${content}`;
  try {
    const text = await geminiGenerateText(prompt);
    const result = extractJson(text, { tags: [], categories: [] });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gemini API error' }, { status: 500 });
  }
} 