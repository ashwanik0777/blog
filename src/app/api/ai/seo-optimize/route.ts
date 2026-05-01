import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { extractJson, geminiGenerateText } from '@/lib/gemini';

export async function POST(req: Request) {
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) {
    return errorResponse;
  }

  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
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
        'Ensure content is at least 1000 words for better SEO'
      ]
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SEO optimization error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to optimize SEO' }, { status: 500 });
  }
}

