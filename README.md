# ABDL Space 移动网页

ABDL Space 的移动优先 React Web 客户端，与主站和 Android App 共用 [abdl-space API](https://github.com/ZhX589/abdl-space)。适合在手机浏览器中浏览社区、参与讨论、查询纸尿裤资料，以及使用独立的商家和管理控制台；本仓库不是 Android 原生客户端，也不包含后端和数据库。

项目原有移动站域名为 `m.abdl-space.top`。以下功能描述以仓库代码为依据，不代表对现网可用性或部署版本的承诺。自行部署应使用自己的域名、后端、验证码和存储资源，不应把原项目的服务视为公共测试环境。

## 相关仓库

| 仓库 | 职责 |
| --- | --- |
| [abdl-space](https://github.com/ZhX589/abdl-space) | 共享 API、认证、数据与存储业务，Cloudflare Workers 后端 |
| [ABDL-Space-V2](https://github.com/ZYongX09/ABDL-Space-V2) | 主站 Web 前端 |
| [abdl-space-mobile](https://github.com/ZYongX09/abdl-space-mobile) | 本仓库，移动优先 Web 前端 |
| [ABDL-Space-APP](https://github.com/ZYongX09/ABDL-Space-APP) | Android 原生客户端 |

## 功能与移动体验

- **移动交互**：底部导航、移动标题栏、下拉刷新、返回列表时恢复滚动位置，以及浅色、深色、多彩主题。通过 Web App Manifest 和 Service Worker 提供安装与推送集成；推送仍需要 HTTPS、浏览器支持、授权和后端配置，不等于完整离线应用。
- **社区**：广场、帖子详情、图文发布、点赞、评论、关注、举报、私信与通知；个人主页、多账号切换、签到积分、等级与徽章。
- **纸尿裤资料**：产品列表与详情、评分、排行榜、对比、推荐、术语 Wiki 和裤裤百科。推荐依赖后端服务，不需要在前端放置 AI 密钥。
- **账号与隐私**：注册、登录、找回密码、账户隐私设置、第三方账号绑定与 WebAuthn 通行密钥集成；通行密钥需后端 RP ID / Origin 与部署域名匹配。
- **认证与照片**：`/baby-verification` 展示当前账号认证状态、额度及证书，`/c/:token` 提供公开实时验真。认证拍摄在 Android App 完成，网页没有认证照片或相册上传入口。本仓库也没有独立宝宝相册的浏览、编辑或发布路由；共享后端的相册能力不能直接等同于移动网页能力，网页/旧客户端可收到相册帖的兼容文字。

### 商家与广告

`/merchant` 及其子路由使用独立控制台，不挂载前台底部导航、下载或推广浮层。登录后根据服务端权限与企业状态显示开通、补登记、暂停提示或运营页面。

- 使用注册码开通商家并登记企业名称、头像；普通商家登记后身份锁定，可维护联系资料。
- 广告列表与筛选、新建/编辑、素材上传和预览、排期、启用/暂停、归档及复制草稿。
- 效果概览、按 UTC 日期查询的趋势与明细、每日 CSV 导出和操作记录。
- 超级管理员可在权限允许时管理企业暂停/恢复、跨企业广告及展示身份；前端入口不替代后端授权。
- 广场可渲染后端下发的广告卡片，并回报曝光、链接点击、图片查看和广告跳转事件。是否下发广告由后端策略、账号权益和请求条件决定。

### 管理后台

`/admin` 是与前台隔离的管理宿主，包含用户与角色治理、App 版本策略与观测、赞助者、广告、宝宝认证审核、徽章、帖子、评论、小说、举报、安全、站点设置、产品/品牌和推送页面。身份恢复中、未登录或无权限时不挂载数据页；角色变更等敏感操作仍由后端校验。

广告管理位于 `/admin/advertising`，支持投放总开关、商家/兜底概率、注册码和广告启停。页面明确说明 `min_interval_seconds` 目前仅保存、投放路径尚未读取，不能把它视为已经生效的频控。宝宝认证后台支持认领、审核、受控查看证据、证书撤销/补发、审计和配置；敏感照片与证书验真请求使用禁止缓存的专用适配层。

### 新版 App 注册安全验证策略（开发集成，未发布）

`/admin/app-clients` 新增安全验证策略卡，通过专用 `GET/PUT /api/admin/app-human-check/policy` 管理 `off`、`risk`、`always` 三种模式；默认关闭，风险阈值仅在 `risk` 模式可编辑。卡片区分已保存快照与未保存草稿，保存带 revision CAS；冲突后须重新加载，不自动重放覆盖。功能交付于 `develop` 开发线，未合入或发布 `main`，不代表生产已启用，也不强制旧 App 升级。

首期只作用于新版 App 新协议 `type=register` 的注册验证码邮件首次发送与重发，429 硬限流优先；旧版 App、网页注册及其他验证码用途不变。旧发送端点仍保留且可被调用，协议头与版本号不构成授权，不能将此功能称为全站防机器人。

本次未配置生产 Turnstile key、secret 或其他 Cloudflare 资源。管理卡只显示 `turnstile_configured` 布尔状态，不编辑或回显 sitekey / secret，也不发送邮件或加载挑战；无可用配置时仍允许保存策略，但需要挑战的操作会明确不可用，不会绕过验证，`off` 不依赖验证组件。已完成 Node 模型/API/fixture 与实际组件 SSR 可见内容验证，移动站完整测试 341/341、构建通过；未进行浏览器 GUI、真实邮件或真实 Turnstile 闭环验收，SSR 不等同于 GUI 验收。

## 技术架构

- React 18、React Router 6、Vite 5、Tailwind CSS 3；业务主体为 JavaScript / JSX，构建配置为 `vite.config.ts`，未配置独立类型检查脚本。
- `src/main.jsx` 挂载路由及认证、主题、通知等 Context；`src/App.jsx` 按路由懒加载页面，`src/AdminRoutes.jsx` 和 `src/MerchantHost.jsx` 提供独立后台宿主。
- `src/api.js` 为主要数据层，普通数据有内存缓存；身份治理、宝宝认证、商家、赞助者和 App 管理另有专用 API 适配层。请求使用 Cookie，并在有当前账号令牌时附加 Bearer Authorization。
- `public/sw.js` 与 `public/sw-policy.js` 提供静态资源缓存及推送处理；缓存策略排除 `/api`、`/api/*`、`/c/*` 和带 Authorization 的请求。
- 构建输出 `dist/`；Vite 插件另将根 `functions/` 复制至 `dist/functions/`。Cloudflare Pages 的函数源码仍在根 `functions/`，不能仅凭静态产物中存在同名目录就认为其他平台会执行它。

默认请求链路如下，开发与生产的上游并不相同。

```text
开发：浏览器 /api/* → Vite :5174 → vite.config.ts 中的 API 域名
Pages：浏览器 /api/* → functions/api/[[path]].js → 代码中固定的 Worker 上游
直连：浏览器 → VITE_API_BASE + /api/* → 自有 API（需要后端 CORS）
```

## 本地开发、构建与测试

建议使用 Node.js 22 LTS 和 npm，依赖版本以 `package-lock.json` 为准。在仓库根目录执行：

```bash
npm ci
npm run dev
```

开发地址默认是 `http://localhost:5174`。**默认 Vite `/api` 代理会连接原项目的 `https://api.abdl-space.top`**，不是本地后端。需要真实联调时，先在自己的副本中将 `vite.config.ts` 的代理目标改为自有 API；也可在 `.env.local` 中配置自有 API Origin，例如 `VITE_API_BASE=http://localhost:8787`，但跨域访问需要配套 CORS，且部分推送请求仍固定访问同源 `/api`。

仅检查商家或管理 UI 时可使用隔离 fixture，不依赖真实账号或生产 API：

```bash
# 商家：打开 http://127.0.0.1:5174/merchant
npm run dev:merchant-fixture

# 管理：打开 http://127.0.0.1:8792/__fixture/start
ADMIN_FIXTURE_UI=1 npm run test:app-fixture
```

Fixture 仅监听回环地址，数据保存在进程内存，不能证明真实后端集成成功。停止一个服务后再启动另一个，避免端口冲突。

```bash
npm test                 # package.json 中显式列出的 Node 原生测试
npm run test:merchant    # 商家专项回归
npm run check:sw         # Service Worker 语法检查
npm run lint            # 全库 ESLint 检查
npm run build           # 生产构建，输出 dist/
npm run preview         # 静态产物预览，不运行 Pages Functions 或开发代理
```

测试覆盖协议与隐私、API 适配、认证、管理宿主、商家等逻辑，不等于完整浏览器端到端覆盖。全库 ESLint 目前存在既有错误与警告，不能把 `npm run lint` 写成已全绿的门禁；应实际检查输出。静态预览无法单独验证同源 API、Cookie 或推送链路。

## 环境变量参考

这些值由 Vite 在启动/构建时读取，修改托管平台的值后需要重新构建。所有 `VITE_*` 都会进入浏览器产物，**不得放入 JWT、OAuth client secret、数据库或对象存储密钥**。仓库没有可直接复制的 `.env.example`。

| 变量 | 默认与实际用途 |
| --- | --- |
| `VITE_API_BASE` | 默认 `''`，使用同源 `/api/*`；也可设置不带尾斜杠、不含 `/api` 的 API Origin，例如 `https://api.example.com`。不会改变 Vite/Pages 代理上游，也不是所有请求都读取它。 |
| `VITE_CAPTCHA_KEY` | 验证码服务的公开客户端标识，由 `index.html` 注入；仓库未提供可复用的配置值，应使用自有服务发放的值。 |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile 公开 site key。构建配置有原项目硬编码回退值，自行部署应显式配置自己的值及域名白名单；secret 仅放后端。 |
| `VITE_BETA_NAME` | 创始成员计划展示名称，默认 `ABDL Space 创始成员计划`。 |
| `VITE_BETA_ENDS_AT` | 展示用截止时间，代码默认 `2026-07-31T23:59:59Z`，采用时应按实际活动更新，不能据此判断活动仍开放。 |
| `VITE_BETA_CAPACITY` | 展示用容量，默认 `120`；不替代后端实际资格与额度。 |
| `VITE_ADMIN_FIXTURE` | 管理 fixture 内部注入的界面标识；不是生产配置，也不能启用管理员权限。 |

注意：虽然旧注释和旧指引提到离线模式，当前 `API_BASE = import.meta.env.VITE_API_BASE ?? ''` 之后的 `USE_API` 实际始终为真。**不设置变量、设置空串或字符串 `undefined` / `null` 都不会启用 localStorage 离线后端。**

## 部署

### 部署前先配置自己的资源

先部署兼容的 [API 后端](https://github.com/ZhX589/abdl-space)，按其数据库、存储、认证和验证码要求完成配置，再部署网页。本仓库不创建 D1、COS、验证码服务或管理员账号。

当前源码保留了原项目的固定集成地址，部署到新域名时至少需要审查以下位置；仅设置 `VITE_API_BASE` 不能完成迁移：

| 位置 | 采用者需要确认的配置 |
| --- | --- |
| `vite.config.ts` | 本地 `/api` 代理上游及 Turnstile 回退值 |
| `functions/api/[[path]].js` | `API_ORIGIN` 固定指向原项目个人账号下的 Worker，未读取运行时环境变量；自行部署须在自己的副本中改为自有后端 Origin |
| `index.html` | 验证码 embed 脚本地址和统计脚本；不要默认沿用原项目统计账号 |
| `public/_headers` | CSP 的 `connect-src`、`script-src`、`img-src` 等允许域名，以及证书页面的隐私响应头 |
| `src/App.jsx` | `/oauth/*` 当前跳转原主站授权页；独立部署需匹配自己的主站与 OAuth 配置 |
| 后端配置与代码 | Cookie 域、CORS、敏感接口可信 Origin、WebAuthn RP ID / Origin、第三方 OAuth 回调和存储授权 |

原后端使用 `.abdl-space.top` Cookie 域，不能原样用于自己的域名或 Pages 预览域名。前端同时使用账号令牌，但不能因此忽略 Cookie 与可信 Origin 配置。

### Cloudflare Pages（仓库现有配置）

1. 在自己的 Cloudflare 账号创建 **Pages Git 集成项目**，连接本仓库的副本；使用自己的项目名及域名，不复用作者账号资源。
2. 配置生产分支 `main`、根目录为仓库根、构建命令 `npm run build`、输出目录 `dist`，并选择可用的 Node.js 22 构建环境。`wrangler.jsonc` 已声明 `pages_build_output_dir: "./dist"`，其中项目名应与自己的资源一致。
3. 在构建环境填写所需 `VITE_*`，完成上方资源与域名调整。生产和预览环境分别配置后端及可信来源，避免预览页面写入正式数据。
4. 保留根 `functions/api/[[path]].js`。Pages Git 构建应将其编译为 `/api/*` 路由，而不是只上传 `dist` 静态文件；通过部署详情确认 Function 路由存在。`public/_redirects` 提供 SPA 回退及旧政策链接重定向，API 应先由 Function 接管。
5. 按 Pages 控制台指引绑定自有域名并配置 DNS / HTTPS。部署后检查 `/api/health` 返回 JSON、刷新 `/merchant/ads` 与 `/admin` 等深层路由仍可打开，再验证登录、上传、验证码、受保护接口和证书响应的禁止缓存行为。

Pages Function 保留方法、请求头、请求体和查询参数，设置 `X-Forwarded-Host` / `X-Forwarded-Proto`，在没有 Origin 时补上当前网页来源；它不会把新域名伪装为原站来绕过后端来源校验。

### API 地址与 CORS 的边界

- **同源代理**：`VITE_API_BASE` 留空，浏览器请求本站 `/api`，通常不发生浏览器跨域检查；后端依然可能按 Origin 拒绝敏感操作，代理不会解除这些校验。
- **跨域直连**：设置自有 `VITE_API_BASE`，API 必须对网页的准确 Origin 返回带凭据 CORS，允许实际方法与请求头，例如 `Authorization`、`Content-Type`、`X-Captcha-Token`；同时前端 CSP 必须允许该 API 域名。凭据请求不能用 `Access-Control-Allow-Origin: *` 代替准确来源。
- 共享后端的通用 CORS 以及商家、认证、赞助者、身份治理等接口存在代码级来源名单/校验，并非一个可在本前端设置的通用 `CORS_ORIGINS` 变量；Pages 分支预览域名也不会自动被信任。
- 当前 Pages Function 的 OPTIONS 会回显来源并允许凭据，正常响应优先保留后端 CORS 头、缺失时才补头；这不是严格来源白名单。`public/_headers` 中静态文件的 `Access-Control-Allow-Origin: *` 也不能替代 API CORS 或安全授权。
- `src/utils/pushManager.js` 和 Service Worker 中有固定同源 `/api` 请求，因此即使主要 API 使用跨域直连，仍需配置同源代理或单独适配这些调用。

### Vercel 或其他静态平台

仓库**没有 `vercel.json` 或 Vercel API 函数**，根 `functions/` 是 Cloudflare Pages 格式，不能直接当作 Vercel Functions。可使用 Vite 框架预设、安装命令 `npm ci`、构建命令 `npm run build`、输出 `dist`，但还必须自行配置 API 反向代理和 SPA 回退。

以下是采用者可添加到自己副本的最小 Vercel 重写示例，`api.example.com` 必须替换为自有 API：

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.example.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

使用同源重写时将 `VITE_API_BASE` 留空；需实测转发后的 Origin、Authorization、Cookie、Set-Cookie 与敏感接口行为，不能假定与 Pages Function 完全等价。此示例仅展示 API 优先、SPA 随后的必要顺序；旧政策地址的永久重定向、CSP、安全响应头、`/c/*` 与敏感 API 的 `no-store` 规则需要按平台另外迁移。Vercel 不会解释 Cloudflare 的 `_headers` / `_redirects`。仅把网页上传为静态文件、让 `/api` 回退到 `index.html`，不是可用的部署。

## 文档与源码入口

- [移动界面与 App 制作指引](APP_GUIDE.md)：设计系统、功能和路由说明；其中历史验收数量、账号、部署状态与旧离线描述不应作为当前配置依据。
- [变更记录](CHANGELOG.md)：历史变更参考。
- [WebAuthn 加固说明](docs/compose/reports/webauthn-hardening.md)：通行密钥的兼容与错误处理背景。
- [后端部署说明](https://github.com/ZhX589/abdl-space/blob/main/DEPLOYMENT.md)、[后端 API 说明](https://github.com/ZhX589/abdl-space/blob/main/API.md)：共享服务依赖，执行前结合后端当前代码和分支规范核对。
- [路由入口](src/App.jsx)、[管理路由](src/AdminRoutes.jsx)、[Pages API 代理](functions/api/[[path]].js)、[构建配置](vite.config.ts)、[开发协作约定](AGENTS.md)。

## 分支与发布规范

- `develop` 是开发与集成分支，必须包含 `main` 的全部增量。
- `feat/*`、`fix/*` 从 `develop` 创建，完成后合回 `develop`，再清理本地与远端功能分支。
- `main` 是上线分支。仅在明确授权发版时，将 `develop` 以 merge 或 fast-forward 合入 `main`；不 squash 这次合并，也不直接向 `main` 堆叠功能提交。
- `hotfix/*` 从 `main` 创建，发布后必须把 `main` 合回 `develop`；不得用 reset 丢弃 `develop` 的独有提交。
- **本仓库既有远端配置中，推送 `main` 会触发 Cloudflare Pages 自动部署移动站，推 `main` 即上线。** 发版前确认测试、构建、配置与授权；新 fork 需要自行配置 Git 集成，不会自动继承该关联。

## 许可证

当前仓库未提供根 `LICENSE` / `COPYING` 文件，`package.json` 也未声明许可证；不能据相关仓库或依赖的许可证推断本仓库采用 MIT 等授权。复制、修改或分发前请向维护者确认本仓库授权范围，第三方依赖和素材分别遵循其各自许可。
