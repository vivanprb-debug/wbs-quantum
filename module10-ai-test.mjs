import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const aiService = fs.readFileSync(path.join(root, 'src/ai/ai-service.js'), 'utf8');
const fn = fs.readFileSync(path.join(root, 'functions/index.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(aiService, /httpsCallable\('askGemini'\)/);
assert.match(fn, /defineSecret\('GEMINI_API_KEY'\)/);
assert.doesNotMatch(fn, /AQ\./);
assert.doesNotMatch(html, /AQ\./);
assert.match(html, /firebase-functions-compat\.js/);
assert.match(html, /id="ai-view"/);
assert.match(html, /data-nav="ai"/);
console.log('Module 10 AI architecture checks passed');
