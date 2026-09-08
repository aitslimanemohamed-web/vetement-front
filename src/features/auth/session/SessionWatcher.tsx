'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { SESSION_EXPIRED_STORAGE_KEY } from '@/lib/auth-storage-keys';
import { callMeApi } from './session-api';

const POLL_INTERVAL_MS = 60_000;

interface SessionWatcherProps {
  initiallyOffline: boolean;
}

// Monté sur /espace (US-010, section 9) : distingue trois états au fil du
// temps, jamais confondus l'un avec l'autre —
//   - hors-ligne (le back ne répond pas / délai dépassé) : on NE déconnecte
//     JAMAIS sur cette seule base, on réessaie ;
//   - session expirée (le back a explicitement répondu "non authentifié") :
//     seule cette réponse déclenche un retour à l'accueil ;
//   - connecté : rien à afficher.
export function SessionWatcher({ initiallyOffline }: SessionWatcherProps) {
  const t = useTranslations('espace.offline');
  const router = useRouter();
  const [offline, setOffline] = useState(initiallyOffline);
  const redirectingRef = useRef(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
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
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [router]);

  if (!offline) return null;

  return (
    <p role="status" aria-live="polite">
      {t('message')}
    </p>
  );
}
