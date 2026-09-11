import { getDb } from './firebase.js';

const COLLECTION = 'users';
const DOCUMENT = 'settings';
const CACHE_PREFIX = 'wbs_quantum_preferences:';

export const DEFAULT_PREFERENCES = Object.freeze({
  scheduleView: 'day',
  compactTasks: false,
  taskDefaultPriority: 'medium',
  streakReminders: true,
  aiSuggestions: true,
  displayName: '',
  studyGoal: 'Stay organised',
  favouriteSubject: 'Maths'
});

function cacheKey(uid) { return `${CACHE_PREFIX}${uid}`; }
function clean(value) { return JSON.parse(JSON.stringify(value ?? {})); }
function safeText(value, fallback = '', max = 60) {
  const text = String(value ?? '').trim().replace(/[<>]/g, '');
  return text.slice(0, max) || fallback;
}

export function normalizePreferences(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    scheduleView: source.scheduleView === 'week' ? 'week' : DEFAULT_PREFERENCES.scheduleView,
    compactTasks: Boolean(source.compactTasks),
    taskDefaultPriority: ['low', 'medium', 'high'].includes(source.taskDefaultPriority) ? source.taskDefaultPriority : DEFAULT_PREFERENCES.taskDefaultPriority,
    streakReminders: source.streakReminders !== false,
    aiSuggestions: source.aiSuggestions !== false,
    displayName: safeText(source.displayName, DEFAULT_PREFERENCES.displayName, 40),
    studyGoal: safeText(source.studyGoal, DEFAULT_PREFERENCES.studyGoal, 80),
    favouriteSubject: safeText(source.favouriteSubject, DEFAULT_PREFERENCES.favouriteSubject, 40)
  };
}

export function getCachedPreferences(uid) {
  if (!uid) return { ...DEFAULT_PREFERENCES };
  try { return normalizePreferences(JSON.parse(localStorage.getItem(cacheKey(uid)) || '{}')); }
  catch { return { ...DEFAULT_PREFERENCES }; }
}

function setCachedPreferences(uid, preferences) {
  if (!uid) return;
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(normalizePreferences(preferences))); } catch {}
}

export async function getPreferences(uid) {
  if (!uid) throw new Error('A signed-in user is required.');
  const cached = getCachedPreferences(uid);
  try {
    const snap = await getDb().collection(COLLECTION).doc(uid).collection('preferences').doc(DOCUMENT).get();
    const preferences = snap.exists ? normalizePreferences(snap.data()) : cached;
    setCachedPreferences(uid, preferences);
    return clean(preferences);
  } catch { return clean(cached); }
}

export async function savePreferences(uid, patch) {
  if (!uid) throw new Error('A signed-in user is required.');
  const next = normalizePreferences({ ...getCachedPreferences(uid), ...(patch || {}) });
  setCachedPreferences(uid, next);
  try {
    await getDb().collection(COLLECTION).doc(uid).collection('preferences').doc(DOCUMENT).set({ ...next, updatedAt: new Date().toISOString() }, { merge: true });
    return { ...next, synced: true };
  } catch (error) { return { ...next, synced: false, error }; }
}

export function clearCachedPreferences(uid) {
  if (!uid) return;
  try { localStorage.removeItem(cacheKey(uid)); } catch {}
}
