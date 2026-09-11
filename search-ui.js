import { globalSearch } from './search-service.js';

let state = { uid: null, profile: null, generation: null, open: false, query: '', results: [], loading: false, error: null };
let searchRequest = 0;

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const icons = { schedule: '▦', task: '✓', exam: '◇', note: '✎' };
const labels = { schedule: 'Schedule', task: 'Task', exam: 'Exam', note: 'Note' };

function render() {
  const modal = $('global-search-modal');
  if (!modal) return;
  modal.classList.toggle('hidden', !state.open);
  if (!state.open) return;
  const input = $('global-search-input');
  if (input && input.value !== state.query) input.value = state.query;
  const body = $('global-search-results');
  if (!body) return;
  if (state.loading) { body.innerHTML = '<div class="empty-state">Searching your dashboard…</div>'; return; }
  if (state.error) { body.innerHTML = `<div class="message error">${esc(state.error)}</div>`; return; }
  if (!state.query.trim()) { body.innerHTML = '<div class="empty-state">Search subjects, teachers, rooms, tasks, exams or notes.</div>'; return; }
  if (!state.results.length) { body.innerHTML = `<div class="empty-state">No matches for “${esc(state.query.trim())}”.</div>`; return; }
  body.innerHTML = state.results.map((item, index) => `
    <button class="global-search-result" type="button" data-search-index="${index}">
      <span class="global-search-icon">${icons[item.type] || '•'}</span>
      <span class="global-search-main"><strong>${esc(item.title)}</strong><small>${esc(item.subtitle)}</small></span>
      <span class="badge">${labels[item.type]}</span>
    </button>`).join('');
  body.querySelectorAll('[data-search-index]').forEach(button => button.addEventListener('click', () => selectResult(state.results[Number(button.dataset.searchIndex)])));
}

async function runSearch() {
  const query = state.query.trim();
  const request = ++searchRequest;
  state.loading = Boolean(query); state.error = null; if (!query) state.results = []; render();
  if (!query) return;
  try {
    const results = await globalSearch({ profile: state.profile, uid: state.uid, query });
    if (request !== searchRequest || !state.open) return;
    state.results = results;
  } catch (error) {
    if (request !== searchRequest) return;
    state.error = error?.message || 'Search could not load.';
  } finally {
    if (request === searchRequest) { state.loading = false; render(); }
  }
}

function selectResult(item) {
  if (!item) return;
  closeSearch();
  if (item.type === 'schedule') {
    window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'schedule' }));
    window.dispatchEvent(new CustomEvent('wbs:schedule-search', { detail: { query: item.title } }));
  } else {
    window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: 'productivity' }));
    window.dispatchEvent(new CustomEvent('wbs:productivity-search', { detail: { query: item.title } }));
  }
}

function openSearch(initial = '') {
  if (!state.uid) return;
  state.open = true; state.query = initial; state.results = []; state.error = null;
  render();
  window.setTimeout(() => $('global-search-input')?.focus(), 0);
  if (initial) runSearch();
}
function closeSearch() { state.open = false; render(); }

export function mountSearchUI({ studentProfile, userId, sessionGeneration }) {
  state = { uid: userId, profile: studentProfile, generation: sessionGeneration, open: false, query: '', results: [], loading: false, error: null };
  $('global-search-button')?.addEventListener('click', () => openSearch());
  $('global-search-close')?.addEventListener('click', closeSearch);
  $('global-search-modal')?.addEventListener('click', event => { if (event.target.id === 'global-search-modal') closeSearch(); });
  $('global-search-input')?.addEventListener('input', event => { state.query = event.target.value; window.clearTimeout(mountSearchUI.timer); mountSearchUI.timer = window.setTimeout(runSearch, 120); });
  const keyHandler = event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); } if (event.key === 'Escape' && state.open) closeSearch(); };
  window.addEventListener('keydown', keyHandler);
  return () => { window.removeEventListener('keydown', keyHandler); clearSearchUI(); };
}

export function clearSearchUI() {
  state = { uid: null, profile: null, generation: null, open: false, query: '', results: [], loading: false, error: null };
  const modal = $('global-search-modal'); if (modal) modal.classList.add('hidden');
}
