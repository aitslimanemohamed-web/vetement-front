'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { JUST_LOGGED_OUT_STORAGE_KEY, SESSION_EXPIRED_STORAGE_KEY } from '@/lib/auth-storage-keys';
import styles from './AuthStatusBanner.module.css';

// Affiche, sur l'accueil publique, un message transitoire propre à cet
// onglet — jamais un secret — après une déconnexion volontaire (US-010,
// section 10 : « Vous êtes déconnecté ») ou une expiration de session
// détectée pendant la visite (section 9 : « Votre session a expiré »).
// Chaque signal est consommé une seule fois (retiré du stockage dès sa
// lecture) : il ne réapparaît pas à une actualisation ultérieure.
export function AuthStatusBanner() {
  const t = useTranslations('espace');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    // Frontière asynchrone volontaire (même motif que StatusPanel.tsx) :
    // la mise à jour d'état a lieu après une micro-tâche, jamais de façon
    // synchrone pendant l'exécution de l'effet lui-même.
    Promise.resolve().then(() => {
      if (ignore) return;
      try {
        if (sessionStorage.getItem(JUST_LOGGED_OUT_STORAGE_KEY) === '1') {
          sessionStorage.removeItem(JUST_LOGGED_OUT_STORAGE_KEY);
          setMessage(t('logout.confirmation'));
          return;
        }
        if (sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY) === '1') {
          sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
          setMessage(t('sessionExpired'));
        }
      } catch {
        // Stockage indisponible : pas de confirmation affichée, sans
        // conséquence fonctionnelle (la déconnexion/l'expiration elles-mêmes
        // ont déjà eu lieu réellement).
      }
    });

    return () => {
      ignore = true;
    };
  }, [t]);

  if (!message) return null;

  return (
    <p role="status" aria-live="polite" className={styles.banner}>
      {message}
    </p>
  );
}
