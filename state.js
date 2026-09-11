const state = {
  phase: 'booting',
  firebase: 'loading',
  auth: 'signed-out',
  user: null,
  profile: null,
  cloud: 'unknown',
  error: null,
  sessionGeneration: 0
};

const listeners = new Set();

export function getState() { return structuredClone(state); }
export function patchState(patch) {
  Object.assign(state, patch);
  for (const listener of listeners) listener(getState());
}
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
