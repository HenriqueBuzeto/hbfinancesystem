/**
 * Cliente Auth0 para Next.js (SDK v4).
 * Só é criado quando AUTH0_* e APP_BASE_URL estão definidos e válidos (evita "Invalid URL" no middleware).
 * Rotas: /api/auth0/login, callback, logout, me.
 */
import { Auth0Client } from '@auth0/nextjs-auth0/server';

function isAuth0EnvValid(): boolean {
  const base = process.env.APP_BASE_URL;
  if (!base || typeof base !== 'string' || base.trim() === '') return false;
  try {
    new URL(base);
  } catch {
    return false;
  }
  return !!(
    process.env.AUTH0_DOMAIN?.trim() &&
    process.env.AUTH0_CLIENT_ID?.trim() &&
    process.env.AUTH0_SECRET?.trim()
  );
}

let client: Auth0Client | null = null;

function getAuth0(): Auth0Client | null {
  if (client) return client;
  if (!isAuth0EnvValid()) return null;
  client = new Auth0Client({
    routes: {
      login: '/api/auth0/login',
      callback: '/api/auth0/callback',
      logout: '/api/auth0/logout',
    },
  });
  return client;
}

export { getAuth0 };
