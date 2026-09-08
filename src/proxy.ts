import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { CSRF_COOKIE_NAME } from './lib/csrf-constants';

// Détecte la langue (URL > cookie NEXT_LOCALE > en-tête Accept-Language > défaut),
// redirige "/" vers "/fr", "/en" ou "/ar" et mémorise le choix dans un cookie pour
// les visites suivantes sur le même navigateur.
// Nommé "proxy" (et non "middleware") : convention Next.js 16, voir
// https://nextjs.org/docs/messages/middleware-to-proxy
const intlProxy = createMiddleware(routing);

// Émet aussi le jeton anti-CSRF à double dépôt (US-010) pour TOUT visiteur,
// pas seulement une fois connecté — cela protège aussi l'inscription
// elle-même contre une CSRF de connexion forcée ("login CSRF"), pas
// seulement la déconnexion. Volontairement non HttpOnly : c'est le fait
// qu'un script cross-site ne puisse pas le lire (politique d'origine du
// navigateur) qui rend ce motif utile, voir src/lib/csrf.ts.
// Chemin de l'espace connecté, quelle que soit la langue (/fr/espace,
// /en/espace, /ar/espace) — voir src/i18n/routing.ts pour la liste des
// langues (codes à 2 lettres).
const PROTECTED_SPACE_PATTERN = /^\/[a-z]{2}\/espace(\/|$)/;

export function proxy(request: NextRequest) {
  const response = intlProxy(request);

  if (!request.cookies.get(CSRF_COOKIE_NAME)) {
    response.cookies.set(CSRF_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // Empêche toute mise en cache de la page (y compris le cache "retour" du
  // navigateur, bfcache) : son contenu dépend d'une session et ne doit
  // jamais être resservi après une déconnexion (US-010, sections 8 et 10).
  if (PROTECTED_SPACE_PATTERN.test(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'no-store');
  }

  return response;
}

export const config = {
  // Toutes les routes sauf les fichiers statiques (contiennent un point), les
  // dossiers internes de Next.js, et les routes API (/api/*, US-010) — ces
  // dernières ne doivent jamais être préfixées par une langue ni redirigées :
  // le jeton CSRF qu'elles vérifient a déjà été posé par une visite de page
  // précédente.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
