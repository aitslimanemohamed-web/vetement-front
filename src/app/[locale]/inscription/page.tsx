import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { RegistrationForm } from '@/features/auth/registration/RegistrationForm';
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
  const t = await getTranslations({ locale, namespace: 'registration' });

  return {
    title: `${t('title')} — Vetement`,
  };
}

// Page d'inscription (US-007, connectée en US-009/US-010). Un visiteur déjà
// connecté est redirigé vers son espace — pas de raison de lui montrer le
// formulaire d'inscription. À l'inverse, si la vérification de session
// échoue par panne/délai (kind 'unknown'), le formulaire public reste
// affiché : bloquer l'inscription à tort serait une régression, alors que
// la montrer à quelqu'un déjà connecté n'a aucune conséquence de sécurité.
export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionUser(token);

  if (session.kind === 'ok') {
    redirect({ href: '/espace', locale });
  }

  const t = await getTranslations('registration');

  return (
    <>
      <AuthHeader />
      <main className={styles.main}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.testNotice}>{t('testNotice')}</p>
        <RegistrationForm />
      </main>
    </>
  );
}
