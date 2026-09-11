import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateReleaseShell } from '../core/release-integrity.js';

const root = path.resolve(process.cwd());
const config = fs.readFileSync(path.join(root, 'src/core/config.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'src/app/bootstrap.js'), 'utf8');

assert.match(config, /recode-module-20/);
assert.match(sw, /recode-m20/);
assert.match(sw, /src\/core\/release-integrity\.js/);
assert.match(index, /id="app-view"/);
assert.match(index, /data-nav="admin"/);
assert.match(bootstrap, /validateReleaseShell/);
assert.match(bootstrap, /unhandledrejection/);

const fakeDocument = {
  getElementById: id => ({
    'loading-view': {}, 'auth-view': {}, 'app-view': {}, 'home-view': {}, 'schedule-view': {},
    'productivity-view': {}, 'streaks-view': {}, 'ai-view': {}, 'settings-view': {},
    'revision-view': {}, 'insights-view': {}, 'admin-view': {}
  }[id] || null),
  querySelector: selector => selector.startsWith('[data-nav=') ? {} : null,
  scripts: [
    { src: 'firebase-app-compat.js' }, { src: 'firebase-auth-compat.js' },
    { src: 'firebase-firestore-compat.js' }, { src: 'firebase-functions-compat.js' }
  ]
};
assert.equal(validateReleaseShell(fakeDocument).ok, true);
console.log('Module 20 release/integration tests passed.');
