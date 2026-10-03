import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const app = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const redirects = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8');
const modal = readFileSync(new URL('./components/PolicyModal.jsx', import.meta.url), 'utf8');

test('policy pages have public canonical routes and mobile titles', () => {
  for (const [path, title] of [['/terms', '用户协议'], ['/privacy', '隐私政策'], ['/cookies', 'Cookie 政策']]) {
    assert.ok(app.includes(`<Route path="${path}"`));
    assert.ok(app.includes(`'${path}': '${title}'`));
  }
});

test('legacy policy redirects precede the SPA fallback', () => {
  const fallback = redirects.indexOf('/*    /index.html   200');
  for (const rule of ['/agreement       /terms      301', '/user-agreement  /terms      301', '/privacy-policy  /privacy    301', '/cookie          /cookies    301']) {
    const index = redirects.indexOf(rule);
    assert.ok(index >= 0 && index < fallback, rule);
  }
});

test('registration policy summaries link to full current documents', () => {
  assert.ok(modal.includes('2026.10'));
  assert.ok(modal.includes('年满18周岁'));
  assert.ok(modal.includes("'/terms'"));
  assert.ok(modal.includes("'/privacy'"));
  assert.ok(modal.includes('阅读完整'));
  assert.ok(!modal.includes('完整版将在内测正式开放时同步'));
  assert.ok(!modal.includes('密码（加密存储）'));
});
