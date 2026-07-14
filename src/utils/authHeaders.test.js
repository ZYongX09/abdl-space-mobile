import test from 'node:test'
import assert from 'node:assert/strict'
import { getActiveToken, withAuthHeader } from './authHeaders.js'

test('adds the active account bearer token', () => {
  const values = new Map([
    ['abdl_active_account', '2'],
    ['abdl_accounts', JSON.stringify([{ id: 1, token: 'one' }, { id: 2, token: 'two' }])],
  ])
  globalThis.localStorage = { getItem: key => values.get(key) || null }

  assert.equal(getActiveToken(), 'two')
  assert.deepEqual(withAuthHeader({ Accept: 'application/json' }), {
    Accept: 'application/json',
    Authorization: 'Bearer two',
  })
})

test('does not add an authorization header without a valid active account', () => {
  globalThis.localStorage = { getItem: () => null }
  assert.deepEqual(withAuthHeader({ Accept: 'application/json' }), { Accept: 'application/json' })
})
