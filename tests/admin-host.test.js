import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseCertificate as parseFrontendCertificate } from '../src/babyVerification/model.js';
import { parseCertificate as parseAdminCertificate } from '../src/adminBabyVerification/model.js';

const source = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const expectedRoutes = ['/admin', '/admin/users', '/admin/app-clients', '/admin/sponsors', '/admin/advertising', '/admin/baby-verifications', '/admin/badges', '/admin/posts', '/admin/comments', '/admin/novels', '/admin/reports', '/admin/security', '/admin/settings', '/admin/diapers', '/admin/notifications'];

test('14 管理路由/title 完整，独立宿主与 gate 在数据页外阻止未授权挂载', async () => {
  let auth = { user: null, loading: false, accounts: [] };
  const server = await createServer({ configFile: false, root: new URL('../', import.meta.url).pathname, esbuild: { jsx: 'automatic' }, server: { middlewareMode: true, hmr: false }, appType: 'custom', plugins: [{
    name: 'local-auth-fixture',
    transform(_code, id) {
      if (id.endsWith('/contexts/AuthContext.jsx')) return 'export const useAuth = () => globalThis.__mobileAdminHostAuth();';
      if (id.endsWith('/contexts/ThemeContext.jsx')) return 'export const useTheme = () => ({ theme: "colorful" });';
      if (id.endsWith('/contexts/NotificationContext.jsx')) return 'export const NotificationProvider = ({ children }) => children; export const useNotifications = () => ({ toasts: [{ id: 1, title: "后台通知", message: "fixture反馈", icon: "fa-check" }], dismissToast() {} });';
      if (['AdBlockNotice', 'RedirectNotice', 'AppDownloadBanner', 'PushPrompt', 'CookieConsent'].some(name => id.endsWith(`/components/${name}.jsx`))) return 'export default function FrontendOverlay() { globalThis.__mobileFrontendOverlayMounts++; return "前台浮层不应挂载"; }';
    },
  }] });
  globalThis.__mobileAdminHostAuth = () => auth;
  globalThis.__mobileFrontendOverlayMounts = 0;
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('SSR 不应发起请求'); };
  try {
    const { MemoryRouter } = await server.ssrLoadModule('react-router-dom');
    const { default: App } = await server.ssrLoadModule('/src/App.jsx');
    const { ADMIN_ROUTE_TITLES, isAdminPath } = await server.ssrLoadModule('/src/AdminRoutes.jsx');
    const { AdminRouteBoundary } = await server.ssrLoadModule('/src/pages/admin/gate.jsx');
    assert.deepEqual(Object.keys(ADMIN_ROUTE_TITLES).sort(), [...expectedRoutes].sort());
    for (const path of expectedRoutes) {
      const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(App)));
      assert.match(html, /请先登录管理员账号/);
      assert.match(html, /ac-admin-theme[\s\S]*后台通知/);
      assert.doesNotMatch(html, /前台浮层不应挂载/);
      assert.doesNotMatch(html, /app-main-content|max-w-\[720px\]|bottom-nav|移动版 ·|app-download-banner/);
      assert.ok(source('../src/AdminRoutes.jsx').includes(`path="${path}"`));
    }
    const unknownPath = '/admin/unknown/deep';
    auth = { loading: false, user: { id: 1, role: 'admin' }, accounts: [] };
    const unknown = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [unknownPath] }, React.createElement(App)));
    assert.match(unknown, /管理页面不存在/);
    assert.doesNotMatch(unknown, /ac-side-body|app-main-content|max-w-\[720px\]|bottom-nav/);
    assert.equal(isAdminPath('/administrator'), false);
    assert.equal(isAdminPath('/admin/unknown'), true);
    let mounts = 0;
    function DataPage() { mounts++; return React.createElement('p', null, '后台数据'); }
    const renderGate = () => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(AdminRouteBoundary, auth, React.createElement(DataPage))));
    for (const state of [{ loading: true, user: null }, { loading: true, user: { id: 1, role: 'admin' } }, { loading: false, user: { id: 9, role: 'user', is_super_admin: true } }]) {
      auth = { ...state, accounts: [] };
      assert.doesNotMatch(renderGate(), /后台数据/);
      assert.equal(mounts, 0);
    }
    auth = { loading: false, user: { id: 1, role: 'admin' }, accounts: [{ id: 1, token: 'fixture-only' }] };
    assert.match(renderGate(), /后台数据/);
    assert.equal(mounts, 1);
    assert.equal(requests, 0);
    assert.equal(globalThis.__mobileFrontendOverlayMounts, 0, '全部后台deep links与unknown均不挂载前台fixed提示层');
  } finally {
    await server.close();
    globalThis.fetch = originalFetch;
    delete globalThis.__mobileAdminHostAuth;
    delete globalThis.__mobileFrontendOverlayMounts;
  }
});

test('旧 tabs 后台已移除，管理员入口仅管理员可见且移动全局容器不包裹后台', () => {
  for (const file of ['AdminPage.jsx', 'AdminSponsors.jsx', 'AdminBabyVerifications.jsx']) assert.equal(existsSync(new URL(`../src/pages/${file}`, import.meta.url)), false);
  assert.match(source('../src/App.jsx'), /const isAdmin = isAdminPath\(pathname\)/);
  assert.match(source('../src/App.jsx'), /if \(isAdmin\) return <>\s*<AdminRoutes/);
  assert.match(source('../src/pages/Settings.jsx'), /user\?\.role === 'admin'[\s\S]*label="管理控制台"/);
  assert.match(source('../src/styles/mobile.css'), /\.app-layout:not\(\.admin-host\) > \.app-main-content/);
});

test('GUI fixture 禁用默认生产代理、env与启动外联脚本，并禁止SW', () => {
  const fixture = source('./app-clients-fixture-server.js');
  assert.match(fixture, /configFile: false/);
  assert.match(fixture, /envFile: false/);
  assert.match(fixture, /proxy: \{\}/);
  assert.match(fixture, /connect-src 'self'/);
  assert.match(fixture, /worker-src 'none'/);
  assert.match(fixture, /transformIndexHtml/);
  assert.match(fixture, /code.replace\("if \('serviceWorker' in navigator\)"/);
  assert.match(fixture, /Bearer fixture-/);
});

test('后台宝宝认证独立 adapter，前台仍返回原有证书包装', () => {
  const payload = { id: 'cert-1', status: 'active', username: 'fixture', issued_at: 1720000000 };
  const frontend = parseFrontendCertificate(payload);
  const admin = parseAdminCertificate(payload);
  assert.equal(frontend.certificate.id, 'cert-1');
  assert.equal(frontend.status, 'approved');
  assert.equal(admin.id, 'cert-1');
  assert.equal(admin.status, 'active');
  assert.match(source('../src/pages/admin/babyVerifications.jsx'), /adminBabyVerification\/api.js/);
  assert.match(source('../src/pages/BabyVerificationStatus.jsx'), /components\/BabyVerificationCard.jsx/);
  assert.match(source('../src/pages/CertificateVerify.jsx'), /babyVerification\//);
  assert.match(source('../src/components/BabyVerificationCard.jsx'), /babyVerification\//);
  for (const path of ['../src/pages/BabyVerificationStatus.jsx', '../src/pages/CertificateVerify.jsx', '../src/components/BabyVerificationCard.jsx']) assert.doesNotMatch(source(path), /adminBabyVerification/);
});
