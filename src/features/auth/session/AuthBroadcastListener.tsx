'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { subscribeToLogout } from '@/lib/auth-broadcast';

// Monté une fois par page (voir src/app/[locale]/layout.tsx). Ne rend rien :
// réagit à une déconnexion déclenchée dans un AUTRE onglet en redemandant le
// rendu serveur de la page courante — si celle-ci est protégée (/espace),
// cela déclenche sa redirection normale vers l'accueil, exactement comme si
// la déconnexion avait eu lieu dans cet onglet (US-010, section 10).
export function AuthBroadcastListener() {
  const router = useRouter();

  useEffect(() => subscribeToLogout(() => router.refresh()), [router]);

  return null;
}
