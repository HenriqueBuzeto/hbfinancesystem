/**
 * Helper: extrai e valida JWT do header Authorization (Bearer).
 * Uso em rotas protegidas (transações, etc.).
 */
import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt';

export async function getAuthFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  return verifyAccessToken(token);
}
