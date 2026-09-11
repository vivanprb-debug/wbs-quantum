let deferredInstallPrompt = null;
let registration = null;

export async function registerPWA({ onReady, onOfflineChange, onUpdate } = {}) {
  if (!('serviceWorker' in navigator)) return { supported: false };
  try {
    registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) onUpdate?.(registration);
      });
    });
    onReady?.(registration);
  } catch (error) {
    console.warn('[WBS Quantum] service worker registration failed', error);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent('wbs:pwa-install-available'));
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('wbs:pwa-installed'));
  });
  const report = () => onOfflineChange?.(navigator.onLine);
  window.addEventListener('online', report);
  window.addEventListener('offline', report);
  report();
  return { supported: true, registration };
}

export async function promptInstall() {
  if (!deferredInstallPrompt) return false;
  deferredInstallPrompt.prompt();
  const result = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return result?.outcome === 'accepted';
}

export async function updatePWA() {
  try {
    await registration?.update();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
  } catch (error) {
    console.warn('[WBS Quantum] PWA update failed', error);
  }
  return false;
}
