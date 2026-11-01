import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { requirePermission } from '@/lib/adminAuth';
import { badRequest, cleanString, limitRequest, normalizeEmail, readJsonBody, serverError } from '@/lib/security';

const STATUSES = ['pending', 'resolved', 'closed'];

export async function POST(req: Request) {
  try {
    const limited = limitRequest(req, 'issue', 3, 15 * 60 * 1000);
    if (limited) return limited;

    const body = await readJsonBody(req, 16 * 1024);
    if (!body) return badRequest();

    if (cleanString(body.website, 200)) {
      return NextResponse.json({ success: true, message: 'Issue reported successfully' });
    }

    const name = cleanString(body.name, 80);
    const email = normalizeEmail(body.email);
    const subject = cleanString(body.subject, 150);
    const message = cleanString(body.message, 5000);

    if (!name || !subject || message.length < 10) {
      return badRequest('Please fill in all fields (message needs at least 10 characters)');
    }
    if (!email) return badRequest('Please enter a valid email address');

    await dbConnect();
    const issue = await Issue.create({ name, email, subject, message, status: 'pending' });

    return NextResponse.json({
      success: true,
      message: 'Issue reported successfully',
      issueId: issue._id,
    });
  } catch (error) {
    return serverError('Issue creation error', error, 'Failed to submit issue');
  }
}

export async function GET(req: Request) {
  try {
    const { errorResponse } = await requirePermission(req, 'manage_issues');
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const query = status && STATUSES.includes(status) ? { status } : {};

    await dbConnect();
    const issues = await Issue.find(query)
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({ issues }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return serverError('Issues fetch error', error, 'Failed to fetch issues');
  }
}
