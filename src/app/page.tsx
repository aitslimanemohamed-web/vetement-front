import styles from './page.module.css';
import { StatusPanel } from './components/StatusPanel';

export default function Home() {
  const frontVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev';

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
