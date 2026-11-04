# NBW全链路主备联动网页发布（2026-11-04）

用户明确要求“网页上线”，仅发布移动站与主站NBW动态端点、固定OAuth上下文、展示/媒体/缓存联动，保留既有词库/策略管理。不再部署后端，不执行D1查询/迁移、不切主备/能力/AI配置，不发布或安装App，不真实NBW授权/注册/发帖/上传。

## 实际生产

| 站点 | 固定main | Pages production deployment | 成功时间UTC |
|---|---|---|---|
| 移动m.abdl-space.top | `122b08c6e674f621ce7283769df20b1ceccd0f6e` | `8979c5ae-99f8-48e8-9d79-ba15252b2a20` | `2026-11-04T10:53:38.22395Z` |
| 主站abdl-space.top | `b8bb02eda537e6a3b9e4ae9e2309e4f57468cc9c` | `d1c65ffd-c057-4d51-9d65-8172223ad4a9` | `2026-11-04T10:52:54.717927Z` |

原main为移动0103718、主0b7b7e1，均非squash快进已验develop。Pages API确认准确commit/environment/deploy success/canonical，build_config/source/deployment_configs与前检相同。

## 验证

- 本轮新label一次串行完整移动 **515/515**、主站 **508/508**，fail/cancel/skip全0，双build exit0。移动292、主站315个业务源码配置逐hash不变；主站原始清单另含一个嵌套Mimosa工具状态(raw316)，未改/提交工具目录。
- 依赖锁、Vite、Pages代理/Functions与部署设置未变，CSP只增加固定备用域（移动img、主站img/frame），不用通配。既有captcha/turnstile占位、Browserslist与大chunk警告未隐去。
- 两站正式入口、移动7个/主站8个关键懒加载模块、CSS均与准确目标deployment的canonical逐字节一致，NBW九字段发现/OAuthcontext/缓存变化/固定备用及词库策略标记均在实际entry。32个JS样本Acorn+Babel静态解析合法，不执行下载JS。
- 移动entry及7模块与本地已验构建逐字节一致。主站本地和云端压缩产物部分不同，不称全字节/AST相同；准确commit、canonical和核心标记已确认。
- 两站同源health/DB、九字段discovery、旧config、安全拒绝非法state、词库/策略匿名鉴权最终 **14/14通过**。首轮主站config传输断开及资源短读保留后只重新读取，未改业务或重复部署。完整循环读至EOF核Content-Length后，正式域与canonical字节匹配。

## 异常过程及边界

GitHub普通push曾返回Internal Server Error，逐次核refs和Pages未收到目标后才普通重试，无force-push。main更新后Pages Git webhook超过15分钟未创建新构建；再次核对未存在目标deployment后，各用官方create-deployment multipart `branch=main` 触发一次原Git源构建。没有本地asset Direct Upload、创建hook或改配置，返回的commit准确且成功生效。

实际官方浏览器打开两站`/login`与`/admin/app-clients`，登录页渲染、管理页均显示“请先登录管理员账号 / 登录后才能验证管理后台权限”。初导航超时后同标签已完成。移动393px截图曾显示NBW配置不可用安全禁用（网络观察期间不稳），本站登录表单保留；不将其称为成功授权，也未点击授权按钮或真实登录。真实双域资源/Cookie/合作方callback与有效账号闭环未代验，传播受TTL而非即时推送。

后端保持Worker822/`1d7da1f3-0287-4930-819f-f7901ae1801b`，0105已唯一id26，**禁止重放0105/0104/0103/0102或全量apply**，本次网页发布无D1调用。NBW与AI/版本/词库/额度配置不写；Android仍签名测试包cfac28cd，不正式发布或安装。

发布归档只合回推develop，不再次推进main。证据 `~/.local/share/abdl-nbw-web-production-20261104/`；本轮完整gate/源码与dist清单 `~/.local/share/abdl-seamless-nbw-20261103/web-release-preflight-20261104-*`。不在仓库提交凭据、生产元数据或构建产物。
