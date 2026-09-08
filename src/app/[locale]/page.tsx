import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthStatusBanner } from '@/features/auth/session/AuthStatusBanner';
import { Hero } from '@/features/home/Hero';
import { HowItWorks } from '@/features/home/HowItWorks';
import { ListingsPlaceholder } from '@/features/home/ListingsPlaceholder';
import type { Locale } from '@/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      {/* Message transitoire propre à cet onglet après une déconnexion ou
          une expiration de session détectée pendant la visite (US-010) —
          voir AuthStatusBanner pour le détail, jamais un secret. */}
      <AuthStatusBanner />
      <main>
        <Hero />
        <HowItWorks />
        <ListingsPlaceholder />
      </main>
      <Footer />
    </>
  );
}
