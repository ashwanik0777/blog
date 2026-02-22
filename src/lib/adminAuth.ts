import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export type AdminSessionUser = {
  id: string;
  email: string;
  name?: string;
  role: 'admin';
};

const ADMIN_SESSION_COOKIE = 'admin_session';
const DEFAULT_EXPIRY = '1d';

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'change-this-secret-in-production';
}

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string, string>;

  return cookieHeader.split(';').reduce((acc, cookiePart) => {
    const [key, ...valueParts] = cookiePart.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(valueParts.join('='));
    return acc;
  }, {} as Record<string, string>);
}

export function createAdminSessionToken(user: AdminSessionUser) {
  return jwt.sign(user, getJwtSecret(), { expiresIn: DEFAULT_EXPIRY });
}

export function getAdminSessionFromRequest(req: Request): AdminSessionUser | null {
  try {
    const cookies = parseCookies(req.headers.get('cookie'));
    const token = cookies[ADMIN_SESSION_COOKIE];
    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & AdminSessionUser;
    if (!decoded || decoded.role !== 'admin') return null;

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: 'admin',
    };
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request) {
  const user = getAdminSessionFromRequest(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Admin access required' }, { status: 401 }),
    };
  }

  return { user, errorResponse: null };
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 1, // 1 day expiry
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}
