import { getDb } from '../core/firebase.js';

const STREAKS = 'streaks';
const LEADERBOARD = 'leaderboard';

export const ACHIEVEMENTS = Object.freeze([
  { id: 'starter', name: 'Getting Started', description: 'Reach a 3-day streak', threshold: 3, points: 10, icon: '🌱' },
  { id: 'week', name: 'One Week', description: 'Reach a 7-day streak', threshold: 7, points: 25, icon: '🔥' },
  { id: 'fortnight', name: 'Fortnight', description: 'Reach a 14-day streak', threshold: 14, points: 50, icon: '⚡' },
  { id: 'month', name: 'One Month', description: 'Reach a 30-day streak', threshold: 30, points: 100, icon: '🏆' },
  { id: 'two-months', name: 'Unstoppable', description: 'Reach a 60-day streak', threshold: 60, points: 200, icon: '💎' },
  { id: 'century', name: '100 Days', description: 'Reach a 100-day streak', threshold: 100, points: 500, icon: '👑' }
]);

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateDifferenceInDays(a, b) {
  const first = new Date(`${a}T00:00:00`);
  const second = new Date(`${b}T00:00:00`);
  return Math.round((second - first) / 86400000);
}

export function calculateClaim(previous, today) {
  if (!previous?.lastClaimDate) return { changed: true, currentStreak: 1, totalDays: 1, reason: 'first' };
  const gap = dateDifferenceInDays(previous.lastClaimDate, today);
  if (gap === 0) return { changed: false, currentStreak: Number(previous.currentStreak || 0), totalDays: Number(previous.totalDays || 0), reason: 'already-claimed' };
  if (gap === 1) return { changed: true, currentStreak: Number(previous.currentStreak || 0) + 1, totalDays: Number(previous.totalDays || 0) + 1, reason: 'continued' };
  return { changed: true, currentStreak: 1, totalDays: Number(previous.totalDays || 0) + 1, reason: 'reset' };
}

export function earnedAchievements(currentStreak, existing = []) {
  const known = new Set(existing);
  return ACHIEVEMENTS.filter(item => currentStreak >= item.threshold && !known.has(item.id)).map(item => item.id);
}

export function calculateScore({ totalDays = 0, currentStreak = 0, longestStreak = 0, achievements = [] } = {}) {
  const points = ACHIEVEMENTS.filter(item => achievements.includes(item.id)).reduce((sum, item) => sum + item.points, 0);
  return Number(totalDays) * 10 + Number(currentStreak) * 5 + Number(longestStreak) * 5 + points;
}

function clean(data) {
  return JSON.parse(JSON.stringify(data || {}));
}

export async function getStreak(uid) {
  if (!uid) throw new Error('A signed-in user is required.');
  const snap = await getDb().collection(STREAKS).doc(uid).get();
  return snap.exists ? { id: snap.id, ...clean(snap.data()) } : {
    id: uid, currentStreak: 0, longestStreak: 0, totalDays: 0, lastClaimDate: null, achievements: [], score: 0
  };
}

export async function claimToday(uid, displayName) {
  if (!uid) throw new Error('A signed-in user is required.');
  const today = localDateKey();
  const db = getDb();
  const streakRef = db.collection(STREAKS).doc(uid);
  let result = null;

  await db.runTransaction(async tx => {
    const snap = await tx.get(streakRef);
    const previous = snap.exists ? snap.data() : {};
    const claim = calculateClaim(previous, today);
    if (!claim.changed) {
      result = { ...clean(previous), id: uid, claimedToday: true, newlyEarned: [] };
      return;
    }
    const currentStreak = claim.currentStreak;
    const longestStreak = Math.max(Number(previous.longestStreak || 0), currentStreak);
    const achievements = [...new Set([...(previous.achievements || []), ...earnedAchievements(currentStreak, previous.achievements || [])])];
    const score = calculateScore({ totalDays: claim.totalDays, currentStreak, longestStreak, achievements });
    const next = {
      currentStreak,
      longestStreak,
      totalDays: claim.totalDays,
      lastClaimDate: today,
      achievements,
      score,
      displayName: String(displayName || 'Student').slice(0, 80),
      updatedAt: new Date().toISOString()
    };
    tx.set(streakRef, next, { merge: true });
    result = { ...next, id: uid, claimedToday: true, newlyEarned: earnedAchievements(currentStreak, previous.achievements || []) };
  });

  if (result?.claimedToday && result?.lastClaimDate === today) {
    await db.collection(LEADERBOARD).doc(uid).set({
      displayName: result.displayName || String(displayName || 'Student').slice(0, 80),
      currentStreak: Number(result.currentStreak || 0),
      longestStreak: Number(result.longestStreak || 0),
      totalDays: Number(result.totalDays || 0),
      achievements: Array.isArray(result.achievements) ? result.achievements.length : 0,
      score: Number(result.score || 0),
      premium: true,
      updatedAt: result.updatedAt || new Date().toISOString()
    }, { merge: true });
  }
  return result;
}

export function subscribeLeaderboard(onChange, onError) {
  return getDb().collection(LEADERBOARD).orderBy('score', 'desc').limit(25).onSnapshot(
    snap => onChange(snap.docs.map((doc, index) => ({ rank: index + 1, id: doc.id, ...clean(doc.data()) }))),
    error => onError?.(error)
  );
}

export function clearStreak(uid) {
  if (!uid) return Promise.resolve();
  return Promise.all([
    getDb().collection(STREAKS).doc(uid).delete().catch(() => {}),
    getDb().collection(LEADERBOARD).doc(uid).delete().catch(() => {})
  ]);
}
