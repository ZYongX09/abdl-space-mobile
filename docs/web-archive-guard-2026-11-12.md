# 网页防归档抓取（2026-11-12，完整guard开发记录）

> 用户容量核验后选择仅声明层上线：移动mainc701679、主站main8149369，无根middleware/全路径路由。完整guard仍仅develop，不能未经确认整体发布。见[声明层正式发布与34项验收](web-archive-declarations-production-2026-11-12.md)。

本轮只改移动网页及主站对应实现，不改Android/后端/时间线/生产开关。公开网页无法保证不被普通浏览器、伪装UA或忽略规则者复制；robots/noarchive只是自愿信号，不能删除既有存档。未向归档机构提交本站URL、保存页面或权属材料。

## 实现

- `public/robots.txt`列归档产品组Disallow `/`；普通`*`组不禁爬，不全站noindex/nofollow。
- `index.html`增加robots noarchive，`public/_headers`增加静态X-Robots-Tag。
- 根`functions/_middleware.js`在下游处理前按明确产品token识别归档UA（archive.org_bot、ia_archiver、ia_archiver-web.archive.org、ArchiveBot、CCBot、heritrix），返回短文本403，HEAD无正文，private/no-store/CDN no-store、Vary User-Agent。不是广泛bot/archive子串匹配，不返回伪装内容。
- 普通网页保留流、状态和安全头；追加noarchive/Vary，实际HTML/XHTML不缓存，带hashJS/CSS缓存保留。
- 精确api/oauth命名空间、robots及应用关联文件先原样透传，不重建101或改变CORS/身份头。移动OAuth仍为原有前端跳转，不新增代理。`/apiary`/`/oauth2`不例外。
- `public/_routes.json`包含所有路径，不把API排除而跳过原代理；自定义域与Pages自身地址同一守卫。
- SW按响应Content-Type/Cache-Control拒存HTML/private/no-store，旧误缓存HTML不重放，不清全量缓存。

标识兼容说明：Common Crawl官方CCBot可核实；部分IA/Alexa名称为历史兼容，不保证当前所有抓取使用它。dotted robots名为遗留实现扩展，不是RFC9309标准product-token，不扩大成普通archive匹配。

## 上线门槛

全路径中间件增加Functions调用。只读生产配置（现有OAuth刷新后可读）为standard、fail_open=true，剩余额度/超额行为未确认；不改WAF/套餐/fail_open，不承诺不可绕过。正式上线前须确认真实请求量及额度不会影响API/普通访问，否则暂停该层阻断上线。本轮只推develop，不推main或部署。

## 验证

源码与测试全部编写后统一实跑：主站611/611、移动618/618，0fail/skip/cancel；两站build均exit0。实际构建产物middleware/policy/robots/routes/SW与源相同，API原代理未改。修改函数/测试scopedlint0；public原被忽略的SW另以显式globals配置实检0。首轮3个测试getter-return与忽略警告保留，测试窄修后重跑，不把ignored当通过。

真实Wrangler4.88编译+workerd/Pages dev共381检查点：主站174运行时+17静态、移动173+17；归档拒绝时ASSETS实际0调用。普通首页/深链接/query/JS/PNG、robots/assetlinks、_headers/_redirects、API身份/CORS、WS101/echo、主站OAuthPOST/302/body均通过。移动无OAuth代理，单独compiledprobe只证旁路协议；框架本身clone响应，不主张运行时外部可观察对象identity，Node源契约覆盖该项。

普通浏览器本地Pages合成深链接标题正确，robots原文可读；不等于整站React视觉或生产验收。所有上游用本地协议替身，终端出网被阻断；没有真实API/归档服务/用户内容访问。初轮workerd网络配置、RPCOrigin工具问题均保留日志后仅修harness，未放宽业务断言。

证据：仓外`abdl-space-archive-evidence-20261112/runtime-BT71vx/result.json`和既有`abdl-space-novel-evidence-20261112/archive-*.log`；主站对应完整记录`ABDL-Space-V2-alipay-gate-20261106/docs/web-archive-guard-2026-11-12.md`。业务已提交并推远端develop：移动`032c760`、主站`9244d89`；main仍`7044824`/`f10003d`、未部署。依赖/.mimosa/产物未入提交，其他本地工作树旧暂存改动不覆盖。

参考：[RFC9309](https://www.rfc-editor.org/rfc/rfc9309.html)、[CCBot](https://commoncrawl.org/ccbot)、[Pages Middleware](https://developers.cloudflare.com/pages/functions/middleware/)、[Routing](https://developers.cloudflare.com/pages/functions/routing/)、[Headers](https://developers.cloudflare.com/pages/configuration/headers/)、[Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)。IA移除与Google现行noarchive细则官方访问超时，未写成已证实事实；清理已有快照另需授权。
