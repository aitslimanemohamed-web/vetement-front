import { afterEach, describe, expect, it, vi } from 'vitest';
import { broadcastLogout, subscribeToLogout } from './auth-broadcast';

afterEach(() => {
  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch {
    // ignore
  }
});

describe('auth-broadcast', () => {
  it('never transports a secret — only a fixed, contentless signal', () => {
    // Vérification statique de l'intention (US-010, section 10) : le seul
    // paramètre transporté est un type de message fixe, jamais une valeur
    // dynamique (token, id...).
    const originalPostMessage = BroadcastChannel.prototype.postMessage;
    const seen: unknown[] = [];
    BroadcastChannel.prototype.postMessage = function (message: unknown) {
      seen.push(message);
      return originalPostMessage.call(this, message);
    };

    broadcastLogout();

    expect(seen).toEqual([{ type: 'logout' }]);
    BroadcastChannel.prototype.postMessage = originalPostMessage;
  });

  it('delivers a broadcast logout to a subscriber', async () => {
    const onLogout = vi.fn();
    const unsubscribe = subscribeToLogout(onLogout);

    broadcastLogout();

    await vi.waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
    unsubscribe();
  });

  it('cleans up so a later broadcast is not delivered after unsubscribing', async () => {
    const onLogout = vi.fn();
    const unsubscribe = subscribeToLogout(onLogout);
    unsubscribe();

    broadcastLogout();
    // Laisse une chance à un éventuel message tardif d'arriver, pour ne pas
    // simplement passer parce que le test se termine trop tôt.
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onLogout).not.toHaveBeenCalled();
  });

  it('falls back to the storage event with a non-secret timestamp payload', () => {
    const onLogout = vi.fn();
    const unsubscribe = subscribeToLogout(onLogout);

    // Simule ce qui se passerait dans un AUTRE onglet : l'évènement
    // "storage" natif du navigateur porte la nouvelle valeur, jamais un
    // secret — seulement un horodatage.
    window.dispatchEvent(new StorageEvent('storage', { key: 'vetement:logout-at', newValue: String(Date.now()) }));

    expect(onLogout).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('ignores unrelated storage events', () => {
    const onLogout = vi.fn();
    const unsubscribe = subscribeToLogout(onLogout);

    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated-key', newValue: '1' }));

    expect(onLogout).not.toHaveBeenCalled();
    unsubscribe();
  });
});
