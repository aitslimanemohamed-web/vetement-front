// Noms partagés entre src/proxy.ts (émission), src/lib/csrf.ts (vérification
// serveur) et src/lib/csrf-client.ts (lecture navigateur) — US-010.
export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const SESSION_COOKIE_NAME = 'vetement_session';
