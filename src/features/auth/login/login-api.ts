// Client de l'API de connexion (US-011) — même motif exact que
// register-api.ts (US-009/US-010) : relais de même origine, union
// discriminée, aucune valeur journalisée/stockée en dehors de cet appel.
import { getCsrfToken } from '@/lib/csrf-client';

const REQUEST_TIMEOUT_MS = 90_000;

export interface LoggedInAccount {
  id: string;
  username: string;
}

export type LoginApiResult =
  | { kind: 'success'; user: LoggedInAccount }
  | { kind: 'field-error'; fieldErrors: { username?: string; password?: string } }
  | { kind: 'invalid-credentials' }
  | { kind: 'rate-limited' }
  | { kind: 'service-unavailable' }
  | { kind: 'unexpected' }
  // Délai dépassé ou requête perdue : on ne sait pas si la connexion a eu
  // lieu côté serveur — jamais confondu avec un échec certain.
  | { kind: 'unknown-result' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function callLoginApi(username: string, password: string): Promise<LoginApiResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() ?? '' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
      cache: 'no-store',
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    if (response.status === 200 && isRecord(body) && body.status === 'LOGGED_IN' && isRecord(body.user)) {
      const { id, username: returnedUsername } = body.user;
      if (typeof id === 'string' && typeof returnedUsername === 'string') {
        return { kind: 'success', user: { id, username: returnedUsername } };
      }
      return { kind: 'unexpected' };
    }

    if (isRecord(body) && typeof body.status === 'string') {
      switch (body.status) {
        case 'VALIDATION_ERROR': {
          const rawFieldErrors = isRecord(body.fieldErrors) ? body.fieldErrors : {};
          return {
            kind: 'field-error',
            fieldErrors: {
              username: typeof rawFieldErrors.username === 'string' ? rawFieldErrors.username : undefined,
              password: typeof rawFieldErrors.password === 'string' ? rawFieldErrors.password : undefined,
            },
          };
        }
        case 'INVALID_CREDENTIALS':
          return { kind: 'invalid-credentials' };
        case 'RATE_LIMITED':
          return { kind: 'rate-limited' };
        case 'SERVICE_UNAVAILABLE':
          return { kind: 'service-unavailable' };
        default:
          return { kind: 'unexpected' };
      }
    }

    return { kind: 'unexpected' };
  } catch {
    return { kind: 'unknown-result' };
  } finally {
    clearTimeout(timeoutId);
  }
}
