# 定向IP/请求观察管理（2026-11-12开发，2026-11-13前端候选未发布）

## 功能与权限

安全中心`/admin/security`保留原安全概览，新增“定向观察”；普通用户详情内部跳转预填ID，不自动启用。仅当前超级管理员挂载敏感模块，普通管理员不因能访问旧安全中心而取得IP/端点权限。Android不在范围。

IP-only和请求日志两个开关独立、不封禁，需理由，默认7天/最长30天。停止未来观察、清理某日历史、停止旧追踪与明确选择解除来源封禁是四种分离操作，不能根据用户历史IP泛删共享封禁。

专用`src/userObservation/{api,model,controller,components}`绕开通用离线假成功；配置版本为不透明1–128字符token（初始0、UUID/hash），不按数字解释。409保留草稿并要求重读，失败如实显示；退出/切号/401/403/销毁清敏感内存，晚回包不回填。

## 日查询与复制

固定`Asia/Shanghai`自然日，IP、请求、覆盖统计分页；方法/状态筛选，默认50条。请求仅脱敏注册模板、固定说明、HTTP状态/方法、时间/耗时与事件ID；不保存动态参数/查询串/正文/凭据。备注只表示请求，不证明人为点击或成功。来源无法验证显示未知，缺记录不等于没活动。

复制当前页和单日分开，须明确确认/理由并服务器审计。当前IP/request页携带目标/策略generation并原样回传授权，清日/版本改变后旧页新授权/幂等重放拒绝。单日稳定双流快照各页最多200请求+200IP，前端总5000条/1MiB，明确截断、续页/页内进度及重启去重。剪贴板失败只读可选文本；不上传第三方、不写localStorage，已外部复制不能收回。

隐私政策8.1说明定向排障记录的用途、字段、超管权限和新观察最多30天留存，不声称旧日志已统一清理。用户7的误设旧追踪已由单独生产修正撤销，新功能不自动加入该用户。

## 代理与发布边界

API Pages代理新增独立HMAC观察信封，method/path/purpose/time绑定；原认证POST/限流范围、CORS/原生App头/响应/WebSocket合同不变，不增加移动OAuth代理。未读取/写入生产secret值，仓外CDN Worker不改，无法确认原始IP时标未知。

2026-11-12开发轮只开发提交推develop，当时未推main、部署、执行后端0112迁移或启用真实观察；这不是其他发布任务的状态记录。移动main c701679仍仅防归档声明层；develop保留完整全路径guard但未发布，未来不能整体提升而夹带其Functions调用成本，须继续分层发布。

## 开发阶段历史验证（非本候选）

当时develop完整 **684/684**、最终Vite build及Pages Functions真实编译exit0；真实UUID/hash与generation修后module/privacy **66/66**，scoped ESLint exit0/0error/10既有warnings。另以真实后端Hono/SQLite响应验证双站模型的UUID保存/页generation/清日旧复制授权409/legacy hash，跨仓探针通过。不把单元/SSR/fixture当GUI。

本地隔离fixture：`OBSERVATION_FIXTURE_PORT=8797 node src/userObservation/fixture-server.js`，入口`http://127.0.0.1:8797/admin/security?tab=user-observation&user_id=3`。只监听loopback、不代理生产。浏览器newTab/list连续工具超时，正式GUI未开始、无截图，桌面/窄屏三主题及系统剪贴板未验，临时fixture已停止。

开发阶段仓外`abdl-space-user-observation-evidence-20261112/`保留每轮失败与通过日志/退出码/指纹；后端记录另包含真实workerd入口、D1成本、类型及旧失败基线。当时未做生产/真实账号闭环。

## 2026-11-13声明层基线发布候选（仅本地，未发布）

- 从`origin/main` `c701679c54c52eea10ca370fb6a43955f7e04ccb`新建`release/user-observation-20261113`，只选择性应用`de9f45916e93cb1cec1ba9c6f75870db333d2d12`观察提交，不整体合并develop。工作树`/home/ZYongX/projects/abdl-space-mobile-user-observation-release-20261113`。
- main完整测试清单仅追加观察模块，隐私测试保留legal通配符注册；不带main不存在的`archive-guard.test.js`。声明测试严格枚举Functions文件并断言无根守卫、全路径路由或advanced Worker。
- 本候选独立完整 **668/668**，0失败/跳过/取消；`NODE_OPTIONS=--max-old-space-size=1536 npm run build` exit0；构建后声明/SW/代理/隐私专项 **100/100**。不冒用develop的684或完整守卫数字。
- Wrangler **4.88.0**本地编译exit0，实际Functions路由仅`/api/*`，无`/*`或新增OAuth。源及dist Functions仅API和auth-client-ip helper；无`functions/_middleware`、archive-policy、`_routes.json`、`_worker.js`。编译路由证据只放仓外，不进入dist。
- 观察签名API/helper保持审查字节指纹；旧`attachAuthClientIp`实现、AuthContext/认证headers、robots/HTML/noarchive/静态头/SW/Vite/Wrangler配置逐字保持main，认证POST/限流/CORS/App/响应合同不变。
- 真实编译Pages在本地workerd双站代理回归 **30/30**，覆盖HMAC/伪造与未知IP、原认证、方法/正文/headers/CORS、App Origin、stream、真实101 WebSocket echo、401/502及静态ArchiveBot/移动无OAuth边界。所有出站仅同进程合成Worker且禁外网，随机本地key，未读生产secret。首轮合成WS fixture关闭ACK遗漏的runtime警告保留；仅修仓外fixture后重跑30/30无该警告，不改候选源码。
- 测试fixture源码仅显式本地入口使用，生产入口依赖与产物检查不包含fixture；源/产物hash、Functions路由、guard缺失及既有工作树/暂存状态保护证据在`/home/ZYongX/projects/abdl-space-user-observation-production-20261113/frontend-20261113T020541Z-ea8a6c/`。本轮未启动UI fixture，无GUI/三主题/系统剪贴板验收，不声称浏览器通过。
- 本准备任务仅本地提交，**不push、不合并develop/main、不部署、不调用生产API、不改后端源码/secret/配置、不动Android、不启用真实目标**。不代证其他任务的后端发布；须父流程审查后先集成develop并保留其未授权guard，再按授权单独提升候选，不整体发布develop。
