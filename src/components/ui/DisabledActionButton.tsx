import styles from './DisabledActionButton.module.css';

interface DisabledActionButtonProps {
  label: string;
  comingSoonLabel: string;
  variant: 'primary' | 'secondary';
}

// Bouton visible mais non fonctionnel (Connexion / Inscription — US-004).
// `disabled` empêche toute activation clavier/tactile/souris ; l'indication
// "Bientôt disponible" est un texte toujours visible, pas une infobulle au survol.
export function DisabledActionButton({ label, comingSoonLabel, variant }: DisabledActionButtonProps) {
  return (
    <span className={styles.wrapper}>
      <button type="button" className={`${styles.button} ${styles[variant]}`} disabled>
        {label}
      </button>
      <span className={styles.caption}>{comingSoonLabel}</span>
    </span>
  );
}
