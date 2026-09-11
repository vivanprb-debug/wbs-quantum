import { readJson, writeJson } from './storage.js';

const KEY = uid => `sync.outbox.${uid}`;
const now = () => new Date().toISOString();
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;

function normalise(uid, op) {
  return {
    queueId: op.queueId || makeId(),
    uid,
    action: op.action,
    collection: op.collection,
    id: op.id || null,
    payload: op.payload || null,
    createdAt: op.createdAt || now()
  };
}

export function getPending(uid) {
  if (!uid) return [];
  return readJson(KEY(uid), []).filter(Boolean);
}

export function enqueue(uid, op) {
  if (!uid) throw new Error('A signed-in user is required to queue a change.');
  const pending = getPending(uid);
  const entry = normalise(uid, op);
  // Collapse repeated writes to the same document while keeping a delete authoritative.
  const sameDoc = item => item.collection === entry.collection && item.id === entry.id;
  let next = pending.filter(item => !sameDoc(item));
  if (!(entry.action === 'delete' && entry.id)) next.push(entry);
  else next.push(entry);
  writeJson(KEY(uid), next);
  return entry;
}

export function removePending(uid, queueId) {
  writeJson(KEY(uid), getPending(uid).filter(item => item.queueId !== queueId));
}

export function clearPending(uid) {
  writeJson(KEY(uid), []);
}

export function countPending(uid) { return getPending(uid).length; }
