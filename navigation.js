export function createNavigation({ defaultView = 'home' } = {}) {
  const views = ['home', 'schedule', 'productivity', 'streaks', 'ai', 'settings', 'revision', 'insights', 'admin'];
  let active = defaultView;
  const show = view => {
    if (!views.includes(view)) return;
    active = view;
    for (const name of views) document.getElementById(`${name}-view`)?.classList.toggle('hidden', name !== view);
    for (const name of views) document.querySelector(`[data-nav="${name}"]`)?.classList.toggle('active', name === view);
    for (const name of views) document.querySelector(`[data-nav="${name}"]`)?.setAttribute('aria-current', name === view ? 'page' : 'false');
    window.dispatchEvent(new CustomEvent('wbs:view-changed', { detail: active }));
  };
  for (const button of document.querySelectorAll('[data-nav]')) {
    button.addEventListener('click', () => show(button.dataset.nav));
  }
  window.addEventListener('wbs:navigate', event => show(event.detail));
  show(active);
  return { show, get active() { return active; } };
}
