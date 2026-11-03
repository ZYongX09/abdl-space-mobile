# 翻译词库与策略管理前端生产发布（2026-11-03）

## 授权与结果

用户明确要求“词库前端上线”，本轮只发布两网页词库及其依赖的帖子翻译策略卡，不发布后端/Android、不执行DDL、不填词条/保存策略或真实AI，不实施同时提出的NBW配置全端联动评估。

| 站点 | 固定main源码 | 实际Pages production deployment | 成功时间（UTC） |
| --- | --- | --- | --- |
| 主站 | `0b7b7e164ed264398ef4be77ac841ed6fb88f818` | `e14449c5-58a5-4544-8355-a920b228fa44` | `2026-11-03T12:37:38.26912Z` |
| 移动 | `010371847b1af7a8fce2a4a1dc6bd27227cfb20c` | `c58afa16-90de-4492-a769-007e9b60ebb9` | `2026-11-03T12:38:13.963077Z` |

原main为主站d59893d0、移动fa4c4168；非squash快进develop并推送触发现有自动部署，没有额外手动deploy。Pages API确认commit/environment/deploy success及canonical匹配，build/source/deployment_configs与发布前相同。

## 发布前验证

完整Node主站474/474、移动483/483，0fail/skip/cancel，双build exit0；305/282个源码配置文件前后指纹一致。生产增量只有translationPolicy/translationGlossary及AppClients/API接线，未改依赖锁、代理、Vite、CSP、环境配置。既有构建告警仍保留。

## 正式资源与门禁

移动正式域实际appClients模块：`https://m.abdl-space.top/assets/appClients-b0HMpbap.js`，63454字节，SHA256 `5e2cb3d7ac881301861b97e74ec274c438a953aeb9d658bced39cc5ea8855cb2`，模块及三个共享依赖均与本地已验构建逐字节一致。主站appClients-Cm87Re-t.js为63455字节，仅静态import文件名归一后业务代码一致，不误称主站共享entry/layout逐字节匹配。

两站词库CSS逐字节一致，SHA256 `7e6ce32bc6c9ff02ef02cc6446da59318c775f3f18fc0c29e6b245316a450d3e`。实际代码包含中英别名/备注/显式保存/缓存确认/重载，以及共享API中的词库和策略GET/PUT/no-store接线。

两站同源health/DB均200，匿名词库GET/PUT及策略GET均401安全body/no-store，共10项通过。首轮移动传输断开留证后完整复验成功，没有代码或部署变化。官方浏览器实际打开两正式路由，均落“请先登录管理员账号”，移动先显示身份验证中再正确进入门禁。未用本地fixture冒充正式页面，未执行真实管理员保存。

## 管理员使用

- 移动：`https://m.abdl-space.top/admin/app-clients`
- 主站：`https://abdl-space.top/admin/app-clients`

登录管理员后在“App管理 → App中英翻译词库”编辑，中文/英文每行一个别名，可填备注，显式保存并确认失效共享译文。后端支持200条、每语言1–10变体；保存影响后续缓存世代，可能消耗新生成发起者额度，不清同日used/reserved、不自动重译已显示内容或盲重发unknown。同页帖子翻译策略卡也已上线。

## 边界与证据

后端仍为Worker819/742bd7c7，0104已唯一id25，**不需要再次迁移，禁止重放0104/0103/0102或全量apply**。本次未改NBW主备/模式/版本数组、provider/密钥、词库条目、翻译额度或App版本发布。

NBW主备只控制既有服务器出站，若扩大至授权/外链/媒体/全部UI入口，需要后端公开安全endpoint/revision、App主机校验/刷新和两网页authorize/CSP/缓存配合；此为只读评估，不在本轮实施。

归档只推develop，不再次推进main。证据 `~/.local/share/abdl-glossary-web-production-20261103/`。本文件与主站同名上线记录分别保存各站事实；部署成功不代替真实管理员保存或供应商计费验收。
