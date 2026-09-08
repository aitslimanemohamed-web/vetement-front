import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/csrf-constants';
import { getSessionUser } from '@/lib/server/session';

// Relais same-origin de "qui suis-je" (US-010) : lit le cookie HttpOnly
// posé par /api/auth/register (ou plus tard une page de connexion), le
// traduit en en-tête Authorization pour l'appel serveur-à-serveur vers
// NestJS — jamais l'inverse. Utilisé côté client (Header, LogoutButton,
// SessionWatcher) ; les pages rendues côté serveur appellent
// getSessionUser() directement, sans repasser par cette route (voir
// src/lib/server/session.ts).
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const result = await getSessionUser(token);

  const headers = { 'Cache-Control': 'no-store' } as const;

  if (result.kind === 'ok') {
    return NextResponse.json({ status: 'OK', user: result.user }, { headers });
  }
  if (result.kind === 'unauthenticated') {
    return NextResponse.json({ status: 'UNAUTHENTICATED' }, { status: 401, headers });
  }
  return NextResponse.json({ status: 'SERVICE_UNAVAILABLE' }, { status: 503, headers });
}
