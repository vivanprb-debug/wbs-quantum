import { DEFAULT_PREFERENCES, getPreferences, savePreferences, clearCachedPreferences } from './preferences-service.js';
import { isSessionCurrent } from '../auth/session-controller.js';

let state = { uid: null, profile: null, generation: null, preferences: { ...DEFAULT_PREFERENCES }, loading: true, saving: false, message: '' };
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function render() {
  const wrap = $('settings-view'); if (!wrap) return;
  const p = state.preferences;
  wrap.innerHTML = `
    <section class="glass-card settings-hero"><div><div class="eyebrow">ACCOUNT & PREFERENCES</div><h2>Settings</h2><p class="subtle">Personalise how WBS Quantum behaves on this account.</p></div><span class="badge">${esc(state.profile?.role || 'Student')}</span></section>
    <section class="glass-card"><div class="section-heading"><div><div class="eyebrow">PROFILE</div><h3>${esc(state.preferences.displayName || state.profile?.name || 'Student')}</h3></div><span class="badge">Premium</span></div><div class="profile-custom-grid"><label><span>Display name</span><input id="pref-display-name" maxlength="40" value="${esc(state.preferences.displayName)}" placeholder="${esc(state.profile?.name || 'Student')}"></label><label><span>Favourite subject</span><select id="pref-favourite-subject"><option>Maths</option><option>English</option><option>Science</option><option>Computing</option><option>French</option><option>German</option><option>History</option><option>Geography</option><option>Technology / DT</option><option>Art</option><option>Music</option><option>PE</option><option>RE</option><option>PSHE</option></select></label><label class="profile-custom-wide"><span>Study goal</span><input id="pref-study-goal" maxlength="80" value="${esc(state.preferences.studyGoal)}" placeholder="e.g. Stay organised"></label></div><div class="settings-account"><div><span>Profile ID</span><strong class="settings-code">${esc(state.uid || '—')}</strong></div></div></section>
    <section class="glass-card"><div class="section-heading"><div><div class="eyebrow">ACCOUNT DETAILS</div><h3>Signed-in account</h3></div></div><div class="settings-account"><div><span>Email</span><strong>${esc(state.profile?.email || '—')}</strong></div><div><span>Role</span><strong>${esc(state.profile?.role || 'Student')}</strong></div></div></section><section class="glass-card"><div class="section-heading"><div><div class="eyebrow">SCHEDULE</div><h3>Default view</h3></div></div><label class="settings-choice"><span><strong>Open Schedule on</strong><small>Choose the first schedule layout shown.</small></span><select id="pref-schedule-view"><option value="day" ${p.scheduleView === 'day' ? 'selected' : ''}>Day</option><option value="week" ${p.scheduleView === 'week' ? 'selected' : ''}>Week</option></select></label></section>
    <section class="glass-card"><div class="section-heading"><div><div class="eyebrow">PRODUCTIVITY</div><h3>Task preferences</h3></div></div><label class="settings-choice"><span><strong>Default task priority</strong><small>Used when creating a new task.</small></span><select id="pref-task-priority"><option value="low" ${p.taskDefaultPriority === 'low' ? 'selected' : ''}>Low</option><option value="medium" ${p.taskDefaultPriority === 'medium' ? 'selected' : ''}>Medium</option><option value="high" ${p.taskDefaultPriority === 'high' ? 'selected' : ''}>High</option></select></label><label class="settings-toggle"><span><strong>Compact task cards</strong><small>Use a denser task list.</small></span><input id="pref-compact-tasks" type="checkbox" ${p.compactTasks ? 'checked' : ''}></label></section>
    <section class="glass-card"><div class="section-heading"><div><div class="eyebrow">SMART FEATURES</div><h3>Notifications & AI</h3></div></div><label class="settings-toggle"><span><strong>Streak reminders</strong><small>Save this preference for reminder features.</small></span><input id="pref-streak-reminders" type="checkbox" ${p.streakReminders ? 'checked' : ''}></label><label class="settings-toggle"><span><strong>AI suggestions</strong><small>Show suggested prompts in Ask AI.</small></span><input id="pref-ai-suggestions" type="checkbox" ${p.aiSuggestions ? 'checked' : ''}></label></section>
    <section class="glass-card settings-danger"><div class="section-heading"><div><div class="eyebrow">LOCAL DATA</div><h3>Reset preferences</h3></div></div><p class="subtle">This clears the locally cached settings for this account. Cloud settings are unchanged until you save again.</p><button id="reset-local-preferences" class="ghost-button" type="button">Clear local cache</button>${state.message ? `<div class="message ${state.message.startsWith('Saved') ? 'success' : 'error'}">${esc(state.message)}</div>` : ''}</section>`;
  const subject = $('pref-favourite-subject'); if (subject) subject.value = p.favouriteSubject || 'Maths';
  bind();
}

function bind() {
  const collect = () => ({ displayName: $('pref-display-name')?.value || '', favouriteSubject: $('pref-favourite-subject')?.value || 'Maths', studyGoal: $('pref-study-goal')?.value || 'Stay organised', scheduleView: $('pref-schedule-view')?.value, taskDefaultPriority: $('pref-task-priority')?.value, compactTasks: Boolean($('pref-compact-tasks')?.checked), streakReminders: Boolean($('pref-streak-reminders')?.checked), aiSuggestions: Boolean($('pref-ai-suggestions')?.checked) });
  ['pref-display-name','pref-favourite-subject','pref-study-goal','pref-schedule-view','pref-task-priority','pref-compact-tasks','pref-streak-reminders','pref-ai-suggestions'].forEach(id => $(id)?.addEventListener('change', async () => {
    if (!state.uid || state.saving) return;
    state.saving = true; state.message = ''; render();
    const result = await savePreferences(state.uid, collect());
    if (state.generation != null && !isSessionCurrent(state.generation, state.uid)) return;
    state.saving = false; state.preferences = { ...state.preferences, ...result };
    state.message = result.synced ? 'Saved to your account.' : 'Saved locally. Cloud sync will retry later.';
    render(); window.dispatchEvent(new CustomEvent('wbs:preferences-changed', { detail: { ...state.preferences } }));
  }));
  $('reset-local-preferences')?.addEventListener('click', () => { if (!state.uid) return; clearCachedPreferences(state.uid); state.preferences = { ...DEFAULT_PREFERENCES }; state.message = 'Local cache cleared. Cloud settings remain unchanged.'; render(); });
}

export async function mountPreferencesUI({ studentProfile, userId, sessionGeneration } = {}) {
  state = { uid: userId, profile: studentProfile, generation: sessionGeneration, preferences: { ...DEFAULT_PREFERENCES }, loading: true, saving: false, message: '' };
  render();
  state.preferences = await getPreferences(userId).catch(() => ({ ...DEFAULT_PREFERENCES }));
  if (state.generation != null && !isSessionCurrent(state.generation, state.uid)) return () => {};
  state.loading = false; render(); return () => clearPreferencesUI();
}

export function clearPreferencesUI() { const wrap = $('settings-view'); if (wrap) wrap.innerHTML = ''; state = { uid: null, profile: null, generation: null, preferences: { ...DEFAULT_PREFERENCES }, loading: true, saving: false, message: '' }; }
export function getPreferencesState() { return { ...state.preferences }; }
