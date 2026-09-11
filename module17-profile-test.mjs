import assert from 'node:assert/strict';
import fs from 'node:fs';

const service = fs.readFileSync(new URL('../preferences/preferences-service.js', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('../preferences/preferences-ui.js', import.meta.url), 'utf8');
const config = fs.readFileSync(new URL('../core/config.js', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');

assert.match(service, /displayName: ''/);
assert.match(service, /studyGoal: 'Stay organised'/);
assert.match(service, /favouriteSubject: 'Maths'/);
assert.match(service, /users.*preferences/si);
assert.match(ui, /pref-display-name/);
assert.match(ui, /pref-favourite-subject/);
assert.match(ui, /pref-study-goal/);
assert.match(ui, /savePreferences\(state\.uid/);
assert.match(config, /recode-module-(?:17|18|19|20)/);
assert.match(sw, /wbs-quantum-recode-m(?:17|18|19|20)-v1/);
assert.match(sw, /src\/preferences\/preferences-service\.js/);
console.log('Module 17 profile tests passed');
