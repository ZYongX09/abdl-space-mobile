import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldOfferWebAuthn } from './webauthnAvailability.js'

test('offers WebAuthn in a supported secure browser regardless of PWA mode', () => {
  assert.equal(shouldOfferWebAuthn({ secure: true, available: true }), true)
  assert.equal(shouldOfferWebAuthn({ secure: false, available: true }), false)
  assert.equal(shouldOfferWebAuthn({ secure: true, available: false }), false)
})
