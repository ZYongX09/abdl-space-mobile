# 支付宝管理门禁候选（移动站，2026-11-06，未上线）

基于develop44b6202，隔离树abdl-space-mobile-alipay-gate-20261106／feat/sponsor-alipay-gate-20261106。在现src/sponsors/SponsorAdmin.jsx的配置与权益tab增加独立AlipayPolicyPanel，复用adminAPI/run/busy/确认/理由/CAS/主题；不改全站api.js、Android、原套餐／爱发电或其他管理模块。

## 行为与合同

独立新购开关默认false，不能关闭额度保护；人工商家状态区分审核中和已确认restricted_allowed，不是支付宝自动审核查询。单笔5000分/上海日100000分硬上限，只可更保守；审核通过不自动开关或取消额度，monthunknown继续禁购。没有密钥输入或原始配置读取。

GET/PUT `/api/admin/sponsors/alipay-policy`严格响应与精确写入{expected_version,settings,reason}；购买可用只认true+null reason，未知enum/不完整响应拒绝。保存必须PUT回执+GET重读，409/写入结果未知保草稿/理由并暂停保存，人工比较最新版本才采用CAS基准，不静默重发。切号丢旧响应，不用localStorage假保存。

显示服务器as_of、上海周期/重置与本系统账本paid/pending/occupied/remaining，无上下文null不造0；样本超过120秒不声称实时可购。明确不是支付宝所有应用/站外收款或余额；关门不阻旧单通知查询履约、不假撤销外部签单。

## 已完成验证

固定基线515/514pass/1skip，build0。新增API/model/真实handlers专项21/21；最终536/536、0fail/skip/cancel、build0，296份源码配置前后不变。原跨仓同源测试在独立副本缺另端时skip，当前实际执行通过；没删测试。源码独立定点复核未发现可确认P1/P2，不是完整安全认证。

修改9个JS/JSX文件真实lint exit0，保原7项warning、语义零增减；首轮新测试/fixture的Node全局9错已改明确node:timers/node:process导入，未关闭规则。与主站组件/model/API/CSS/测试/fixture同实现，主站无原lint脚本，不虚报主站全仓lint通过。

## 页面验收未完成

**当前没有实际浏览器截图或人工页面交互验收。** 主站同源隔离fixture启动HTTP200/CSP通过，但会话未暴露浏览器控制工具；已停止本次fixture，未用shell浏览器/其他通道绕过。Node handlers/fetchstub测试不替代实际React弹窗/切号/窄屏三主题验收。

因此三仓只提交推送功能分支检查点，不合develop/main、不部署；候选后端0108只本地，生产831/迁移27/28及真实支付关闭不动。恢复浏览器验收后再合develop。

## 恢复验收

仓根运行：

```sh
node tests/alipay-policy-fixture-server.js
```

http://127.0.0.1:8814/__alipay-policy-fixture，仅内存数据/模拟Auth，真实SponsorAdmin＋adminAPI，无线上请求/支付。一次仅一站（主站8813）；入口先选scenario/theme并点准备按钮。

场景normal、ready、missing-context、daily-exhausted、monthly-exhausted、stale、unknown-reason、missing-api、load-error、invalid-data、save-error、save-unknown、conflict、concurrent-after-save、slow-save、unauthorized、forbidden。验360/1280px、light/dark/colorful，保存/重读、409草稿及采用最新、受理后回包失败、并发重读、延迟双击、管理员切换/退出期间弹窗与旧响应。

私有证据~/.local/share/abdl-sponsor-alipay-gate-20261106/，关键mobile-final2-result.json、pre-browser-source-freeze.json和lint-recheck2/lint-build-comparison.json。本轮不创建沙箱；下一阶段须独立授权并隔离appId/网关/密钥/账本。
