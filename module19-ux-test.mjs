import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles/base.css'), 'utf8');
const nav = fs.readFileSync(path.join(root, 'src/app/navigation.js'), 'utf8');
const a11y = fs.readFileSync(path.join(root, 'src/ui/accessibility.js'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'src/app/bootstrap.js'), 'utf8');
const config = fs.readFileSync(path.join(root, 'src/core/config.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.match(index, /rel="preconnect" href="https:\/\/www\.gstatic\.com"/);
assert.match(index, /class="skip-link"/);
assert.match(index, /color-scheme/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /focus-visible/);
assert.match(nav, /aria-current/);
assert.match(a11y, /Escape/);
assert.match(a11y, /Tab/);
assert.match(a11y, /wbs:view-changed/);
assert.match(bootstrap, /setupAccessibility/);
assert.match(config, /recode-module-(?:19|20)/);
assert.match(sw, /recode-m(?:19|20)/);
assert.match(sw, /src\/ui\/accessibility\.js/);
console.log('Module 19 UX/accessibility tests passed.');
