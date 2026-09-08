import { getTranslations } from 'next-intl/server';
import styles from './CategoryShortcuts.module.css';

const CATEGORY_KEYS = ['all', 'women', 'men', 'kids'] as const;

// Raccourcis de catégories (US-012) : une proposition de navigation pour
// cette première interface, pas encore de vraies catégories en base ni de
// règles de classement — voir CONTEXTE_PROJET.md. "Tout" est représenté
// comme sélectionné visuellement (style seul, aucun état ni logique de
// sélection réelle) ; les quatre boutons sont réellement désactivés,
// aucun clic ne change quoi que ce soit.
export async function CategoryShortcuts() {
  const t = await getTranslations('discover.categories');

  return (
    <nav className={styles.wrapper} aria-label={t('all')}>
      {CATEGORY_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`${styles.button} ${key === 'all' ? styles.selected : ''}`}
          disabled
        >
          {t(key)}
        </button>
      ))}
    </nav>
  );
}
