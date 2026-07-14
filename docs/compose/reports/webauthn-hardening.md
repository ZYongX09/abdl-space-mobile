---
feature: webauthn-hardening
status: delivered
specs: []
plans:
  - docs/compose/plans/2026-07-14-webauthn-hardening.md
branch: main
commits: uncommitted
---

# WebAuthn Hardening — Final Report

## What Was Built

The mobile web client now supports discoverable Passkeys on `m.abdl-space.top` and the root domain. Registration requires a resident platform credential, username-less authentication installs the returned JWT and user into both persistent account storage and live React state, and normal HTTPS browsers can expose the feature without requiring PWA standalone mode.

WebAuthn requests now share consistent JSON and HTTP error handling. Authenticated account recovery uses the active Bearer token as well as the cookie, and session-version checks prevent a stale `/api/auth/me` response from replacing a newly installed Passkey session.

The Service Worker only caches same-origin unauthenticated static GET requests. API, cross-origin, and Authorization requests bypass the cache, old caches are removed on activation, and the previously invalid push subscription handler is syntactically valid.

The backend requires discoverable credentials, stores credential public keys as exact D1-compatible `ArrayBuffer` values, atomically consumes challenges by ID, ceremony type, and nullable user, validates `userHandle`, protects counter updates from races, rate-limits anonymous WebAuthn endpoints, and rejects malformed or expired JWTs.

## Architecture

`src/utils/webauthn.js` implements the SimpleWebAuthn browser ceremonies and delegates HTTP parsing to `src/utils/requestJSON.js`. Successful authentication calls `AuthContext.installSession()`, which updates `abdl_accounts`, the active account, and React user state in one operation. `src/utils/authHeaders.js` supplies the active Bearer token for authenticated recovery and Passkey-management requests.

`public/sw-policy.js` owns the cache eligibility rule used by `public/sw.js` and its Node tests. The Worker serves static files stale-while-revalidate but never intercepts API or authenticated data.

The backend route `src/routes/webauthn.ts` uses `abdl-space.top` as RP ID with explicit root/mobile origins. D1 persists one-time challenges and credential public keys. `src/lib/auth.ts` validates JWT header, payload shape, issue time, seven-day lifetime, expiration, and HMAC signature; `src/middleware/auth.ts` refreshes the current database role before installing the authenticated user.

### Design Decisions

We chose resident credentials because username-less login is a product requirement; `residentKey: preferred` cannot guarantee that behavior.

We kept the current Cookie plus Bearer-token account architecture because replacing it with cookie-only sessions would require redesigning multi-account switching beyond the WebAuthn scope.

We chose static-only Service Worker caching because CacheStorage does not isolate entries by Cookie or Bearer token, making cache-first authenticated API responses unsafe across accounts.

## Usage

Run automated checks:

```bash
# Mobile client
npm test
npm run check:sw

# Backend
npm test
npx wrangler deploy --dry-run
```

After deployment, log in normally, open Settings, register “宝宝安全识别”, sign out, then use the fingerprint button on the login page without entering a username.

## Verification

- Mobile client: 8 Node tests passed, covering JSON errors, active Bearer headers, WebAuthn availability, and Service Worker cache policy.
- Mobile client: `public/sw.js` passed `node --check`.
- Mobile client: `webauthn.js`, `AuthContext.jsx`, `Login.jsx`, and `Settings.jsx` passed esbuild bundling.
- Backend: 7 Node tests passed, covering valid/tampered/expired JWTs, seven-day JWT lifetime, auth middleware success, exact credential BLOB copying, and atomic challenge binding.
- Backend: Wrangler dry-run bundled the Worker successfully.
- Production probe: `/api/webauthn/authenticate/options` returned HTTP 200 with `rpId=abdl-space.top`, empty `allowCredentials`, a challenge, and mobile-origin credentialed CORS.
- Remote D1 contains the expected `passkeys` and `webauthn_challenges` schemas. It currently has zero Passkeys, so a real phone registration is required to verify the resulting row has `typeof(public_key) = 'blob'`.

## Journey Log

> Brief notes on what informed the final design. Not required reading.

- [lesson] A successful Worker dry-run does not catch undefined identifiers; the auth middleware regression required an execution test.
- [pivot] Existing concurrent changes already implemented most backend hardening, so the final work focused on tests, integration, and uncovered gaps rather than rewriting them.
- [lesson] Service Worker CacheStorage must not cache account-scoped responses because cache keys do not include authentication state.
- [lesson] WebAuthn cryptographic ceremony cannot be fully automated without a real or virtual authenticator; static and endpoint tests stop before user-presence verification.

## Source Materials

| File | Role | Notes |
|------|------|-------|
| `docs/compose/plans/2026-07-14-webauthn-hardening.md` | Implementation plan | Completed except real-device ceremony after deployment |
