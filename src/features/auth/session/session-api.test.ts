import { afterEach, describe, expect, it, vi } from 'vitest';
import { callLogoutApi, callMeApi } from './session-api';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const entry of document.cookie.split('; ')) {
    const name = entry.split('=')[0];
    if (name) document.cookie = `${name}=; max-age=0`;
  }
});

describe('callMeApi', () => {
  it('maps a 200 with the documented shape to ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ status: 'OK', user: { id: '1', username: 'bob' } }, 200),
    );

    expect(await callMeApi()).toEqual({ kind: 'ok', user: { id: '1', username: 'bob' } });
  });

  it('maps a 401 to unauthenticated', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ status: 'UNAUTHENTICATED' }, 401));

    expect(await callMeApi()).toEqual({ kind: 'unauthenticated' });
  });

  it('never confuses a network failure with a logout', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    expect(await callMeApi()).toEqual({ kind: 'unknown' });
  });
});

describe('callLogoutApi', () => {
  it('sends the CSRF cookie value as a header and maps 204 to ok', async () => {
    document.cookie = 'csrf_token=the-token';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    expect(await callLogoutApi()).toEqual({ kind: 'ok' });
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('/api/auth/logout');
    expect((init!.headers as Record<string, string>)['X-CSRF-Token']).toBe('the-token');
  });

  it('never claims success when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await callLogoutApi()).toEqual({ kind: 'unknown' });
  });

  it('never claims success on an unexpected status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 403 }));

    expect(await callLogoutApi()).toEqual({ kind: 'unknown' });
  });
});
