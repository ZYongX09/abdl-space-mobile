# 移动后台 UI/UX 正式上线记录（2026-11-14）

用户在开发交付后明确要求“上线”，本轮仅发布主站17页、移动16页和嵌入模块；无后端/Android/数据库/生产策略操作。开发文档“未上线”为历史，本记录为当前发布状态。

## 分层范围与版本

- 移动main：`8403d3757e0522f04e8d7d5cc844b13e78c6eca8` → **`4d70ec29ceb960519593ea801a343c66bbeeb0bb`**。
- 主站main：`07d2d37bad276b5fccde00842155b1431f221a45` → **`b3f7d0d0044278fe3e887d33e96e0fb2ef23cb70`**。
- 从旧main选择性应用开发UX提交主ef9685b/移2bdf7b0；src逐文件匹配。候选先合回develop（主d0814a8/移d9a38af）后快进推main，远端develop包含main。开发分支完整archive guard原样保留，但**没有上线**。
- 两站Functions/public/Vite配置与旧main零差异；移动构建仅API Functions，主站仅API/OAuth。无root middleware、全路径_routes、advanced worker或archive-policy；仍是既有robots/noarchive/SW HTML缓存声明层。
- package测试注册冲突保留生产声明层测试＋UX测试，不注册不存在的完整guard。无依赖或规则修改。

## 检查与部署

- 主站候选802/802，移动806项/800通过/0失败/6 N/A，均0取消；两build exit0。每站较develop少16项明确未发布的完整guard测试，UI覆盖不减；移动6项为web-only相册N/A。
- 冻结源码测试构建期间不变。相同开发src范围lint0error，主57/移64warnings，非全仓零诊断。
- Pages移动`abdl-space-mobile`：**`3589af9e-5530-4adc-9839-5ae97d16bf47`**，创建于2026-11-14 00:49:48.800411UTC；production deploy success，canonical匹配上述main。
- Pages主站`abdl-space-v2`：**`4fa27f9a-5b08-4e61-bac1-92d2230666e8`**，创建于00:49:44.727397UTC；同样success/canonical匹配。
- Git main各一次自动部署；source/build/deployment config投影hash一致。只记录secret存在性/类型及脱敏元数据，不输出凭据，不声称密钥明文核验。
- 首次GET401证据保留；通过Wrangler刷新既有OAuth后新只读基线通过，不新建token、不改权限、不重复触发部署。
- Worker部署前后均53f04e03/version39c4d060承100%，未发布后端/执行D1查询迁移/改Android。
- 正式HTTP首样本24/24；后续TLS EOF失败保留并重跑，**85/85通过**，涵盖三入口API、双站17/16管理HTML及实际引用资源/robots。两个站点状态样本均在推main之后，相互revision/status/download一致，不称发布前后数据库快照比对。

## 实际GUI与未覆盖范围

本次浏览器恢复后，390浅色合成环境已实际看图＋DOM：仪表盘、导航、赞助概览单标题/配置独立保存、认证2条、帖子记录卡、站点摘要/草稿与输入首字不折叠；所有编辑仅内存未提交。1280浅色主站相册横滚后日期/右侧操作完整可见。

正式既有超管会话：390深色移动仪表盘、导航、已加载赞助、安全与观察页；1280深色主站观察页均只读DOM＋截图。没有生产保存、目标选择/敏感记录、真实AI/支付/推送/照片认领/治理操作。

**当前观察状态更正：正式两站均显示“总开关开启”、已配置目标本页1个**，保留30天、用户日2000/全局日5000。昨日关闭/空目标是历史；本轮没有修改策略，不推断何时/由谁改动，不擅自关回，也未重新操作用户7。

完整16页所有主流程/全部内部栏目、360/768/200%/减少动画/全部主题映射/系统剪贴板等仍未穷尽，不能因上线称全部验收通过。已补到手机实际截图，也不再沿用“手机0视觉通过”的旧边界。

证据：`/home/ZYongX/projects/abdl-space-admin-ux-production-20261114/`的candidate-freeze、pages-preflight/verify、http-before/after、worker-deployment、acceptance及viewed-screenshots；测试完整日志在`abdl-space-admin-ux-evidence-20261113/*-ui-release-*-20261114.*`。旧quota脏工作树仍在本地wip/preserved-develop-20261114，暂存指纹未变，禁止reset或误推。

如需回退，先核对真实远端/canonical再使用旧main/上轮Pages指针，仅回前端、不重迁移或改策略；本轮未回滚。
