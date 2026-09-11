import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const service = fs.readFileSync(path.join(root, 'src/admin/admin-service.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'src/admin/admin-ui.js'), 'utf8');
const rules = fs.readFileSync(path.join(root, 'firestore.rules.txt'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'src/app/bootstrap.js'), 'utf8');
const lifecycle = fs.readFileSync(path.join(root, 'src/app/session-lifecycle.js'), 'utf8');
const config = fs.readFileSync(path.join(root, 'src/core/config.js'), 'utf8');

assert.match(service, /dev@wbsquantum\.app/);
assert.match(service, /appConfig.*maintenance/s);
assert.match(service, /appConfig.*features/s);
assert.match(service, /Developer access is required/);
assert.match(ui, /admin-maintenance-enabled/);
assert.match(ui, /admin-save-features/);
assert.match(index, /id="admin-view"/);
assert.match(index, /data-nav="admin"/);
assert.match(bootstrap, /getMaintenance/);
assert.match(lifecycle, /mountAdminUI|clearAdminUI/);
assert.match(rules, /match \/appConfig\/maintenance/);
assert.match(rules, /match \/appConfig\/features/);
assert.match(rules, /request\.auth\.token\.email == 'dev@wbsquantum\.app'/);
assert.match(config, /recode-module-(?:18|19|20)/);
console.log('Module 18 admin tests passed.');
