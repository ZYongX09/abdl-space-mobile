# 指定版本仅本站模式前端交付

日期：2026-10-24。用户后续授权上线，main固定`690c787c5591dc4d2fa46dd5a06497b34a896265`已快进推送，Pages production部署`6096e8d9-8a8e-4ca7-9353-423a0f995792`成功；正式入口及appClients-D_zTgyiV.js含新卡片/专用接口。发布前重新npm test/build均exit0，原262项通过。浏览器正式管理入口匿名显示登录门禁，未用真实会话操作；配套Worker759已100%，生产策略记录为空保持默认关闭，无DDL/无APK/无V2实施。证据`~/.local/share/abdl-space-release/20261024-nbw-local-only/`。本段只develop维护，不为文档重复部署；以下保留开发记录。

- `/admin/app-clients` 新增「指定版本仅本站模式（关闭NBW）」独立卡片；代码与主站一致，沿用原 Card、表单、提示和三主题样式，原 policy/reminder 不变。
- 默认 `{ enabled: false, version_codes: [], include_unversioned: false }`，不预选版本。支持版本文本规范化预览、编辑/保存/错误重试、已保存快照、未保存更改与独立未上报选项；关闭保留配置。
- `adminAPI.appClientNbwLocalOnly` / `saveAppClientNbwLocalOnly` 专用 GET/PUT `/api/admin/app-clients/nbw-local-only`，仅传/收上述三字段，无 revision。校验严格 boolean、1–2147483647 正整数、最多 200 唯一版本；输入去重排序，读取失败/损坏响应/503 不当默认已保存，错误原样上抛。
- 说明仅影响命中的原生 App，网页/未命中新版不变，不停用整个 App；NBW 专栏为空、首页仅去外站源保留本站帖、发帖仅本站不双发、不改真实绑定。旧同步选项可能仍可见，code31 回复本地缺陷不能后端修复。
- `app_client_nbw_local_only` 与原两项保留键在通用设置表单/API/fixture 均受保护，不能通过新增 JSON 绕过。

## 验证

在移动站根目录执行：

- `node --test src/appClients/model.test.js tests/admin-theme.test.js tests/admin-api.test.js`：**44/44** 通过。
- `npm test`：**262/262** 通过。
- `npm run build`：通过；保留既有 `%VITE_CAPTCHA_KEY%` 缺失及大 chunk 警告，没有关闭任何错误。

证据目录 `/home/ZYongX/projects/nbw-local-only-evidence-20261024/`：`frontend-mobile-focused.log`、`frontend-mobile-full-tests.log`、`frontend-mobile-build.log`。模型、实际 API/token/cookie/no-store、页面接线与主题、fixture HTTP 的默认/保存/关闭/独立性/错误恢复已纳入全量测试。

## 隔离页面验收入口

`ADMIN_FIXTURE_UI=1 APP_FIXTURE_PORT=8792 npm run test:app-fixture`，打开 `http://127.0.0.1:8792/__fixture/start` 的 App 管理链接。数据只存在进程内存；无生产 API 代理，CSP 禁止外部业务请求。通过 `/__fixture?scenario=nbw-unavailable`、`nbw-invalid`、`save-error`、`slow`、`normal` 准备只影响本卡的读取 503、损坏响应、保存失败、延迟与恢复场景；原 legacy-reminder 等场景保留。

初次浏览器初始化超时，恢复后主代理在移动390×844内存fixture实际打开卡片并输入32/33，已核对DOM及截图布局；主站1280×720另完成保存、重载、非法输入验证。截图在共享证据目录gui-mobile-input.png与gui-main-{input,save,reload,invalid}.png。尚未完成真实账号/旧APK、浅色多彩逐态与全部错误GUI，不把自动化当完整真机通过。后端集成、最终提交合并与推送由主代理负责。
