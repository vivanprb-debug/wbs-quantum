import { ACHIEVEMENTS, claimToday, getStreak, localDateKey, subscribeLeaderboard } from './streak-service.js';
import { listKnownProfiles } from '../profiles/profile-registry.js';

let state = { uid: null, profile: null, generation: null, streak: null, leaderboard: [], loading: true, claiming: false, error: null };
let unsubscribeLeaderboard = null;

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function claimedToday(streak) { return streak?.lastClaimDate === localDateKey(); }
function achievementData(ids = []) { return ACHIEVEMENTS.filter(item => ids.includes(item.id)); }
function mergeKnownLeaderboard(rows = []) {
  const byId = new Map(rows.map(row => [row.id, row]));
  for (const profile of listKnownProfiles()) {
    if (!byId.has(profile.id)) byId.set(profile.id, { id: profile.id, displayName: profile.name, currentStreak: 0, longestStreak: 0, totalDays: 0, achievements: 0, score: 0, premium: true });
  }
  return [...byId.values()].sort((a,b) => Number(b.score || 0) - Number(a.score || 0) || String(a.displayName || '').localeCompare(String(b.displayName || ''))).map((row, index) => ({ ...row, rank: index + 1 }));
}

function render() {
  const wrap = $('streaks-view');
  if (!wrap) return;
  const streak = state.streak || { currentStreak: 0, longestStreak: 0, totalDays: 0, achievements: [], score: 0 };
  const achievements = achievementData(streak.achievements);
  const claimed = claimedToday(streak);
  const leaderboard = mergeKnownLeaderboard(state.leaderboard);
  const leaderRows = leaderboard.length ? leaderboard.map(row => `
    <div class="leader-row ${row.id === state.uid ? 'you' : ''}">
      <span class="leader-rank">${row.rank}</span>
      <div class="leader-person"><strong>${esc(row.displayName || 'Student')}</strong><small>${row.premium === false ? 'Standard' : 'Premium'}</small></div>
      <div class="leader-streak">🔥 ${Number(row.currentStreak || 0)}</div>
      <strong class="leader-score">${Number(row.score || 0)}</strong>
    </div>`).join('') : '<div class="empty-state">No leaderboard entries yet. Claim your first day to appear here.</div>';

  wrap.innerHTML = `
    <section class="streak-hero glass-card">
      <div class="streak-orb">🔥</div>
      <div class="eyebrow">DAILY STREAK</div>
      <h2>${Number(streak.currentStreak || 0)} day${Number(streak.currentStreak || 0) === 1 ? '' : 's'}</h2>
      <p>${claimed ? 'Today is already claimed. Keep it going tomorrow.' : 'Claim today to keep your streak alive.'}</p>
      <button id="claim-streak" class="primary-button" type="button" ${claimed || state.claiming ? 'disabled' : ''}>${state.claiming ? 'Claiming…' : claimed ? '✓ Claimed today' : 'Claim today'}</button>
      ${state.error ? `<div class="message error">${esc(state.error)}</div>` : ''}
      <div class="metric-grid streak-metrics">
        <div class="metric-tile"><span>Longest</span><strong>${Number(streak.longestStreak || 0)}</strong><small>best streak</small></div>
        <div class="metric-tile"><span>Total days</span><strong>${Number(streak.totalDays || 0)}</strong><small>days claimed</small></div>
        <div class="metric-tile"><span>Score</span><strong>${Number(streak.score || 0)}</strong><small>leaderboard points</small></div>
      </div>
    </section>

    <section class="glass-card">
      <div class="section-heading"><div><div class="eyebrow">ACHIEVEMENTS</div><h3>Your milestones</h3></div><span class="badge">${achievements.length}/${ACHIEVEMENTS.length}</span></div>
      <div class="achievement-grid">${ACHIEVEMENTS.map(item => {
        const earned = streak.achievements?.includes(item.id);
        return `<article class="achievement-card ${earned ? 'earned' : ''}"><div class="achievement-icon">${item.icon}</div><div><strong>${esc(item.name)}</strong><small>${esc(item.description)}</small></div><span class="badge">${earned ? 'Earned' : `${item.threshold}d`}</span></article>`;
      }).join('')}</div>
    </section>

    <section class="glass-card">
      <div class="section-heading"><div><div class="eyebrow">LEADERBOARD</div><h3>Top streaks</h3></div><span class="badge">Live</span></div>
      <div class="leader-head"><span>#</span><span>Student</span><span>Streak</span><span>Score</span></div>
      <div class="leader-list">${leaderRows}</div>
      <p class="subtle leaderboard-note">Only your display name, streak totals, achievements count and score are shown here.</p>
    </section>`;

  $('claim-streak')?.addEventListener('click', handleClaim);
}

async function handleClaim() {
  if (!state.uid || state.claiming || claimedToday(state.streak)) return;
  state.claiming = true; state.error = null; render();
  const uid = state.uid, generation = state.generation;
  try {
    const result = await claimToday(uid, state.profile?.name);
    if (uid !== state.uid || generation !== state.generation) return;
    state.streak = result;
    if (result.newlyEarned?.length) {
      const names = ACHIEVEMENTS.filter(item => result.newlyEarned.includes(item.id)).map(item => item.name);
      window.setTimeout(() => window.alert(`Achievement unlocked: ${names.join(', ')}`), 50);
    }
  } catch (error) {
    if (uid === state.uid && generation === state.generation) state.error = error?.message || 'Could not claim today. Check your connection and try again.';
  } finally {
    if (uid === state.uid && generation === state.generation) { state.claiming = false; render(); }
  }
}

export async function mountStreakUI({ studentProfile, userId, sessionGeneration: generation }) {
  clearStreakUI();
  state = { uid: userId, profile: studentProfile, generation, streak: null, leaderboard: [], loading: true, claiming: false, error: null };
  render();
  try { state.streak = await getStreak(userId); } catch (error) { state.error = error?.message || 'Could not load your streak.'; }
  if (state.uid !== userId || state.generation !== generation) return;
  try {
    unsubscribeLeaderboard = subscribeLeaderboard(rows => {
      if (state.uid === userId && state.generation === generation) { state.leaderboard = rows; render(); }
    }, error => {
      if (state.uid === userId && state.generation === generation) { state.error = error?.message || 'Leaderboard could not load.'; render(); }
    });
  } catch (error) { state.error = error?.message || 'Leaderboard could not load.'; }
  state.loading = false;
  render();
}

export function clearStreakUI() {
  unsubscribeLeaderboard?.();
  unsubscribeLeaderboard = null;
  state = { uid: null, profile: null, generation: null, streak: null, leaderboard: [], loading: true, claiming: false, error: null };
  const wrap = $('streaks-view');
  if (wrap) wrap.innerHTML = '';
}
