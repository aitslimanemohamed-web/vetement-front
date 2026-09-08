'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { PasswordField } from './PasswordField';
import { callRegisterApi } from './register-api';
import { validateRegistrationForm, type RegistrationMessages } from './validation';
import styles from './RegistrationForm.module.css';

type FieldName = 'username' | 'password' | 'confirmPassword';
type Translator = ReturnType<typeof useTranslations<'registration'>>;

const SLOW_SERVER_HINT_DELAY_MS = 10_000;

// Codes renvoyés par le back-end pour une erreur de champ (US-009) — mêmes
// libellés traduits que la validation locale, pour une expérience cohérente
// quelle que soit l'origine de l'erreur.
const SERVER_FIELD_ERROR_KEYS = {
  USERNAME_REQUIRED: 'usernameRequired',
  USERNAME_LENGTH: 'usernameLength',
  USERNAME_FORMAT: 'usernameFormat',
  PASSWORD_REQUIRED: 'passwordRequired',
  PASSWORD_TOO_SHORT: 'passwordTooShort',
  PASSWORD_TOO_LONG: 'passwordTooLong',
} as const;

function translateServerFieldCode(code: string, t: Translator): string {
  const key = (SERVER_FIELD_ERROR_KEYS as Record<string, string>)[code];
  return key ? t(`errors.${key}` as Parameters<Translator>[0]) : t('serverErrors.unexpected');
}

// Formulaire d'inscription (US-009, connecté automatiquement en US-010) :
// validation locale inchangée (US-007), puis un unique appel réel à l'API
// d'inscription (relayée par Next.js, voir register-api.ts). Les valeurs ne
// vivent que dans l'état de ce composant — jamais dans l'URL, un cookie,
// localStorage/sessionStorage, un journal ou un outil d'analyse. Un succès
// confirmé par le serveur redirige immédiatement vers l'espace connecté —
// jamais une étape intermédiaire où l'utilisateur ressaisirait ses
// identifiants (US-010, section 2).
export function RegistrationForm() {
  const t = useTranslations('registration');
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<{ username?: string; password?: string }>({});

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const usernameHelpId = useId();
  const usernameErrorId = useId();

  const messages: RegistrationMessages = {
    usernameRequired: t('errors.usernameRequired'),
    usernameLength: t('errors.usernameLength'),
    usernameFormat: t('errors.usernameFormat'),
    passwordRequired: t('errors.passwordRequired'),
    passwordTooShort: t('errors.passwordTooShort'),
    passwordTooLong: t('errors.passwordTooLong'),
    confirmRequired: t('errors.confirmRequired'),
    confirmMismatch: t('errors.confirmMismatch'),
  };

  const errors = validateRegistrationForm({ username, password, confirmPassword }, messages);

  const showUsernameError = (touched.username || submitted) && Boolean(errors.username);
  const showPasswordError = (touched.password || submitted) && Boolean(errors.password);
  const showConfirmError = (touched.confirmPassword || submitted) && Boolean(errors.confirmPassword);

  const usernameDisplayError = serverFieldErrors.username ?? (showUsernameError ? errors.username : undefined);
  const passwordDisplayError = serverFieldErrors.password ?? (showPasswordError ? errors.password : undefined);

  function markTouched(field: FieldName) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

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

  function handleConfirmChange(value: string) {
    setConfirmPassword(value);
    resetTransientState();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // empêche les doubles soumissions

    setSubmitted(true);
    setTouched({ username: true, password: true, confirmPassword: true });
    setServerError(null);
    setServerFieldErrors({});

    if (errors.username) {
      usernameRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }
    if (errors.confirmPassword) {
      confirmRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setShowSlowHint(false);
    const slowHintTimer = setTimeout(() => setShowSlowHint(true), SLOW_SERVER_HINT_DELAY_MS);

    const result = await callRegisterApi(username, password);

    clearTimeout(slowHintTimer);
    setSubmitting(false);
    setShowSlowHint(false);

    switch (result.kind) {
      case 'success': {
        setPassword('');
        setConfirmPassword('');
        setSubmitted(false);
        setTouched((current) => ({ ...current, password: false, confirmPassword: false }));
        // Le cookie de session a déjà été posé par le relais (voir
        // register-api.ts) au moment où cette réponse arrive — la
        // redirection ne fait qu'ouvrir la page déjà accessible.
        setRedirecting(true);
        router.push('/espace');
        router.refresh();
        break;
      }
      case 'field-error': {
        const mapped: { username?: string; password?: string } = {};
        if (result.fieldErrors.username) {
          mapped.username = translateServerFieldCode(result.fieldErrors.username, t);
        }
        if (result.fieldErrors.password) {
          mapped.password = translateServerFieldCode(result.fieldErrors.password, t);
        }
        setServerFieldErrors(mapped);
        if (mapped.username) usernameRef.current?.focus();
        else if (mapped.password) passwordRef.current?.focus();
        break;
      }
      case 'username-taken':
        setServerFieldErrors({ username: t('serverErrors.usernameTaken') });
        usernameRef.current?.focus();
        break;
      case 'password-too-common':
        setServerFieldErrors({ password: t('serverErrors.passwordTooCommon') });
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

  const usernameDescribedBy = [usernameHelpId, usernameDisplayError ? usernameErrorId : null]
    .filter(Boolean)
    .join(' ');

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
          onBlur={() => markTouched('username')}
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={Boolean(usernameDisplayError) || undefined}
          aria-describedby={usernameDescribedBy}
          className={styles.input}
        />
        <p id={usernameHelpId} className={styles.help}>
          {t('username.help')}
        </p>
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
        help={t('password.help')}
        value={password}
        onChange={handlePasswordChange}
        onBlur={() => markTouched('password')}
        autoComplete="new-password"
        showLabel={t('password.show')}
        hideLabel={t('password.hide')}
        error={passwordDisplayError}
      />

      <PasswordField
        id="confirmPassword"
        ref={confirmRef}
        label={t('confirmPassword.label')}
        value={confirmPassword}
        onChange={handleConfirmChange}
        onBlur={() => markTouched('confirmPassword')}
        autoComplete="new-password"
        showLabel={t('confirmPassword.show')}
        hideLabel={t('confirmPassword.hide')}
        error={showConfirmError ? errors.confirmPassword : undefined}
      />

      <button type="submit" className={styles.submit} disabled={submitting || redirecting}>
        {submitting ? t('submitting') : t('submit')}
      </button>

      <p className={styles.status} role="status" aria-live="polite">
        {statusMessage}
      </p>

      <p className={styles.loginPrompt}>
        <span>{t('loginPrompt')}</span>
        <Link href="/connexion">{t('loginAction')}</Link>
      </p>
    </form>
  );
}
