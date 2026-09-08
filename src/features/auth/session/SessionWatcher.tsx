'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { SESSION_EXPIRED_STORAGE_KEY } from '@/lib/auth-storage-keys';
import { callMeApi } from './session-api';
import styles from './SessionWatcher.module.css';

const POLL_INTERVAL_MS = 60_000;

interface SessionWatcherProps {
  initiallyOffline: boolean;
}

// Monté sur /espace (US-010, section 9) : distingue trois états au fil du
// temps, jamais confondus l'un avec l'autre —
//   - hors-ligne (le back ne répond pas / délai dépassé) : on NE déconnecte
//     JAMAIS sur cette seule base ; nouvelle tentative automatique toutes
//     les 60s, plus une action « Réessayer » explicite (US-010, section 9 :
//     « afficher un message et une action Réessayer ») ;
//   - session expirée (le back a explicitement répondu "non authentifié") :
//     seule cette réponse déclenche un retour à l'accueil ;
//   - connecté : rien à afficher.
export function SessionWatcher({ initiallyOffline }: SessionWatcherProps) {
  const t = useTranslations('espace.offline');
  const router = useRouter();
  const [offline, setOffline] = useState(initiallyOffline);
  const [retrying, setRetrying] = useState(false);
  const redirectingRef = useRef(false);

  const check = useCallback(async () => {
    if (redirectingRef.current) return;

    const result = await callMeApi();
    if (redirectingRef.current) return;

    if (result.kind === 'ok') {
      setOffline(false);
      return;
    }

    if (result.kind === 'unauthenticated') {
      redirectingRef.current = true;
      try {
        sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, '1');
      } catch {
        // Ignoré : la confirmation affichée ensuite est un confort, pas une garantie.
      }
      router.push('/');
      router.refresh();
      return;
    }

    setOffline(true);
  }, [router]);

  useEffect(() => {
    const intervalId = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [check]);

  async function handleRetryClick() {
    if (retrying) return;
    setRetrying(true);
    await check();
    setRetrying(false);
  }

  if (!offline) return null;

  return (
    <div className={styles.wrapper}>
      <p role="status" aria-live="polite" className={styles.message}>
        {t('message')}
      </p>
      <button type="button" className={styles.retryButton} onClick={handleRetryClick} disabled={retrying}>
        {retrying ? t('retrying') : t('retry')}
      </button>
    </div>
  );
}
