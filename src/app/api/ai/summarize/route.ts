import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { geminiGenerateText } from '@/lib/gemini';
import { badRequest, limitRequest, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  const { user, errorResponse } = await requirePermission(req, 'ai_content_generation');
  if (errorResponse || !user) return errorResponse;

  const limited = limitRequest(req, 'ai', 40, 10 * 60 * 1000, user.id);
  if (limited) return limited;

  const body = await readJsonBody(req, 512 * 1024);
  const content = typeof body?.content === 'string' ? body.content.slice(0, 30_000) : '';
  if (!content.trim()) return badRequest('Missing content');

  const prompt = `Summarize the following blog content in 2-3 sentences, suitable for SEO meta description.\nContent:\n${content}`;
  try {
    const summary = await geminiGenerateText(prompt);
    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    return serverError('Summarize error', error, 'AI service is temporarily unavailable');
  }
}
