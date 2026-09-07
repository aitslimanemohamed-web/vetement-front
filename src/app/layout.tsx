import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'vetement — Environnement de test',
  description:
    "Environnement de test technique du projet vetement, une future plateforme de vente et d'achat de vêtements d'occasion.",
  // Cet environnement de test ne doit pas être indexé par les moteurs de recherche.
  // Ce n'est pas un contrôle d'accès : l'adresse reste accessible à quiconque la connaît.
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
