import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chooseDownloadScreenshots, getAdminDownloadScreenshots, getDownloadScreenshots, getScreenshotBlob,
  MAX_SCREENSHOT_BYTES, saveDownloadScreenshot, SCREENSHOT_GROUPS, SCREENSHOT_THEMES, SCREENSHOT_TYPES,
} from './appDownloadScreenshots.js';

const uuid = '00000000-0000-4000-8000-000000000001';
const makeSlots = () => Object.fromEntries(SCREENSHOT_GROUPS.flatMap(group => SCREENSHOT_THEMES.map(theme => {
  const slot = `${group.id}-${theme.id}`;
  return [slot, { slot, revision: '0', image: null }];
})));

test('slot selection follows theme, falls back to matching feature, and never uses another feature', () => {
  const slots = makeSlots();
  const image = { url: `/api/app-download/screenshots/community-dark/${uuid}.webp`, width: 720, height: 1640 };
  slots['community-dark'] = { slot: 'community-dark', revision: uuid, image };
  slots['rankings-light'] = { slot: 'rankings-light', revision: uuid, image: { ...image, url: `/api/app-download/screenshots/rankings-light/${uuid}.webp` } };
  assert.deepEqual(chooseDownloadScreenshots(slots, 'community', 'light'), [image]);
  assert.deepEqual(chooseDownloadScreenshots(slots, 'community', 'dark'), [image]);
  assert.deepEqual(chooseDownloadScreenshots(slots, 'reading', 'dark'), []);
});

test('manifest rejects duplicates, foreign URLs, missing revisions, invalid dimensions and malformed responses', async t => {
  const cases = [
    { screenshots: [{ slot: 'community-light', revision: uuid, image: { width: 1, height: 2, url: `https://external.example/${uuid}.webp` } }] },
    { screenshots: [{ slot: 'community-light', revision: uuid, image: { width: 8000, height: 16000, url: `/api/app-download/screenshots/community-light/${uuid}.webp` } }] },
    { screenshots: [{ slot: 'community-light', revision: '0', image: { width: 1, height: 2, url: `/api/app-download/screenshots/community-light/${uuid}.webp` } }] },
    { screenshots: [{ slot: 'other-light', revision: '0', image: null }] },
    { screenshots: [...Array(2)].map(() => ({ slot: 'community-light', revision: '0', image: null })) },
    {}, null,
  ];
  for (const body of cases) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    await assert.rejects(getDownloadScreenshots(), /截图服务/u);
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, 'fetch', async () => Response.json({ screenshots: [] }));
  assert.deepEqual(await getDownloadScreenshots(), Object.create(null));
  t.mock.restoreAll();
});

test('admin manifest requires the complete six-slot response', async t => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options?.mode, 'same-origin');
    assert.equal(options?.credentials, 'same-origin');
    return Response.json({ screenshots: Object.values(makeSlots()) });
  });
  assert.equal(Object.keys(await getAdminDownloadScreenshots()).length, 6);
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => Response.json({ screenshots: [] }));
  await assert.rejects(getAdminDownloadScreenshots(), /截图服务/u);
  t.mock.restoreAll();
});

test('invalid upload slots, stale versions, SVG, empty and oversized files fail before requests', async t => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => { requests++; return Response.json({ slot: 'community-light', revision: '0', image: null }); });
  for (const [slot, revision, file] of [
    ['invalid', '0', new Blob(['x'], { type: 'image/png' })],
    ['community-light', 'stale', new Blob(['x'], { type: 'image/png' })],
    ['community-light', '0', new Blob(['x'], { type: 'image/svg+xml' })],
    ['community-light', '0', new Blob([], { type: 'image/png' })],
    ['community-light', '0', new Blob([new Uint8Array(MAX_SCREENSHOT_BYTES + 1)], { type: 'image/png' })],
  ]) await assert.rejects(saveDownloadScreenshot(slot, revision, file));
  assert.equal(requests, 0);
  const file = new Blob(['synthetic image'], { type: 'image/webp' });
  const saved = await saveDownloadScreenshot('community-light', '0', file);
  assert.equal(requests, 1);
  assert.equal(saved.slot, 'community-light');
  assert.equal(SCREENSHOT_TYPES.includes(file.type), true);
  t.mock.restoreAll();
});

test('same-origin protected media fetch enforces credentials, redirects, cache and image type', async t => {
  const path = `/api/app-download/screenshots/community-light/${uuid}.webp`;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, path);
    assert.equal(options?.mode, 'same-origin');
    assert.equal(options?.redirect, 'error');
    assert.equal(options?.cache, 'no-store');
    assert.equal(options?.referrerPolicy, 'origin');
    assert.equal(options?.credentials, 'same-origin');
    return new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'image/webp', 'Content-Length': '3' } });
  });
  const blob = await getScreenshotBlob(path);
  assert.equal(blob.type, 'image/webp');
  assert.equal(blob.size, 3);
  t.mock.restoreAll();
  for (const response of [
    new Response('HTML', { headers: { 'Content-Type': 'text/html' } }),
    new Response(new Uint8Array([1]), { headers: { 'Content-Type': 'image/jpeg' } }),
    new Response(new Uint8Array(0), { headers: { 'Content-Type': 'image/webp' } }),
  ]) {
    t.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(getScreenshotBlob(path));
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('external fetch must be rejected'); });
  await assert.rejects(getScreenshotBlob(`https://external.example/${uuid}.webp`));
  t.mock.restoreAll();
});
