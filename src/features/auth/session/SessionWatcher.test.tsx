import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/fr.json';
import { SESSION_EXPIRED_STORAGE_KEY } from '@/lib/auth-storage-keys';
import { SessionWatcher } from './SessionWatcher';

// Doit rester synchronisé avec POLL_INTERVAL_MS dans SessionWatcher.tsx.
const POLL_INTERVAL_MS = 60_000;

const pushSpy = vi.fn();
const refreshSpy = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: pushSpy, refresh: refreshSpy }),
}));

const callMeApiMock = vi.fn();
vi.mock('./session-api', () => ({
  callMeApi: () => callMeApiMock(),
}));

function renderWatcher(initiallyOffline: boolean) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <SessionWatcher initiallyOffline={initiallyOffline} />
    </NextIntlClientProvider>,
  );
}

describe('SessionWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushSpy.mockClear();
    refreshSpy.mockClear();
    callMeApiMock.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows nothing when the session was already confirmed valid', () => {
    renderWatcher(false);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the offline message and a clickable retry action immediately when the server-rendered check could not confirm the session', () => {
    renderWatcher(true);
    expect(screen.getByText('Impossible de vérifier votre session pour le moment.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('retry button: triggers an immediate check, disables itself while in flight, clears offline state on success', async () => {
    let resolveCheck: (value: { kind: 'ok' }) => void = () => {};
    callMeApiMock.mockReturnValue(
      new Promise((resolve) => {
        resolveCheck = resolve;
      }),
    );
    renderWatcher(true);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    });
    expect(screen.getByRole('button', { name: 'Nouvelle tentative…' })).toBeDisabled();

    await act(async () => {
      resolveCheck({ kind: 'ok' });
    });

    expect(screen.queryByText('Impossible de vérifier votre session pour le moment.')).not.toBeInTheDocument();
  });

  it('clears the offline message once a later check succeeds', async () => {
    callMeApiMock.mockResolvedValue({ kind: 'ok' });
    renderWatcher(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });

    expect(screen.queryByText('Impossible de vérifier votre session pour le moment.')).not.toBeInTheDocument();
  });

  it('never redirects while merely offline — only an explicit "unauthenticated" does', async () => {
    callMeApiMock.mockResolvedValue({ kind: 'unknown' });
    renderWatcher(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects home and flags the session as expired once the backend explicitly says unauthenticated', async () => {
    callMeApiMock.mockResolvedValue({ kind: 'unauthenticated' });
    renderWatcher(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });

    expect(sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)).toBe('1');
    expect(pushSpy).toHaveBeenCalledWith('/');
    expect(refreshSpy).toHaveBeenCalled();
  });
});
