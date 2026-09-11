const freezeProfile = profile => Object.freeze({ ...profile });

export const PROFILE_REGISTRY = Object.freeze({
  'lMJrosbRgtVXmuRz7gZUxAlBMn53': freezeProfile({ id: 'lMJrosbRgtVXmuRz7gZUxAlBMn53', name: 'Vivan', email: 'vivan@wbsquantum.app', role: 'student', plan: 'Premium' }),
  'o2Nv7qVfIoY5olElothK3YQnbGB2': freezeProfile({ id: 'o2Nv7qVfIoY5olElothK3YQnbGB2', name: 'Shriyan', email: 'shriyan@wbsquantum.app', role: 'student', plan: 'Premium' }),
  'Nx8kPsp1NKhdJSio2PpRYDIvit22': freezeProfile({ id: 'Nx8kPsp1NKhdJSio2PpRYDIvit22', name: 'Ryan', email: 'ryan@wbsquantum.app', role: 'student', plan: 'Premium' }),
  'YAF3QAxWhJRzFDvqDSBSp1xUHxH3': freezeProfile({ id: 'YAF3QAxWhJRzFDvqDSBSp1xUHxH3', name: 'Freddie', email: 'freddie@wbsquantum.app', role: 'student', plan: 'Premium' }),
  'q5LP7Hr7EUX8CNbgNxcPrHY67it1': freezeProfile({ id: 'q5LP7Hr7EUX8CNbgNxcPrHY67it1', name: 'Fionan', email: 'fionan@wbsquantum.app', role: 'student', plan: 'Premium' })
});

const EMAIL_INDEX = Object.freeze(
  Object.fromEntries(Object.values(PROFILE_REGISTRY).map(profile => [profile.email.toLowerCase(), profile.id]))
);

export function resolveProfile(user) {
  if (!user) return null;
  const direct = user.uid ? PROFILE_REGISTRY[user.uid] : null;
  if (direct) return direct;
  const email = String(user.email || '').trim().toLowerCase();
  const matchedId = EMAIL_INDEX[email];
  if (matchedId && PROFILE_REGISTRY[matchedId]) return PROFILE_REGISTRY[matchedId];
  return {
    id: user.uid || '',
    name: user.displayName || (email ? email.split('@')[0] : 'Student'),
    email: user.email || '',
    role: 'student',
    plan: 'Premium',
    configured: false
  };
}

export function isKnownStudentId(id) {
  return Boolean(id && PROFILE_REGISTRY[id]);
}

export function listKnownProfiles() {
  return Object.freeze(Object.values(PROFILE_REGISTRY));
}
