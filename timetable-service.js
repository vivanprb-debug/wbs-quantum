import { BELL_TIMES, dayMeta, dayNumber, getWeekType, isoDate, mondayOfWeek, normaliseDate } from './school-calendar.js';
import { getAcademicProfile } from './academic-data.js';

function cloneLesson(lesson, periodIndex) {
  return lesson ? Object.freeze({ ...lesson, period: periodIndex, periodId: periodIndex === 0 ? 'REG' : `P${periodIndex}` }) : null;
}

export function requireAcademicProfile(profile) {
  if (!profile?.id) throw new Error('No student profile is available for the timetable.');
  const academic = getAcademicProfile(profile.id);
  if (!academic) throw new Error(`Timetable data is not configured for ${profile.name || 'this student'}.`);
  return academic;
}

export function getScheduleForDate(profile, date = new Date()) {
  const academic = requireAcademicProfile(profile);
  const day = dayNumber(date);
  if (!day) return Object.freeze({ date: isoDate(date), week: getWeekType(date), day: null, lessons: Object.freeze([]) });
  const week = getWeekType(date);
  const source = week === 'A' ? academic.weekA : academic.weekB;
  const lessons = (source[day] || []).map((item, index) => cloneLesson(item, index)).filter(Boolean);
  return Object.freeze({ date: isoDate(date), week, day, dayMeta: dayMeta(day), lessons: Object.freeze(lessons) });
}

export function getWeekSchedule(profile, value = new Date()) {
  const academic = requireAcademicProfile(profile);
  const monday = mondayOfWeek(value);
  const week = getWeekType(monday);
  const source = week === 'A' ? academic.weekA : academic.weekB;
  return Object.freeze([1, 2, 3, 4, 5].map(day => Object.freeze({
    date: (() => { const d = new Date(monday); d.setDate(d.getDate() + day - 1); return isoDate(d); })(),
    week,
    day,
    dayMeta: dayMeta(day),
    lessons: Object.freeze((source[day] || []).map((item, index) => cloneLesson(item, index)).filter(Boolean))
  })));
}

export function getLessonTimes(period) {
  return BELL_TIMES.find(item => (period === 0 ? item.id === 'REG' : item.id === `P${period}`)) || null;
}

function asMinutes(hours, minutes) { return hours * 60 + minutes; }
function timeMinutes(date) { return asMinutes(date.getHours(), date.getMinutes()); }
function parseClock(clock) { const [h, m] = clock.split(':').map(Number); return asMinutes(h, m); }

export function getCurrentLesson(profile, value = new Date()) {
  const now = value instanceof Date ? new Date(value.getTime()) : normaliseDate(value);
  const schedule = getScheduleForDate(profile, now);
  const minutes = timeMinutes(now);
  for (const item of schedule.lessons) {
    const time = getLessonTimes(item.period);
    if (!time) continue;
    const start = parseClock(time.start);
    const end = parseClock(time.end);
    if (minutes >= start && minutes < end) return Object.freeze({ lesson: item, time, status: 'current' });
  }
  return null;
}

export function getNextLesson(profile, value = new Date()) {
  const now = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  const schedule = getWeekSchedule(profile, now);
  const currentDay = dayNumber(now);
  if (!currentDay) return findNextSchoolDay(profile, now);
  const minutes = timeMinutes(now);
  const today = schedule.find(item => item.day === currentDay);
  if (today) {
    for (const lesson of today.lessons.filter(item => item.period > 0)) {
      const time = getLessonTimes(lesson.period);
      if (time && parseClock(time.end) > minutes) return Object.freeze({ ...lesson, date: today.date, time });
    }
  }
  for (let day = currentDay + 1; day <= 5; day++) {
    const nextDay = schedule.find(item => item.day === day);
    if (nextDay?.lessons.length) {
      const lesson = nextDay.lessons.find(item => item.period > 0);
      if (lesson) return Object.freeze({ ...lesson, date: nextDay.date, time: getLessonTimes(lesson.period) });
    }
  }
  return findNextSchoolDay(profile, new Date(new Date(now).setDate(now.getDate() + 3)));
}

function findNextSchoolDay(profile, start) {
  const probe = new Date(start.getTime());
  for (let i = 0; i < 10; i++) {
    probe.setDate(probe.getDate() + (i === 0 ? 0 : 1));
    const day = dayNumber(probe);
    if (!day) continue;
    const schedule = getScheduleForDate(profile, probe);
    if (schedule.lessons.length) {
      const lesson = schedule.lessons.find(item => item.period > 0);
      if (lesson) return Object.freeze({ ...lesson, date: schedule.date, time: getLessonTimes(lesson.period) });
    }
  }
  return null;
}

export function getPEActivity(profile, value = new Date()) {
  const academic = requireAcademicProfile(profile);
  const schedule = getScheduleForDate(profile, value);
  const peLessons = schedule.lessons.filter(item => item.type === 'pe');
  if (!peLessons.length || !academic.peRotation?.length) return null;
  const monday = isoDate(mondayOfWeek(value));
  let chosen = null;
  for (const block of academic.peRotation) if (block.wc <= monday) chosen = block;
  if (!chosen) return null;
  const peDay = academic.peDays?.[schedule.week] || [];
  if (!peDay.includes(schedule.day)) return null;
  const activity = schedule.week === 'A' ? chosen.a : chosen.b;
  return activity ? Object.freeze({ activity, blockWeek: chosen.wc, week: schedule.week, date: schedule.date }) : null;
}

export function searchTimetable(profile, query) {
  const academic = requireAcademicProfile(profile);
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return Object.freeze([]);
  const hits = [];
  for (const week of ['A', 'B']) {
    const source = week === 'A' ? academic.weekA : academic.weekB;
    for (const day of [1, 2, 3, 4, 5]) {
      (source[day] || []).forEach((item, index) => {
        const haystack = `${item.subject} ${item.teacher} ${item.room}`.toLowerCase();
        if (haystack.includes(needle)) hits.push(Object.freeze({ week, day, period: index, ...item }));
      });
    }
  }
  return Object.freeze(hits);
}
