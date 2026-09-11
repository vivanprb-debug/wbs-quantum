import { loadNotificationSnapshot, requestBrowserNotificationPermission, browserNotificationsSupported, sendBrowserNotification } from './notification-service.js';
import { isSessionCurrent } from '../auth/session-controller.js';

let state = { uid: null, profile: null, generation: null, items: [], loading: false, permission: 'default', lastSeen: [] };
let timer = null;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function renderPanel() {
  const host = $('notification-panel');
  if (!host) return;
  const count = state.items.length;
  host.innerHTML = `<div class="notification-panel-inner"><div class="section-heading"><div><div class="eyebrow">ALERTS</div><h3>Notifications</h3></div><div class="notification-actions"><span class="badge">${count}</span><button id="notification-close" class="icon-button" type="button" aria-label="Close notifications">×</button></div></div><div id="notification-list" class="notification-list">${count ? state.items.map(renderItem).join('') : '<div class="empty-state">You are all caught up.</div>'}</div>${browserNotificationsSupported() ? `<div class="notification-footer"><span class="subtle">Browser alerts: ${esc(state.permission)}</span><button id="enable-browser-notifications" class="small-button" type="button" ${state.permission==='granted'?'disabled':''}>${state.permission==='granted'?'Enabled':'Enable'}</button></div>` : ''}</div>`;
  host.classList.remove('hidden');
  $('notification-close')?.addEventListener('click', closeNotifications);
  $('enable-browser-notifications')?.addEventListener('click', enableBrowserNotifications);
  host.querySelectorAll('[data-notification-target]').forEach(btn => btn.addEventListener('click', () => {
    const target = btn.dataset.notificationTarget;
    closeNotifications();
    window.dispatchEvent(new CustomEvent('wbs:navigate', { detail: target }));
  }));
}

function renderItem(item) {
  return `<button class="notification-item ${esc(item.tone)}" data-notification-target="${esc(item.target)}" type="button"><span class="notification-icon">${esc(item.icon)}</span><span class="notification-main"><strong>${esc(item.title)}</strong><small>${esc(item.text)}</small></span><span class="notification-arrow">›</span></button>`;
}

function closeNotifications() { $('notification-panel')?.classList.add('hidden'); }

async function enableBrowserNotifications() {
  const permission = await requestBrowserNotificationPermission();
  state.permission = permission;
  renderPanel();
}

async function refresh() {
  if (!state.uid) return;
  const uid = state.uid, generation = state.generation;
  state.loading = true;
  try {
    const items = await loadNotificationSnapshot(uid);
    if (!isSessionCurrent(generation, uid)) return;
    const previousIds = new Set(state.lastSeen);
    state.items = items;
    state.loading = false;
    const fresh = items.filter(item => !previousIds.has(item.id));
    if (state.lastSeen.length && fresh.length && state.permission === 'granted') {
      const first = fresh[0];
      sendBrowserNotification(first.title, { body: first.text });
    }
    state.lastSeen = items.map(item => item.id);
    updateBell();
    const panel = $('notification-panel');
    if (panel && !panel.classList.contains('hidden')) renderPanel();
  } catch { state.loading = false; }
}

function updateBell() {
  const button = $('notification-button');
  if (!button) return;
  button.innerHTML = `♢<span class="notification-count" ${state.items.length ? '' : 'hidden'}>${Math.min(state.items.length, 99)}</span>`;
  button.setAttribute('aria-label', `Notifications${state.items.length ? `, ${state.items.length} alerts` : ''}`);
}

export async function mountNotificationUI({ studentProfile, userId, sessionGeneration = null } = {}) {
  clearNotificationUI();
  state = { uid: userId, profile: studentProfile, generation: sessionGeneration, items: [], loading: false, permission: browserNotificationsSupported() ? Notification.permission : 'unsupported', lastSeen: [] };
  $('notification-panel')?.classList.add('hidden');
  updateBell();
  $('notification-button')?.addEventListener('click', renderPanel);
  await refresh();
  timer = window.setInterval(refresh, 60000);
}

export function clearNotificationUI() {
  if (timer) { clearInterval(timer); timer = null; }
  $('notification-button')?.replaceWith($('notification-button')?.cloneNode(true));
  $('notification-panel')?.classList.add('hidden');
  const host = $('notification-panel'); if (host) host.innerHTML = '';
  state = { uid: null, profile: null, generation: null, items: [], loading: false, permission: 'default', lastSeen: [] };
}
