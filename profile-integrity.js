import { PROFILE_REGISTRY } from './profile-registry.js';
import { getAcademicProfile } from './academic-data.js';

function validateLessons(lessons, label) {
  if (!Array.isArray(lessons) || lessons.length !== 6) throw new Error(`${label} must contain registration plus five periods.`);
  lessons.forEach((item, index) => {
    if (!item || !item.subject || !item.room) throw new Error(`${label} period ${index} is incomplete.`);
    if (index === 0 && item.type !== 'registration') throw new Error(`${label} first entry must be registration.`);
  });
}

function validatePeRotation(profile, academic) {
  if (!Array.isArray(academic.peRotation) || !academic.peRotation.length) throw new Error(`${profile.name} is missing PE rotation data.`);
  const dates = academic.peRotation.map(block => block.wc);
  if (dates.some(value => !/^202[6-7]-\d\d-\d\d$/.test(value))) throw new Error(`${profile.name} has an invalid PE rotation date.`);
}

export function validateAcademicProfile(profile) {
  const academic = getAcademicProfile(profile.id);
  if (!academic) throw new Error(`Academic profile missing for ${profile.name}.`);
  if (academic.name !== profile.name) throw new Error(`Profile name mismatch for ${profile.name}.`);
  ['weekA', 'weekB'].forEach(weekKey => {
    [1,2,3,4,5].forEach(day => validateLessons(academic[weekKey][day], `${profile.name} Week ${weekKey.slice(-1)} day ${day}`));
  });
  validatePeRotation(profile, academic);
  return true;
}

export function validateAllAcademicProfiles() {
  const failures = [];
  const ids = Object.keys(PROFILE_REGISTRY);
  if (new Set(Object.values(PROFILE_REGISTRY).map(profile => profile.email.toLowerCase())).size !== ids.length) {
    failures.push({ id: 'registry', name: 'Profiles', message: 'Duplicate profile email detected.' });
  }
  Object.values(PROFILE_REGISTRY).forEach(profile => {
    try { validateAcademicProfile(profile); }
    catch (error) { failures.push({ id: profile.id, name: profile.name, message: error.message }); }
  });
  // Explicitly guard against accidental cross-profile timetable reuse by comparing object identities.
  const academics = ids.map(id => getAcademicProfile(id)).filter(Boolean);
  for (let i = 0; i < academics.length; i += 1) {
    for (let j = i + 1; j < academics.length; j += 1) {
      if (academics[i].weekA === academics[j].weekA || academics[i].weekB === academics[j].weekB) {
        failures.push({ id: 'isolation', name: `${academics[i].name}/${academics[j].name}`, message: 'Two students share a timetable object.' });
      }
    }
  }
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
}
