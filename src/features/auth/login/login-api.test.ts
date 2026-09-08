import { afterEach, describe, expect, it, vi } from 'vitest';
import { callLoginApi } from './login-api';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('callLoginApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a 200 with the documented shape to success, calling the same-origin relay route', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ status: 'LOGGED_IN', user: { id: '1', username: 'bob' } }, 200));

    const result = await callLoginApi('bob', 'une phrase de passe suffisamment longue');

    expect(result).toEqual({ kind: 'success', user: { id: '1', username: 'bob' } });
    expect(fetchSpy.mock.calls[0]![0]).toBe('/api/auth/login');
  });

  it('maps VALIDATION_ERROR with field codes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ status: 'VALIDATION_ERROR', fieldErrors: { username: 'USERNAME_REQUIRED' } }, 400),
    );

    const result = await callLoginApi('', 'x');

    expect(result).toEqual({ kind: 'field-error', fieldErrors: { username: 'USERNAME_REQUIRED', password: undefined } });
  });

  it.each([
    ['INVALID_CREDENTIALS', 'invalid-credentials'],
    ['RATE_LIMITED', 'rate-limited'],
    ['SERVICE_UNAVAILABLE', 'service-unavailable'],
    ['SOMETHING_NEW_AND_UNKNOWN', 'unexpected'],
  ] as const)('maps status %s to kind %s', async (status, kind) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ status }, 401));

    const result = await callLoginApi('bob', 'wrong-password');

    expect(result.kind).toBe(kind);
  });

  it('maps a network failure (e.g. an aborted request) to unknown-result, never to an error status', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const result = await callLoginApi('bob', 'une phrase de passe suffisamment longue');

    expect(result).toEqual({ kind: 'unknown-result' });
  });

  it('maps a non-JSON or malformed response body to unexpected, not to success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not json', { status: 200 }));

    const result = await callLoginApi('bob', 'une phrase de passe suffisamment longue');

    expect(result.kind).toBe('unexpected');
  });
});
