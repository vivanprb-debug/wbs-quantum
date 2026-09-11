import { FIREBASE_CONFIG, APP } from './config.js';
import { AppError } from './errors.js';

let initialized = false;
let auth = null;
let db = null;

function waitForFirebaseSdk(timeoutMs = APP.firebaseSdkWaitMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (window.firebase?.initializeApp && window.firebase?.auth && window.firebase?.firestore) {
        resolve(window.firebase);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        reject(new AppError('Firebase SDK did not load. Check the Firebase CDN/network connection.', 'firebase/sdk-timeout'));
        return;
      }
      window.setTimeout(check, 50);
    };
    check();
  });
}

export async function initializeFirebase() {
  if (initialized) return { auth, db };
  const firebase = await waitForFirebaseSdk();
  try {
    const existing = firebase.apps?.length ? firebase.apps[0] : firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth(existing);
    db = firebase.firestore(existing);
    initialized = true;
    return { auth, db };
  } catch (error) {
    throw new AppError('Firebase could not be initialized.', 'firebase/init-failed', error);
  }
}

export function getAuth() {
  if (!auth) throw new AppError('Firebase Auth is not initialized.', 'firebase/auth-not-ready');
  return auth;
}

export function getDb() {
  if (!db) throw new AppError('Firestore is not initialized.', 'firebase/firestore-not-ready');
  return db;
}
