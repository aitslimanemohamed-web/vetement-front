import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';

vi.mock('next-intl', () => ({
  useLocale: () => 'fr',
  useTranslations: () => (key: string) => (key === 'label' ? 'Choisir la langue' : key),
}));

vi.mock('@/i18n/navigation', () => ({
  // Simplified stand-in for next-intl's <Link>: enough to assert labels,
  // active state and that each option targets its own locale.
  Link: ({
    children,
    locale,
    'aria-current': ariaCurrent,
    className,
  }: {
    children: React.ReactNode;
    locale: string;
    'aria-current'?: 'true';
    className?: string;
  }) => (
    <a href={`/${locale}`} aria-current={ariaCurrent} className={className}>
      {children}
    </a>
  ),
  usePathname: () => '/',
}));

vi.mock('@/i18n/routing', () => ({
  routing: { locales: ['fr', 'en', 'ar'] },
}));

describe('LanguageSwitcher', () => {
  it('renders the three languages under their own native name', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('link', { name: 'Français' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'العربية' })).toBeInTheDocument();
  });

  it('marks only the current locale as active', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('link', { name: 'Français' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'English' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'العربية' })).not.toHaveAttribute('aria-current');
  });

  it('links each option to its own locale', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en');
    expect(screen.getByRole('link', { name: 'العربية' })).toHaveAttribute('href', '/ar');
  });
});
