import { setRequestLocale } from 'next-intl/server';
import { StatusPanel } from '@/components/diagnostic/StatusPanel';
import type { Locale } from '@/i18n/routing';
import styles from './page.module.css';

const SHORT_SHA_LENGTH = 7;

function resolveFrontVersion(): string {
  const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelCommit) {
    return vercelCommit.slice(0, SHORT_SHA_LENGTH);
  }
  return process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev';
}

export const metadata = {
  title: 'vetement — Diagnostic technique',
};

// Page technique interne (US-004) : la zone de diagnostic occupait la page
// d'accueil depuis TECH-003 ; elle est déplacée ici pour laisser la place à la
// page produit publique. Non traduite : outil de vérification, pas une page
// destinée aux visiteurs. Reste couverte par la directive noindex du layout.
export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const frontVersion = resolveFrontVersion();

  return (
    <main className={styles.main}>
      <span className={styles.envBadge}>Environnement de test</span>
      <h1 className={styles.title}>Diagnostic technique</h1>
      <p className={styles.lede}>
        Page interne de vérification de la communication entre le front-end et le back-end.
        Cette page n&apos;est pas destinée aux visiteurs du site — voir la page d&apos;accueil
        pour la page produit publique.
      </p>
      <StatusPanel frontVersion={frontVersion} />
    </main>
  );
}
