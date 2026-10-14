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

## 分支工作流（强制遵循）

> 本节优先于本文件其他任何涉及分支或发版的描述。日常开发与上线必须严格按此执行。

| 分支 | 角色 |
| :--- | :--- |
| `develop` | **标准开发分支**。所有日常开发成果先进这里；任何时刻都必须包含 `main` 的全部增量。 |
| `main` | **上线分支**（正式发布）。 |
| `feat/*`、`fix/*` | 并行功能分支，从 `develop` 切出，完成后合回 `develop`。 |
| `hotfix/*` | 紧急修复分支，从 `main` 切出。 |

1. **日常开发**：从 `develop` 切出 `feat/*`（或 `fix/*`），完成后合回 `develop`；合并后删除该分支（本地与远端）。
2. **发版**：**只有用户明确指示**时才把 `develop` 合并进 `main` 并推送。除此之外不得直接推送 `main`。
3. **紧急修复**：从 `main` 切出 `hotfix/*` → 修复 → 合回 `main` 并推送 → **随后必须把 `main` 合并回 `develop`**。
4. **不变式 `develop ⊇ main`**：`develop` 必须包含 `main` 的全部增量。发现落后时把 `main` 合并（或快进）进 `develop`；**不得**用 `git reset` 丢弃 `develop` 的独有提交。
5. **禁止 squash `develop` → `main`**：该合并必须用 merge 或 fast-forward。squash 会在 `main` 生成 `develop` 里不存在的新提交，直接破坏第 4 条不变式。
6. 功能提交一律先进 `develop`，不得直接堆到 `main`。

### 上线方式

远端 `main` 推送会触发 Cloudflare Pages 自动部署移动站（m.abdl-space.top）——**推 `main` 即等于上线**，推送前必须确认构建/测试通过且已获用户指示。
