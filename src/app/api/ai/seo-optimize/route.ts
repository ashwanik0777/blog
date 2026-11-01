import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { extractJson, geminiGenerateText } from '@/lib/gemini';
import { badRequest, cleanString, limitRequest, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  const { user, errorResponse } = await requirePermission(req, 'ai_content_generation');
  if (errorResponse || !user) return errorResponse;

  const limited = limitRequest(req, 'ai', 40, 10 * 60 * 1000, user.id);
  if (limited) return limited;

  const body = await readJsonBody(req, 512 * 1024);
  const title = cleanString(body?.title, 200);
  const content = typeof body?.content === 'string' ? body.content.slice(0, 30_000) : '';
  if (!title || !content.trim()) {
    return badRequest('Missing title or content');
  }

  const prompt = `Analyze the following blog post for SEO optimization. Provide recommendations in JSON format: { recommendations: string[] }

Title: ${title}
Content: ${content}

Provide 5-7 specific SEO recommendations to improve search engine rankings.`;

  try {
    const text = await geminiGenerateText(prompt);
    const result = extractJson(text, {
      recommendations: [
        'Ensure title is between 50-60 characters',
        'Add relevant keywords naturally throughout content',
        'Include internal and external links',
        'Optimize meta description (150-160 characters)',
        'Use header tags (H1, H2, H3) properly',
        'Add alt text to all images',
        'Ensure content is at least 1000 words for better SEO',
      ],
    });

    return NextResponse.json(result);
  } catch (error) {
    return serverError('SEO optimization error', error, 'Failed to optimize SEO');
  }
}
