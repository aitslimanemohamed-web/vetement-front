'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import styles from './LanguageSwitcher.module.css';

const NATIVE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

// Sélecteur de langue réel (US-004) : chaque option est un lien vers la même
// page dans l'autre langue (préserve le chemin courant), pas une simple bascule
// visuelle. Les noms des langues sont affichés dans leur propre écriture,
// jamais réduits à un drapeau.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('languageSwitcher');

  return (
    <nav aria-label={t('label')} className={styles.switcher}>
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            hrefLang={loc}
            aria-current={isActive ? 'true' : undefined}
            className={`${styles.option} ${isActive ? styles.active : ''}`}
          >
            {NATIVE_NAMES[loc]}
          </Link>
        );
      })}
    </nav>
  );
}
