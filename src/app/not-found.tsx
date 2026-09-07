// Ce fichier gère notamment le cas d'une langue non prise en charge dans l'URL
// (ex. /de) : le layout de [locale] appelle notFound() quand le segment ne
// correspond à aucune langue connue, ce qui rend cette page à la racine (donc
// sans locale valide pour l'afficher traduite). Contenu volontairement bilingue
// et minimal plutôt qu'une erreur serveur.
import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="fr">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <h1>Page introuvable / Page not found</h1>
        <p>
          Cette page n&apos;existe pas. Retour à l&apos;accueil :{' '}
          <Link href="/fr">français</Link> — <Link href="/en">English</Link> —{' '}
          <Link href="/ar">العربية</Link>
        </p>
      </body>
    </html>
  );
}
