# WebAuthn Hardening Implementation Plan

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/webauthn-hardening.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Passkey registration and username-less login reliable on `m.abdl-space.top`, keep React/auth state consistent, prevent authenticated response caching, and close the identified challenge/JWT weaknesses.

**Architecture:** Keep the existing SimpleWebAuthn ceremony and dual Cookie/Bearer session model. Add focused helpers for JSON HTTP handling and challenge consumption, require discoverable platform credentials, store public keys as D1-compatible `ArrayBuffer`, and make Service Worker caching static-only. Verify with small Node tests, module builds, Worker dry-run, remote endpoint probes, and a manual device ceremony.

**Tech Stack:** React 18, `@simplewebauthn/browser`, Hono, `@simplewebauthn/server`, Cloudflare Workers/D1, Node test runner, Service Worker Cache API.

---

### Task 1: Frontend WebAuthn and session consistency

**Files:**
- Modify: `src/utils/webauthn.js`
- Modify: `src/pages/Login.jsx`
- Modify: `src/contexts/AuthContext.jsx`
- Create: `tests/webauthn-client.test.mjs`

- [ ] Write failing Node tests for safe JSON error extraction and session installation behavior.
- [ ] Run `node --test tests/webauthn-client.test.mjs`; expect failures before implementation.
- [ ] Add one `apiJSON()` helper that parses JSON safely, throws the backend error on non-2xx, and sends `credentials: 'include'` for every WebAuthn request.
- [ ] Keep `installSession(result)` as the sole WebAuthn login-state installer and ensure AuthContext initialization cannot overwrite a newer installed session.
- [ ] Make the primary Passkey button call `authenticateWithPasskey('')`; keep typed username/email as a separate constrained fallback.
- [ ] Run the Node tests and `npx esbuild src/utils/webauthn.js --bundle --format=esm --outfile=/tmp/abdl-webauthn.js`.

### Task 2: Service Worker isolation

**Files:**
- Modify: `public/sw.js`
- Create: `tests/service-worker.test.mjs`

- [ ] Write failing tests asserting `/api/*`, cross-origin URLs, and Authorization requests are never cached.
- [ ] Run `node --test tests/service-worker.test.mjs`; expect failures and current syntax error.
- [ ] Fix the `pushsubscriptionchange` parentheses.
- [ ] Bump `CACHE_NAME` and use network-only for API, cross-origin, and authenticated requests; retain stale-while-revalidate only for same-origin static assets.
- [ ] Run `node --check public/sw.js` and the Service Worker tests.

### Task 3: Backend ceremony, D1, and JWT hardening

**Files:**
- Modify: `/home/ZYongX/projects/git/abdl-space/src/routes/webauthn.ts`
- Modify: `/home/ZYongX/projects/git/abdl-space/src/lib/auth.ts`
- Create: `/home/ZYongX/projects/git/abdl-space/tests/auth.test.mjs`

- [ ] Write failing tests for expired JWT rejection, malformed payload rejection, exact public-key `ArrayBuffer` conversion, and challenge type/user matching.
- [ ] Run `node --test tests/auth.test.mjs`; expect failures before implementation.
- [ ] Require resident credentials with `residentKey: 'required'` and `requireResidentKey: true`.
- [ ] Convert credential public keys to an exact `ArrayBuffer` before D1 binding.
- [ ] Consume challenges with required ceremony type and expected user; reject a username-constrained assertion that resolves to another user; delete the challenge before verification so only one request can consume it.
- [ ] Delete expired challenges opportunistically and rate-limit anonymous options generation.
- [ ] Validate JWT payload shape, `iat`, and `exp` after HMAC verification.
- [ ] Run Node tests and `npx wrangler deploy --dry-run`.

### Task 4: Integrated verification

**Files:**
- No additional production files.

- [ ] Run all new Node tests in both repositories.
- [ ] Run frontend module builds and `node --check public/sw.js`.
- [ ] Run backend Worker dry-run.
- [ ] Probe production CORS and `/authenticate/options` after deployment.
- [ ] Query remote D1 after a manual phone registration and confirm `typeof(public_key) = 'blob'`.
- [ ] On a real Android PWA, register a Passkey, sign out, perform username-less login, verify the user appears immediately without refresh, and verify credentials list/delete errors are surfaced correctly.
