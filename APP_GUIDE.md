# ABDL Space 移动端 — App 制作指引

## 项目简介

ABDL Space 移动端（abdl-space-mobile）是 ABDL Space 主站的移动端版本，域名为 `m.abdl-space.top`。专注于移动端体验优化，与主站共享后端 API，可独立迭代 UI/UX。

## 品牌信息

| 项目 | 内容 |
|------|------|
| 项目名称 | ABDL Space |
| 中文名 | ABDL Space（无正式中文名） |
| 当前版本 | v0.1.0 移动版 |
| 生产域名 | `m.abdl-space.top` |
| 主站域名 | `abdl-space.top` |
| 后端 API | `api.abdl-space.top` |
| 图床 | `img.abdl-space.top` |

### Logo 资源

| 资源 | URL |
|------|-----|
| 横版 logo（JPG，白色背景） | https://img.abdl-space.top/file/1779879217956_ABDL.jpg |
| 横版 logo（PNG，无背景） | https://img.abdl-space.top/file/1779879241082_ABDL.png |
| 网站 icon（SVG） | https://img.abdl-space.top/file/1779879250278_ABDL_icon.svg |
| 竖版 logo（SVG，无背景） | https://img.abdl-space.top/file/1779879267209_ABDL_logo_word.svg |
| 纯艺术文字（SVG） | https://img.abdl-space.top/file/1779879269255_ABDL_word.svg |

## 设计系统

### 主题（三套）

1. **浅色主题**（默认）：白底、蓝粉配色，清新柔和
2. **深色主题**：暗色背景，降低饱和度，护眼
3. **多彩主题**：半透明毛玻璃卡片，渐变背景

### 色板

| 角色 | 浅色 | 深色 | 多彩 |
|------|------|------|------|
| Primary | #A8D8F0 | #7EB8D4 | #9BB8E0 |
| Accent | #FFB7C5 | #F5989E | #F0A0B8 |
| Background | #F5F8FC | #1A1D23 | 透明渐变 |
| Card | #FFFFFF | #252830 | rgba(255,255,255,0.55) |
| Text | #2C3E50 | #E0E4EA | #3A4A5C |

### 设计语言

- **圆角**：卡片 1.25rem、按钮 1rem、输入框 1rem
- **阴影**：柔和蓝色阴影（浅色）、深色阴影（深色）
- **字体**：Segoe UI → PingFang SC → Microsoft YaHei → system-ui
- **动效风格**：参考 MIUI / Xiaomi Hyper OS（尤其是 MIUI 12），流畅、弹性感、层次分明、丝滑过渡

### 移动端专属

- 底部导航栏（5 个 Tab）
- 顶部毛玻璃标题栏（blur 24px + saturate 200%）
- 下拉刷新（PullToRefresh）
- 微信风格图片查看器（双指缩放/双击放大/左右滑动）

## 核心功能

### 用户系统
- 注册/登录（支持离线模式，localStorage 存储）
- 多账户切换
- 个人中心（支持访问他人主页）
- 用户等级与经验值
- 关注/粉丝系统

### 论坛/广场（默认首页）
- 帖子列表、帖子详情、发帖
- 图片上传与预览
- 点赞、评论
- 富文本内容渲染

### 纸尿裤系统
- 纸尿裤列表、纸尿裤详情
- 排行榜
- 对比工具
- AI 智能推荐（基于 DeepSeek）

### 其他
- 术语 Wiki
- 私信系统
- 通知系统
- 管理后台
- 人机验证（QuantumVerify + Turnstile）
- 外部链接拦截与跳转提示

## 路由表

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | ForumFeed | 广场/论坛首页（默认） |
| `/forum/:id` | PostDetail | 帖子详情 |
| `/create-post` | CreatePost | 发帖 |
| `/diapers` | Home | 纸尿裤列表 |
| `/diaper/:id` | DiaperDetail | 纸尿裤详情 |
| `/rankings` | Rankings | 排行榜 |
| `/compare` | ComparePage | 对比工具 |
| `/recommend` | Recommendations | AI 推荐 |
| `/termwiki` | TermWiki | 术语 Wiki |
| `/about` | About | 关于页 |
| `/login` | Login | 登录 |
| `/register` | Register | 注册 |
| `/profile` | Profile | 个人中心 |
| `/profile/:id` | Profile | 用户主页 |
| `/settings` | Settings | 设置 |
| `/messages` | MessagesPage | 私信 |
| `/notifications` | NotificationsPage | 通知 |
| `/admin` | AdminOverview | 独立管理控制台概览 |
| `/admin/users` | AdminUsers | 用户身份、账户治理与超级管理员角色管理 |
| `/admin/app-clients` | AdminAppClients | App 更新提醒、版本废弃与观测 |
| `/admin/sponsors` | AdminSponsors | 赞助者配置、权益与库存 |
| `/admin/baby-verifications` | AdminBabyVerifications | 宝宝认证审核（独立后台 adapter） |
| `/admin/badges` | AdminBadges | 徽章管理 |
| `/admin/posts` | AdminPosts | 帖子治理 |
| `/admin/comments` | AdminComments | 评论治理 |
| `/admin/novels` | AdminNovels | 小说管理 |
| `/admin/reports` | AdminReports | 举报管理 |
| `/admin/security` | AdminSecurity | 安全日志与统计 |
| `/admin/settings` | AdminSettings | 站点设置 |
| `/admin/diapers` | AdminDiapers | 产品与品牌 |
| `/admin/notifications` | AdminNotifications | 推送管理 |
| `/admin/*` | AdminUnknownRoute | 未知管理路径不挂载数据页 |
| `/baby-verification` | BabyVerificationStatus | 当前账号认证状态与额度 |
| `/c/:token` | CertificateVerify | 公开证书实时验真 |

