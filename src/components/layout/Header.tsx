import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { DisabledActionButton } from '@/components/ui/DisabledActionButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Header.module.css';

export async function Header() {
  const t = await getTranslations('header');

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

        <div className={styles.authButtons}>
          <DisabledActionButton label={t('login')} comingSoonLabel={t('comingSoon')} variant="secondary" />
          <Link href="/inscription" className={styles.signupLink}>
            {t('signup')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
