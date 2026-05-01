import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { geminiGenerateText } from '@/lib/gemini';

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
  }
  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }
  const prompt = `Summarize the following blog content in 2-3 sentences, suitable for SEO meta description.\nContent:\n${content}`;
  try {
    const summary = await geminiGenerateText(prompt);
    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gemini API error' }, { status: 500 });
  }
} 