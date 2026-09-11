export class AppError extends Error {
  constructor(message, code = 'app/unknown', cause = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export function authErrorMessage(error) {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-email': 'That email address is not valid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account was found for that email.',
    'auth/wrong-password': 'The password is incorrect.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
    'auth/network-request-failed': 'Firebase could not connect. Check your internet connection.',
    'auth/internal-error': 'Firebase returned an internal error. Please try again.'
  };
  return messages[code] || `Sign-in failed${code ? ` (${code})` : ''}.`;
}

export function dataErrorMessage(error) {
  const code = error?.code || '';
  if (code === 'permission-denied') return 'You do not have permission to change this data.';
  if (code === 'unavailable') return 'Cloud data is temporarily unavailable. Your local copy is still available.';
  if (code === 'failed-precondition') return 'Cloud data is not ready yet. Please try again shortly.';
  return error?.message || 'The data could not be loaded.';
}
