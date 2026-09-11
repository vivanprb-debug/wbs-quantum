import assert from 'node:assert/strict';
import { buildTaskInsights, buildRevisionInsights, buildExamInsights, buildSubjectLoad, buildWeeklyReview } from '../insights/insights-service.js';

const tasks = [
  { title:'Done', completed:true, dueDate:'2026-09-10' },
  { title:'Today', completed:false, dueDate:'2026-09-11' },
  { title:'Late', completed:false, dueDate:'2026-09-09' },
  { title:'Future', completed:false, dueDate:'2026-09-15' }
];
const ti = buildTaskInsights(tasks, '2026-09-11');
assert.equal(ti.total, 4); assert.equal(ti.completed, 1); assert.equal(ti.open, 3); assert.equal(ti.overdue, 1); assert.equal(ti.dueToday, 1); assert.equal(ti.completionRate, 25);

const ri = buildRevisionInsights([{minutes:30,completed:true},{minutes:45,completed:false},{minutes:20,completed:true}]);
assert.equal(ri.total,3); assert.equal(ri.completed,2); assert.equal(ri.plannedMinutes,95); assert.equal(ri.completedMinutes,50); assert.equal(ri.completionRate,67);

const ei = buildExamInsights([{title:'Maths',subject:'Maths',date:'2026-09-20'},{title:'Past',subject:'English',date:'2026-09-01'}], '2026-09-11');
assert.equal(ei.upcoming,1); assert.equal(ei.next.title,'Maths'); assert.equal(ei.subjects,2);

const profile = {weekA:{Mon:[{subject:'Maths'},{subject:'English'}],Tue:[{subject:'Maths'}]},weekB:{Mon:[{subject:'Maths'}],Tue:[{subject:'Registration'},{subject:'Science'}]}};
const load = buildSubjectLoad(profile);
assert.deepEqual(load[0], {subject:'Maths',count:3});
assert.equal(load.find(x=>x.subject==='Registration'), undefined);

const week = buildWeeklyReview(tasks,[{date:'2026-09-10',completed:false}], [{date:'2026-09-12',title:'Exam'}], new Date('2026-09-11T12:00:00'));
assert.equal(week.length,7); assert.equal(week[4].key,'2026-09-11'); assert.equal(week[4].tasks,1); assert.equal(week[3].revision,1); assert.equal(week[5].exams,1);
console.log('Module 16 insights tests passed');
