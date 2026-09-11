import { getDb } from './firebase.js';
import { readJson, writeJson } from './storage.js';

const DEV_EMAIL = 'dev@wbsquantum.app';
const DEFAULT_FEATURES = Object.freeze({
  ai: true,
  notifications: true,
  revision: true,
  insights: true,
  leaderboard: true
});

const clone = value => JSON.parse(JSON.stringify(value));
const cacheKey = name => `admin.config.${name}`;

function isDeveloper(user) {
  return String(user?.email || '').trim().toLowerCase() === DEV_EMAIL;
}

function normaliseMaintenance(data) {
  return {
    enabled: Boolean(data?.enabled),
    message: String(data?.message || 'WBS Quantum is temporarily unavailable. Please try again shortly.').slice(0, 180),
    updatedAt: data?.updatedAt || null,
    updatedBy: data?.updatedBy || null
  };
}

function normaliseFeatures(data) {
  return { ...DEFAULT_FEATURES, ...(data || {}) };
}

export async function getMaintenance() {
  const cached = normaliseMaintenance(readJson(cacheKey('maintenance'), {}));
  try {
    const snap = await getDb().collection('appConfig').doc('maintenance').get();
    const value = normaliseMaintenance(snap.exists ? snap.data() : {});
    writeJson(cacheKey('maintenance'), value);
    return { data: value, source: 'cloud' };
  } catch (error) {
    return { data: cached, source: 'cache', error };
  }
}

export async function getFeatures() {
  const cached = normaliseFeatures(readJson(cacheKey('features'), DEFAULT_FEATURES));
  try {
    const snap = await getDb().collection('appConfig').doc('features').get();
    const value = normaliseFeatures(snap.exists ? snap.data() : DEFAULT_FEATURES);
    writeJson(cacheKey('features'), value);
    return { data: value, source: 'cloud' };
  } catch (error) {
    return { data: cached, source: 'cache', error };
  }
}

async function saveConfig(user, document, payload) {
  if (!isDeveloper(user)) throw new Error('Developer access is required.');
  const data = { ...clone(payload), updatedAt: new Date().toISOString(), updatedBy: user.email };
  await getDb().collection('appConfig').doc(document).set(data, { merge: true });
  writeJson(cacheKey(document), data);
  return data;
}

export async function saveMaintenance(user, data) {
  return saveConfig(user, 'maintenance', normaliseMaintenance(data));
}

export async function saveFeatures(user, data) {
  return saveConfig(user, 'features', normaliseFeatures(data));
}

export { DEV_EMAIL, DEFAULT_FEATURES, isDeveloper };
