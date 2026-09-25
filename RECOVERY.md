# 恢复说明（2026-09-25）

本分支基于云端还原提交 `f4b7c30480f6c32e14594349a0b3601ca4f88425`，从本机 ZCode 会话数据库恢复删除前未推送的增量。

恢复内容：

- 管理员 QQ 身份查询、筛选与解绑界面。
- QQ 响应敏感字段过滤、幂等 operation ID 和会话漂移保护。
- QQ Android SDK 隐私政策披露。

验证：

- 单元测试：36/36 通过。
- `npm run build`：通过。

证据来源：ZCode SQLite 会话库、Cloudflare Pages 部署记录。当前生产 Pages Source 为基线提交 `f4b7c30`，因此已部署源码没有缺失；本分支主要保存 2026-09-24 未推送的 QQ 管理增量。
