import { describe, expect, it } from 'vitest';
import {
  countCharacters,
  validateConfirmPassword,
  validatePassword,
  validateUsername,
} from './validation';

const messages = {
  usernameRequired: 'usernameRequired',
  usernameLength: 'usernameLength',
  usernameFormat: 'usernameFormat',
  passwordRequired: 'passwordRequired',
  passwordTooShort: 'passwordTooShort',
  passwordTooLong: 'passwordTooLong',
  confirmRequired: 'confirmRequired',
  confirmMismatch: 'confirmMismatch',
};

describe('countCharacters', () => {
  it('counts a base letter + combining diacritic as a single character', () => {
    // "é" written as "e" + U+0301 COMBINING ACUTE ACCENT (decomposed form).
    const decomposedE = 'é';
    expect(countCharacters(decomposedE)).toBe(1);
  });

  it('counts an Arabic letter + a diacritic (tashkeel) as a single character', () => {
    // "ب" + FATHA (U+064E)
    const babWithFatha = 'بَ';
    expect(countCharacters(babWithFatha)).toBe(1);
  });

  it('counts plain ASCII normally', () => {
    expect(countCharacters('abc')).toBe(3);
  });
});

describe('validateUsername', () => {
  it('rejects an empty value', () => {
    expect(validateUsername('', messages)).toBe('usernameRequired');
  });

  it('rejects a value that is only whitespace', () => {
    expect(validateUsername('   ', messages)).toBe('usernameRequired');
  });

  it('ignores leading/trailing spaces for length and format', () => {
    expect(validateUsername('  bob  ', messages)).toBeUndefined();
  });

  it('rejects a username shorter than 3 characters', () => {
    expect(validateUsername('ab', messages)).toBe('usernameLength');
  });

  it('rejects a username longer than 30 characters', () => {
    expect(validateUsername('a'.repeat(31), messages)).toBe('usernameLength');
  });

  it('accepts exactly 3 and exactly 30 characters', () => {
    expect(validateUsername('abc', messages)).toBeUndefined();
    expect(validateUsername('a'.repeat(30), messages)).toBeUndefined();
  });

  it('rejects an internal space', () => {
    expect(validateUsername('jean dupont', messages)).toBe('usernameFormat');
  });

  it('rejects control characters', () => {
    expect(validateUsername('abcdef', messages)).toBe('usernameFormat');
  });

  it('accepts letters, digits, hyphen and underscore', () => {
    expect(validateUsername('jean-dupont_92', messages)).toBeUndefined();
  });

  it('accepts accented Latin letters', () => {
    expect(validateUsername('émilie', messages)).toBeUndefined();
  });

  it('accepts Arabic letters', () => {
    expect(validateUsername('محمد', messages)).toBeUndefined();
  });
});

describe('validatePassword', () => {
  it('rejects an empty value', () => {
    expect(validatePassword('', messages)).toBe('passwordRequired');
  });

  it('rejects a password shorter than 15 characters', () => {
    expect(validatePassword('a'.repeat(14), messages)).toBe('passwordTooShort');
  });

  it('rejects a password longer than 128 characters', () => {
    expect(validatePassword('a'.repeat(129), messages)).toBe('passwordTooLong');
  });

  it('accepts exactly 15 and exactly 128 characters', () => {
    expect(validatePassword('a'.repeat(15), messages)).toBeUndefined();
    expect(validatePassword('a'.repeat(128), messages)).toBeUndefined();
  });

  it('accepts spaces inside the password (a passphrase)', () => {
    expect(validatePassword('correct horse battery staple', messages)).toBeUndefined();
  });

  it('does not require a mix of uppercase, digits and symbols', () => {
    expect(validatePassword('lowercaseonlypassphrase', messages)).toBeUndefined();
  });
});

describe('validateConfirmPassword', () => {
  it('rejects an empty confirmation', () => {
    expect(validateConfirmPassword('', 'something', messages)).toBe('confirmRequired');
  });

  it('rejects a confirmation that does not match, case-sensitively', () => {
    expect(validateConfirmPassword('Password123456789', 'password123456789', messages)).toBe(
      'confirmMismatch',
    );
  });

  it('rejects a confirmation that differs only by trailing spaces', () => {
    expect(validateConfirmPassword('password123456789 ', 'password123456789', messages)).toBe(
      'confirmMismatch',
    );
  });

  it('accepts an exact match', () => {
    expect(validateConfirmPassword('password123456789', 'password123456789', messages)).toBeUndefined();
  });
});
