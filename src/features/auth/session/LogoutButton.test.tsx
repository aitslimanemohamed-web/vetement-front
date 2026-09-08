import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/fr.json';
import { JUST_LOGGED_OUT_STORAGE_KEY } from '@/lib/auth-storage-keys';
import { LogoutButton } from './LogoutButton';

const pushSpy = vi.fn();
const refreshSpy = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: pushSpy, refresh: refreshSpy }),
}));

const callLogoutApiMock = vi.fn();
vi.mock('./session-api', () => ({
  callLogoutApi: () => callLogoutApiMock(),
}));

const broadcastLogoutMock = vi.fn();
vi.mock('@/lib/auth-broadcast', () => ({
  broadcastLogout: () => broadcastLogoutMock(),
}));

function renderButton() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <LogoutButton />
    </NextIntlClientProvider>,
  );
}

describe('LogoutButton', () => {
  beforeEach(() => {
    pushSpy.mockClear();
    refreshSpy.mockClear();
    callLogoutApiMock.mockReset();
    broadcastLogoutMock.mockClear();
    sessionStorage.clear();
  });

  it('disables itself and shows progress while the request is in flight', async () => {
    let resolveLogout: (value: { kind: 'ok' }) => void = () => {};
    callLogoutApiMock.mockReturnValue(
      new Promise((resolve) => {
        resolveLogout = resolve;
      }),
    );
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Déconnexion' }));

    const button = screen.getByRole('button', { name: 'Déconnexion…' });
    expect(button).toBeDisabled();

    resolveLogout({ kind: 'ok' });
    await screen.findByRole('button', { name: 'Déconnexion' });
  });

  it('on success: broadcasts, sets the confirmation flag, and navigates home', async () => {
    callLogoutApiMock.mockResolvedValue({ kind: 'ok' });
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Déconnexion' }));

    expect(broadcastLogoutMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(JUST_LOGGED_OUT_STORAGE_KEY)).toBe('1');
    expect(pushSpy).toHaveBeenCalledWith('/');
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('on failure: never claims success, shows a retry-able error, does not navigate', async () => {
    callLogoutApiMock.mockResolvedValue({ kind: 'unknown' });
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Déconnexion' }));

    expect(await screen.findByText('La déconnexion a échoué. Réessayez.')).toBeInTheDocument();
    expect(broadcastLogoutMock).not.toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(JUST_LOGGED_OUT_STORAGE_KEY)).toBeNull();
  });

  it('ignores a second click while a request is already in flight', async () => {
    callLogoutApiMock.mockReturnValue(new Promise(() => {})); // never resolves
    const user = userEvent.setup();
    renderButton();

    const button = screen.getByRole('button', { name: 'Déconnexion' });
    await user.click(button);
    await user.click(screen.getByRole('button', { name: 'Déconnexion…' }));

    expect(callLogoutApiMock).toHaveBeenCalledTimes(1);
  });
});
