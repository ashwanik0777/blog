import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  const prompt = `Analyze the following blog post for SEO optimization. Provide recommendations in JSON format: { recommendations: string[] }
  
Title: ${title}
Content: ${content}

Provide 5-7 specific SEO recommendations to improve search engine rankings.`;

  try {
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!geminiRes.ok) {
      return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    let result = { recommendations: [] };
    
    try {
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      result = JSON.parse(text);
    } catch {
      // Fallback: create basic recommendations
      result = {
        recommendations: [
          'Ensure title is between 50-60 characters',
          'Add relevant keywords naturally throughout content',
          'Include internal and external links',
          'Optimize meta description (150-160 characters)',
          'Use header tags (H1, H2, H3) properly',
          'Add alt text to all images',
          'Ensure content is at least 1000 words for better SEO'
        ]
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('SEO optimization error:', error);
    return NextResponse.json({ error: 'Failed to optimize SEO' }, { status: 500 });
  }
}

