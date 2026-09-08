'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { PasswordField } from '@/features/auth/registration/PasswordField';
import { callLoginApi } from './login-api';
import styles from './LoginForm.module.css';

const SLOW_SERVER_HINT_DELAY_MS = 10_000;

// Formulaire de connexion (US-011) : réutilise le mécanisme de session
// existant (US-010) — un succès crée une vraie session côté serveur (via le
// relais Next.js, voir login-api.ts) puis redirige immédiatement vers
// l'espace connecté, jamais une étape où l'utilisateur ressaisirait ses
// identifiants. Contrairement à l'inscription, aucune règle de format n'est
// appliquée localement : seule la présence des deux champs est vérifiée —
// c'est au back-end de vérifier le mot de passe enregistré, jamais aux
// règles de création d'un nouveau mot de passe (US-011, section 3).
export function LoginForm() {
  const t = useTranslations('login');
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<{ username?: string; password?: string }>({});

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameErrorId = useId();

  const usernameEmpty = username.trim().length === 0;
  const passwordEmpty = password.length === 0;

  const showUsernameError = (usernameTouched || submitted) && usernameEmpty;
  const showPasswordError = (passwordTouched || submitted) && passwordEmpty;

  const usernameDisplayError =
    serverFieldErrors.username ?? (showUsernameError ? t('errors.usernameRequired') : undefined);
  const passwordDisplayError =
    serverFieldErrors.password ?? (showPasswordError ? t('errors.passwordRequired') : undefined);

  function resetTransientState() {
    if (serverError) setServerError(null);
  }

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (serverFieldErrors.username) setServerFieldErrors((current) => ({ ...current, username: undefined }));
    resetTransientState();
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (serverFieldErrors.password) setServerFieldErrors((current) => ({ ...current, password: undefined }));
    resetTransientState();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // empêche les doubles soumissions

    setSubmitted(true);
    setUsernameTouched(true);
    setPasswordTouched(true);
    setServerError(null);
    setServerFieldErrors({});

    if (usernameEmpty) {
      usernameRef.current?.focus();
      return;
    }
    if (passwordEmpty) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setShowSlowHint(false);
    const slowHintTimer = setTimeout(() => setShowSlowHint(true), SLOW_SERVER_HINT_DELAY_MS);

    const result = await callLoginApi(username, password);

    clearTimeout(slowHintTimer);
    setSubmitting(false);
    setShowSlowHint(false);

    switch (result.kind) {
      case 'success': {
        setPassword('');
        setSubmitted(false);
        setPasswordTouched(false);
        // Le cookie de session a déjà été posé par le relais — la
        // redirection ne fait qu'ouvrir la page déjà accessible.
        setRedirecting(true);
        router.push('/espace');
        router.refresh();
        break;
      }
      case 'field-error': {
        setServerFieldErrors({
          username: result.fieldErrors.username ? t('errors.usernameRequired') : undefined,
          password: result.fieldErrors.password ? t('errors.passwordRequired') : undefined,
        });
        if (result.fieldErrors.username) usernameRef.current?.focus();
        else if (result.fieldErrors.password) passwordRef.current?.focus();
        break;
      }
      case 'invalid-credentials':
        // Volontairement générique et non lié à un champ précis : ne jamais
        // laisser deviner si le nom d'utilisateur existe (US-011, section 4).
        setServerError(t('serverErrors.invalidCredentials'));
        passwordRef.current?.focus();
        break;
      case 'rate-limited':
        setServerError(t('serverErrors.rateLimited'));
        break;
      case 'service-unavailable':
        setServerError(t('serverErrors.serviceUnavailable'));
        break;
      case 'unknown-result':
        setServerError(t('serverErrors.unknownResult'));
        break;
      case 'unexpected':
      default:
        setServerError(t('serverErrors.unexpected'));
        break;
    }
  }

  const statusMessage = submitting
    ? showSlowHint
      ? `${t('submitting')} ${t('slowServerHint')}`
      : t('submitting')
    : redirecting
      ? t('redirecting')
      : (serverError ?? '');

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>
          {t('username.label')}
        </label>
        <input
          id="username"
          name="username"
          ref={usernameRef}
          type="text"
          dir="auto"
          value={username}
          onChange={(event) => handleUsernameChange(event.target.value)}
          onBlur={() => setUsernameTouched(true)}
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={Boolean(usernameDisplayError) || undefined}
          aria-describedby={usernameDisplayError ? usernameErrorId : undefined}
          className={styles.input}
        />
        {usernameDisplayError && (
          <p id={usernameErrorId} className={styles.error}>
            {usernameDisplayError}
          </p>
        )}
      </div>

      <PasswordField
        id="password"
        ref={passwordRef}
        label={t('password.label')}
        value={password}
        onChange={handlePasswordChange}
        onBlur={() => setPasswordTouched(true)}
        autoComplete="current-password"
        showLabel={t('password.show')}
        hideLabel={t('password.hide')}
        error={passwordDisplayError}
      />

      <button type="submit" className={styles.submit} disabled={submitting || redirecting}>
        {submitting ? t('submitting') : t('submit')}
      </button>

      <p className={styles.status} role="status" aria-live="polite">
        {statusMessage}
      </p>

      <p className={styles.createAccountPrompt}>
        <span>{t('createAccountPrompt')}</span>
        <Link href="/inscription">{t('createAccountAction')}</Link>
      </p>
    </form>
  );
}
