import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { LogoutButton } from '@/features/auth/session/LogoutButton';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { HeartIcon, MessageIcon, PlusIcon } from './icons';
import styles from './DiscoverHeader.module.css';

interface DiscoverHeaderProps {
  username: string;
}

// En-tête de l'espace connecté "Découvrir" (US-012) — distinct du Header
// marketing de l'accueil publique (jamais modifié par ce ticket) : celui-ci
// ajoute les futures actions (Favoris, Messages, Vendre), toutes désactivées
// pour le moment. Le nom réel vient de la session (passé en prop par la
// page, qui l'a déjà résolu) — jamais une valeur arbitraire côté front.
// L'avatar + le nom représentent ici visuellement "Profil" : aucun lien,
// contrairement au Header marketing (pas de page de profil pour l'instant).
// La déconnexion, elle, reste toujours réellement active — jamais
// dépendante d'un menu Profil inactif (US-012, section 3).
export async function DiscoverHeader({ username }: DiscoverHeaderProps) {
  const t = await getTranslations('discover.header');
  const tHeader = await getTranslations('header');

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link href="/" className={styles.logo} aria-label={tHeader('logoAlt')}>
          Vetement
        </Link>

        <div className={styles.desktopActions}>
          <button type="button" className={styles.actionButton} disabled>
            <HeartIcon />
            {t('favorites')}
          </button>
          <button type="button" className={styles.actionButton} disabled>
            <MessageIcon />
            {t('messages')}
          </button>
          <button type="button" className={`${styles.actionButton} ${styles.sellAction}`} disabled>
            <PlusIcon />
            {t('sell')}
          </button>
        </div>

        <div className={styles.identityRow}>
          <LanguageSwitcher />
          <span className={styles.identity} aria-label={t('profile')}>
            <Avatar />
            <span className={styles.username}>{username}</span>
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
