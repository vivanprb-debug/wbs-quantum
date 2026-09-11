import { getFeatures, getMaintenance, saveFeatures, saveMaintenance, isDeveloper, DEFAULT_FEATURES } from './admin-service.js';
import { isSessionCurrent } from './session-controller.js';

let state = { user: null, profile: null, generation: null, maintenance: { enabled: false, message: '' }, features: { ...DEFAULT_FEATURES }, loading: true, saving: false, message: '' };
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));

function render() {
  const wrap = $('admin-view');
  const nav = document.querySelector('[data-nav="admin"]');
  const developer = isDeveloper(state.user);
  if (nav) nav.classList.toggle('hidden', !developer);
  if (!wrap) return;
  if (!developer) { wrap.innerHTML = ''; return; }
  if (state.loading) { wrap.innerHTML = '<section class="glass-card"><div class="eyebrow">DEVELOPER</div><h2>Admin Console</h2><p class="subtle">Loading secure controls…</p></section>'; return; }
  const m = state.maintenance;
  const f = state.features;
  wrap.innerHTML = `
    <section class="glass-card admin-hero"><div><div class="eyebrow">DEVELOPER CONSOLE</div><h2>Admin Console</h2><p class="subtle">Manage app-wide controls. Firestore rules enforce developer access on writes.</p></div><span class="badge">Developer</span></section>
    <section class="glass-card"><div class="section-heading"><div><div class="eyebrow">MAINTENANCE</div><h3>App availability</h3></div><span class="badge">Cloud config</span></div>
      <label class="settings-toggle"><span><strong>Maintenance mode</strong><small>Turn this on when the dashboard needs planned maintenance.</small></span><input id="admin-maintenance-enabled" type="checkbox" ${m.enabled ? 'checked' : ''}></label>
      <label class="admin-field"><span>Maintenance message</span><textarea id="admin-maintenance-message" maxlength="180" rows="3">${esc(m.message)}</textarea></label>
      <div class="admin-actions"><button id="admin-save-maintenance" class="primary-button" type="button">Save maintenance</button></div>
    </section>
    <section class="glass-card"><div class="section-heading"><div><div class="eyebrow">FEATURE FLAGS</div><h3>Dashboard features</h3></div><span class="badge">Live config</span></div>
      ${[['ai','Ask AI','Show the AI section to signed-in users.'],['notifications','Notifications','Show the notification centre.'],['revision','Revision','Show revision planning.'],['insights','Insights','Show progress analytics.'],['leaderboard','Leaderboard','Allow the leaderboard feature.']].map(([key,title,desc]) => `<label class="settings-toggle"><span><strong>${title}</strong><small>${desc}</small></span><input class="admin-feature" data-feature="${key}" type="checkbox" ${f[key] ? 'checked' : ''}></label>`).join('')}
      <div class="admin-actions"><button id="admin-save-features" class="primary-button" type="button">Save feature flags</button></div>
    </section>
    <section class="glass-card admin-info"><div class="eyebrow">DIAGNOSTICS</div><h3>Configuration status</h3><div class="admin-grid"><div><span>Developer account</span><strong>${esc(state.user?.email || '—')}</strong></div><div><span>Maintenance</span><strong>${m.enabled ? 'ON' : 'OFF'}</strong></div><div><span>Last update</span><strong>${esc(m.updatedAt || 'Not available')}</strong></div></div></section>
    <p id="admin-message" class="message">${esc(state.message)}</p>`;
  wire();
}

function wire() {
  $('admin-save-maintenance')?.addEventListener('click', async () => {
    if (state.saving) return;
    const maintenance = { enabled: $('admin-maintenance-enabled')?.checked, message: $('admin-maintenance-message')?.value };
    state.saving = true; state.message = 'Saving…'; render();
    try {
      const data = await saveMaintenance(state.user, maintenance);
      if (!isSessionCurrent(state.generation, state.user.uid)) return;
      state.maintenance = data; state.message = 'Maintenance settings saved.';
      window.dispatchEvent(new CustomEvent('wbs:maintenance-changed', { detail: data }));
    } catch (error) { state.message = error.message || 'Could not save maintenance settings.'; }
    state.saving = false; render();
  });
  $('admin-save-features')?.addEventListener('click', async () => {
    if (state.saving) return;
    const features = { ...DEFAULT_FEATURES };
    document.querySelectorAll('.admin-feature').forEach(input => { features[input.dataset.feature] = input.checked; });
    state.saving = true; state.message = 'Saving…'; render();
    try {
      state.features = await saveFeatures(state.user, features);
      if (!isSessionCurrent(state.generation, state.user.uid)) return;
      state.message = 'Feature flags saved.';
      window.dispatchEvent(new CustomEvent('wbs:features-changed', { detail: { ...state.features } }));
    } catch (error) { state.message = error.message || 'Could not save feature flags.'; }
    state.saving = false; render();
  });
}

export async function mountAdminUI({ user, profile, sessionGeneration } = {}) {
  state = { user, profile, generation: sessionGeneration, maintenance: { enabled: false, message: '' }, features: { ...DEFAULT_FEATURES }, loading: true, saving: false, message: '' };
  render();
  if (!isDeveloper(user)) return () => clearAdminUI();
  const [maintenance, features] = await Promise.all([getMaintenance(), getFeatures()]);
  if (!isSessionCurrent(sessionGeneration, user.uid)) return () => {};
  state.maintenance = maintenance.data;
  state.features = features.data;
  state.loading = false;
  state.message = maintenance.source === 'cloud' && features.source === 'cloud' ? 'Connected to live app configuration.' : 'Using cached configuration where cloud data was unavailable.';
  render();
  return () => clearAdminUI();
}

export function clearAdminUI() { $('admin-view')?.replaceChildren(); document.querySelector('[data-nav="admin"]')?.classList.add('hidden'); state = { user: null, profile: null, generation: null, maintenance: { enabled: false, message: '' }, features: { ...DEFAULT_FEATURES }, loading: true, saving: false, message: '' }; }
