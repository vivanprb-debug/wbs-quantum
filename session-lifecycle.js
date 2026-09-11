import { startSessionController, stopSessionController, isSessionCurrent } from './session-controller.js';
import { getState, patchState } from './state.js';
import { renderSignedIn, showPhase, showAuthError } from './auth-ui.js';
import { mountAcademicUI, clearAcademicUI } from './academic-ui.js';
import { mountHomeUI, clearHomeUI } from './home-ui.js';
import { mountProductivityUI, clearProductivityUI } from './productivity-ui.js';
import { mountStreakUI, clearStreakUI } from './streak-ui.js';
import { mountPreferencesUI, clearPreferencesUI } from './preferences-ui.js';
import { mountSearchUI, clearSearchUI } from './search-ui.js';
import { mountNotificationUI, clearNotificationUI } from './notification-ui.js';
import { mountRevisionUI, clearRevisionUI } from './revision-ui.js';
import { mountInsightsUI, clearInsightsUI } from './insights-ui.js';
import { authErrorMessage } from './errors.js';
import { mountAdminUI, clearAdminUI } from './admin-ui.js';

let navigation = null;
let cleanupCurrent = [];

export function configureSessionLifecycle({ navigationController }) {
  navigation = navigationController;
  startSessionController({
    onSignedIn: handleSignedIn,
    onSignedOut: handleSignedOut,
    onAuthError: handleAuthError
  });
}

async function handleSignedIn({ user, profile, generation }) {
  if (!isSessionCurrent(generation, user.uid)) return;
  cleanupCurrent.forEach(fn => fn?.());
  cleanupCurrent = [];
  patchState({ phase: 'ready', auth: 'signed-in', user, profile, cloud: 'Checking…', sessionGeneration: generation });
  renderSignedIn(user, profile, 'Signed in');
  showPhase('ready');

  mountAcademicUI(profile);
  mountHomeUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation });
  mountProductivityUI(user.uid, { sessionGeneration: generation }).catch(error => {
    if (!isSessionCurrent(generation, user.uid)) return;
    console.error('[WBS Quantum] productivity mount failed', error);
  });
  mountPreferencesUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation }).then(cleanup => {
    if (typeof cleanup === 'function') cleanupCurrent.push(cleanup);
  }).catch(error => {
    if (!isSessionCurrent(generation, user.uid)) return;
    console.error('[WBS Quantum] preferences mount failed', error);
  });
  const searchCleanup = mountSearchUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation });
  if (typeof searchCleanup === 'function') cleanupCurrent.push(searchCleanup);
  mountNotificationUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation }).catch(error => {
    if (!isSessionCurrent(generation, user.uid)) return;
    console.error('[WBS Quantum] notification mount failed', error);
  });
  mountStreakUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation }).catch(error => {
    if (!isSessionCurrent(generation, user.uid)) return;
    console.error('[WBS Quantum] streak mount failed', error);
  });
  mountRevisionUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation });
  mountInsightsUI({ studentProfile: profile, userId: user.uid, sessionGeneration: generation }).catch(error => {
    if (!isSessionCurrent(generation, user.uid)) return;
    console.error('[WBS Quantum] insights mount failed', error);
  });
  mountAdminUI({ user, profile, sessionGeneration: generation }).then(cleanup => {
    if (typeof cleanup === 'function') cleanupCurrent.push(cleanup);
  }).catch(error => {
    if (!isSessionCurrent(generation, user.uid)) return;
    console.error('[WBS Quantum] admin mount failed', error);
  });
  navigation?.show('home');

  // Make the new account boundary visible in diagnostics.
  patchState({ sessionGeneration: generation, profile: { ...profile } });
}

async function handleSignedOut({ generation }) {
  cleanupCurrent.forEach(fn => fn?.());
  cleanupCurrent = [];
  clearAcademicUI();
  clearHomeUI();
  clearProductivityUI();
  clearStreakUI();
  clearPreferencesUI();
  clearSearchUI();
  clearNotificationUI();
  clearRevisionUI();
  clearInsightsUI();
  clearAdminUI();
  navigation?.show('home');
  patchState({ phase: 'signed-out', auth: 'signed-out', user: null, profile: null, cloud: 'unknown', sessionGeneration: generation });
  showPhase('signed-out');
}

function handleAuthError(error) {
  cleanupCurrent.forEach(fn => fn?.());
  cleanupCurrent = [];
  clearAcademicUI();
  clearHomeUI();
  clearProductivityUI();
  clearStreakUI();
  clearPreferencesUI();
  clearSearchUI();
  clearNotificationUI();
  clearRevisionUI();
  clearInsightsUI();
  clearAdminUI();
  showAuthError(authErrorMessage(error));
  showPhase('signed-out');
  patchState({ phase: 'signed-out', auth: 'error', user: null, profile: null, error });
}

export function getSessionStatus() {
  const state = getState();
  return {
    phase: state.phase,
    auth: state.auth,
    uid: state.user?.uid || null,
    profileId: state.profile?.id || null,
    profileName: state.profile?.name || null,
    generation: state.sessionGeneration || null
  };
}

export { stopSessionController };
