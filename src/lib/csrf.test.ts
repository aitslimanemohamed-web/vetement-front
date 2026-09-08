import { describe, expect, it } from 'vitest';
import { csrfTokensMatch, isSameOrigin } from './csrf';

describe('isSameOrigin', () => {
  const expectedOrigin = 'https://vetement-front.vercel.app';

  it('accepts a matching Origin header', () => {
    expect(isSameOrigin(expectedOrigin, null, expectedOrigin)).toBe(true);
  });

  it('rejects a mismatched Origin header (cross-site request)', () => {
    expect(isSameOrigin('https://attacker.example', null, expectedOrigin)).toBe(false);
  });

  it('falls back to Referer only when Origin is absent', () => {
    expect(isSameOrigin(null, `${expectedOrigin}/inscription`, expectedOrigin)).toBe(true);
    expect(isSameOrigin(null, 'https://attacker.example/page', expectedOrigin)).toBe(false);
  });

  it('rejects a malformed Referer rather than throwing', () => {
    expect(isSameOrigin(null, 'not a url', expectedOrigin)).toBe(false);
  });

  it('fails closed when neither Origin nor Referer is present', () => {
    expect(isSameOrigin(null, null, expectedOrigin)).toBe(false);
  });
});

describe('csrfTokensMatch', () => {
  it('matches identical, non-empty tokens', () => {
    expect(csrfTokensMatch('abc', 'abc')).toBe(true);
  });

  it('rejects a mismatch', () => {
    expect(csrfTokensMatch('abc', 'def')).toBe(false);
  });

  it('rejects when either side is missing', () => {
    expect(csrfTokensMatch(undefined, 'abc')).toBe(false);
    expect(csrfTokensMatch('abc', null)).toBe(false);
    expect(csrfTokensMatch(null, null)).toBe(false);
  });

  it('rejects two empty strings (never treats absence as a match)', () => {
    expect(csrfTokensMatch('', '')).toBe(false);
  });
});
