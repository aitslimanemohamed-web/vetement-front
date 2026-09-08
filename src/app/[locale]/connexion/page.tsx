import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { LoginForm } from '@/features/auth/login/LoginForm';
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
  const t = await getTranslations({ locale, namespace: 'login' });

  return {
    title: `${t('title')} — Vetement`,
  };
}

// Page de connexion (US-011). Même motif exact que la page d'inscription
// (US-007/US-010) : un visiteur déjà connecté est redirigé vers son espace ;
// une panne/délai de vérification (kind 'unknown') laisse le formulaire
// public affiché plutôt que de bloquer la connexion à tort. Réutilise
// AuthHeader (logo, langue, "retour à l'accueil" déjà fourni).
export default async function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionUser(token);

  if (session.kind === 'ok') {
    redirect({ href: '/espace', locale });
  }

  const t = await getTranslations('login');

  return (
    <>
      <AuthHeader />
      <main className={styles.main}>
        <h1 className={styles.title}>{t('title')}</h1>
        <LoginForm />
      </main>
    </>
  );
}
