import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  return NextResponse.json({ error: 'Registration is disabled' }, { status: 403 });
} 