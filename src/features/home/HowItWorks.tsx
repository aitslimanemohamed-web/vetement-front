import { getTranslations } from 'next-intl/server';
import styles from './HowItWorks.module.css';

const STEP_KEYS = ['discover', 'chat', 'handover'] as const;

export async function HowItWorks() {
  const t = await getTranslations('howItWorks');

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.note}>{t('note')}</p>

        <ol className={styles.steps}>
          {STEP_KEYS.map((key, index) => (
            <li key={key} className={styles.step}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
              <h3 className={styles.stepTitle}>{t(`steps.${key}.title`)}</h3>
              <p className={styles.stepDescription}>{t(`steps.${key}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
