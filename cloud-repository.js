import { getDb } from './firebase.js';
import { readJson, writeJson } from './storage.js';
import { enqueue, getPending, removePending } from './sync-queue.js';

const COLLECTIONS = Object.freeze({ tasks: 'tasks', exams: 'exams', notes: 'notes' });

function userDoc(uid) {
  if (!uid) throw new Error('A signed-in user is required.');
  return getDb().collection('users').doc(uid);
}
function collectionRef(uid, collectionName) { return userDoc(uid).collection(collectionName); }
function cacheKey(uid, collectionName) { return `cloud.${uid}.${collectionName}`; }
function serialise(item) { return JSON.parse(JSON.stringify(item)); }
function isoFromTimestamp(value) {
  if (!value) return value;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value.seconds !== undefined) return new Date(value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6)).toISOString();
  return value;
}
function withDates(data) {
  const copy = serialise(data);
  for (const key of ['createdAt', 'updatedAt', 'dueDate', 'date']) copy[key] = isoFromTimestamp(copy[key]);
  return copy;
}
function sortItems(items) {
  return [...items].sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
}
function isOfflineLike(error) {
  return ['unavailable', 'failed-precondition', 'deadline-exceeded', 'network-request-failed'].includes(error?.code);
}

async function list(uid, collectionName) {
  const cached = readJson(cacheKey(uid, collectionName), []);
  try {
    const snap = await collectionRef(uid, collectionName).get();
    const data = sortItems(snap.docs.map(doc => withDates({ id: doc.id, ...doc.data() })));
    writeJson(cacheKey(uid, collectionName), data);
    return { data, source: 'cloud', pending: getPending(uid).filter(op => op.collection === collectionName).length };
  } catch (error) {
    console.warn(`[WBS Quantum] ${collectionName} cloud read failed`, error);
    return { data: sortItems(cached), source: 'cache', pending: getPending(uid).filter(op => op.collection === collectionName).length, error };
  }
}

async function writeCloud(uid, collectionName, id, payload) {
  await collectionRef(uid, collectionName).doc(id).set(payload, { merge: true });
}

async function deleteCloud(uid, collectionName, id) {
  await collectionRef(uid, collectionName).doc(id).delete();
}

function updateCacheAfterSave(uid, collectionName, saved) {
  const cached = readJson(cacheKey(uid, collectionName), []);
  writeJson(cacheKey(uid, collectionName), sortItems([saved, ...cached.filter(entry => entry.id !== saved.id)]));
}
function updateCacheAfterDelete(uid, collectionName, id) {
  const cached = readJson(cacheKey(uid, collectionName), []);
  writeJson(cacheKey(uid, collectionName), cached.filter(entry => entry.id !== id));
}

async function upsert(uid, collectionName, item) {
  const nowIso = new Date().toISOString();
  const id = item.id || crypto.randomUUID();
  const payload = { ...serialise(item), updatedAt: nowIso, createdAt: item.createdAt || nowIso };
  delete payload.id;
  const saved = withDates({ id, ...payload });
  try {
    await writeCloud(uid, collectionName, id, payload);
    updateCacheAfterSave(uid, collectionName, saved);
    return { item: saved, source: 'cloud', pending: 0 };
  } catch (error) {
    if (!isOfflineLike(error)) throw error;
    enqueue(uid, { action: 'upsert', collection: collectionName, id, payload });
    updateCacheAfterSave(uid, collectionName, { ...saved, syncPending: true });
    return { item: { ...saved, syncPending: true }, source: 'cache', pending: 1, error };
  }
}

async function removeItem(uid, collectionName, id) {
  try {
    await deleteCloud(uid, collectionName, id);
    updateCacheAfterDelete(uid, collectionName, id);
    return { source: 'cloud', pending: 0 };
  } catch (error) {
    if (!isOfflineLike(error)) throw error;
    enqueue(uid, { action: 'delete', collection: collectionName, id });
    updateCacheAfterDelete(uid, collectionName, id);
    return { source: 'cache', pending: 1, error };
  }
}

export async function syncPendingChanges(uid) {
  if (!uid) return { synced: 0, remaining: 0 };
  const pending = getPending(uid);
  let synced = 0;
  for (const op of pending) {
    try {
      if (op.action === 'upsert') await writeCloud(uid, op.collection, op.id, op.payload);
      else if (op.action === 'delete') await deleteCloud(uid, op.collection, op.id);
      removePending(uid, op.queueId);
      synced += 1;
    } catch (error) {
      if (isOfflineLike(error)) break;
      console.warn('[WBS Quantum] queued change rejected', error);
      removePending(uid, op.queueId);
    }
  }
  return { synced, remaining: getPending(uid).length };
}

export async function syncAllUserData(uid) {
  const result = await syncPendingChanges(uid);
  const [tasks, exams, notes] = await Promise.all([list(uid, COLLECTIONS.tasks), list(uid, COLLECTIONS.exams), list(uid, COLLECTIONS.notes)]);
  return { ...result, tasks, exams, notes };
}

export const taskRepository = {
  list: uid => list(uid, COLLECTIONS.tasks),
  save: (uid, task) => upsert(uid, COLLECTIONS.tasks, task),
  remove: (uid, id) => removeItem(uid, COLLECTIONS.tasks, id)
};
export const examRepository = {
  list: uid => list(uid, COLLECTIONS.exams),
  save: (uid, exam) => upsert(uid, COLLECTIONS.exams, exam),
  remove: (uid, id) => removeItem(uid, COLLECTIONS.exams, id)
};
export const noteRepository = {
  list: uid => list(uid, COLLECTIONS.notes),
  save: (uid, note) => upsert(uid, COLLECTIONS.notes, note),
  remove: (uid, id) => removeItem(uid, COLLECTIONS.notes, id)
};
