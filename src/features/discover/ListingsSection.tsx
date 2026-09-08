import { getTranslations } from 'next-intl/server';
import { SortIcon } from './icons';
import styles from './ListingsSection.module.css';

// Zone des annonces (US-012) : aucune annonce réelle n'existe encore — même
// principe que ListingsPlaceholder sur l'accueil publique (US-004), même
// illustration (`listings-hanger.svg`, déjà "cohérente avec les visuels
// existants" par construction, pas un nouvel asset). Le conteneur de grille
// réutilisable pour les futures annonces (`.grid` ci-dessous, CSS module) est
// préparé mais pas encore instancié : rien n'est rendu à sa place tant qu'il
// n'y a pas de vraies annonces, pour ne jamais afficher de cases vides ou un
// chargement permanent (US-012, section 6).
export async function ListingsSection() {
  const t = await getTranslations('discover.listings');

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>{t('title')}</h2>
        <button type="button" className={styles.sortButton} disabled>
          <SortIcon />
          {t('sort')}
        </button>
      </div>

      <div className={styles.emptyState}>
        <img src="/images/listings-hanger.svg" alt="" aria-hidden="true" className={styles.image} />
        <p className={styles.emptyTitle}>{t('emptyTitle')}</p>
        <p className={styles.emptyMessage}>{t('emptyMessage')}</p>
        <button type="button" className={styles.sellButton} disabled>
          {t('sellCta')}
        </button>
      </div>
    </section>
  );
}
