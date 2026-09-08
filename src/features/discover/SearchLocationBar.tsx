import { getTranslations } from 'next-intl/server';
import { FilterIcon, LocationIcon, SearchIcon } from './icons';
import styles from './SearchLocationBar.module.css';

// Barre de recherche/localisation/filtres (US-012) — trois commandes
// réellement désactivées, aucune n'ouvre quoi que ce soit ni ne déclenche
// d'appel réseau. La recherche n'est volontairement PAS un <input> : un vrai
// champ de saisie ouvrirait le clavier virtuel sur téléphone, ce que le
// ticket exclut explicitement ("ne permet pas la saisie et n'ouvre pas le
// clavier") — un bouton désactivé rend cette contrainte impossible à violer
// par construction, plutôt que par une simple absence de gestionnaire.
export async function SearchLocationBar() {
  const t = await getTranslations('discover.search');

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.searchButton} disabled>
        <SearchIcon />
        <span>{t('placeholder')}</span>
      </button>

      <div className={styles.secondaryRow}>
        <button type="button" className={styles.secondaryButton} disabled>
          <LocationIcon />
          <span>{t('location')}</span>
        </button>
        <button type="button" className={styles.secondaryButton} disabled>
          <FilterIcon />
          <span>{t('filters')}</span>
        </button>
      </div>
    </div>
  );
}
