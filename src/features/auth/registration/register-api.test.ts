import { afterEach, describe, expect, it, vi } from 'vitest';
import { callRegisterApi } from './register-api';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('callRegisterApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a 201 with the documented shape to success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ status: 'ACCOUNT_CREATED', user: { id: '1', username: 'bob', createdAt: '2026-01-01' } }, 201),
    );

    const result = await callRegisterApi('bob', 'une phrase de passe suffisamment longue');

    expect(result).toEqual({
      kind: 'success',
      user: { id: '1', username: 'bob', createdAt: '2026-01-01' },
    });
  });

  it('maps VALIDATION_ERROR with field codes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ status: 'VALIDATION_ERROR', fieldErrors: { username: 'USERNAME_LENGTH' } }, 400),
    );

    const result = await callRegisterApi('ab', 'une phrase de passe suffisamment longue');

    expect(result).toEqual({ kind: 'field-error', fieldErrors: { username: 'USERNAME_LENGTH', password: undefined } });
  });

  it.each([
    ['USERNAME_TAKEN', 'username-taken'],
    ['PASSWORD_TOO_COMMON', 'password-too-common'],
    ['RATE_LIMITED', 'rate-limited'],
    ['SERVICE_UNAVAILABLE', 'service-unavailable'],
    ['SOMETHING_NEW_AND_UNKNOWN', 'unexpected'],
  ] as const)('maps status %s to kind %s', async (status, kind) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ status }, 400));

    const result = await callRegisterApi('bob', 'une phrase de passe suffisamment longue');

    expect(result.kind).toBe(kind);
  });

  it('maps a network failure (e.g. an aborted request) to unknown-result, never to an error status', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const result = await callRegisterApi('bob', 'une phrase de passe suffisamment longue');

    expect(result).toEqual({ kind: 'unknown-result' });
  });

  it('maps a non-JSON or malformed response body to unexpected, not to success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not json', { status: 201 }));

    const result = await callRegisterApi('bob', 'une phrase de passe suffisamment longue');

    expect(result.kind).toBe('unexpected');
  });

  it('never calls fetch when NEXT_PUBLIC_API_URL is not configured', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const original = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const result = await callRegisterApi('bob', 'une phrase de passe suffisamment longue');

    expect(result).toEqual({ kind: 'unknown-result' });
    expect(fetchSpy).not.toHaveBeenCalled();

    process.env.NEXT_PUBLIC_API_URL = original;
  });
});
