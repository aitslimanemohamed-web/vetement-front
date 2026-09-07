'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './StatusPanel.module.css';

type CheckState = 'checking' | 'ok' | 'down';

interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  version: string;
}

type CheckResult = { ok: true; data: HealthResponse } | { ok: false };

const CHECK_TIMEOUT_MS = 10_000;

/**
 * Zone de diagnostic temporaire (TECH-003) : confirme, via un vrai appel HTTP fait
 * depuis le navigateur, que le back-end répond. N'est pas mis en cache pour refléter
 * l'état réel au moment de chaque vérification.
 */
export function StatusPanel({ frontVersion }: { frontVersion: string }) {
  const [state, setState] = useState<CheckState>('checking');
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [backendEnvironment, setBackendEnvironment] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // Effectue une vérification réelle à chaque changement de refreshToken (montage
  // initial inclus, valeur 0). Toutes les mises à jour d'état ont lieu après la
  // frontière asynchrone du fetch (dans .then/.catch), jamais de façon synchrone
  // pendant l'exécution de l'effet lui-même.
  useEffect(() => {
    let ignore = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    async function checkBackend(): Promise<CheckResult> {
      if (!apiUrl) {
        // Pas d'adresse API configurée — on ne prétend pas que le serveur est joignable.
        return { ok: false };
      }

      const response = await fetch(`${apiUrl}/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Réponse HTTP ${response.status}`);
      }

      const data = (await response.json()) as HealthResponse;

      if (data.status !== 'ok') {
        throw new Error('Réponse API invalide');
      }

      return { ok: true, data };
    }

    checkBackend()
      .then((result) => {
        if (ignore) return;

        if (result.ok) {
          setBackendVersion(result.data.version);
          setBackendEnvironment(result.data.environment);
          setState('ok');
        } else {
          setState('down');
        }
      })
      .catch(() => {
        if (!ignore) setState('down');
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [refreshToken]);

  // Gestionnaire du bouton "Vérifier à nouveau" : appelé depuis un événement
  // utilisateur, pas depuis un effet — la réinitialisation synchrone de l'état y
  // est sans risque. Changer refreshToken déclenche une nouvelle exécution de l'effet.
  const handleRetry = useCallback(() => {
    setState('checking');
    setBackendVersion(null);
    setBackendEnvironment(null);
    setRefreshToken((token) => token + 1);
  }, []);

  return (
    <section className={styles.panel} aria-live="polite">
      <h2 className={styles.title}>État de l&apos;environnement</h2>

      <dl className={styles.grid}>
        <dt>Commit front déployé</dt>
        <dd>
          <code>{frontVersion}</code>
        </dd>

        <dt>Communication avec le back-end</dt>
        <dd>
          <span className={`${styles.badge} ${styles[state]}`}>
            {state === 'checking' && 'Connexion au serveur…'}
            {state === 'ok' && 'Serveur opérationnel'}
            {state === 'down' && 'Serveur indisponible'}
          </span>
        </dd>

        <dt>Commit back retourné par l&apos;API</dt>
        <dd>
          <code>{backendVersion ?? '—'}</code>
        </dd>

        <dt>Environnement déclaré par l&apos;API</dt>
        <dd>
          <code>{backendEnvironment ?? '—'}</code>
        </dd>
      </dl>

      <button
        type="button"
        className={styles.button}
        onClick={handleRetry}
        disabled={state === 'checking'}
      >
        Vérifier à nouveau
      </button>
    </section>
  );
}
