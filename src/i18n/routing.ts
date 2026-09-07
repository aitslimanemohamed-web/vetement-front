import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

// Langues affichées de droite à gauche.
export const rtlLocales: readonly Locale[] = ['ar'];

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Toujours préfixer l'URL par la langue (/fr, /en, /ar), y compris pour le
  // français par défaut : une langue explicitement présente dans l'URL doit
  // pouvoir être partagée et doit primer sur la préférence enregistrée.
  localePrefix: 'always',
});
