# App 帖子 AI 翻译策略卡

本记录保留最初开发验证。新增 `src/translationPolicy/` 并挂载于管理端App页面；用户随后授权词库前端上线，2026-11-03已随词库发布移动main `0103718`、Pages production `c58afa16`。未修改生产策略或发送真实AI，详见[生产记录](translation-glossary-web-production-2026-11-03.md)。

## 配置与交互

通过 `GET/PUT /api/admin/app-ai/translation-policy` 管理帖子翻译总开关、三档每日额度、赞助自动翻译许可和缓存世代。默认普通 5、英文阅读普通 10、有效赞助 100，不叠加；输入为 0–10000 的整数。上海时区只读。

PUT 精确七字段：`enabled/daily_limit/english_daily_limit/sponsor_daily_limit/sponsor_auto_allowed/cache_epoch/revision`。UUID revision 比较交换；409 保留草稿并要求成功重载后再保存。不自动覆盖、不自动重放。缓存世代为大于等于 1 的安全整数，切换不清零当日用量。

复用统一 App AI 服务，不重复管理地址、模型或密钥。保存策略不调用 AI，不证明上游可用。允许自动翻译不等于为用户开启；实际仍需有效赞助和用户主动选择。请求取消、账号/token 变化、组件卸载和晚回包具有隔离；读失败或离线不伪造已保存状态。

## 验证

- 新增策略专项 23 项；相邻管理模块合跑 104/104。
- 新鲜移动站完整基线 427/427；最终完整 450/450，零跳过，构建成功。测试/构建前后源码指纹不变。
- 首次相邻测试因既有 VM 夹具未注入新 API namespace 失败一项；只补夹具后完整复跑，保留首次失败记录。
- 首轮浏览器已观察 390px 实际页面 GET 的默认 5/10/100 与只读时区；保存/冲突点击遇工具超时，首轮不记为通过。随后在隔离的本地内存 fixture 实际补验：5→8 保存 PUT200；草稿9遇PUT409后保留并禁写；重新加载GET200后恢复8并可再次保存。390×844浅色、深色及colorful三主题均无横向溢出并截图。标准点击/等待曾超时的原始证据保留，成功保存为真实DOM点击，不用 Node/SSR 或直接网络写入替代。
- 环境变量占位、旧 Browserslist、既有大 chunk 告警仍在，构建并非无告警。

证据：`~/.local/share/abdl-post-translation-20261102/web-final-summary.json` 与逐轮原始日志。未改依赖锁、现有 provider/human 策略或生产配置。开发阶段develop推送不等于生产可用；后续后端已独立发布Worker819/0104唯一id25，本卡2026-11-03已随词库前端授权发布，不需要重复迁移。
