import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { extractJson, geminiGenerateText } from '@/lib/gemini';
import { badRequest, cleanString, limitRequest, readJsonBody, serverError } from '@/lib/security';

export async function POST(req: Request) {
  const { user, errorResponse } = await requirePermission(req, 'ai_content_generation');
  if (errorResponse || !user) return errorResponse;

  const limited = limitRequest(req, 'ai-generate', 15, 10 * 60 * 1000, user.id);
  if (limited) return limited;

  const body = await readJsonBody(req, 16 * 1024);
  const title = cleanString(body?.title, 200);
  const keywords = cleanString(body?.keywords, 500);
  if (!title && !keywords) {
    return badRequest('Missing title or keywords');
  }

  const prompt = `You are a professional technical blog writer.
Write original, non-plagiarized content. Do not copy from sources. Do not use quotes longer than 20 words.
Avoid brand names unless they are strictly necessary for clarity.
If you use external facts, include citations in a References section and in a references array.
Return ONLY valid JSON (no markdown fences, no extra text).

Input:
Title: ${title}
Keywords: ${keywords}

Output JSON schema:
{
  "content": "markdown string with headings, lists, and a ## References section (if any)",
  "summary": "2-3 sentence summary",
  "tags": ["tag1", "tag2"],
  "categories": ["category1", "category2"],
  "keywords": ["keyword1", "keyword2"],
  "seoTitle": "50-60 chars",
  "seoDescription": "150-160 chars",
  "readingTime": 1,
  "references": [{"title": "Source title", "url": "https://example.com"}]
}
`;

  try {
    const text = await geminiGenerateText(prompt);
    const result = extractJson(text, {
      content: text || '',
      summary: '',
      tags: [],
      categories: [],
      keywords: [],
      seoTitle: '',
      seoDescription: '',
      readingTime: 1,
      references: [],
    });

    return NextResponse.json(result);
  } catch (error) {
    return serverError('Generate blog error', error, 'AI service is temporarily unavailable');
  }
}
