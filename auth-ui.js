export function showAuthLoading(loading) {
  const button = document.getElementById('login-button');
  button.disabled = loading;
  button.textContent = loading ? 'Signing in…' : 'Sign in';
}

export function showAuthError(message = '') {
  const el = document.getElementById('auth-error');
  el.textContent = message;
  el.classList.toggle('show', Boolean(message));
}

export function clearAuthError() { showAuthError(''); }

export function setPasswordVisible(visible) {
  const input = document.getElementById('password');
  const button = document.getElementById('toggle-password');
  input.type = visible ? 'text' : 'password';
  button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
  button.textContent = visible ? '◉' : '◌';
}

export function showBootStatus(text) { document.getElementById('boot-status').textContent = text; }

export function showPhase(phase) {
  document.getElementById('loading-view').classList.toggle('hidden', phase !== 'booting');
  document.getElementById('auth-view').classList.toggle('hidden', phase !== 'signed-out');
  document.getElementById('app-view').classList.toggle('hidden', phase !== 'ready');
}

export function renderSignedIn(user, profile, cloudStatus = 'Connected') {
  showAuthLoading(false);
  document.getElementById('welcome-title').textContent = `Welcome, ${profile.name}`;
  document.getElementById('user-meta').textContent = `${profile.role === 'student' ? 'Student' : profile.role} • ${user.email || profile.email || ''}`;
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-email').textContent = user.email || profile.email || '—';
  document.getElementById('profile-role').textContent = profile.role || 'Student';
  document.getElementById('profile-id').textContent = user.uid;
  document.getElementById('profile-plan').textContent = profile.plan || 'Premium';
  document.getElementById('cloud-status').textContent = cloudStatus;
  document.getElementById('firebase-status').textContent = `Firebase Auth connected • ${user.uid === profile.id ? 'canonical profile match' : 'email fallback match'}`;
}
