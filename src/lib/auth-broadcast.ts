// Diffusion de la déconnexion aux autres onglets du même site (US-010,
// section 10) — jamais de secret transporté, seulement un signal. Deux
// mécanismes redondants : BroadcastChannel (moderne, direct) et un repli
// via localStorage + l'évènement "storage" natif, qui ne se déclenche que
// dans les AUTRES onglets que celui qui écrit — exactement ce qu'il faut ici.
const CHANNEL_NAME = 'vetement-auth';
const STORAGE_KEY = 'vetement:logout-at';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function broadcastLogout(): void {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'logout' });
    channel.close();
  }

  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Stockage indisponible (navigation privée stricte, quota dépassé) :
    // BroadcastChannel reste la voie principale, ce repli est secondaire.
  }
}

export function subscribeToLogout(onLogout: () => void): () => void {
  const cleanups: Array<() => void> = [];

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const handleMessage = (event: MessageEvent) => {
      if (isRecord(event.data) && event.data.type === 'logout') onLogout();
    };
    channel.addEventListener('message', handleMessage);
    cleanups.push(() => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    });
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onLogout();
  };
  window.addEventListener('storage', handleStorage);
  cleanups.push(() => window.removeEventListener('storage', handleStorage));

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
