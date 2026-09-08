// Clés de signaux transitoires propres à un onglet (US-010) — jamais un
// secret, seulement un indicateur booléen consommé une seule fois. Isolées
// dans ce fichier (plutôt que dans LogoutButton.tsx/SessionWatcher.tsx) pour
// que AuthStatusBanner.tsx puisse les lire sans entraîner les dépendances
// plus lourdes de ces composants (routage, appels réseau).
export const JUST_LOGGED_OUT_STORAGE_KEY = 'vetement:just-logged-out';
export const SESSION_EXPIRED_STORAGE_KEY = 'vetement:session-expired';
