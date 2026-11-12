# 定向IP/请求观察管理（2026-11-12开发，未上线）

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

本轮只开发提交推develop：不推main、不部署、不执行后端0112迁移或启用真实观察。移动main c701679仍仅防归档声明层；develop保留完整全路径guard但未发布，未来不能整体提升而夹带其Functions调用成本，须继续分层发布。

## 验证

最终完整 **684/684**、最终Vite build及Pages Functions真实编译exit0；真实UUID/hash与generation修后module/privacy **66/66**，scoped ESLint exit0/0error/10既有warnings。另以真实后端Hono/SQLite响应验证双站模型的UUID保存/页generation/清日旧复制授权409/legacy hash，跨仓探针通过。不把单元/SSR/fixture当GUI。

本地隔离fixture：`OBSERVATION_FIXTURE_PORT=8797 node src/userObservation/fixture-server.js`，入口`http://127.0.0.1:8797/admin/security?tab=user-observation&user_id=3`。只监听loopback、不代理生产。浏览器newTab/list连续工具超时，正式GUI未开始、无截图，桌面/窄屏三主题及系统剪贴板未验，临时fixture已停止。

仓外`abdl-space-user-observation-evidence-20261112/`保留每轮失败与通过日志/退出码/指纹；后端记录另包含真实workerd入口、D1成本、类型及旧失败基线。不称生产/真实账号闭环已验证。
