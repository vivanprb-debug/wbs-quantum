import assert from 'node:assert/strict';
import { listKnownProfiles } from '../profiles/profile-registry.js';
import { getAcademicProfile } from '../timetable/academic-data.js';
import { getScheduleForDate, getWeekSchedule, getCurrentLesson, getNextLesson, getPEActivity } from '../timetable/timetable-service.js';

const iso = s => new Date(`${s}T12:00:00`);
const users = listKnownProfiles();
assert.equal(users.length, 5, 'Expected five known users');

for (const user of users) {
  const academic = getAcademicProfile(user.id);
  assert.ok(academic, `${user.name} missing academic profile`);
  for (const date of ['2026-08-31','2026-09-01','2026-09-02','2026-09-03','2026-09-04']) {
    const schedule = getScheduleForDate(user, iso(date));
    if (schedule.lessons.length) assert.equal(schedule.lessons.length, 6, `${user.name} ${date} should have registration + five lessons`);
  }
  const weekA = getWeekSchedule(user, iso('2026-08-31'));
  const weekB = getWeekSchedule(user, iso('2026-09-07'));
  assert.equal(weekA.length, 5); assert.equal(weekB.length, 5);
}

const fionan = users.find(x => x.name === 'Fionan');
assert.ok(fionan);
const fionanBFriday = getScheduleForDate(fionan, iso('2026-09-11'));
assert.equal(fionanBFriday.week, 'B');
assert.deepEqual(fionanBFriday.lessons.slice(1).map(x => x.subject), ['Science (Biology)','Maths','Art','English','PSHE']);
assert.deepEqual(fionanBFriday.lessons.slice(1).map(x => `${x.teacher}|${x.room}`), ['Miss Bermingham|S3','Dr Smith|M7','Ms Mitchell|AD2','Mrs Eye|E4','Ms Afford|H6']);
const pe = getPEActivity(fionan, iso('2026-09-08'));
assert.equal(pe?.activity, 'Football');

const fionanMonday = getScheduleForDate(fionan, iso('2026-09-07'));
assert.deepEqual(fionanMonday.lessons.slice(1).map(x => x.subject), ['Science (Biology)','German','English','Maths','Geography']);

const now = new Date('2026-09-11T16:21:00');
const next = getNextLesson(fionan, now);
assert.equal(next?.subject, 'Technology / DT', 'After Friday school, next should be Monday Period 1, not registration');

const current = getCurrentLesson(fionan, new Date('2026-09-11T14:20:00'));
assert.equal(current?.lesson.subject, 'PSHE');

console.log('Module 8 timetable tests: PASS');
