import { getTranslations } from 'next-intl/server';
import styles from './Footer.module.css';

export async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.brand}>Vetement</p>
          <p className={styles.tagline}>{t('tagline')}</p>
        </div>

        <div className={styles.meta}>
          <a href="#top" className={styles.backToTop}>
            {t('backToTop')}
          </a>
          <span className={styles.testVersion}>{t('testVersion')}</span>
        </div>
      </div>
    </footer>
  );
}
