import assert from 'node:assert/strict';
import { DEFAULT_PREFERENCES, normalizePreferences } from '../preferences/preferences-service.js';

const a = normalizePreferences({ scheduleView: 'week', taskDefaultPriority: 'high', compactTasks: true, streakReminders: false, aiSuggestions: false });
assert.equal(a.scheduleView, 'week');
assert.equal(a.taskDefaultPriority, 'high');
assert.equal(a.compactTasks, true);
assert.equal(a.streakReminders, false);
assert.equal(a.aiSuggestions, false);

const b = normalizePreferences({ scheduleView: 'sideways', taskDefaultPriority: 'urgent', streakReminders: null, aiSuggestions: 0 });
assert.deepEqual(b, { ...DEFAULT_PREFERENCES, compactTasks: false });
assert.equal(normalizePreferences(null).scheduleView, 'day');
console.log('Module 12 preference tests passed.');
