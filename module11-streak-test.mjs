import assert from 'node:assert/strict';
import { calculateClaim, calculateScore, dateDifferenceInDays, earnedAchievements } from '../streaks/streak-service.js';

assert.equal(dateDifferenceInDays('2026-09-10', '2026-09-11'), 1);
assert.equal(dateDifferenceInDays('2026-09-10', '2026-09-12'), 2);
assert.deepEqual(calculateClaim({}, '2026-09-11'), { changed:true, currentStreak:1, totalDays:1, reason:'first' });
assert.deepEqual(calculateClaim({ lastClaimDate:'2026-09-11', currentStreak:4, totalDays:7 }, '2026-09-11'), { changed:false, currentStreak:4, totalDays:7, reason:'already-claimed' });
assert.deepEqual(calculateClaim({ lastClaimDate:'2026-09-10', currentStreak:4, totalDays:7 }, '2026-09-11'), { changed:true, currentStreak:5, totalDays:8, reason:'continued' });
assert.deepEqual(calculateClaim({ lastClaimDate:'2026-09-08', currentStreak:9, totalDays:12 }, '2026-09-11'), { changed:true, currentStreak:1, totalDays:13, reason:'reset' });
assert.deepEqual(earnedAchievements(7, ['starter']), ['week']);
assert.equal(calculateScore({ totalDays:7, currentStreak:7, longestStreak:7, achievements:['starter','week'] }), 175);
console.log('Module 11 streak logic tests passed.');

import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
assert.match(html, /data-nav=\"streaks\"/);
assert.match(html, /id=\"streaks-view\"/);
const nav = readFileSync(new URL('../app/navigation.js', import.meta.url), 'utf8');
assert.match(nav, /streaks/);
const lifecycle = readFileSync(new URL('../app/session-lifecycle.js', import.meta.url), 'utf8');
assert.match(lifecycle, /clearStreakUI/);
console.log('Module 11 integration checks passed.');
