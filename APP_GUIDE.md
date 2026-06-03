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
| `/admin` | AdminPage | 管理后台 |

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
