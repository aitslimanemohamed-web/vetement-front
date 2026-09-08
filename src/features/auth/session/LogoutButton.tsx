'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { broadcastLogout } from '@/lib/auth-broadcast';
import { JUST_LOGGED_OUT_STORAGE_KEY } from '@/lib/auth-storage-keys';
import { callLogoutApi } from './session-api';
import styles from './LogoutButton.module.css';

// Déroulé exact du ticket (US-010, section 10) : bouton désactivé pendant le
// traitement, appel réel, puis seulement en cas de succès confirmé —
// jamais supposé — diffusion aux autres onglets et retour à l'accueil.
export function LogoutButton() {
  const t = useTranslations('espace.logout');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError(false);

    const result = await callLogoutApi();
    setLoading(false);

    if (result.kind !== 'ok') {
      // Ne jamais annoncer un succès non confirmé (US-010, section 10).
      setError(true);
      return;
    }

    broadcastLogout();
    try {
      sessionStorage.setItem(JUST_LOGGED_OUT_STORAGE_KEY, '1');
    } catch {
      // Ignoré : la confirmation affichée ensuite est un confort, pas une garantie.
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.button} onClick={handleClick} disabled={loading}>
        {loading ? t('inProgress') : t('button')}
      </button>
      {error && (
        <p role="status" aria-live="polite" className={styles.error}>
          {t('error')}
        </p>
      )}
    </div>
  );
}
