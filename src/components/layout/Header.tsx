import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { DisabledActionButton } from '@/components/ui/DisabledActionButton';
import { LogoutButton } from '@/features/auth/session/LogoutButton';
import { SESSION_COOKIE_NAME } from '@/lib/csrf-constants';
import { getSessionUser } from '@/lib/server/session';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Header.module.css';

// Server Component (US-010) : ne paie le coût d'un appel réseau vers /me que
// si un cookie de session est présent — un visiteur anonyme n'a jamais cette
// latence supplémentaire. En cas de panne/délai (kind 'unknown'), affiche le
// markup existant (anonyme) plutôt que de deviner : mieux vaut montrer les
// actions publiques par défaut qu'un état incertain.
export async function Header() {
  const t = await getTranslations('header');
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionUser(token);

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link href="/" className={styles.logo} aria-label={t('logoAlt')}>
          Vetement
        </Link>
        <LanguageSwitcher />
      </div>

      <nav className={styles.actionsRow} aria-label={t('primaryNav')}>
        <a href="#how-it-works" className={styles.howItWorks}>
          {t('howItWorks')}
        </a>

        {session.kind === 'ok' ? (
          <div className={styles.userInfo}>
            <Avatar />
            <span className={styles.username}>{session.user.username}</span>
            <Link href="/espace" className={styles.mySpaceLink}>
              {t('mySpace')}
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className={styles.authButtons}>
            <DisabledActionButton label={t('login')} comingSoonLabel={t('comingSoon')} variant="secondary" />
            <Link href="/inscription" className={styles.signupLink}>
              {t('signup')}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
