// Vérifications CSRF (US-010) : deux couches indépendantes, comme exigé
// explicitement par le ticket (OWASP CSRF Prevention Cheat Sheet — ni
// SameSite ni CORS seuls ne suffisent) :
//   1. Origine stricte (isSameOrigin) — "Verifying Origin With Standard
//      Headers".
//   2. Jeton à double dépôt (csrfTokensMatch) — "Double Submit Cookie".
// Fonctions pures et testables séparément des routes qui les appellent
// (src/app/api/auth/{register,logout}/route.ts).
export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf-constants';

export function isSameOrigin(
  originHeader: string | null,
  refererHeader: string | null,
  expectedOrigin: string,
): boolean {
  if (originHeader) return originHeader === expectedOrigin;

  if (refererHeader) {
    try {
      return new URL(refererHeader).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // Un navigateur moderne envoie systématiquement Origin (ou au moins
  // Referer) sur une requête POST — leur absence totale est traitée comme
  // suspecte (échec fermé), pas comme un cas neutre.
  return false;
}

export function csrfTokensMatch(cookieToken: string | null | undefined, headerToken: string | null | undefined): boolean {
  return Boolean(cookieToken) && Boolean(headerToken) && cookieToken === headerToken;
}
