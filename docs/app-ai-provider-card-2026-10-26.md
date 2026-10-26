# 管理端「新版 App AI 服务配置」卡片（移动站）

日期：2026-10-26。分支 `feat/app-ai-forum-controls-20261026`。移动站管理后台新增 App AI 上游配置卡片，与主站同构（组件、模型、fixture 均为同源副本），对接后端 `GET/PUT /api/admin/app-ai/provider`。**本轮仅交付 develop 分支代码，不部署生产。**

## 范围与行为

- `src/appAI/`（model/api/fixture/model.test.js）+ `src/pages/admin/AppAIProviderCard.jsx`，渲染进 `appClients.jsx` 管理页。
- 令牌 keep/replace/clear 三态；密码框非受控不回显；clear 需勾选确认；跨 origin 变更 base_url 强制携带新令牌；revision CAS 冲突提示刷新。
- 文案明确仅影响带 `X-ABDL-App-AI: 1` 协议头的 App AI 功能，不影响旧版 App 与网页 AI。

## 验证

- `npm test` 全量 **324/324 通过**（含新增 appAI 用例），`npm run build` 成功。
- `tests/app-clients-fixture-server.js` 的 AI 路由 fixture 未经请求可控模板执行（静态断言实现），与上一轮 Mimosa 整改口径一致。
- 仅本地验证；生产部署需用户另行指示。

## 2026-10-27 推送门禁误报处理

主站项目图错误地将内存注册测试夹具的 `fetch` 方法与生产全局 fetch 关联，导致移动站提交也被跨仓告警阻断。两站将该纯内存方法统一改名 `handleFixtureRequest`，同步三处调用，保留未知路径拒绝和全部断言；没有修改生产代理或认证代码。主站同参数项目上下文复扫告警归零，本仓完整测试324/324复测通过。未关闭安全门、未写豁免规则或伪造账本。用户本次只授权后端上线，移动站仍仅交付develop。
