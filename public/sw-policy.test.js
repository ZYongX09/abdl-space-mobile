import test from 'node:test'
import assert from 'node:assert/strict'
import './sw-policy.js'

const origin = 'https://m.abdl-space.top'

test('does not cache API, cross-origin, or authorized requests', () => {
  assert.equal(globalThis.shouldCacheRequest(new Request(`${origin}/api/auth/me`), origin), false)
  assert.equal(globalThis.shouldCacheRequest(new Request(`${origin}/api`), origin), false)
  assert.equal(globalThis.shouldCacheRequest(new Request('https://api.abdl-space.top/image.png'), origin), false)
  assert.equal(globalThis.shouldCacheRequest(new Request(`${origin}/private`, {
    headers: { Authorization: 'Bearer token' },
  }), origin), false)
})

test('allows same-origin static GET requests only', () => {
  assert.equal(globalThis.shouldCacheRequest(new Request(`${origin}/app-icon.png`), origin), true)
  assert.equal(globalThis.shouldCacheRequest(new Request(`${origin}/app-icon.png`, { method: 'POST' }), origin), false)
})
