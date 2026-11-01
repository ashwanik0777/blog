import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isObjectId } from '@/lib/security';

export type StaffRole = 'admin' | 'sub-admin' | 'editor';
export type AdminSessionUser = {
  id: string;
  email: string;
  name?: string;
  role: StaffRole;
  permissions?: string[];
};

export const ALL_PERMISSIONS = [
  'manage_blogs',
  'manage_users',
  'manage_newsletter',
  'view_analytics',
  'ai_content_generation',
  'manage_settings',
  'manage_issues',
] as const;

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_JWT_SECRET must be set in production');
  }
  return 'dev-only-insecure-secret-change-me';
}

export function sanitizePermissions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return ALL_PERMISSIONS.filter((permission) => value.includes(permission));
}

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string, string>;

  return cookieHeader.split(';').reduce((acc, cookiePart) => {
    const [key, ...valueParts] = cookiePart.trim().split('=');
    if (!key) return acc;
    try {
      acc[key] = decodeURIComponent(valueParts.join('='));
    } catch {
      // Ignore malformed cookie values.
    }
    return acc;
  }, {} as Record<string, string>);
}

export function createAdminSessionToken(user: AdminSessionUser) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    getJwtSecret(),
    { algorithm: 'HS256', expiresIn: SESSION_MAX_AGE_SECONDS }
  );
}

/** Decodes the session cookie only — use the async helpers below for authorization. */
export function getAdminSessionFromRequest(req: Request): AdminSessionUser | null {
  try {
    const cookies = parseCookies(req.headers.get('cookie'));
    const token = cookies[ADMIN_SESSION_COOKIE];
    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as JwtPayload & AdminSessionUser;
    if (!decoded || !decoded.role || !isObjectId(decoded.id)) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Verifies the session token AND re-reads the user from the database, so
 * disabled / deleted staff and permission changes take effect immediately.
 */
export async function getVerifiedStaff(req: Request): Promise<AdminSessionUser | null> {
  const session = getAdminSessionFromRequest(req);
  if (!session) return null;

  await dbConnect();
  const user = await User.findById(session.id).select('name email role permissions disabled').lean<{
    _id: unknown;
    name?: string;
    email: string;
    role: StaffRole;
    permissions?: string[];
    disabled?: boolean;
  }>();

  if (!user || user.disabled || !['admin', 'sub-admin', 'editor'].includes(user.role)) return null;

  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.role === 'admin' ? [...ALL_PERMISSIONS] : sanitizePermissions(user.permissions),
  };
}

export async function requireAdmin(req: Request) {
  const user = await getVerifiedStaff(req);

  if (!user || user.role !== 'admin') {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Admin access required' }, { status: user ? 403 : 401 }),
    };
  }

  return { user, errorResponse: null };
}

export async function requireStaff(req: Request) {
  const user = await getVerifiedStaff(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Staff access required' }, { status: 401 }),
    };
  }

  return { user, errorResponse: null };
}

export async function requirePermission(req: Request, permissions: string | string[]) {
  const { user, errorResponse } = await requireStaff(req);
  if (errorResponse || !user) {
    return { user: null, errorResponse: errorResponse! };
  }

  if (user.role === 'admin') {
    return { user, errorResponse: null };
  }

  const required = Array.isArray(permissions) ? permissions : [permissions];
  const userPermissions = user.permissions || [];
  const hasAccess = required.every((permission) => userPermissions.includes(permission));

  if (!hasAccess) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }),
    };
  }

  return { user, errorResponse: null };
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });
}
