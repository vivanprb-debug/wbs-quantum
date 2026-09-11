import { BELL_TIMES, dayMeta, dayNumber, getWeekType, isoDate, mondayOfWeek, SCHOOL_YEAR } from '../data/school-calendar.js';
import { getCurrentLesson, getNextLesson, getPEActivity, getScheduleForDate, getWeekSchedule, getLessonTimes, searchTimetable } from '../timetable/timetable-service.js';

let activeProfile = null;
let selectedDate = new Date();
let mode = 'day';
let cleanup = null;

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>\'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function formatDate(date) { return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date); }
function shortDate(dateString) { return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${dateString}T00:00:00`)); }
function formatTimeRange(period) {
  const time = getLessonTimes(period);
  return time ? `${time.start}–${time.end}` : 'Time unavailable';
}
function isToday(date) { return isoDate(date) === isoDate(new Date()); }
function moveDate(delta) { const next = new Date(selectedDate); next.setDate(next.getDate() + delta); selectedDate = next; render(); }
function moveWeek(delta) { const next = mondayOfWeek(selectedDate); next.setDate(next.getDate() + delta * 7); selectedDate = next; render(); }
function setMode(nextMode) { mode = nextMode; render(); }

function lessonCard(lesson, options = {}) {
  const { highlight = false, compact = false } = options;
  const time = formatTimeRange(lesson.period);
  const classes = ['schedule-lesson', lesson.type || 'lesson', highlight ? 'is-active' : '', compact ? 'compact' : ''].filter(Boolean).join(' ');
  const icon = lesson.type === 'pe' ? '🏃' : lesson.type === 'science' ? '🧪' : lesson.type === 'registration' ? '👋' : '📚';
  return `<article class="${classes}">
    <div class="schedule-time"><strong>${lesson.period === 0 ? 'REG' : `P${lesson.period}`}</strong><span>${escapeHTML(time)}</span></div>
    <div class="schedule-subject"><div class="subject-line"><span class="subject-icon" aria-hidden="true">${icon}</span><strong>${escapeHTML(lesson.subject)}</strong></div><span>${escapeHTML(lesson.teacher || 'Teacher not listed')} • ${escapeHTML(lesson.room || 'Room not listed')}</span></div>
    <span class="schedule-chip">${lesson.type === 'pe' ? 'PE' : lesson.type === 'science' ? 'Science' : lesson.type === 'registration' ? 'Form' : 'Class'}</span>
  </article>`;
}

function renderShell() {
  const scheduleView = $('schedule-view');
  if (!scheduleView) return;
  scheduleView.innerHTML = `<div class="schedule-page">
    <section class="glass-card schedule-hero">
      <div>
        <div class="eyebrow">ACADEMIC SCHEDULE</div>
        <h2 id="academic-name"></h2>
        <p id="academic-status" class="subtle"></p>
      </div>
      <div class="schedule-week-badge" id="week-badge"></div>
    </section>

    <section class="glass-card schedule-controls">
      <div class="schedule-toolbar">
        <div class="segmented" role="tablist" aria-label="Schedule view">
          <button id="day-mode" class="segment active" type="button">Day</button>
          <button id="week-mode" class="segment" type="button">Week</button>
        </div>
        <button id="today-day" class="ghost-button" type="button">Today</button>
      </div>
      <div class="date-toolbar">
        <button id="schedule-prev" class="icon-nav" type="button" aria-label="Previous">‹</button>
        <div class="date-heading"><strong id="academic-date"></strong><span id="academic-week"></span></div>
        <button id="schedule-next" class="icon-nav" type="button" aria-label="Next">›</button>
      </div>
      <div class="schedule-actions">
        <button id="refresh-academic" class="ghost-button" type="button">↻ Refresh</button>
        <button id="search-timetable" class="ghost-button" type="button">⌕ Search</button>
      </div>
    </section>

    <section class="schedule-strip" id="day-strip" aria-label="School days"></section>

    <section class="glass-card current-card">
      <div class="section-heading"><div><div class="eyebrow" id="current-eyebrow">NOW / NEXT</div><h3 id="current-title">Loading…</h3></div><span class="badge" id="current-badge"></span></div>
      <p id="current-details" class="subtle"></p>
    </section>

    <section id="day-panel"></section>
    <section id="week-panel" class="hidden"></section>

    <section class="glass-card pe-card">
      <div class="section-heading"><div><div class="eyebrow">PE</div><h3>Today's activity</h3></div><span class="badge" id="selected-pe">PE: —</span></div>
      <p id="pe-details" class="subtle">Your PE activity is calculated from your profile's rotation.</p>
    </section>

    <section class="glass-card search-panel hidden" id="search-panel">
      <div class="section-heading"><div><div class="eyebrow">TIMETABLE SEARCH</div><h3>Find a lesson</h3></div></div>
      <div class="search-row"><input id="timetable-query" type="search" placeholder="Subject, teacher or room" autocomplete="off"><button id="close-search" class="ghost-button" type="button">Close</button></div>
      <div id="search-results" class="search-results"></div>
    </section>
  </div>`;
}

function renderDayStrip() {
  const strip = $('day-strip');
  if (!strip || !activeProfile) return;
  const monday = mondayOfWeek(selectedDate);
  const days = [1,2,3,4,5].map(number => {
    const date = new Date(monday); date.setDate(date.getDate() + number - 1);
    return { number, date };
  });
  strip.innerHTML = days.map(({ number, date }) => {
    const selected = isoDate(date) === isoDate(selectedDate);
    const today = isToday(date);
    const schedule = getScheduleForDate(activeProfile, date);
    const count = Math.max(0, schedule.lessons.length - 1);
    return `<button class="day-switcher ${selected ? 'selected' : ''} ${today ? 'today' : ''}" data-day="${number}" type="button"><span>${escapeHTML(dayMeta(number).short)}</span><strong>${date.getDate()}</strong><small>${count} ${count === 1 ? 'lesson' : 'lessons'}</small></button>`;
  }).join('');
  strip.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => {
    const monday = mondayOfWeek(selectedDate); const date = new Date(monday); date.setDate(date.getDate() + Number(button.dataset.day) - 1); selectedDate = date; mode = 'day'; render();
  }));
}

function renderDay() {
  const schedule = getScheduleForDate(activeProfile, selectedDate);
  const now = new Date();
  const current = isToday(selectedDate) ? getCurrentLesson(activeProfile, now) : null;
  const next = getNextLesson(activeProfile, now);
  $('academic-date').textContent = formatDate(selectedDate);
  $('academic-week').textContent = `Week ${schedule.week} • ${schedule.dayMeta?.full || 'School day'}`;
  $('week-badge').textContent = `Week ${schedule.week}`;
  $('day-panel').innerHTML = `<div class="schedule-list">${schedule.lessons.length ? schedule.lessons.map(lesson => lessonCard(lesson, { highlight: Boolean(current?.lesson && current.lesson.period === lesson.period) })).join('') : '<div class="empty-state">No lessons are scheduled for this date.</div>'}</div>`;
  const nextRelevant = next && next.period !== 0 ? next : null;
  if (current?.lesson) {
    $('current-eyebrow').textContent = 'RIGHT NOW';
    $('current-title').textContent = current.lesson.subject;
    $('current-details').textContent = `${current.lesson.teacher} • ${current.lesson.room} • ${current.time.start}–${current.time.end}`;
    $('current-badge').textContent = 'Live';
  } else if (isToday(selectedDate) && nextRelevant) {
    $('current-eyebrow').textContent = 'UP NEXT';
    $('current-title').textContent = nextRelevant.subject;
    $('current-details').textContent = `${nextRelevant.teacher} • ${nextRelevant.room} • ${nextRelevant.time?.start || ''}`;
    $('current-badge').textContent = nextRelevant.period === 0 ? 'Registration' : `P${nextRelevant.period}`;
  } else {
    $('current-eyebrow').textContent = 'SELECTED DAY';
    $('current-title').textContent = schedule.lessons[1]?.subject || schedule.lessons[0]?.subject || 'No lessons';
    const first = schedule.lessons[1] || schedule.lessons[0];
    $('current-details').textContent = first ? `${first.teacher} • ${first.room} • ${formatTimeRange(first.period)}` : 'No lesson information available.';
    $('current-badge').textContent = schedule.lessons.length > 1 ? `${schedule.lessons.length - 1} lessons` : 'None';
  }
}

function renderWeek() {
  const days = getWeekSchedule(activeProfile, selectedDate);
  const week = getWeekType(selectedDate);
  $('academic-date').textContent = `Week commencing ${shortDate(days[0].date)}`;
  $('academic-week').textContent = `Week ${week} • Monday to Friday`;
  $('week-badge').textContent = `Week ${week}`;
  $('week-panel').innerHTML = `<div class="week-stack">${days.map(day => {
    const today = day.date === isoDate(new Date());
    return `<section class="glass-card week-day-card ${today ? 'today-card' : ''}">
      <div class="week-day-heading"><div><div class="eyebrow">${escapeHTML(day.dayMeta.short)} ${today ? '• TODAY' : ''}</div><h3>${escapeHTML(day.dayMeta.full)}</h3></div><span class="badge">${escapeHTML(shortDate(day.date))}</span></div>
      <div class="schedule-list compact-list">${day.lessons.map(lesson => lessonCard(lesson, { compact: true })).join('')}</div>
    </section>`;
  }).join('')}</div>`;
}

function renderPE() {
  try {
    const schedule = getScheduleForDate(activeProfile, selectedDate);
    const pe = getPEActivity(activeProfile, selectedDate);
    $('selected-pe').textContent = pe ? pe.activity : 'PE: —';
    $('pe-details').textContent = pe ? `Week ${schedule.week} • ${schedule.dayMeta.full} • Block commencing ${shortDate(pe.blockWeek)}.` : schedule.lessons.some(item => item.type === 'pe') ? 'PE is scheduled, but no PE activity is configured for this date.' : 'No PE is scheduled on this date.';
  } catch (error) {
    $('selected-pe').textContent = 'PE: —'; $('pe-details').textContent = error.message;
  }
}

function renderSearch() {
  const query = $('timetable-query')?.value.trim();
  if (!query) { $('search-results').innerHTML = '<div class="empty-state">Search by subject, teacher or room.</div>'; return; }
  const hits = searchTimetable(activeProfile, query);
  $('search-results').innerHTML = hits.length ? hits.slice(0, 20).map(hit => `<div class="search-hit"><div><strong>Week ${hit.week} • ${escapeHTML(dayMeta(hit.day)?.full || '')}</strong><span>P${hit.period} • ${escapeHTML(hit.subject)}</span></div><span>${escapeHTML(hit.teacher)} • ${escapeHTML(hit.room)}</span></div>`).join('') : '<div class="empty-state">No timetable matches found.</div>';
}

function render() {
  if (!activeProfile) return;
  const dayMode = mode === 'day';
  $('day-mode')?.classList.toggle('active', dayMode);
  $('week-mode')?.classList.toggle('active', !dayMode);
  $('day-panel')?.classList.toggle('hidden', !dayMode);
  $('week-panel')?.classList.toggle('hidden', dayMode);
  renderDayStrip();
  if (dayMode) renderDay(); else renderWeek();
  renderPE();
  renderSearch();
  const searchPanel = $('search-panel');
  if (searchPanel) searchPanel.classList.toggle('hidden', !searchPanel.dataset.open);
}

function handleExternalScheduleSearch(event){
  const query = String(event.detail?.query || '').trim();
  if (!query) return;
  const panel = $('search-panel');
  if (panel) { panel.dataset.open = '1'; panel.classList.remove('hidden'); }
  const input = $('timetable-query');
  if (input) input.value = query;
  renderSearch();
}

function bind() {
  $('day-mode')?.addEventListener('click', () => setMode('day'));
  $('week-mode')?.addEventListener('click', () => setMode('week'));
  $('today-day')?.addEventListener('click', () => { selectedDate = new Date(); mode = 'day'; render(); });
  $('schedule-prev')?.addEventListener('click', () => mode === 'week' ? moveWeek(-1) : moveDate(-1));
  $('schedule-next')?.addEventListener('click', () => mode === 'week' ? moveWeek(1) : moveDate(1));
  $('refresh-academic')?.addEventListener('click', () => render());
  $('search-timetable')?.addEventListener('click', () => { const panel = $('search-panel'); panel.dataset.open = '1'; panel.classList.remove('hidden'); $('timetable-query')?.focus(); });
  $('close-search')?.addEventListener('click', () => { const panel = $('search-panel'); delete panel.dataset.open; panel.classList.add('hidden'); });
  $('timetable-query')?.addEventListener('input', renderSearch);
}

export function mountAcademicUI(profile) {
  window.removeEventListener('wbs:schedule-search', handleExternalScheduleSearch);
  window.addEventListener('wbs:schedule-search', handleExternalScheduleSearch);
  cleanup?.();
  activeProfile = profile;
  selectedDate = new Date();
  mode = 'day';
  renderShell();
  $('academic-name').textContent = `${profile.name}'s timetable`;
  $('academic-status').textContent = `${profile.email} • Profile ${profile.id}`;
  bind();
  render();
  const timer = window.setInterval(() => {
    if (mode === 'day' && isToday(selectedDate)) render();
  }, 30000);
  cleanup = () => window.clearInterval(timer);
}

export function clearAcademicUI() {
  window.removeEventListener('wbs:schedule-search', handleExternalScheduleSearch);
  cleanup?.(); cleanup = null; activeProfile = null;
  const wrap = $('schedule-view'); if (wrap) wrap.innerHTML = '';
}
