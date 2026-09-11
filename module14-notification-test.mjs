import assert from 'node:assert/strict';
import { buildNotifications, dayDiff } from '../notifications/notification-service.js';

assert.equal(dayDiff('2026-09-11','2026-09-11'), 0);
assert.equal(dayDiff('2026-09-11','2026-09-12'), 1);
assert.equal(dayDiff('2026-09-11','2026-09-10'), -1);

let items = buildNotifications({
  today: '2026-09-11',
  tasks: [
    { id:'a', title:'Maths homework', dueDate:'2026-09-11', completed:false },
    { id:'b', title:'Done task', dueDate:'2026-09-11', completed:true },
    { id:'c', title:'English', dueDate:'2026-09-10', completed:false }
  ],
  exams: [{ id:'e', title:'Science test', subject:'Biology', date:'2026-09-12' }],
  streak: { claimedToday:false }, preferences:{ streakReminders:true }
});
assert.equal(items.some(x => x.id === 'task-today-a'), true);
assert.equal(items.some(x => x.id === 'task-overdue-c'), true);
assert.equal(items.some(x => x.id === 'exam-tomorrow-e'), true);
assert.equal(items.some(x => x.type === 'streak'), true);
assert.equal(items.some(x => x.id === 'task-today-b'), false);

items = buildNotifications({ today:'2026-09-11', streak:{claimedToday:true}, preferences:{streakReminders:true} });
assert.equal(items.some(x => x.type === 'streak'), false);
console.log('Module 14 notification tests passed');

import fs from 'node:fs';
import assert2 from 'node:assert/strict';
const root = new URL('../..', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
assert2.match(read('src/core/config.js'), /recode-module-(?:1[5-9]|20)/);
assert2.match(read('sw.js'), /wbs-quantum-recode-m(?:1[5-9]|20)-v1/);
assert2.match(read('sw.js'), /notifications\/notification-ui\.js/);
assert2.match(read('index.html'), /notification-button/);
assert2.match(read('src/app/session-lifecycle.js'), /mountNotificationUI/);
assert2.match(read('src/app/session-lifecycle.js'), /clearNotificationUI/);
console.log('Module 14 integration checks passed');
