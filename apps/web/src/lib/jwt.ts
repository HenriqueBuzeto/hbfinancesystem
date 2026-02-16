/**
 * JWT short-lived + refresh token (helpers para API de auth).
 * Em produção use cookies httpOnly para refresh.
 */
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-dev-secret-min-32-chars-change-me'
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'fallback-refresh-secret-change-me'
);

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

export type TokenPayload = {
  sub: string; // userId
  email: string;
  tenantId: string;
  role: string;
  type: 'access' | 'refresh';
};

export async function signAccessToken(payload: Omit<TokenPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: Omit<TokenPayload, 'type'>): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'access') return null;
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') return null;
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
