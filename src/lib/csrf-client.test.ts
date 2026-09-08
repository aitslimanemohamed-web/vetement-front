import { afterEach, describe, expect, it } from 'vitest';
import { getCsrfToken } from './csrf-client';

function setCookie(value: string) {
  document.cookie = value;
}

describe('getCsrfToken', () => {
  afterEach(() => {
    // Expire every cookie set during the test.
    for (const entry of document.cookie.split('; ')) {
      const name = entry.split('=')[0];
      if (name) document.cookie = `${name}=; max-age=0`;
    }
  });

  it('returns null when the cookie is absent', () => {
    expect(getCsrfToken()).toBeNull();
  });

  it('reads the csrf_token cookie value', () => {
    setCookie('csrf_token=abc123');
    expect(getCsrfToken()).toBe('abc123');
  });

  it('decodes a URL-encoded value', () => {
    setCookie(`csrf_token=${encodeURIComponent('a b/c')}`);
    expect(getCsrfToken()).toBe('a b/c');
  });

  it('picks the right cookie among several', () => {
    setCookie('other=1');
    setCookie('csrf_token=the-real-one');
    setCookie('another=2');
    expect(getCsrfToken()).toBe('the-real-one');
  });
});
