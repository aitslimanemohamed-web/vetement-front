import { CSRF_COOKIE_NAME } from './csrf-constants';

// Lecture du jeton anti-CSRF à double dépôt (US-010) : ce cookie est
// délibérément NON HttpOnly (posé par src/proxy.ts pour tout visiteur) —
// c'est justement le fait qu'un script tiers cross-site ne puisse jamais le
// lire qui rend le motif "double dépôt" efficace. N'est jamais utilisé pour
// autre chose que ce jeton (jamais le cookie de session, lui bien HttpOnly
// et donc invisible ici, comme voulu).
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1)) : null;
}
