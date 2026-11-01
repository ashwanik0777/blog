import { NextResponse } from 'next/server';
import { createStaff, listStaff } from '@/lib/staffInput';

export async function GET(req: Request) {
  const { users, errorResponse } = await listStaff(req, true);
  if (errorResponse) return errorResponse;
  return NextResponse.json({ subAdmins: users }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  return createStaff(req);
}
