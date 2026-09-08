// Client des routes relais /api/auth/{me,logout} (US-010), même motif que
// register-api.ts : union discriminée, jamais de secret journalisé ou
// stocké, un délai réseau ou une panne ne sont jamais confondus avec un état
// "déconnecté" (kind 'unknown', distinct de 'unauthenticated').
import { getCsrfToken } from '@/lib/csrf-client';

export interface SessionUser {
  id: string;
  username: string;
}

export type MeApiResult =
  | { kind: 'ok'; user: SessionUser }
  | { kind: 'unauthenticated' }
  | { kind: 'unknown' };

export type LogoutApiResult = { kind: 'ok' } | { kind: 'unknown' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function callMeApi(): Promise<MeApiResult> {
  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store' });

    if (response.status === 401) return { kind: 'unauthenticated' };
    if (response.status !== 200) return { kind: 'unknown' };

    const body: unknown = await response.json().catch(() => undefined);
    if (isRecord(body) && body.status === 'OK' && isRecord(body.user)) {
      const { id, username } = body.user;
      if (typeof id === 'string' && typeof username === 'string') {
        return { kind: 'ok', user: { id, username } };
      }
    }
    return { kind: 'unknown' };
  } catch {
    return { kind: 'unknown' };
  }
}

export async function callLogoutApi(): Promise<LogoutApiResult> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'X-CSRF-Token': getCsrfToken() ?? '' },
      cache: 'no-store',
    });
    return response.status === 204 ? { kind: 'ok' } : { kind: 'unknown' };
  } catch {
    return { kind: 'unknown' };
  }
}
