import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { extractJson, geminiGenerateText } from '@/lib/gemini';

export async function POST(req: Request) {
  const { errorResponse } = requirePermission(req, 'ai_content_generation');
  if (errorResponse) {
    return errorResponse;
  }
  const { title, keywords } = await req.json();
  if (!title && !keywords) {
    return NextResponse.json({ error: 'Missing title or keywords' }, { status: 400 });
  }

  const prompt = `You are a professional technical blog writer.
Write original, non-plagiarized content. Do not copy from sources. Do not use quotes longer than 20 words.
Avoid brand names unless they are strictly necessary for clarity.
If you use external facts, include citations in a References section and in a references array.
Return ONLY valid JSON (no markdown fences, no extra text).

Input:
Title: ${title}
Keywords: ${keywords || ''}

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
    const result = extractJson(
      text,
      {
        content: text || '',
        summary: '',
        tags: [],
        categories: [],
        keywords: [],
        seoTitle: '',
        seoDescription: '',
        readingTime: 1,
        references: [],
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gemini API error' }, { status: 500 });
  }
} 