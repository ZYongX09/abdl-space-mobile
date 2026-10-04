import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// 加载实际 ../api 入口，fetch 完全截断在内存中，不访问 Vite 生产代理。
test('实际 src/api.js 暴露完整后台 API，分页、筛选、cookie/token 与保留配置契约正确', async () => {
  const server = await createServer({ configFile: false, root: new URL('../', import.meta.url).pathname, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const calls = [];
  globalThis.localStorage = { getItem(key) { return key === 'abdl_accounts' ? JSON.stringify([{ id: 1, token: 'memory-admin-token' }]) : key === 'abdl_active_account' ? '1' : null; } };
  globalThis.fetch = async (url, options) => { calls.push({ url: String(url), options }); return Response.json({}); };
  try {
    const { adminAPI } = await server.ssrLoadModule('/src/api');
    const explicit = await server.ssrLoadModule('/src/api.js');
    assert.equal(adminAPI, explicit.adminAPI, '扩展名省略的 ../api 必须命中实际 api.js');
    for (const method of ['overview', 'trends', 'users', 'setUserRole', 'userDetail', 'userTracking', 'listComments', 'novels', 'novelStatus', 'badges', 'badgeGrant', 'badgeRevoke', 'settings', 'betaMode', 'blockedEmails', 'friendRequestReports', 'appClientReminder', 'saveAppClientReminder', 'appClientPolicy', 'saveAppClientPolicy', 'appClientStats', 'appClientUsers']) assert.equal(typeof adminAPI[method], 'function', method);
    await adminAPI.users({ page: 2, limit: 30, q: 'QQ & test', role: 'admin', qq_bound: 'unbound' });
    const url = new URL(calls[0].url, 'http://fixture.invalid');
    assert.equal(url.pathname, '/api/admin/users');
    assert.deepEqual(Object.fromEntries(url.searchParams), { page: '2', limit: '30', q: 'QQ & test', role: 'admin', qq_bound: 'unbound' });
    assert.equal(calls[0].options.headers.Authorization, 'Bearer memory-admin-token');
    assert.equal(calls[0].options.credentials, 'include');
    await adminAPI.listComments({ page: 3, post_id: 42 });
    assert.match(calls[1].url, /post_id=42/);
    await adminAPI.setPostNsfw(8, true);
    assert.equal(calls[2].options.method, 'PATCH');
    assert.deepEqual(JSON.parse(calls[2].options.body), { has_nsfw: true });
    const count = calls.length;
    for (const key of ['app_client_policy', ' app_client_reminder ']) await assert.rejects(adminAPI.saveSetting(key, '{}'), /保留配置/);
    assert.equal(calls.length, count);
    for (const role of ['admin', 'user']) {
      await adminAPI.setUserRole('id / fixture', role);
      const call = calls.at(-1);
      assert.match(call.url, /\/api\/admin\/users\/id%20%2F%20fixture\/role$/);
      assert.equal(call.options.method, 'PATCH');
      assert.deepEqual(JSON.parse(call.options.body), { role });
      assert.equal(call.options.headers.Authorization, 'Bearer memory-admin-token');
      assert.equal(call.options.credentials, 'include');
    }
    const roleCount = calls.length;
    await assert.rejects(adminAPI.setUserRole(2, 'super_admin'), /admin 或 user/);
    await assert.rejects(adminAPI.setUserRole(1, 'user'), /不能被降权/);
    assert.equal(calls.length, roleCount);
    for (const status of [401, 403]) {
      globalThis.fetch = async () => Response.json({ error: 'fixture denied' }, { status });
      await assert.rejects(adminAPI.setUserRole(2, 'user'), error => error.status === status && /fixture denied/.test(error.message));
    }
  } finally {
    await server.close();
    globalThis.fetch = originalFetch;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});
