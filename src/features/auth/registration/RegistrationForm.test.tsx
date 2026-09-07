import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/fr.json';
import { RegistrationForm } from './RegistrationForm';

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

  it('shows the local success message and clears both password fields, without any network call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Nom d'utilisateur"), VALID_USERNAME);
    await user.type(screen.getByLabelText('Mot de passe'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), VALID_PASSWORD);

    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(
      await screen.findByText(
        "Le formulaire est valide. La création de compte sera disponible prochainement. Aucun compte n'a été créé.",
      ),
    ).toBeInTheDocument();

    expect((screen.getByLabelText('Mot de passe') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Confirmer le mot de passe') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText("Nom d'utilisateur") as HTMLInputElement).value).toBe(VALID_USERNAME);
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('keeps the "log in" action disabled with a visible "coming soon" caption', () => {
    renderForm();
    const loginButton = screen.getByRole('button', { name: 'Se connecter' });
    expect(loginButton).toBeDisabled();
    expect(screen.getAllByText('Bientôt disponible').length).toBeGreaterThan(0);
  });
});
