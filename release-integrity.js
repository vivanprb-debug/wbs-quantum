import { APP } from './config.js';

const REQUIRED_VIEW_IDS = [
  'loading-view', 'auth-view', 'app-view', 'home-view', 'schedule-view',
  'productivity-view', 'streaks-view', 'ai-view', 'settings-view',
  'revision-view', 'insights-view', 'admin-view'
];

const REQUIRED_NAV_IDS = [
  'home', 'schedule', 'productivity', 'streaks', 'ai', 'settings',
  'revision', 'insights', 'admin'
];

export function getReleaseInfo() {
  return Object.freeze({ name: APP.name, version: APP.version, generatedAt: new Date().toISOString() });
}

export function validateReleaseShell(documentRef = globalThis.document) {
  const missingViews = REQUIRED_VIEW_IDS.filter(id => !documentRef?.getElementById(id));
  const missingNavigation = REQUIRED_NAV_IDS.filter(name => !documentRef?.querySelector(`[data-nav="${name}"]`));
  const firebaseScripts = [
    'firebase-app-compat.js',
    'firebase-auth-compat.js',
    'firebase-firestore-compat.js',
    'firebase-functions-compat.js'
  ].filter(name => ![...documentRef?.scripts || []].some(script => script.src.includes(name)));

  return Object.freeze({
    ok: missingViews.length === 0 && missingNavigation.length === 0 && firebaseScripts.length === 0,
    version: APP.version,
    missingViews,
    missingNavigation,
    missingFirebaseScripts: firebaseScripts
  });
}
