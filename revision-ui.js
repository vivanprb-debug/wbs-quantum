import { loadExams } from '../exams/exam-service.js';
import { buildRevisionPlan, loadRevisionSessions, saveRevisionSession, deleteRevisionSession, toggleRevisionSession, localDateKey } from './revision-service.js';

let uid = null;
let profile = null;
let generation = null;
let cleanup = null;
let sessions = [];
let exams = [];
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function formatDate(value) { return new Intl.DateTimeFormat('en-GB', { weekday:'short', day:'numeric', month:'short' }).format(new Date(`${value}T00:00:00`)); }
function daysUntil(date) { return Math.round((new Date(`${date}T00:00:00`) - new Date(`${localDateKey()}T00:00:00`)) / 86400000); }

function render() {
  const view = $('revision-view');
  if (!view || !profile) return;
  const upcoming = exams.filter(e => e.date && daysUntil(e.date) >= 0).sort((a,b) => a.date.localeCompare(b.date));
  const open = sessions.filter(s => !s.completed);
  const done = sessions.filter(s => s.completed);
  view.innerHTML = `
    <section class="glass-card revision-hero">
      <div><div class="eyebrow">STUDY PLANNER</div><h2>Revision Planner</h2><p>Build a focused plan around your upcoming exams.</p></div>
      <div class="revision-stats"><strong>${open.length}</strong><span>open sessions</span></div>
    </section>
    <section class="glass-card">
      <div class="section-heading"><div><div class="eyebrow">UPCOMING EXAMS</div><h3>Exam countdowns</h3></div><button id="revision-generate" class="primary-button" type="button">Generate plan</button></div>
      <div class="revision-exams">${upcoming.slice(0,5).map(exam => `<div class="revision-exam"><div><strong>${esc(exam.title)}</strong><small>${esc(exam.subject || 'General')} • ${formatDate(exam.date)}</small></div><span class="badge">${daysUntil(exam.date) === 0 ? 'Today' : `${daysUntil(exam.date)}d`}</span></div>`).join('') || '<div class="empty-state">Add an exam in Tasks to build a revision plan.</div>'}</div>
    </section>
    <section class="glass-card">
      <div class="section-heading"><div><div class="eyebrow">MY PLAN</div><h3>Revision sessions</h3></div><span class="badge">${done.length} done</span></div>
      <div class="revision-list">${sessions.map(session => `<div class="revision-item ${session.completed ? 'done' : ''}"><label><input type="checkbox" data-revision-toggle="${esc(session.id)}" ${session.completed ? 'checked' : ''}><span><strong>${esc(session.title)}</strong><small>${formatDate(session.date)} • ${esc(session.subject)} • ${session.minutes} min</small></span></label><button class="icon-button" type="button" data-revision-delete="${esc(session.id)}" aria-label="Delete session">×</button></div>`).join('') || '<div class="empty-state">No revision sessions yet. Generate one from your upcoming exams.</div>'}</div>
    </section>`;
  bind();
}

function bind() {
  $('revision-generate')?.addEventListener('click', async () => {
    const suggestions = buildRevisionPlan(exams, new Date());
    const existing = new Set(sessions.map(s => `${s.date}|${s.examId}`));
    for (const suggestion of suggestions) if (!existing.has(`${suggestion.date}|${suggestion.examId}`)) await saveRevisionSession(uid, suggestion);
    await refresh();
  });
  document.querySelectorAll('[data-revision-toggle]').forEach(input => input.addEventListener('change', async () => { await toggleRevisionSession(uid, input.dataset.revisionToggle, input.checked); await refresh(); }));
  document.querySelectorAll('[data-revision-delete]').forEach(button => button.addEventListener('click', async () => { await deleteRevisionSession(uid, button.dataset.revisionDelete); await refresh(); }));
}

async function refresh() {
  if (!uid || generation == null) return;
  const requestUid = uid; const requestGeneration = generation;
  const [sessionResult, examResult] = await Promise.all([loadRevisionSessions(requestUid), loadExams(requestUid)]);
  if (uid !== requestUid || generation !== requestGeneration) return;
  sessions = sessionResult.data || []; exams = examResult.data || [];
  render();
}

export function mountRevisionUI({ studentProfile, userId, sessionGeneration }) {
  profile = studentProfile; uid = userId; generation = sessionGeneration;
  cleanup?.();
  cleanup = () => { sessions = []; exams = []; };
  render();
  refresh().catch(error => console.warn('[WBS Quantum] revision load failed', error));
  return cleanup;
}
export function clearRevisionUI() { cleanup?.(); cleanup = null; profile = null; uid = null; generation = null; sessions = []; exams = []; const view = $('revision-view'); if (view) view.innerHTML = ''; }
