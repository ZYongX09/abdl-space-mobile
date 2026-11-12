import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const sha256 = value => createHash('sha256').update(value).digest('hex');

test('robots declares the six archive products without restricting ordinary search indexing', async () => {
  const robots = await source('public/robots.txt');
  const groups = robots.replace(/#.*$/gm, '').trim().split(/\n\s*\n/)
    .map(group => group.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  assert.deepEqual(groups, [
    [
      'User-agent: archive.org_bot',
      'User-agent: ia_archiver',
      'User-agent: ia_archiver-web.archive.org',
      'User-agent: ArchiveBot',
      'User-agent: CCBot',
      'User-agent: heritrix',
      'Disallow: /',
    ],
    ['User-agent: *', 'Disallow:'],
  ]);
});

test('public HTML declares noarchive while preserving the existing no-referrer meta', async () => {
  const html = await source('index.html');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, 'HTML must retain its head');
  assert.deepEqual(head.match(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/gi), [
    '<meta name="robots" content="noarchive" />',
  ]);
  assert.match(head, /<meta name="referrer" content="no-referrer"\s*\/?>/);
});

test('global noarchive preserves CSP, security headers and sensitive-route declarations', async () => {
  const headers = await source('public/_headers');
  const global = headers.match(/^\/\*\r?\n((?:[ \t]+[^\r\n]*(?:\r?\n|$))*)/)?.[1];
  assert.ok(global, 'global static header block must remain');
  assert.match(global, /^ {2}X-Robots-Tag: noarchive\r?$/m);
  const csp = headers.split(/\r?\n/).map(line => line.trim())
    .find(line => line.startsWith('Content-Security-Policy:'));
  assert.ok(csp, 'existing CSP must remain');
  assert.equal(sha256(csp), 'eb4bd61f183cc0f065d3a1a925fb0f8a1ca807e14917d612de362809243fdffb');
  for (const header of [
    'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options: DENY',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Access-Control-Allow-Origin: *',
  ]) assert.ok(headers.includes(`  ${header}\n`), header);
  for (const path of ['/c/*', '/api/v1/baby-verification/verify/*', '/api/admin/baby-verification/*']) {
    assert.ok(headers.includes(`${path}\n  Cache-Control: no-store, max-age=0\n  Referrer-Policy: no-referrer\n  X-Robots-Tag: noindex, nofollow, noarchive\n`), path);
  }
});

test('API and client-IP Functions match the reviewed observation signing integration', async () => {
  // Observation adds only a separately scoped signed IP envelope; response/proxy contracts have dedicated tests.
  for (const [path, digest] of [
    ['functions/api/[[path]].js', '85e69380879197ae59d1aecded3234a15011ceb09af55cb3fe51fd6daca2f1d2'],
    ['functions/_shared/auth-client-ip.js', 'e13ab4b43808520659aaf3d76ad301bc6587da75aca59cc19351f674b0c9f2b7'],
  ]) {
    assert.equal(sha256(await readFile(new URL(`../${path}`, import.meta.url))), digest, path);
  }
});
