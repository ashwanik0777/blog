import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { ALL_PERMISSIONS, createAdminSessionToken, setAdminSessionCookie } from '@/lib/adminAuth';
import { badRequest, cleanString, limitRequest, normalizeEmail, readJsonBody, serverError } from '@/lib/security';
import { persistentLimit, persistentLimitByKey, persistentPeekByKey } from '@/lib/persistentRateLimit';

// Used to keep response times similar when the account does not exist.
const DUMMY_HASH = '$2b$12$9FGGAz6ZavRc6Q6K7D3yX.dWwsJcFcexinlR..g4KqYimHm3uIc3q';

function safeEqual(a: string, b: string) {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}

const invalidCredentials = () => NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

const FAILED_ATTEMPTS_PER_ACCOUNT = 10;
const ACCOUNT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    // Fast in-memory check first, then the limit shared by all server instances.
    const limited =
      limitRequest(req, 'signin', 5, 15 * 60 * 1000) || (await persistentLimit(req, 'signin', 5, 15 * 60 * 1000));
    if (limited) return limited;

    const body = await readJsonBody(req, 4 * 1024);
    if (!body) return badRequest();

    const email = normalizeEmail(body.email);
    const password = cleanString(body.password, 200);
    if (!email || !password) {
      return badRequest('Email and password are required');
    }

    // Failed attempts are counted per account (not per IP), so rotating IPs does not help an attacker.
    const accountKey = `signin-failed:${email}`;
    const blocked = await persistentPeekByKey(accountKey, FAILED_ATTEMPTS_PER_ACCOUNT);
    if (blocked) return blocked;
    const failed = async () => {
      await persistentLimitByKey(accountKey, FAILED_ATTEMPTS_PER_ACCOUNT, ACCOUNT_WINDOW_MS);
      return invalidCredentials();
    };

    await dbConnect();

    let staffUser = await User.findOne({
      email,
      role: { $in: ['admin', 'sub-admin', 'editor'] },
    }).select('_id name email password role permissions disabled');

    if (staffUser) {
      const isValid = await bcrypt.compare(password, staffUser.password || DUMMY_HASH);
      if (!isValid || !staffUser.password) return failed();
      if (staffUser.disabled) {
        return NextResponse.json({ error: 'This account has been disabled' }, { status: 403 });
      }
    } else {
      await bcrypt.compare(password, DUMMY_HASH);

      // First-run bootstrap: only allowed while no admin exists in the database.
      const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
      const adminPassword = process.env.ADMIN_PASSWORD || '';
      const canBootstrap =
        adminEmail &&
        adminPassword.length >= 8 &&
        email === adminEmail &&
        safeEqual(password, adminPassword) &&
        (await User.countDocuments({ role: 'admin' })) === 0;

      if (!canBootstrap) return failed();

      staffUser = await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        role: 'admin',
        permissions: [...ALL_PERMISSIONS],
        emailVerified: new Date(),
        disabled: false,
      });
    }

    const token = createAdminSessionToken({
      id: String(staffUser._id),
      email: staffUser.email,
      name: staffUser.name,
      role: staffUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: String(staffUser._id),
        email: staffUser.email,
        name: staffUser.name,
        role: staffUser.role,
        permissions: staffUser.permissions || [],
      },
    });

    setAdminSessionCookie(response, token);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return serverError('Signin error', error);
  }
}
