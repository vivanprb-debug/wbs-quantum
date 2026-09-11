import assert from 'node:assert/strict';
import { normaliseTask } from '../tasks/task-service.js';
import { normaliseExam } from '../exams/exam-service.js';
import { normaliseNote } from '../notes/note-service.js';

const task = normaliseTask({ title: '  Maths homework  ', subject: 'Maths', priority:'High', completed:true });
assert.equal(task.title, 'Maths homework');
assert.equal(task.priority, 'High');
assert.equal(task.completed, true);
assert.throws(() => normaliseTask({ title:'' }), /Task title is required/);

const exam = normaliseExam({ title:'Science test', subject:'Biology', date:'2026-10-02', room:'S3' });
assert.equal(exam.title, 'Science test');
assert.equal(exam.room, 'S3');
assert.equal(exam.date, '2026-10-02');
assert.throws(() => normaliseExam({ title:'' }), /Exam title is required/);

const note = normaliseNote({ title:'Revision', body:'Key ideas' });
assert.equal(note.body, 'Key ideas');
assert.equal(note.title, 'Revision');
assert.throws(() => normaliseNote({ title:'x', body:'' }), /Note text is required/);

console.log('Module 9 productivity model tests: PASS');
