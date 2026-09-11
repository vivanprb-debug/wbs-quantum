import { getAuth } from '../core/firebase.js';
import { APP } from '../core/config.js';
import { AppError } from '../core/errors.js';

let unsubscribe = null;

export function listenToAuth(onUser, onError) {
  const auth = getAuth();
  if (unsubscribe) unsubscribe();
  unsubscribe = auth.onAuthStateChanged(onUser, onError);
  return unsubscribe;
}

export async function signIn(email, password) {
  const auth = getAuth();
  if (!email || !password) throw new AppError('Enter your email and password.', 'auth/missing-fields');
  const operation = auth.signInWithEmailAndPassword(email.trim(), password);
  const result = await Promise.race([
    operation,
    new Promise((_, reject) => window.setTimeout(() => reject(new AppError('Firebase sign-in timed out. Please try again.', 'auth/timeout')), APP.authWaitMs))
  ]);
  return result.user;
}

export async function signOut() {
  await getAuth().signOut();
}

export async function sendPasswordReset(email) {
  if (!email?.trim()) throw new AppError('Enter your school email first.', 'auth/reset-missing-email');
  await getAuth().sendPasswordResetEmail(email.trim());
}
