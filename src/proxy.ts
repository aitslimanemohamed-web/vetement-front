import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Détecte la langue (URL > cookie NEXT_LOCALE > en-tête Accept-Language > défaut),
// redirige "/" vers "/fr", "/en" ou "/ar" et mémorise le choix dans un cookie pour
// les visites suivantes sur le même navigateur.
// Nommé "proxy" (et non "middleware") : convention Next.js 16, voir
// https://nextjs.org/docs/messages/middleware-to-proxy
export const proxy = createMiddleware(routing);

export const config = {
  // Toutes les routes sauf les fichiers statiques (contiennent un point) et les
  // dossiers internes de Next.js.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
