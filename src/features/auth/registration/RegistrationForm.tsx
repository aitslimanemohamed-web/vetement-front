'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { DisabledActionButton } from '@/components/ui/DisabledActionButton';
import { PasswordField } from './PasswordField';
import { validateRegistrationForm, type RegistrationMessages } from './validation';
import styles from './RegistrationForm.module.css';

type FieldName = 'username' | 'password' | 'confirmPassword';

// Formulaire d'inscription (US-007) : validation entièrement locale, aucun
// appel réseau. Les valeurs ne vivent que dans l'état de ce composant — jamais
// dans l'URL, un cookie, localStorage/sessionStorage, un journal ou un outil
// d'analyse. Les deux champs de mot de passe sont effacés après une
// soumission localement valide (voir handleSubmit).
export function RegistrationForm() {
  const t = useTranslations('registration');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

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

  function markTouched(field: FieldName) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  function handleUsernameChange(value: string) {
    setUsername(value);
    if (successVisible) setSuccessVisible(false);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (successVisible) setSuccessVisible(false);
  }

  function handleConfirmChange(value: string) {
    setConfirmPassword(value);
    if (successVisible) setSuccessVisible(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ username: true, password: true, confirmPassword: true });

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

    // Validation locale réussie : aucun compte n'est créé, aucune requête
    // n'est envoyée. Les mots de passe ne sont pas conservés au-delà de ce
    // point.
    setSuccessVisible(true);
    setPassword('');
    setConfirmPassword('');
    setSubmitted(false);
    setTouched((current) => ({ ...current, password: false, confirmPassword: false }));
  }

  const usernameDescribedBy = [usernameHelpId, showUsernameError ? usernameErrorId : null]
    .filter(Boolean)
    .join(' ');

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
          aria-invalid={showUsernameError || undefined}
          aria-describedby={usernameDescribedBy}
          className={styles.input}
        />
        <p id={usernameHelpId} className={styles.help}>
          {t('username.help')}
        </p>
        {showUsernameError && (
          <p id={usernameErrorId} className={styles.error}>
            {errors.username}
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
        error={showPasswordError ? errors.password : undefined}
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

      <button type="submit" className={styles.submit}>
        {t('submit')}
      </button>

      <p className={styles.status} role="status" aria-live="polite">
        {successVisible ? t('successMessage') : ''}
      </p>

      <p className={styles.loginPrompt}>
        <span>{t('loginPrompt')}</span>
        <DisabledActionButton label={t('loginAction')} comingSoonLabel={t('comingSoon')} variant="secondary" />
      </p>
    </form>
  );
}
