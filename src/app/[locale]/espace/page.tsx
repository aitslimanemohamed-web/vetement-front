import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SessionWatcher } from '@/features/auth/session/SessionWatcher';
import { BottomNav } from '@/features/discover/BottomNav';
import { CategoryShortcuts } from '@/features/discover/CategoryShortcuts';
import { DiscoverHeader } from '@/features/discover/DiscoverHeader';
import { ListingsSection } from '@/features/discover/ListingsSection';
import { SearchLocationBar } from '@/features/discover/SearchLocationBar';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { SESSION_COOKIE_NAME } from '@/lib/csrf-constants';
import { getSessionUser } from '@/lib/server/session';
import styles from './page.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover' });

  return {
    title: `${t('pageTitle')} — Vetement`,
    robots: { index: false, follow: false },
  };
}

// Page protégée (US-010), désormais la page « Découvrir » (US-012). La
// vérification de session a lieu entièrement côté serveur, avant tout
// rendu — redirect() interrompt le rendu avant qu'aucun HTML ne parte vers
// le navigateur, donc un visiteur non connecté n'a jamais l'occasion de
// voir ce contenu, même brièvement.
//
// Un back-end injoignable (kind 'unknown', ex. démarrage à froid de Render)
// n'entraîne volontairement PAS de redirection : afficher un utilisateur
// légitimement connecté comme déconnecté à tort serait pire qu'un message
// d'attente — voir SessionWatcher, qui réessaie côté client.
//
// Aucune des nouvelles commandes de cette page (recherche, localisation,
// filtres, catégories, tri, favoris, vendre, messages, profil, navigation
// basse) n'est interactive : ce sont de vrais <button disabled>, jamais de
// liens href="#" (US-012, section 8) — aucune n'a donc besoin d'être un
// composant client, toute la page reste un Server Component.
export default async function EspacePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionUser(token);

  if (session.kind === 'unauthenticated') {
    redirect({ href: '/', locale });
  }

  const t = await getTranslations('discover');
  // Réutilise la clé existante (espace.offline.checking, déjà traduite dans
  // les 3 langues) plutôt que d'en dupliquer une sous "discover" — même
  // texte, même rôle ; seul le contenu de la page change avec ce ticket.
  const tOffline = await getTranslations('espace.offline');

  return (
    <>
      {session.kind === 'ok' ? (
        <>
          <DiscoverHeader username={session.user.username} />
          <main className={styles.main}>
            <SearchLocationBar />
            <CategoryShortcuts />
            <ListingsSection />
            <p className={styles.comingSoonNotice}>{t('comingSoonNotice')}</p>
          </main>
          <BottomNav />
        </>
      ) : (
        <main className={styles.main}>
          <p role="status" aria-live="polite" className={styles.offlineMessage}>
            {tOffline('checking')}
          </p>
        </main>
      )}
      <SessionWatcher initiallyOffline={session.kind === 'unknown'} />
    </>
  );
}
