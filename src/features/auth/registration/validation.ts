export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 128;

// Lettres Unicode (y compris arabes et accentuées), marques diacritiques
// associées, chiffres décimaux, tiret et tiret bas. N'autorise aucun espace ni
// caractère de contrôle : les deux sont simplement absents de cette liste.
const USERNAME_PATTERN = /^[\p{L}\p{M}\p{Nd}_-]+$/u;

/**
 * Compte les caractères Unicode par "grappe de graphèmes" (grapheme cluster),
 * pas par unité UTF-16 (`.length`) ni par simple point de code (`Array.from`
 * seul) : une lettre de base suivie d'une marque diacritique combinante (un
 * signe de voyellation arabe, un accent latin décomposé...) reste comptée
 * comme UN SEUL caractère, conformément à ce qu'un utilisateur perçoit.
 * Repli sur le comptage par point de code si `Intl.Segmenter` n'est pas
 * disponible (tous les navigateurs ciblés par ce projet le supportent).
 *
 * Le futur back-end doit appliquer exactement la même méthode de comptage
 * pour que les limites de longueur (nom d'utilisateur, mot de passe) soient
 * cohérentes des deux côtés — voir CONTEXTE_PROJET.md.
 */
export function countCharacters(value: string): number {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(value)).length;
  }
  return Array.from(value).length;
}

export interface RegistrationMessages {
  usernameRequired: string;
  usernameLength: string;
  usernameFormat: string;
  passwordRequired: string;
  passwordTooShort: string;
  passwordTooLong: string;
  confirmRequired: string;
  confirmMismatch: string;
}

export interface RegistrationValues {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateUsername(rawValue: string, messages: RegistrationMessages): string | undefined {
  // Les espaces en début/fin ne comptent pas pour la validation, mais la
  // valeur affichée dans le champ n'est jamais modifiée par cette fonction.
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return messages.usernameRequired;
  }

  const length = countCharacters(trimmed);
  if (length < USERNAME_MIN_LENGTH || length > USERNAME_MAX_LENGTH) {
    return messages.usernameLength;
  }

  if (!USERNAME_PATTERN.test(trimmed)) {
    return messages.usernameFormat;
  }

  return undefined;
}

export function validatePassword(value: string, messages: RegistrationMessages): string | undefined {
  // Aucun trim, aucune transformation : la valeur saisie est jugée telle quelle.
  if (value.length === 0) {
    return messages.passwordRequired;
  }

  const length = countCharacters(value);
  if (length < PASSWORD_MIN_LENGTH) {
    return messages.passwordTooShort;
  }
  if (length > PASSWORD_MAX_LENGTH) {
    return messages.passwordTooLong;
  }

  return undefined;
}

export function validateConfirmPassword(
  confirmValue: string,
  passwordValue: string,
  messages: RegistrationMessages,
): string | undefined {
  if (confirmValue.length === 0) {
    return messages.confirmRequired;
  }
  if (confirmValue !== passwordValue) {
    return messages.confirmMismatch;
  }
  return undefined;
}

export function validateRegistrationForm(
  values: RegistrationValues,
  messages: RegistrationMessages,
): RegistrationErrors {
  const errors: RegistrationErrors = {};

  const usernameError = validateUsername(values.username, messages);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(values.password, messages);
  if (passwordError) errors.password = passwordError;

  const confirmError = validateConfirmPassword(values.confirmPassword, values.password, messages);
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
}
