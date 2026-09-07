import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './AuthHeader.module.css';

// En-tête minimal pour les pages d'authentification (inscription, puis
// connexion) : logo, sélecteur de langue et retour à l'accueil — pas la
// navigation marketing complète du Header de l'accueil (US-007).
export async function AuthHeader() {
  const tHeader = await getTranslations('header');
  const tRegistration = await getTranslations('registration');

  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <Link href="/" className={styles.logo} aria-label={tHeader('logoAlt')}>
          Vetement
        </Link>
        <LanguageSwitcher />
      </div>

      <Link href="/" className={styles.backLink}>
        {tRegistration('backToHome')}
      </Link>
    </header>
  );
}
