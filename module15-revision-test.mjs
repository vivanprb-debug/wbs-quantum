import assert from 'node:assert/strict';
import { buildRevisionPlan, daysUntil, normaliseSession } from '../revision/revision-service.js';

assert.equal(daysUntil('2026-09-11','2026-09-11'), 0);
assert.equal(daysUntil('2026-09-11','2026-09-14'), 3);
assert.throws(() => normaliseSession({ date:'2026-09-12' }), /title/);

const plan = buildRevisionPlan([
  { id:'e1', title:'Maths Test', subject:'Maths', date:'2026-09-16' },
  { id:'e2', title:'Science Test', subject:'Science', date:'2026-09-19' }
], new Date('2026-09-11T12:00:00'));
assert.ok(plan.length > 0);
assert.ok(plan.every(x => x.date >= '2026-09-11'));
assert.ok(plan.every(x => x.date < '2026-09-16' || x.examId !== 'e1'));
assert.ok(plan.some(x => x.examId === 'e1'));
console.log('Module 15 revision tests passed');

import fs from 'node:fs';
const root = new URL('../..', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
assert.match(read('src/core/config.js'), /recode-module-(?:1[5-9]|20)/);
assert.match(read('sw.js'), /wbs-quantum-recode-m(?:1[5-9]|20)-v1/);
assert.match(read('src/app/navigation.js'), /revision/);
assert.match(read('src/app/session-lifecycle.js'), /mountRevisionUI/);
assert.match(read('firestore.rules.txt'), /revisionSessions/);
assert.match(read('index.html'), /revision-view/);
console.log('Module 15 integration checks passed');
