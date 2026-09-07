import { getTranslations } from 'next-intl/server';
import styles from './Hero.module.css';

export async function Hero() {
  const t = await getTranslations('hero');

  return (
    <section className={styles.hero} id="top">
      <div className={styles.text}>
        <span className={styles.eyebrow}>{t('eyebrow')}</span>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
        <a href="#how-it-works" className={styles.cta}>
          {t('cta')}
        </a>
      </div>

      <div className={styles.visual}>
        <img src="/images/hero-clothing.svg" alt="" aria-hidden="true" className={styles.image} />
      </div>
    </section>
  );
}
