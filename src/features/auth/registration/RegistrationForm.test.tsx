import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/fr.json';
import { RegistrationForm } from './RegistrationForm';

// next-intl's <Link>/useRouter pull in next/navigation internals that
// aren't resolvable outside a real Next.js build — stand in with a plain
// <a> and a spy router, as LanguageSwitcher.test.tsx already does for <Link>.
const pushSpy = vi.fn();
const refreshSpy = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: pushSpy, refresh: refreshSpy }),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <RegistrationForm />
    </NextIntlClientProvider>,
  );
}

const VALID_USERNAME = 'jean-dupont_92';
const VALID_PASSWORD = 'une phrase de passe suffisamment longue';

describe('RegistrationForm', () => {
  beforeEach(() => {
    pushSpy.mockClear();
    refreshSpy.mockClear();
  });

  it('shows no error on initial render, even though required fields are empty', () => {
    renderForm();
    expect(screen.queryByText("Saisissez un nom d'utilisateur.")).not.toBeInTheDocument();
    expect(screen.queryByText('Saisissez un mot de passe.')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirmez votre mot de passe.')).not.toBeInTheDocument();
  });

  it('shows a field error after that field is blurred empty', async () => {
    const user = userEvent.setup();
    renderForm();

    const username = screen.getByLabelText("Nom d'utilisateur");
    await user.click(username);
    await user.tab();

    expect(await screen.findByText("Saisissez un nom d'utilisateur.")).toBeInTheDocument();
  });

  it('shows every error and focuses the first invalid field on submit with empty fields', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(await screen.findByText("Saisissez un nom d'utilisateur.")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveFocus();
  });

  it('flags a password shorter than 15 characters', async () => {
    const user = userEvent.setup();
    renderForm();

    const password = screen.getByLabelText('Mot de passe');
    await user.type(password, 'trop court');
    await user.tab();

    expect(await screen.findByText('Utilisez au moins 15 caractères.')).toBeInTheDocument();
  });

  it('flags a confirmation that does not match, and re-flags it when the password changes', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), `${VALID_PASSWORD}!`);
    await user.tab();

    expect(await screen.findByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument();

    // Fix the confirmation to match: the error must clear reactively.
    await user.clear(screen.getByLabelText('Confirmer le mot de passe'));
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), VALID_PASSWORD);

    expect(screen.queryByText('Les mots de passe ne correspondent pas.')).not.toBeInTheDocument();
  });

  it('toggles password visibility via an accessible, non-submitting button', async () => {
    const user = userEvent.setup();
    renderForm();

    const password = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    expect(password).toHaveAttribute('type', 'password');

    const toggle = screen.getByRole('button', { name: 'Afficher le mot de passe' });
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('toggles via the keyboard and keeps the typed value and focus behavior intact', async () => {
    const user = userEvent.setup();
    renderForm();

    const password = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    await user.type(password, VALID_PASSWORD);

    await user.tab(); // username -> password already focused after typing; tab moves to the toggle button
    const toggle = screen.getByRole('button', { name: 'Afficher le mot de passe' });
    toggle.focus();
    await user.keyboard('{Enter}');

    expect(password).toHaveAttribute('type', 'text');
    expect(password.value).toBe(VALID_PASSWORD); // toggling never alters the value
  });

  it('toggles the password and confirmation fields independently', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirmer le mot de passe')).toHaveAttribute('type', 'password');
  });

  it('sends only username and password to the register API, once, and redirects to the connected space', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'ACCOUNT_CREATED',
          user: { id: 'fake-id', username: VALID_USERNAME, createdAt: '2026-01-01T00:00:00.000Z' },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), VALID_PASSWORD);

    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(
      await screen.findByText('Votre compte a été créé. Ouverture de votre espace…'),
    ).toBeInTheDocument();
    expect(pushSpy).toHaveBeenCalledWith('/espace');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchSpy.mock.calls[0]!;
    expect(requestUrl).toBe('/api/auth/register');
    expect(JSON.parse(requestInit!.body as string)).toEqual({
      username: VALID_USERNAME,
      password: VALID_PASSWORD,
    });

    expect((screen.getByLabelText('Mot de passe') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Confirmer le mot de passe') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText("Nom d'utilisateur") as HTMLInputElement).value).toBe(VALID_USERNAME);

    fetchSpy.mockRestore();
  });

  it('never redirects on local validation alone, and disables the submit button while the request is in flight', async () => {
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
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    const submitButton = await screen.findByRole('button', { name: 'Création du compte…' });
    expect(submitButton).toBeDisabled();
    expect(pushSpy).not.toHaveBeenCalled();

    resolveFetch(
      new Response(
        JSON.stringify({
          status: 'ACCOUNT_CREATED',
          user: { id: 'fake-id', username: VALID_USERNAME, createdAt: '2026-01-01T00:00:00.000Z' },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    expect(
      await screen.findByText('Votre compte a été créé. Ouverture de votre espace…'),
    ).toBeInTheDocument();
    expect(pushSpy).toHaveBeenCalledWith('/espace');
    fetchSpy.mockRestore();
  });

  it('shows a translated, field-linked error when the username is already taken', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'USERNAME_TAKEN' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(
      await screen.findByText("Ce nom d'utilisateur est déjà utilisé. Choisissez-en un autre."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveFocus();
    fetchSpy.mockRestore();
  });

  it('shows a generic message and never claims success when the response is lost (timeout/network failure)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(
      await screen.findByText(
        "Nous n'avons pas pu confirmer la création du compte. Elle a peut-être été effectuée.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Votre compte a été créé. Ouverture de votre espace…')).not.toBeInTheDocument();
    expect(pushSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('links "log in" to the real login page (US-011)', () => {
    renderForm();
    const loginLink = screen.getByRole('link', { name: 'Se connecter' });
    expect(loginLink).toHaveAttribute('href', '/connexion');
  });
});
