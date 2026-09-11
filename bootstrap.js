import { initializeFirebase } from './firebase.js';
import { sendPasswordReset } from './auth-service.js';
import { configureSessionLifecycle } from './session-lifecycle.js';
import { createNavigation } from './navigation.js';
import { registerPWA, promptInstall } from './pwa-service.js';
import { validateAllAcademicProfiles } from './profile-integrity.js';
import { showAuthLoading, showAuthError, clearAuthError, setPasswordVisible, showBootStatus, showPhase } from './auth-ui.js';
import { patchState } from './state.js';
import { authErrorMessage } from './errors.js';
import { getDb } from './firebase.js';
import { mountAI } from './ai-ui.js';
import { getMaintenance } from './admin-service.js';
import { setupAccessibility } from './accessibility.js';
import { validateReleaseShell } from './release-integrity.js';

let navigation = null;
let cloudRequestId = 0;

function setupGlobalErrorHandling() {
  window.addEventListener('error', event => {
    console.error('[WBS Quantum] Unhandled runtime error', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', event => {
    console.error('[WBS Quantum] Unhandled promise rejection', event.reason);
  });
}

function cloudHealthCheck(timeoutMs = 4000) {
  const requestId = ++cloudRequestId;
  const probe = getDb().collection('appConfig').doc('health').get()
    .then(() => 'Connected')
    .catch(error => error?.code === 'permission-denied' ? 'Auth connected • Firestore restricted' : 'Auth connected • Firestore unavailable');
  const timeout = new Promise(resolve => window.setTimeout(() => resolve('Auth connected • Cloud check timed out'), timeoutMs));
  return Promise.race([probe, timeout]).then(status => requestId === cloudRequestId ? status : 'Cloud status superseded');
}

function wireUi() {
  setupAccessibility();
  setupGlobalErrorHandling();
  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', async event => {
    event.preventDefault();
    clearAuthError();
    showAuthLoading(true);
    try {
      // Auth service owns the sign-in lifecycle; the auth observer completes the session.
      const auth = window.firebase?.auth;
      if (!auth) throw new Error('Firebase Authentication is not ready yet. Please wait a moment and try again.');
      const current = auth().currentUser;
      if (current) {
        window.dispatchEvent(new CustomEvent('wbs:auth-already-signed-in'));
        return;
      }
      const { signIn } = await import('./auth-service.js');
      await signIn(document.getElementById('email').value, document.getElementById('password').value);
    } catch (error) {
      showAuthError(error.code === 'auth/timeout' ? error.message : authErrorMessage(error));
      showAuthLoading(false);
    }
  });

  document.getElementById('reset-button')?.addEventListener('click', async () => {
    clearAuthError();
    try {
      await sendPasswordReset(document.getElementById('email').value);
      showAuthError('Password reset email sent. Check your inbox.');
      document.getElementById('auth-error')?.classList.remove('error');
    } catch (error) {
      showAuthError(error.message || authErrorMessage(error));
    }
  });

  let visible = false;
  document.getElementById('toggle-password')?.addEventListener('click', () => {
    visible = !visible;
    setPasswordVisible(visible);
  });

  document.getElementById('logout-button')?.addEventListener('click', async () => {
    try {
      const { signOut } = await import('./auth-service.js');
      await signOut();
    } catch (error) {
      showAuthError(authErrorMessage(error));
    }
  });

  window.addEventListener('wbs:pwa-install', () => promptInstall());
}

async function boot() {
  try {
    // Update the boot UI immediately so a startup exception cannot leave the static HTML message forever.
    patchState({ phase: 'booting', firebase: 'loading' });
    showBootStatus('Loading Firebase securely…');

    wireUi();
    navigation = createNavigation({ defaultView: 'home' });
    mountAI();
    registerPWA({ onOfflineChange: online => {
      const status = document.getElementById('firebase-status');
      if (status) status.textContent = online ? status.textContent.replace(/^Offline • /, '') : `Offline • ${status.textContent}`;
    }}).catch(error => console.warn('[WBS Quantum] PWA setup failed', error));

    const release = validateReleaseShell();
    if (!release.ok) console.error('[WBS Quantum] Release shell integrity failure', release);

    const integrity = validateAllAcademicProfiles();
    if (!integrity.ok) console.error('[WBS Quantum] Academic profile integrity failure', integrity.failures);

    await initializeFirebase();
    patchState({ firebase: 'ready', phase: 'authenticating' });
    showBootStatus('Firebase ready • checking account…');

    configureSessionLifecycle({ navigationController: navigation });

    // Cloud configuration is informational and never blocks authentication.
    getMaintenance().then(({ data }) => {
      if (data.enabled) {
        const status = document.getElementById('firebase-status');
        if (status) status.textContent = data.message;
      }
    }).catch(() => {});

    cloudHealthCheck().then(cloud => {
      patchState({ cloud });
      const cloudStatus = document.getElementById('cloud-status');
      const firebaseStatus = document.getElementById('firebase-status');
      if (cloudStatus) cloudStatus.textContent = cloud;
      if (firebaseStatus) firebaseStatus.textContent = cloud;
    }).catch(() => {});
  } catch (error) {
    console.error('[WBS Quantum] Fatal startup error', error);
    patchState({ phase: 'signed-out', firebase: 'error', auth: 'error', error });
    showPhase('signed-out');
    showAuthError(error.message || 'WBS Quantum could not start. Please refresh and try again.');
    showAuthLoading(false);
  }
}

boot();
