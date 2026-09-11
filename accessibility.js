function getVisibleDialog() {
  return [...document.querySelectorAll('[role="dialog"]')].find(el => !el.classList.contains('hidden')) || null;
}

function focusFirst(container) {
  const target = container?.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
  target?.focus({ preventScroll: true });
}

export function setupAccessibility() {
  let lastFocused = null;

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const dialog = getVisibleDialog();
      if (dialog) {
        const close = dialog.querySelector('[id$="-close"], [aria-label^="Close"]');
        close?.click();
        return;
      }
      const notificationPanel = document.getElementById('notification-panel');
      if (notificationPanel && !notificationPanel.classList.contains('hidden')) {
        document.getElementById('notification-button')?.click();
      }
    }

    if (event.key === 'Tab') {
      const dialog = getVisibleDialog();
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('#global-search-button, #notification-button, [data-open-modal]');
    if (trigger) lastFocused = trigger;
    const dialog = getVisibleDialog();
    if (dialog && !dialog.contains(document.activeElement)) focusFirst(dialog);
  });

  window.addEventListener('wbs:view-changed', event => {
    document.querySelectorAll('[data-nav]').forEach(button => {
      const active = button.dataset.nav === event.detail;
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
  });

  window.addEventListener('wbs:modal-closed', () => {
    lastFocused?.focus?.({ preventScroll: true });
    lastFocused = null;
  });

  const app = document.getElementById('app');
  if (app) app.setAttribute('data-accessibility-ready', 'true');
}
