import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSessionUser } from './session';

const ORIGINAL_INTERNAL_API_URL = process.env.INTERNAL_API_URL;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('getSessionUser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.env.INTERNAL_API_URL = ORIGINAL_INTERNAL_API_URL;
  });

  it('never calls the backend when no token is provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    process.env.INTERNAL_API_URL = 'http://localhost:3001/api';

    const result = await getSessionUser(undefined);

    expect(result).toEqual({ kind: 'unauthenticated' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns unknown when INTERNAL_API_URL is not configured, never a false "authenticated"', async () => {
    delete process.env.INTERNAL_API_URL;

    const result = await getSessionUser('some-token');

    expect(result).toEqual({ kind: 'unknown' });
  });

  it('maps a 200 with the documented shape to ok, sending the token as a Bearer header', async () => {
    process.env.INTERNAL_API_URL = 'http://localhost:3001/api';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ status: 'OK', user: { id: '1', username: 'bob' } }, 200));

    const result = await getSessionUser('abc.def');

    expect(result).toEqual({ kind: 'ok', user: { id: '1', username: 'bob' } });
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('http://localhost:3001/api/auth/me');
    expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer abc.def');
  });

  it('maps a 401 to unauthenticated', async () => {
    process.env.INTERNAL_API_URL = 'http://localhost:3001/api';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ status: 'UNAUTHENTICATED' }, 401));

    expect(await getSessionUser('bad-token')).toEqual({ kind: 'unauthenticated' });
  });

  it('never confuses a network failure or timeout with a logout', async () => {
    process.env.INTERNAL_API_URL = 'http://localhost:3001/api';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    expect(await getSessionUser('some-token')).toEqual({ kind: 'unknown' });
  });

  it('treats an unexpected status or malformed body as unknown, not as authenticated', async () => {
    process.env.INTERNAL_API_URL = 'http://localhost:3001/api';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not json', { status: 200 }));

    expect(await getSessionUser('some-token')).toEqual({ kind: 'unknown' });
  });
});
