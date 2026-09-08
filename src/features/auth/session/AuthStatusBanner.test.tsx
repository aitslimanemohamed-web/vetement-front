import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/fr.json';
import { JUST_LOGGED_OUT_STORAGE_KEY, SESSION_EXPIRED_STORAGE_KEY } from '@/lib/auth-storage-keys';
import { AuthStatusBanner } from './AuthStatusBanner';

function renderBanner() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <AuthStatusBanner />
    </NextIntlClientProvider>,
  );
}

describe('AuthStatusBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('shows nothing when no signal is set', () => {
    renderBanner();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the logout confirmation once, then never again', async () => {
    sessionStorage.setItem(JUST_LOGGED_OUT_STORAGE_KEY, '1');
    renderBanner();

    expect(await screen.findByText('Vous êtes déconnecté.')).toBeInTheDocument();
    expect(sessionStorage.getItem(JUST_LOGGED_OUT_STORAGE_KEY)).toBeNull();
  });

  it('shows the session-expired message when that signal is set', async () => {
    sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, '1');
    renderBanner();

    expect(await screen.findByText('Votre session a expiré.')).toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)).toBeNull();
  });

  it('prefers the logout confirmation when both signals are somehow set', async () => {
    sessionStorage.setItem(JUST_LOGGED_OUT_STORAGE_KEY, '1');
    sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, '1');
    renderBanner();

    expect(await screen.findByText('Vous êtes déconnecté.')).toBeInTheDocument();
  });
});
