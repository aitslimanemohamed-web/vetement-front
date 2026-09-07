import { getTranslations } from 'next-intl/server';
import styles from './ListingsPlaceholder.module.css';

// État d'attente (US-004) : aucune annonce réelle n'existe encore. Ne réalise
// aucun appel réseau et n'affiche ni chargement permanent, ni annonces, prix ou
// vendeurs fictifs — seulement un message d'attente et une illustration décorative.
export async function ListingsPlaceholder() {
  const t = await getTranslations('listings');

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('title')}</h2>
        <img src="/images/listings-hanger.svg" alt="" aria-hidden="true" className={styles.image} />
        <p className={styles.message}>{t('message')}</p>
      </div>
    </section>
  );
}
