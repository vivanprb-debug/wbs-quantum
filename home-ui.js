import { getCurrentLesson, getNextLesson, getPEActivity } from '../timetable/timetable-service.js';
import { getScheduleForDate } from '../timetable/timetable-service.js';
import { isoDate } from '../data/school-calendar.js';
import { loadTasks, loadExams } from '../tasks/task-service.js';

let profile = null;
let uid = null;
let cleanup = null;
let sessionGeneration = null;

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date);
}
function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', { weekday:'long', day:'numeric', month:'long' }).format(date);
}
function daysUntil(dateString) {
  if (!dateString) return null;
  const target = new Date(`${dateString}T00:00:00`);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((target - today) / 86400000);
}

function renderHome(tasks = [], exams = []) {
  if (!profile) return;
  const now = new Date();
  let current = null;
  let next = null;
  let schedule = null;
  let pe = null;
  try {
    current = getCurrentLesson(profile, now);
    next = getNextLesson(profile, now);
    schedule = getScheduleForDate(profile, now);
    pe = getPEActivity(profile, now);
  } catch (error) {
    console.warn('[WBS Quantum] home timetable calculation failed', error);
  }
  const openTasks = tasks.filter(item => !item.completed).length;
  const upcomingExams = exams.filter(item => item.date && daysUntil(item.date) >= 0).sort((a,b) => a.date.localeCompare(b.date));
  const firstExam = upcomingExams[0];
  const countdown = firstExam ? daysUntil(firstExam.date) : null;
  const lesson = current?.lesson;
  const nextDisplay = next ? `${esc(next.subject)} • ${esc(next.room || 'Room not listed')}` : 'No upcoming lesson';

  $('home-view').innerHTML = `
    <section class="hero-card">
      <div class="hero-copy">
        <div class="eyebrow">WBS QUANTUM</div>
        <h2 id="home-greeting">Good morning, ${esc(profile.name)}.</h2>
        <p>${esc(formatDate(now))} • <span id="home-clock">${esc(formatTime(now))}</span></p>
      </div>
      <div class="hero-avatar" aria-hidden="true">${esc(profile.name.slice(0,1).toUpperCase())}</div>
    </section>

    <section class="glass-card focus-card">
      <div class="section-heading">
        <div><div class="eyebrow">${lesson ? 'RIGHT NOW' : 'UP NEXT'}</div><h3>${lesson ? esc(lesson.subject) : 'Next lesson'}</h3></div>
        <span class="badge">${schedule?.week ? `Week ${schedule.week}` : ''}</span>
      </div>
      <p class="focus-main">${lesson ? `${esc(lesson.teacher)} • ${esc(lesson.room)}` : nextDisplay}</p>
      <div class="quick-actions">
        <button id="home-schedule" class="primary-button" type="button">View timetable</button>
        <button id="home-tasks" class="ghost-button" type="button">Open tasks</button>
      </div>
    </section>

    <section class="metric-grid home-metrics">
      <button class="metric-tile" id="metric-tasks" type="button"><span>Open tasks</span><strong>${openTasks}</strong><small>${openTasks === 1 ? 'task' : 'tasks'} to finish</small></button>
      <button class="metric-tile" id="metric-exams" type="button"><span>Next exam</span><strong>${countdown == null ? '—' : countdown === 0 ? 'Today' : `${countdown}d`}</strong><small>${firstExam ? esc(firstExam.title) : 'No exam added'}</small></button>
      <button class="metric-tile" id="metric-pe" type="button"><span>PE</span><strong>${pe ? esc(pe.activity) : '—'}</strong><small>${pe ? `Week ${schedule.week}` : 'No PE today'}</small></button>
    </section>

    <section class="glass-card">
      <div class="section-heading"><div><div class="eyebrow">TODAY</div><h3>Today's classes</h3></div><span class="badge">${schedule?.lessons?.length ? schedule.lessons.length - 1 : 0} lessons</span></div>
      <div class="home-lesson-strip">${(schedule?.lessons || []).slice(1).map(item => `<div class="home-lesson"><span>P${item.period}</span><strong>${esc(item.subject)}</strong><small>${esc(item.room)}</small></div>`).join('') || '<div class="empty-state">No lessons scheduled today.</div>'}</div>
    </section>

    <section class="glass-card">
      <div class="section-heading"><div><div class="eyebrow">COMING UP</div><h3>Next lesson</h3></div></div>
      <div class="next-home"><strong>${next ? esc(next.subject) : 'No next lesson'}</strong><span>${next ? `${esc(next.teacher)} • ${esc(next.room)} • ${esc(next.time?.start || '')}` : 'Check your timetable for the next school day.'}</span></div>
    </section>

    <section class="glass-card compact-install" id="install-card">
      <div><div class="eyebrow">APP</div><h3>WBS Quantum PWA</h3><p id="pwa-status">Checking app install status…</p></div>
      <button id="install-app" class="small-button" type="button" disabled>Install</button>
    </section>`;

  bindHomeEvents();
  updateClock();
}

function bindHomeEvents() {
  $('home-schedule')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'schedule' })));
  $('home-tasks')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'productivity' })));
  $('metric-tasks')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'productivity' })));
  $('metric-exams')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'productivity' })));
  $('metric-pe')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'schedule' })));
  $('install-app')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('wbs:pwa-install')));
}

function updateClock() {
  const clock = $('home-clock');
  const greeting = $('home-greeting');
  if (!clock || !greeting) return;
  const now = new Date();
  clock.textContent = formatTime(now);
  const hour = now.getHours();
  const prefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  greeting.textContent = `${prefix}, ${profile.name}.`;
}

async function refresh() {
  if (!uid || !profile || sessionGeneration == null) return;
  const requestGeneration = sessionGeneration;
  const requestUid = uid;
  const [tasksResult, examsResult] = await Promise.all([loadTasks(requestUid), loadExams(requestUid)]);
  if (requestGeneration !== sessionGeneration || requestUid !== uid) return;
  renderHome(tasksResult.data || [], examsResult.data || []);
}

export function mountHomeUI({ studentProfile, userId, sessionGeneration: generation }) {
  profile = studentProfile;
  uid = userId;
  sessionGeneration = generation;
  cleanup?.();
  const timer = window.setInterval(updateClock, 1000);
  const onInstallAvailable = () => {
    const button = $('install-app'); const status = $('pwa-status');
    if (button) { button.disabled = false; button.textContent = 'Install'; }
    if (status) status.textContent = 'Install WBS Quantum on this device for an app-like experience.';
  };
  const onInstalled = () => {
    const button = $('install-app'); const status = $('pwa-status');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Installed — WBS Quantum is available like an app.';
  };
  window.addEventListener('wbs:pwa-install-available', onInstallAvailable);
  window.addEventListener('wbs:pwa-installed', onInstalled);
  cleanup = () => {
    window.clearInterval(timer);
    window.removeEventListener('wbs:pwa-install-available', onInstallAvailable);
    window.removeEventListener('wbs:pwa-installed', onInstalled);
  };
  renderHome([], []);
  refresh().catch(error => {
    console.warn('[WBS Quantum] home cloud data failed', error);
    renderHome([], []);
  });
}

export function clearHomeUI() { cleanup?.(); cleanup = null; profile = null; uid = null; sessionGeneration = null; const wrap = $('home-view'); if (wrap) wrap.innerHTML = ''; }
