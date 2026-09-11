export const SCHOOL_YEAR = Object.freeze({ start: '2026-08-31', end: '2027-07-23', firstWeek: 'A' });

export const DAYS = Object.freeze([
  Object.freeze({ number: 1, key: 'monday', short: 'Mon', full: 'Monday' }),
  Object.freeze({ number: 2, key: 'tuesday', short: 'Tue', full: 'Tuesday' }),
  Object.freeze({ number: 3, key: 'wednesday', short: 'Wed', full: 'Wednesday' }),
  Object.freeze({ number: 4, key: 'thursday', short: 'Thu', full: 'Thursday' }),
  Object.freeze({ number: 5, key: 'friday', short: 'Fri', full: 'Friday' })
]);

export const BELL_TIMES = Object.freeze([
  Object.freeze({ id: 'REG', label: 'Registration', start: '08:30', end: '09:00' }),
  Object.freeze({ id: 'P1', label: 'Period 1', start: '09:00', end: '10:00' }),
  Object.freeze({ id: 'P2', label: 'Period 2', start: '10:00', end: '11:20' }),
  Object.freeze({ id: 'P3', label: 'Period 3', start: '11:20', end: '12:20' }),
  Object.freeze({ id: 'P4', label: 'Period 4', start: '12:20', end: '13:55' }),
  Object.freeze({ id: 'P5', label: 'Period 5', start: '13:55', end: '14:55' })
]);

export function normaliseDate(value = new Date()) {
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(d.getTime())) throw new TypeError('Invalid date');
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isoDate(value = new Date()) {
  const d = normaliseDate(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function mondayOfWeek(value = new Date()) {
  const d = normaliseDate(value);
  const jsDay = d.getDay();
  const offset = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + offset);
  return d;
}

export function getWeekType(value = new Date()) {
  const monday = mondayOfWeek(value);
  const start = mondayOfWeek(new Date(`${SCHOOL_YEAR.start}T00:00:00`));
  const days = Math.floor((monday.getTime() - start.getTime()) / 86400000);
  const fortnight = Math.floor(days / 7);
  return Math.abs(fortnight) % 2 === 0 ? 'A' : 'B';
}

export function isSchoolDay(value = new Date()) {
  const d = normaliseDate(value);
  const weekday = d.getDay();
  return weekday >= 1 && weekday <= 5 && isoDate(d) >= SCHOOL_YEAR.start && isoDate(d) <= SCHOOL_YEAR.end;
}

export function dayNumber(value = new Date()) {
  const jsDay = normaliseDate(value).getDay();
  return jsDay >= 1 && jsDay <= 5 ? jsDay : null;
}

export function dayMeta(number) {
  return DAYS.find(day => day.number === number) || null;
}
