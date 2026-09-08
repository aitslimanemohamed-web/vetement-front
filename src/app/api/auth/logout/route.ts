import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, SESSION_COOKIE_NAME } from '@/lib/csrf-constants';
import { csrfTokensMatch, isSameOrigin } from '@/lib/csrf';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

// Relais same-origin de la déconnexion (US-010). Révoque réellement la
// session côté NestJS (best-effort si le back est injoignable), puis efface
// toujours le cookie du navigateur — la déconnexion locale ne doit jamais
// échouer du point de vue de l'utilisateur.
export async function POST(request: NextRequest) {
  const csrfOk =
    isSameOrigin(request.headers.get('origin'), request.headers.get('referer'), request.nextUrl.origin) &&
    csrfTokensMatch(request.cookies.get(CSRF_COOKIE_NAME)?.value, request.headers.get(CSRF_HEADER_NAME));
  if (!csrfOk) {
    return NextResponse.json({ status: 'FORBIDDEN' }, { status: 403, headers: NO_STORE });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const apiUrl = process.env.INTERNAL_API_URL;

  if (token && apiUrl) {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
    } catch {
      // Back injoignable : le cookie local est quand même effacé ci-dessous
      // — la session serveur, elle, expirera naturellement (24h/2h,
      // US-010, section 5).
    }
  }

  const response = new NextResponse(null, { status: 204, headers: NO_STORE });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
