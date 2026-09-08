import styles from './Avatar.module.css';

// Avatar par défaut (US-010) : silhouette dessinée pour ce projet, même
// convention graphique que les icônes œil/œil barré de COR-008 (trait
// "currentColor", pas de bibliothèque d'icônes). Purement décoratif à côté
// du nom d'utilisateur déjà visible — aria-hidden, aucun aria-label.
export function Avatar() {
  return (
    <span className={styles.avatar}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.icon}>
        <circle cx="12" cy="8.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M4.5 20c0-4.14 3.36-6.5 7.5-6.5s7.5 2.36 7.5 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
