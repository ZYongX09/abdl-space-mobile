# Agent Guide for abdl-space-mobile

## Project Overview
Mobile-first React web app (m.abdl-space.top) sharing backend API with main site (abdl-space.top). Tech: React 18 + Vite + Tailwind CSS 3.

## Commands
- `npm run dev` — Start dev server (port 5174, not default 5173)
- `npm run build` — Build for production (outputs to `dist/`)
- `npm run lint` — Run ESLint (no typecheck or test scripts exist)

## Key Architecture
- **Pure JavaScript** — No TypeScript (.js/.jsx only)
- **No tests** — No test framework configured
- **API proxy** — Dev server proxies `/api` to `https://api.abdl-space.top`
- **Offline mode** — Set `VITE_API_BASE` to undefined/null to use localStorage fallback
- **Cloudflare Pages** — Deployed via `wrangler.jsonc`, output dir: `./dist`

## Environment Variables
- `VITE_API_BASE` — API base URL (empty string = relative path, undefined = offline mode)
- `VITE_CAPTCHA_KEY` — Captcha service key (injected into HTML)

## File Structure
- `src/api.js` — Full API layer with offline fallback and in-memory cache
- `functions/` — Cloudflare Pages Functions (copied to `dist/functions/` during build)
- `src/App.jsx` — All routes lazy-loaded
- `src/main.jsx` — Entry point with context providers (Auth, Theme, Toast, Notification, NSFW)

## Development Tips
- Dev server runs on **port 5174** (non-standard Vite port)
- API uses **stale-while-revalidate** caching (30s/2m/5m TTLs)
- Auth uses JWT cookie with `Domain=.abdl-space.top` for cross-site sharing
- Build automatically copies `functions/` to `dist/functions/` via custom Vite plugin

## Linting
- ESLint configured for `.js` and `.jsx` files only
- Ignores `dist/` directory
- Uses react-hooks and react-refresh plugins

## Deployment
- Platform: Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Custom domain: `m.abdl-space.top`
