import test from 'node:test'
import assert from 'node:assert/strict'
import { requestJSON } from './requestJSON.js'

test('returns parsed JSON for a successful response', async () => {
  const fetcher = async () => new Response(JSON.stringify({ verified: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
  assert.deepEqual(await requestJSON('/test', {}, fetcher), { verified: true })
})

test('throws the server error for a failed response', async () => {
  const fetcher = async () => new Response(JSON.stringify({ error: '挑战已过期' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
  await assert.rejects(() => requestJSON('/test', {}, fetcher), /挑战已过期/)
})

test('uses the status code when a failed response is not JSON', async () => {
  const fetcher = async () => new Response('bad gateway', { status: 502 })
  await assert.rejects(() => requestJSON('/test', {}, fetcher), /请求失败 \(502\)/)
})
