import { NextResponse, type NextRequest } from 'next/server';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, SESSION_COOKIE_NAME } from '@/lib/csrf-constants';
import { csrfTokensMatch, isSameOrigin } from '@/lib/csrf';

// Relais same-origin de l'inscription (US-010). Le navigateur n'appelle plus
// jamais directement l'API NestJS (cross-origin, cookie tiers bloqué sur
// Safari mobile) : il appelle cette route, qui relaie l'appel serveur-à-
// serveur, pose le cookie de session HttpOnly sur le domaine du site, et ne
// renvoie jamais le jeton brut au navigateur — voir
// CONTEXTE_PROJET.md, section "Architecture du relais".
const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: NextRequest) {
  const csrfOk =
    isSameOrigin(request.headers.get('origin'), request.headers.get('referer'), request.nextUrl.origin) &&
    csrfTokensMatch(request.cookies.get(CSRF_COOKIE_NAME)?.value, request.headers.get(CSRF_HEADER_NAME));
  if (!csrfOk) {
    return NextResponse.json({ status: 'FORBIDDEN' }, { status: 403, headers: NO_STORE });
  }

  const apiUrl = process.env.INTERNAL_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ status: 'SERVICE_UNAVAILABLE' }, { status: 503, headers: NO_STORE });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    requestBody = {};
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ status: 'SERVICE_UNAVAILABLE' }, { status: 503, headers: NO_STORE });
  }

  let backendBody: unknown;
  try {
    backendBody = await backendResponse.json();
  } catch {
    backendBody = undefined;
  }

  const isSuccess =
    backendResponse.status === 201 &&
    isRecord(backendBody) &&
    backendBody.status === 'ACCOUNT_CREATED' &&
    isRecord(backendBody.user) &&
    isRecord(backendBody.session) &&
    typeof backendBody.session.token === 'string' &&
    typeof backendBody.session.expiresAt === 'string';

  if (isSuccess && isRecord(backendBody) && isRecord(backendBody.session)) {
    const token = backendBody.session.token as string;
    const expiresAt = backendBody.session.expiresAt as string;
    const maxAgeSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

    // Le champ "session" (jeton compris) s'arrête ici : jamais réexposé au
    // navigateur, qui ne reçoit que le cookie HttpOnly.
    const response = NextResponse.json(
      { status: 'ACCOUNT_CREATED', user: backendBody.user },
      { status: 201, headers: NO_STORE },
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });
    return response;
  }

  // Passthrough transparent de tous les cas d'erreur existants (US-009,
  // contrat inchangé) : VALIDATION_ERROR, USERNAME_TAKEN,
  // PASSWORD_TOO_COMMON, RATE_LIMITED (avec Retry-After), SERVICE_UNAVAILABLE,
  // INTERNAL_ERROR.
  const headers: Record<string, string> = { ...NO_STORE };
  const retryAfter = backendResponse.headers.get('retry-after');
  if (retryAfter) headers['Retry-After'] = retryAfter;

  return NextResponse.json(backendBody ?? { status: 'INTERNAL_ERROR' }, { status: backendResponse.status, headers });
}
