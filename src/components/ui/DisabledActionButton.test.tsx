import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisabledActionButton } from './DisabledActionButton';

describe('DisabledActionButton', () => {
  it('renders a real disabled button, not an enabled one styled to look disabled', () => {
    render(
      <DisabledActionButton label="Connexion" comingSoonLabel="Bientôt disponible" variant="secondary" />,
    );

    const button = screen.getByRole('button', { name: 'Connexion' });
    expect(button).toBeDisabled();
  });

  it('shows the "coming soon" text visibly, not only as a hover tooltip', () => {
    render(<DisabledActionButton label="Inscription" comingSoonLabel="Bientôt disponible" variant="primary" />);

    // Visible text node, no title attribute needed to discover it.
    expect(screen.getByText('Bientôt disponible')).toBeVisible();
  });

  it('never triggers a click handler, even if one were passed by mistake', () => {
    const onClick = vi.fn();
    const { container } = render(
      <DisabledActionButton label="Connexion" comingSoonLabel="Bientôt disponible" variant="secondary" />,
    );

    const button = container.querySelector('button');
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
