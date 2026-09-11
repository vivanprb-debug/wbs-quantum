import { askAI } from './ai-service.js';
import { getState, subscribe } from '../core/state.js';
import { getScheduleForDate } from '../timetable/timetable-service.js';
import { loadTasks } from '../tasks/task-service.js';
import { loadExams } from '../exams/exam-service.js';

let profile = null;
let history = [];
let unsubscribe = null;
let bound = false;

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function timetableContext() {
  if (!profile) return '';
  const schedule = getScheduleForDate(profile, new Date());
  return (schedule?.lessons || []).map(l => `P${l.period} ${l.subject} | ${l.teacher || ''} | ${l.room || ''} | ${l.start || ''}-${l.end || ''}`).join('\n');
}

function renderMessages() {
  const box = $('ai-messages');
  if (!box) return;
  if (!history.length) {
    box.innerHTML = `<div class="ai-empty"><div class="ai-orb">✦</div><h3>Ask Quantum AI</h3><p>I can help with your timetable, homework planning, exams and school-day questions.</p><div class="ai-suggestions"><button data-ai-suggest="What is my next lesson?">Next lesson</button><button data-ai-suggest="Help me plan my homework for today.">Plan homework</button><button data-ai-suggest="What exams are coming up?">Upcoming exams</button></div></div>`;
    return;
  }
  box.innerHTML = history.map(item => `<article class="ai-message ${item.role === 'user' ? 'user' : 'assistant'}"><div class="ai-message-label">${item.role === 'user' ? 'You' : 'Quantum AI'}</div><div class="ai-message-body">${esc(item.text).replace(/\n/g, '<br>')}</div></article>`).join('');
  box.scrollTop = box.scrollHeight;
}

function render() {
  const view = $('ai-view');
  if (!view) return;
  view.innerHTML = `<section class="ai-shell">
    <section class="glass-card ai-header"><div><div class="eyebrow">WBS QUANTUM</div><h2>Ask AI</h2><p class="subtle">Your school-day assistant, grounded in your account.</p></div><span class="badge">Gemini</span></section>
    <section id="ai-messages" class="glass-card ai-messages" aria-live="polite"></section>
    <section class="glass-card ai-composer"><textarea id="ai-input" rows="3" maxlength="4000" placeholder="Ask about your timetable, homework, exams or planning…"></textarea><div class="ai-composer-row"><span id="ai-status" class="subtle">Ready</span><button id="ai-send" class="primary-button" type="button">Ask AI</button></div></section>
  </section>`;
  renderMessages();
  bindComposer();
}

function bindComposer() {
  if (bound) return;
  bound = true;
  $('ai-send')?.addEventListener('click', send);
  $('ai-input')?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) send();
  });
  $('ai-messages')?.addEventListener('click', event => {
    const button = event.target.closest('[data-ai-suggest]');
    if (!button) return;
    const input = $('ai-input');
    if (input) { input.value = button.dataset.aiSuggest; input.focus(); }
  });
}

async function send() {
  if (!profile) return;
  const input = $('ai-input');
  const sendButton = $('ai-send');
  const status = $('ai-status');
  const message = input?.value.trim();
  if (!message) return;
  history.push({ role: 'user', text: message });
  input.value = '';
  renderMessages();
  if (sendButton) sendButton.disabled = true;
  if (status) status.textContent = 'Thinking…';
  try {
    const [tasks, exams] = await Promise.all([loadTasks(profile.id), loadExams(profile.id)]);
    const result = await askAI({ message, profile, timetableContext: timetableContext(), tasks, exams, history });
    history.push({ role: 'assistant', text: result.text || 'I could not produce a response.' });
    if (status) status.textContent = 'Ready';
  } catch (error) {
    history.push({ role: 'assistant', text: error.message || 'Ask AI failed. Please try again.' });
    if (status) status.textContent = 'Needs attention';
  } finally {
    if (sendButton) sendButton.disabled = false;
    renderMessages();
  }
}

export function mountAI() {
  if (!unsubscribe) {
    unsubscribe = subscribe(state => {
      if (state.profile?.id !== profile?.id) {
        profile = state.profile;
        history = [];
        bound = false;
        if (profile) render();
      }
    });
  }
  const state = getState();
  profile = state.profile;
  if (profile) render();
}
