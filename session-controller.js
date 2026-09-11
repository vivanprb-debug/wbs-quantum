import { listenToAuth, signOut } from './auth-service.js';
import { resolveProfile } from './profile-registry.js';
import { patchState } from './state.js';

let unsubscribe = null;
let generation = 0;
let active = null;
let started = false;

function newGeneration() {
  generation += 1;
  return generation;
}

export function getSessionGeneration() {
  return generation;
}

export function isSessionCurrent(token, uid) {
  return token === generation && (!uid || active?.uid === uid);
}

export function getActiveSession() {
  return active ? { ...active, generation } : null;
}

export function startSessionController({
  onSignedIn,
  onSignedOut,
  onAuthError
} = {}) {
  if (started) return unsubscribe;
  started = true;
  unsubscribe = listenToAuth(
    async user => {
      const token = newGeneration();
      if (!user) {
        active = null;
        patchState({ phase: 'signed-out', auth: 'signed-out', user: null, profile: null, sessionGeneration: token });
        await onSignedOut?.({ generation: token });
        return;
      }

      // Never carry the previous student's state into this session.
      active = { uid: user.uid, email: user.email || '' };
      patchState({ phase: 'authenticating', auth: 'signed-in', user, profile: null, sessionGeneration: token });

      const profile = resolveProfile(user);
      if (!profile) {
        active = null;
        await signOut().catch(() => {});
        patchState({ phase: 'signed-out', auth: 'error', user: null, profile: null, error: new Error('Student profile could not be resolved.') });
        onAuthError?.(new Error('Student profile could not be resolved.'));
        return;
      }

      // Every downstream operation receives this exact profile + generation token.
      patchState({ phase: 'profile-ready', profile, sessionGeneration: token });
      await onSignedIn?.({ user, profile, generation: token });
    },
    error => {
      const token = newGeneration();
      active = null;
      patchState({ phase: 'signed-out', auth: 'error', user: null, profile: null, error, sessionGeneration: token });
      onAuthError?.(error);
    }
  );
  return unsubscribe;
}

export function stopSessionController() {
  newGeneration();
  active = null;
  unsubscribe?.();
  unsubscribe = null;
  started = false;
}
