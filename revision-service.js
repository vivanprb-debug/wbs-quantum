import { getDb } from '../core/firebase.js';
import { loadExams } from '../exams/exam-service.js';

const COLLECTION = 'users';
const SUBCOLLECTION = 'revisionSessions';
const CACHE_PREFIX = 'wbs_quantum_revision:';

function cleanText(value, max = 160) { return String(value ?? '').trim().slice(0, max); }
function cacheKey(uid) { return `${CACHE_PREFIX}${uid}`; }
function clone(value) { return JSON.parse(JSON.stringify(value ?? [])); }

export function localDateKey(date = new Date()) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysUntil(fromDate, toDate) {
  const a = new Date(`${localDateKey(fromDate)}T00:00:00`);
  const b = new Date(`${localDateKey(toDate)}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

export function normaliseSession(input = {}) {
  const session = {
    id: input.id || undefined,
    date: cleanText(input.date, 20),
    subject: cleanText(input.subject, 80),
    title: cleanText(input.title, 160),
    minutes: Math.max(10, Math.min(180, Number(input.minutes) || 30)),
    completed: Boolean(input.completed),
    examId: cleanText(input.examId, 120),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (!session.date) throw new Error('Revision date is required.');
  if (!session.title) throw new Error('Revision session title is required.');
  if (!session.id) delete session.id;
  return session;
}

export function getCachedSessions(uid) {
  if (!uid) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(cacheKey(uid)) || '[]');
    return Array.isArray(parsed) ? clone(parsed) : [];
  } catch { return []; }
}

function setCachedSessions(uid, sessions) {
  if (!uid) return;
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(clone(sessions))); } catch {}
}

export function clearCachedSessions(uid) {
  if (!uid) return;
  try { localStorage.removeItem(cacheKey(uid)); } catch {}
}

export async function loadRevisionSessions(uid) {
  if (!uid) throw new Error('A signed-in user is required.');
  const cached = getCachedSessions(uid);
  try {
    const snap = await getDb().collection(COLLECTION).doc(uid).collection(SUBCOLLECTION).get();
    const sessions = snap.docs.map(doc => normaliseSession({ id: doc.id, ...doc.data() }))
      .sort((a, b) => `${a.date}|${a.title}`.localeCompare(`${b.date}|${b.title}`));
    setCachedSessions(uid, sessions);
    return { data: clone(sessions), synced: true };
  } catch (error) {
    return { data: clone(cached), synced: false, error };
  }
}

export async function saveRevisionSession(uid, input) {
  if (!uid) throw new Error('A signed-in user is required.');
  const session = normaliseSession(input);
  const ref = session.id
    ? getDb().collection(COLLECTION).doc(uid).collection(SUBCOLLECTION).doc(session.id)
    : getDb().collection(COLLECTION).doc(uid).collection(SUBCOLLECTION).doc();
  session.id = ref.id;
  const cached = getCachedSessions(uid).filter(item => item.id !== session.id).concat(session)
    .sort((a, b) => `${a.date}|${a.title}`.localeCompare(`${b.date}|${b.title}`));
  setCachedSessions(uid, cached);
  try {
    await ref.set(session, { merge: true });
    return { ...session, synced: true };
  } catch (error) { return { ...session, synced: false, error }; }
}

export async function deleteRevisionSession(uid, id) {
  if (!uid || !id) throw new Error('Revision session id is required.');
  const cached = getCachedSessions(uid).filter(item => item.id !== id);
  setCachedSessions(uid, cached);
  try { await getDb().collection(COLLECTION).doc(uid).collection(SUBCOLLECTION).doc(id).delete(); return { ok: true, id, synced: true }; }
  catch (error) { return { ok: true, id, synced: false, error }; }
}

export async function toggleRevisionSession(uid, id, completed) {
  if (!uid || !id) throw new Error('Revision session id is required.');
  const cached = getCachedSessions(uid);
  const next = cached.map(item => item.id === id ? { ...item, completed: Boolean(completed), updatedAt: new Date().toISOString() } : item);
  setCachedSessions(uid, next);
  try {
    await getDb().collection(COLLECTION).doc(uid).collection(SUBCOLLECTION).doc(id).set({ completed: Boolean(completed), updatedAt: new Date().toISOString() }, { merge: true });
    return { ok: true, synced: true };
  } catch (error) { return { ok: true, synced: false, error }; }
}

export function buildRevisionPlan(exams = [], today = new Date()) {
  const todayKey = localDateKey(today);
  const upcoming = exams
    .filter(exam => exam?.date && localDateKey(exam.date) >= todayKey)
    .map(exam => ({ ...exam, daysAway: daysUntil(today, exam.date) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const sessions = [];
  for (const exam of upcoming.slice(0, 5)) {
    const windowDays = exam.daysAway <= 1 ? 1 : exam.daysAway <= 4 ? 2 : 3;
    for (let offset = windowDays; offset >= 1; offset--) {
      const target = new Date(`${todayKey}T00:00:00`);
      target.setDate(target.getDate() + Math.max(0, exam.daysAway - offset));
      const date = localDateKey(target);
      if (date < todayKey || date >= exam.date) continue;
      sessions.push({
        date,
        subject: exam.subject || 'General',
        title: `${exam.title} revision`,
        minutes: exam.daysAway <= 2 ? 45 : 30,
        completed: false,
        examId: exam.id || ''
      });
    }
  }
  const unique = new Map();
  for (const session of sessions) unique.set(`${session.date}|${session.examId}`, session);
  return [...unique.values()].sort((a, b) => `${a.date}|${a.subject}`.localeCompare(`${b.date}|${b.subject}`));
}

export async function suggestRevisionSessions(uid, today = new Date()) {
  const examsResult = await loadExams(uid);
  return buildRevisionPlan(examsResult.data || [], today);
}
