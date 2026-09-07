'use client';

import { forwardRef, useId, useState } from 'react';
import styles from './PasswordField.module.css';

interface PasswordFieldProps {
  id: string;
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
  error?: string;
}

// Champ mot de passe réutilisable (nom d'utilisateur mis à part) : masqué par
// défaut, jamais tronqué (pas de maxLength), jamais transformé (pas de trim),
// avec un bouton afficher/masquer qui ne soumet pas le formulaire (type="button").
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { id, label, help, value, onChange, onBlur, autoComplete, showLabel, hideLabel, error },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const helpId = useId();
  const errorId = useId();

  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <div className={styles.inputRow}>
        <input
          id={id}
          name={id}
          ref={ref}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={styles.input}
        />

        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
        >
          {visible ? hideLabel : showLabel}
        </button>
      </div>

      {help && (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      )}

      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
});
