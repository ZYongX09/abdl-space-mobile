import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const supplement = readFileSync(new URL('./pages/MinorProtection.jsx', import.meta.url), 'utf8');
const modal = readFileSync(new URL('./components/PolicyModal.jsx', import.meta.url), 'utf8');
const register = readFileSync(new URL('./pages/Register.jsx', import.meta.url), 'utf8');
const betaRegister = readFileSync(new URL('./pages/BetaRegister.jsx', import.meta.url), 'utf8');

test('minor supplement does not authorize access through guardian consent', () => {
  assert.ok(supplement.includes('仅面向年满18周岁'));
  assert.ok(supplement.includes('Guardian consent will not restore eligibility'));
  assert.ok(supplement.includes('监护人同意'));
  assert.ok(!supplement.includes('未成年用户可以使用我们的服务'));
  assert.ok(supplement.includes('href="/privacy"'));
  assert.ok(modal.includes('监护人同意不改变本站18周岁的限制'));
  assert.ok(register.includes('我确认已年满18周岁'));
  assert.ok(register.includes('to="/minor-protection"'));
  assert.ok(betaRegister.includes('我确认已年满18周岁'));
});
