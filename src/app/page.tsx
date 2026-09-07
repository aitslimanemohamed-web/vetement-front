import styles from './page.module.css';
import { StatusPanel } from './components/StatusPanel';

const SHORT_SHA_LENGTH = 7;

/**
 * Résout le commit déployé automatiquement, sans étape manuelle à chaque livraison :
 * - Vercel expose VERCEL_GIT_COMMIT_SHA (SHA complet) au moment du build.
 * - NEXT_PUBLIC_APP_VERSION permet une valeur explicite (ex. tests locaux).
 * - Retombe sur 'dev' si aucun des deux n'est défini (exécution locale simple).
 * Lu ici côté serveur (composant serveur, pas de directive 'use client') — la variable
 * n'a donc pas besoin du préfixe NEXT_PUBLIC_ pour être accessible à ce stade.
 */
function resolveFrontVersion(): string {
  const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelCommit) {
    return vercelCommit.slice(0, SHORT_SHA_LENGTH);
  }
  return process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev';
}

export default function Home() {
  const frontVersion = resolveFrontVersion();

  return (
    <main className={styles.main}>
      <span className={styles.envBadge}>Environnement de test</span>

      <h1 className={styles.title}>vetement</h1>

      <p className={styles.lede}>
        Future plateforme de vente et d&apos;achat de vêtements d&apos;occasion. Cette page est un
        environnement technique de test : aucune annonce, aucun compte et aucune fonctionnalité
        réelle n&apos;y sont disponibles pour l&apos;instant.
      </p>

      <StatusPanel frontVersion={frontVersion} />
    </main>
  );
}
