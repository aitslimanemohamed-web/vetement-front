import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Cairo } from 'next/font/google';
import { routing, rtlLocales, type Locale } from '@/i18n/routing';
import '../globals.css';

// Une seule famille, choisie pour couvrir le latin et l'arabe : évite un changement
// de police (et le décalage de mise en page qui l'accompagne) au changement de langue.
const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['400', '600', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
    // Environnement de test : ne doit pas être indexé (voir aussi src/app/robots.ts).
    // Ce n'est pas un contrôle d'accès, seulement un retrait des moteurs de recherche.
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: requestedLocale } = await params;

  if (!hasLocale(routing.locales, requestedLocale)) {
    notFound();
  }

  const locale = requestedLocale as Locale;
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={cairo.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
