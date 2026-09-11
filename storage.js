const PREFIX = 'wbsq.v3.';

export function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn('[WBS Quantum] local read failed', key, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('[WBS Quantum] local write failed', key, error);
    return false;
  }
}

export function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch (error) { console.warn('[WBS Quantum] local remove failed', key, error); }
}
