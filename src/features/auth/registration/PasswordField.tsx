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

// Icônes locales, volontairement simples (pas d'emoji, pas de nouvelle
// dépendance) : le dessin est décoratif, aria-hidden pour éviter une
// double annonce avec le nom accessible du bouton qui le contient.
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Champ mot de passe réutilisable : masqué par défaut, jamais tronqué (pas de
// maxLength), jamais transformé (pas de trim). Le bouton œil est une icône
// intégrée dans le contour du champ, en position absolue — pas un bouton
// texte à côté qui élargissait la ligne et provoquait le débordement
// horizontal corrigé en COR-008. type="button" : ne soumet jamais le
// formulaire. Le nom accessible vient de aria-label (plus de texte visible).
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

      <div className={styles.inputWrapper}>
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
          aria-label={visible ? hideLabel : showLabel}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
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
