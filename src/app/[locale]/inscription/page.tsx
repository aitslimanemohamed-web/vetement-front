import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { RegistrationForm } from '@/features/auth/registration/RegistrationForm';
import type { Locale } from '@/i18n/routing';
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

// Page d'inscription (US-007) : interface et contrôles côté navigateur
// uniquement. Aucun appel réseau, aucun compte réellement créé — voir
// RegistrationForm pour le détail du comportement.
export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
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
