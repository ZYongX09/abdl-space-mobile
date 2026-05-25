# ABDL Space 移动端发展规划

## 项目概述

ABDL Space 移动端是独立于主站的前端项目，专注于移动端体验优化，未来将迁移至 React Native 构建原生安卓 APP。

## 技术栈

### 当前阶段（Web 移动端）
- **框架**：Vite + React 18
- **样式**：Tailwind CSS（与主站一致）
- **API**：复用主站 API 层（api.abdl-space.top）
- **部署**：Cloudflare Pages
- **域名**：m.abdl-space.top（待配置）

### 未来阶段（原生 APP）
- **框架**：React Native + Expo
- **样式**：NativeWind（Tailwind CSS 语法写 RN 组件）
- **构建**：EAS Build（Expo Application Services）
- **分发**：Google Play Store

## 与主站的关系

```
abdl-space.top          → 主站（桌面端优先，移动端兼容）
m.abdl-space.top        → 移动端（移动端优先，独立优化）
api.abdl-space.top      → 后端 API（两个前端共用）
```

- 共享后端 API，不重复开发
- 共享认证体系（JWT cookie 跨域）
- 移动端可以独立迭代 UI/UX，不受主站影响

## 域名配置（m.abdl-space.top）

### Cloudflare Pages 配置
1. 在 Cloudflare Pages 创建新项目 `abdl-space-mobile`
2. 构建命令：`npm run build`
3. 输出目录：`dist`
4. 自定义域名：`m.abdl-space.top`

### DNS 配置
```
m.abdl-space.top  →  CNAME  →  abdl-space-mobile.pages.dev
```

### CORS 配置
后端 API 已配置 `*.abdl-space.top` 跨域，m.abdl-space.top 自动包含在内。

### Cookie 共享
JWT cookie 的 `Domain=.abdl-space.top` 已配置，m.abdl-space.top 可共享登录状态。

## 迁移路径

### Phase 1：Web 移动端（当前）
- [x] 项目初始化（Vite + React + Tailwind）
- [x] 复用 API 层和 Context
- [ ] 逐页迁移移动端组件
- [ ] 移动端专属交互优化（下拉刷新、手势操作等）
- [ ] 部署到 m.abdl-space.top

### Phase 2：React Native 迁移
- [ ] 初始化 React Native + Expo 项目
- [ ] NativeWind 样式迁移
- [ ] 逐组件从 Web 迁移到 RN
- [ ] 推送通知集成
- [ ] 原生导航（React Navigation）

### Phase 3：原生 APP 发布
- [ ] Google Play 开发者账号
- [ ] APP 图标和启动画面
- [ ] 隐私政策和用户协议更新
- [ ] EAS Build 打包
- [ ] Google Play 上架

## 目录结构

```
abdl-space-mobile/
├── src/
│   ├── api/          # 复用主站 API 层
│   ├── components/   # 移动端专属组件
│   ├── contexts/     # 复用主站 Context
│   ├── pages/        # 移动端页面
│   ├── styles/       # 移动端样式
│   └── utils/        # 复用工具函数
├── public/
├── index.html
└── vite.config.js
```

## 注意事项

- 移动端项目不影响主站运行
- 两个前端可以同时部署，互不干扰
- API 层代码通过手动同步更新（未来可考虑 npm 包共享）
- 移动端可以自由尝试新的 UI/UX 方案，不影响主站用户
