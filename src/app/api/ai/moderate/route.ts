import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { moderateText } from '@/lib/gemini';
import { badRequest, limitRequest, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  const { user, errorResponse } = await requirePermission(req, 'ai_content_generation');
  if (errorResponse || !user) return errorResponse;

  const limited = limitRequest(req, 'ai', 40, 10 * 60 * 1000, user.id);
  if (limited) return limited;

  const body = await readJsonBody(req, 512 * 1024);
  const content = typeof body?.content === 'string' ? body.content : '';
  if (!content.trim()) return badRequest('Missing content');

  try {
    return NextResponse.json(await moderateText(content));
  } catch (error) {
    return serverError('Moderation error', error, 'AI service is temporarily unavailable');
  }
}
