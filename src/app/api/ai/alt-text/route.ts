import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { geminiGenerateText } from '@/lib/gemini';
import { badRequest, cleanString, limitRequest, readJsonBody, safeHttpUrl, serverError } from '@/lib/security';

export async function POST(req: Request) {
  const { user, errorResponse } = await requirePermission(req, 'ai_content_generation');
  if (errorResponse || !user) return errorResponse;

  const limited = limitRequest(req, 'ai', 40, 10 * 60 * 1000, user.id);
  if (limited) return limited;

  const body = await readJsonBody(req, 16 * 1024);
  const imageUrl = safeHttpUrl(body?.imageUrl);
  const context = cleanString(body?.context, 500);
  if (!imageUrl) return badRequest('Missing imageUrl');

  try {
    const prompt = `Describe the following image in a concise, SEO-friendly alt text for a blog (max 125 characters).
${context ? `Context: ${context}\n` : ''}Image URL: ${imageUrl}`;
    const alt = await geminiGenerateText(prompt);
    return NextResponse.json({ altText: alt.trim().slice(0, 200) });
  } catch (error) {
    return serverError('Alt text error', error, 'AI service is temporarily unavailable');
  }
}
