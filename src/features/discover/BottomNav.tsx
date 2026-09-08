import { getTranslations } from 'next-intl/server';
import { CompassIcon, HeartIcon, MessageIcon, PersonIcon, PlusIcon } from './icons';
import styles from './BottomNav.module.css';

// Navigation basse, téléphone uniquement (US-012, section 7) — masquée sur
// ordinateur par CSS (les mêmes destinations y sont déjà dans l'en-tête,
// voir DiscoverHeader). "Découvrir" est la page courante : ni un lien, ni un
// bouton désactivé, juste un repère visuel (`aria-current="page"`) — les
// quatre autres sont de vrais boutons désactivés. `env(safe-area-inset-
// bottom)` (voir le viewport `viewportFit: 'cover'` dans layout.tsx) évite
// d'empiéter sur la zone de sécurité des téléphones à encoche ; le
// paddding-bottom réservé sous le contenu principal (page.module.css) évite
// que cette barre fixe ne masque le bas de la page.
export async function BottomNav() {
  const t = await getTranslations('discover.nav');

  return (
    <nav className={styles.nav} aria-label={t('discover')}>
      <span className={styles.item} aria-current="page">
        <CompassIcon />
        <span className={styles.label}>{t('discover')}</span>
      </span>
      <button type="button" className={styles.item} disabled>
        <HeartIcon />
        <span className={styles.label}>{t('favorites')}</span>
      </button>
      <button type="button" className={`${styles.item} ${styles.sellItem}`} disabled>
        <PlusIcon />
        <span className={styles.label}>{t('sell')}</span>
      </button>
      <button type="button" className={styles.item} disabled>
        <MessageIcon />
        <span className={styles.label}>{t('messages')}</span>
      </button>
      <button type="button" className={styles.item} disabled>
        <PersonIcon />
        <span className={styles.label}>{t('profile')}</span>
      </button>
    </nav>
  );
}
