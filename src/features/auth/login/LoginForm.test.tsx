import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/fr.json';
import { LoginForm } from './LoginForm';

const pushSpy = vi.fn();
const refreshSpy = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: pushSpy, refresh: refreshSpy }),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <LoginForm />
    </NextIntlClientProvider>,
  );
}

const VALID_USERNAME = 'jean-dupont_92';
const VALID_PASSWORD = 'une phrase de passe suffisamment longue';

describe('LoginForm', () => {
  beforeEach(() => {
    pushSpy.mockClear();
    refreshSpy.mockClear();
  });

  it('shows no error on initial render, even though required fields are empty', () => {
    renderForm();
    expect(screen.queryByText("Saisissez un nom d'utilisateur.")).not.toBeInTheDocument();
    expect(screen.queryByText('Saisissez un mot de passe.')).not.toBeInTheDocument();
  });

  it('shows a field error after that field is blurred empty', async () => {
    const user = userEvent.setup();
    renderForm();

    const username = screen.getByLabelText("Nom d'utilisateur");
    await user.click(username);
    await user.tab();

    expect(await screen.findByText("Saisissez un nom d'utilisateur.")).toBeInTheDocument();
  });

  it('shows both errors and focuses the first invalid field on submit with empty fields', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText("Saisissez un nom d'utilisateur.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveFocus();
  });

  it('applies no format/length validation locally — only presence is checked', async () => {
    const user = userEvent.setup();
    renderForm();

    // Un nom d'un seul caractère serait invalide à l'inscription (min 3),
    // mais la connexion ne doit jamais appliquer les règles de création
    // (US-011, section 3).
    await user.type(screen.getByLabelText("Nom d'utilisateur"), 'a');
    await user.tab();

    expect(screen.queryByText("Saisissez un nom d'utilisateur.")).not.toBeInTheDocument();
  });

  it('toggles password visibility via the existing accessible eye icon', async () => {
    const user = userEvent.setup();
    renderForm();

    const password = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');

    await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('sends only username and password to the login API, once, and redirects to the connected space', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'LOGGED_IN', user: { id: '1', username: VALID_USERNAME } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Connexion réussie. Ouverture de votre espace…')).toBeInTheDocument();
    expect(pushSpy).toHaveBeenCalledWith('/espace');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchSpy.mock.calls[0]!;
    expect(requestUrl).toBe('/api/auth/login');
    expect(JSON.parse(requestInit!.body as string)).toEqual({ username: VALID_USERNAME, password: VALID_PASSWORD });

    expect((screen.getByLabelText('Mot de passe') as HTMLInputElement).value).toBe('');

    fetchSpy.mockRestore();
  });

  it('shows one identical, non-field-specific error for both an unknown username and a wrong password', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ status: 'INVALID_CREDENTIALS' }), { status: 401 }));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText("Nom d'utilisateur ou mot de passe incorrect.")).toBeInTheDocument();
    // Le message n'est jamais rattaché à un champ précis (ne doit pas
    // révéler si le nom existe) — vérifié en s'assurant qu'aucun des deux
    // champs n'est marqué aria-invalid.
    expect(screen.getByLabelText("Nom d'utilisateur")).not.toHaveAttribute('aria-invalid', 'true');
    expect(pushSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('disables the submit button while the request is in flight, never shows redirect text prematurely', async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    const submitButton = await screen.findByRole('button', { name: 'Connexion…' });
    expect(submitButton).toBeDisabled();
    expect(pushSpy).not.toHaveBeenCalled();

    resolveFetch(
      new Response(JSON.stringify({ status: 'LOGGED_IN', user: { id: '1', username: VALID_USERNAME } }), {
        status: 200,
      }),
    );

    expect(await screen.findByText('Connexion réussie. Ouverture de votre espace…')).toBeInTheDocument();
    fetchSpy.mockRestore();
  });

  it('shows a rate-limited message distinct from invalid credentials', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ status: 'RATE_LIMITED' }), { status: 429 }));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(
      await screen.findByText('Trop de tentatives. Patientez quelques instants avant de réessayer.'),
    ).toBeInTheDocument();
    fetchSpy.mockRestore();
  });

  it('shows a generic message and never claims success when the response is lost (timeout/network failure)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(
      await screen.findByText("Nous n'avons pas pu confirmer la connexion. Réessayez si besoin."),
    ).toBeInTheDocument();
    expect(pushSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('links "create an account" to the registration page', () => {
    renderForm();
    const link = screen.getByRole('link', { name: 'Créer un compte' });
    expect(link).toHaveAttribute('href', '/inscription');
  });
});
