// Vérification de session côté serveur (US-010) : fonction partagée entre
// les pages protégées (rendues côté serveur, jamais de flash de contenu
// privé) et la route relais src/app/api/auth/me/route.ts — un seul appel
// serveur-à-serveur vers NestJS, jamais un aller-retour de l'app vers
// elle-même. N'importer que depuis du code serveur : lit une variable
// d'environnement volontairement NON préfixée NEXT_PUBLIC_ (jamais exposée
// au navigateur).
const REQUEST_TIMEOUT_MS = 8_000;

export interface SessionUser {
  id: string;
  username: string;
}

export type SessionUserResult =
  | { kind: 'ok'; user: SessionUser }
  // Jeton absent, ou explicitement rejeté par le back-end (mal formé,
  // inconnu, expiré, révoqué, inactif trop longtemps) — toutes ces causes
  // sont indiscernables ici par conception (voir SessionGuard côté NestJS).
  | { kind: 'unauthenticated' }
  // Panne ou délai dépassé : ne doit JAMAIS être traité comme une
  // déconnexion (US-010, section 9) — même motif que register-api.ts.
  | { kind: 'unknown' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function getSessionUser(token: string | undefined | null): Promise<SessionUserResult> {
  if (!token) return { kind: 'unauthenticated' };

  const apiUrl = process.env.INTERNAL_API_URL;
  if (!apiUrl) return { kind: 'unknown' };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: controller.signal,
    });

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
  } finally {
    clearTimeout(timeoutId);
  }
}