## 管理控制台本地验收（2026-10-04，未部署）

本分支将主站 14 个后台页面移植到独立移动宿主。后台不挂载前台 Header、底部导航、Footer、720px 容器或广告拦截/跳转/下载/推送推广提示；全局必要 toast 与通知 toast 保留并使用后台深浅 token。身份恢复中、未登录、普通用户和未知路径不挂载后台数据页。普通管理员可以治理普通用户，管理员目标需先由超级管理员撤销角色，ID 1 受保护。

后端持久化角色仍只有 `user` / `admin`；`is_super_admin` 由当前数据库 `id=1 && role=admin` 派生，不信任旧 token 中的管理角色。界面兼容旧身份响应缺失标记，显式 false 不回退；安全授权始终依赖配套后端。授予与撤销使用 `PATCH /api/admin/users/:id/role`，仅超级管理员可操作。这里没有部署后端或验证生产接口。

后台仅深浅主题：明确 light/dark 沿用前台结果（包括前台时间自动模式），多彩在后台映射为系统 `matchMedia` 深浅并实时监听，不写入或修改前台保存偏好。前台宝宝认证继续用 `src/babyVerification`，后台审核使用 `src/adminBabyVerification`。

隔离 GUI 启动命令（不要用默认 `npm run dev` 做本次验收，它配置了生产 `/api` 代理）

```bash
ADMIN_FIXTURE_UI=1 APP_FIXTURE_PORT=8792 node /home/ZYongX/projects/abdl-space-mobile/tests/app-clients-fixture-server.js
```

打开 `http://127.0.0.1:8792/__fixture/start` 选择测试身份和主题。该服务只监听回环地址，不读取默认 Vite 配置或 .env，不启用任何生产代理；HTML 外部 captcha/统计脚本被移除，CSP 限制同源连接并禁用测试页 Service Worker。角色修改与 App 保存仅在进程内存，不转发真实 API；没有实现的接口返回错误，不能视为生产集成通过。测试路径可用 `npm test`、`npm run build`、`npm run check:sw`，lint 应区分新增限定检查与历史全库错误。

本次自动验证：`npm test` 143/143 通过，`npm run build` 和 `npm run check:sw` 通过，`git diff --check` 通过。新增后台/adapter/tests 限定 ESLint 为 0 errors、35 warnings；现有宿主改动文件与 HEAD 基线相比无新增 lint error，不代表旧全库 lint 全绿。构建仍提示未配置 `VITE_CAPTCHA_KEY` 和较大 chunk，不能将本地构建成功视为生产配置或部署验证。

开发验收阶段仅本地验证，未调用生产 API。2026-10-05 用户授权提交、推送并通过 PR 交付到 `main`；GitHub PR 合并与 Cloudflare Pages 自动部署需分别核验，本次不主动运行部署命令或生产 SQL。合并前再次复跑 143/143 测试及 SW 检查通过；GUI 结果以实际浏览器验收记录为准。

## 部署信息

| 项目 | 内容 |
|------|------|
| 部署平台 | Cloudflare Pages |
| CF 项目名 | `abdl-space-mobile` |
| CF 账户 | 朋友的账户（ZhX589@outlook.com） |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 自定义域名 | `m.abdl-space.top` |
| DNS | `m.abdl-space.top` → CNAME → `abdl-space-mobile.pages.dev` |

## 与主站的关系

```
abdl-space.top          → 主站（桌面端优先，移动端兼容）
m.abdl-space.top        → 移动端（移动端优先，独立优化）
api.abdl-space.top      → 后端 API（两个前端共用）
img.abdl-space.top      → 图床（共享）
```

- 共享后端 API，不重复开发
- 共享认证体系（JWT cookie 跨域，Domain=.abdl-space.top）


## 宝宝认证网页功能
- 与主站同步公开证书验真、用户认证状态/额度/证书和管理员审核。
- 移动网页不提供认证照片或相册上传，统一提示在 Android App 完成拍摄。
- 证书验真及管理照片禁止进入 localStorage、内存缓存和 Service Worker 缓存。
