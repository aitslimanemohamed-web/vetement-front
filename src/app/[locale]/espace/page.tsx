import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { SessionWatcher } from '@/features/auth/session/SessionWatcher';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { SESSION_COOKIE_NAME } from '@/lib/csrf-constants';
import { getSessionUser } from '@/lib/server/session';
import styles from './page.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'espace' });

  return {
    title: `${t('title')} — Vetement`,
    robots: { index: false, follow: false },
  };
}

// Page protégée (US-010) : la vérification de session a lieu entièrement
// côté serveur, avant tout rendu — redirect() interrompt le rendu avant
// qu'aucun HTML ne parte vers le navigateur, donc un visiteur non connecté
// n'a jamais l'occasion de voir ce contenu, même brièvement.
//
// Un back-end injoignable (kind 'unknown', ex. démarrage à froid de Render)
// n'entraîne volontairement PAS de redirection : afficher un utilisateur
// légitimement connecté comme déconnecté à tort serait pire qu'un message
// d'attente — voir SessionWatcher, qui réessaie côté client.
export default async function EspacePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionUser(token);

  if (session.kind === 'unauthenticated') {
    redirect({ href: '/', locale });
  }

  const t = await getTranslations('espace');

  return (
    <>
      <Header />
      <main className={styles.main}>
        {session.kind === 'ok' ? (
          <>
            <Avatar />
            <h1 className={styles.title}>{t('greeting', { username: session.user.username })}</h1>
            <p className={styles.subtitle}>{t('placeholder')}</p>
          </>
        ) : (
          <p role="status" aria-live="polite" className={styles.subtitle}>
            {t('offline.checking')}
          </p>
        )}
        <SessionWatcher initiallyOffline={session.kind === 'unknown'} />
      </main>
      <Footer />
    </>
  );
}
