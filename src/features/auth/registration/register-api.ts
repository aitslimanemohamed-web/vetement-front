// Client de l'API d'inscription (US-009, adapté en US-010). Appelle
// désormais une route de même origine (`/api/auth/register`, servie par
// Next.js) plutôt que directement l'API NestJS cross-origin : ce relais pose
// le cookie de session HttpOnly sur le domaine du site — voir
// src/app/api/auth/register/route.ts et CONTEXTE_PROJET.md. Aucune valeur
// n'est jamais journalisée, stockée (URL, cookie non-HttpOnly mis à part
// pour le jeton CSRF, localStorage/sessionStorage) ni envoyée ailleurs qu'à
// cette route, une seule fois par appel — pas de tentative automatique.
import { getCsrfToken } from '@/lib/csrf-client';

const REQUEST_TIMEOUT_MS = 90_000;

export interface RegisteredAccount {
  id: string;
  username: string;
  createdAt: string;
}

export type RegisterApiResult =
  | { kind: 'success'; user: RegisteredAccount }
  | { kind: 'field-error'; fieldErrors: { username?: string; password?: string } }
  | { kind: 'username-taken' }
  | { kind: 'password-too-common' }
  | { kind: 'rate-limited' }
  | { kind: 'service-unavailable' }
  | { kind: 'unexpected' }
  // Délai dépassé ou requête perdue : on ne sait pas si la création a eu
  // lieu côté serveur (US-009, section 12) — à distinguer d'une réponse
  // d'erreur explicite, qui, elle, est une réponse définitive.
  | { kind: 'unknown-result' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function callRegisterApi(username: string, password: string): Promise<RegisterApiResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/auth/register', {
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

    if (response.status === 201 && isRecord(body) && body.status === 'ACCOUNT_CREATED' && isRecord(body.user)) {
      const { id, username: returnedUsername, createdAt } = body.user;
      if (typeof id === 'string' && typeof returnedUsername === 'string' && typeof createdAt === 'string') {
        return { kind: 'success', user: { id, username: returnedUsername, createdAt } };
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
        case 'USERNAME_TAKEN':
          return { kind: 'username-taken' };
        case 'PASSWORD_TOO_COMMON':
          return { kind: 'password-too-common' };
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
