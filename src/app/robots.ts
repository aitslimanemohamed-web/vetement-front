import type { MetadataRoute } from 'next';

// Empêche l'indexation de cet environnement de test par les moteurs de recherche.
// Cette mesure ne constitue pas un contrôle d'accès : l'URL reste accessible à quiconque
// la connaît, elle est seulement retirée des résultats de recherche.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
