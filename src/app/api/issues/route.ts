import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Issue from '@/models/Issue';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const issue = await Issue.create({
      name,
      email,
      subject,
      message,
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Issue reported successfully',
      issueId: issue._id 
    });
  } catch (error: any) {
    console.error('Issue creation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to submit issue' 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url!);
    const status = url.searchParams.get('status');
    
    const query = status ? { status } : {};
    const issues = await Issue.find(query)
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ issues });
  } catch (error: any) {
    console.error('Issues fetch error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch issues' 
    }, { status: 500 });
  }
}

