---
title: cf-bbs Nexus：跑在 Cloudflare Workers + D1 上的零依赖论坛社区
date: 2026-10-17 20:00:00
updated: 2026-10-17 20:00:00
categories: [开源项目]
tags: [Cloudflare Workers, D1, TypeScript, SSR, 论坛]
description: 一个不引入任何运行时依赖的论坛社区，从路由、SSR 模板到 Markdown 渲染全部手写，约 5.8k 行 TypeScript 跑在 Workers + D1 上。记录它的架构取舍、安全防护设计，以及为省下免费额度做的三层反爬与两个反直觉的实测发现。
---

**cf-bbs（Nexus）** 是一个可以直接部署到 Cloudflare Workers + D1 的轻量论坛：**服务端直出 HTML、零运行时依赖、内置中英双语与 6 种 OAuth 登录**。

它不引入 Hono、不引入 React、不引入 ORM——路由、模板渲染、Markdown 解析、会话签名全部自己写。整套逻辑约 5.8k 行 TypeScript，本地 `npm run dev` 起来就能用，线上 `npm run ship` 一条命令发布。

<!-- more -->

## 为什么是 Workers + D1

论坛这类应用的负载特征很适合边缘运行时：读多写少、请求零散、流量有明显的潮汐。传统方案要养一台服务器，而论坛大部分时间那台机器是空转的。

Workers + D1 的组合把成本压到了几乎是零：

- **Workers** 免费版每天 10 万次请求，按需计费；
- **D1**（SQLite 语义的边缘数据库）免费版每天 500 万行读；
- 没有冷启动焦虑，全球节点就近响应；
- 国内访问友好——绑定自定义域名后比 `workers.dev` 子域稳定得多。

代价是运行时受限：没有 Node.js API、CPU 时间有上限、没有长连接。这些约束反过来决定了后面的所有技术选型。

## 关键取舍：不引入任何运行时依赖

这是整个项目最核心的决策，也是它在同类项目里最不寻常的地方。

```
src/
├── index.ts        Worker 入口：上下文、CSRF、安全头、限流、错误处理
├── router.ts       极简路由（method + /path/:param）
├── lib/
│   ├── auth.ts     会话签名、PBKDF2、CSRF
│   ├── oauth.ts    6 个 Provider 的授权/换取/资料拉取
│   ├── db.ts       全部 SQL 与领域操作
│   ├── markdown.ts 安全 Markdown → HTML
│   ├── botguard.ts 应用层爬虫拦截
│   └── i18n.ts     中英词条、相对时间
├── routes/         home / topic / auth / user / admin / api / feeds
└── views/          layout、pages、admin、ui
```

{% note info 为什么不用 Hono %}
不是因为 Hono 不好，而是这套应用的复杂度**还没到需要框架的程度**：路由规则不到 60 条，模板是纯函数拼字符串，ORM 在 SQLite 上带来的抽象收益有限却会拖慢启动。

省下来的收益很实在：Worker 冷启动更快、产物更小、依赖漏洞面归零。
{% endnote %}

`devDependencies` 里只有三样：`typescript`、`wrangler`、`@cloudflare/workers-types`。**运行时依赖是 0。**

## SSR 直出，首屏不依赖 JS

页面全部服务端渲染。CSS / JS / 图标走 **Workers Static Assets** 直接返回——这意味着静态资源**不消耗 Worker 调用次数**，是省额度的重要一环。

点赞、收藏、回复预览做成**渐进增强**：没有 JS 时以表单提交回退，功能依然完整，只是没有局部刷新。

## 数据模型上的两个决定

{% row %}
{% col %}
**一、内容全部软删除**

`is_deleted` 标记而非物理删除。论坛内容有审计与恢复需求，误删的代价远高于多几个字节。
{% endcol %}
{% col %}
**二、冗余计数 + `DB.batch()`**

`reply_count` / `like_count` / `views` 与板块的各类计数在写入时同批更新，让列表查询**零 JOIN 聚合**。
{% endcol %}
{% endrow %}

D1 的计费按行读算，列表页如果每次都要 `COUNT(*)` + 多表 JOIN，额度消耗会成倍增长。**把计算从读时挪到写时**，是这个项目的省钱主线。

用户名与邮箱通过 `lower()` 唯一索引实现大小写不敏感唯一——SQLite 里这是标准做法，但容易被忽略。

## 安全不是后补的

| 项 | 实现 |
| --- | --- |
| 会话 | HMAC-SHA256 签名令牌，HttpOnly + SameSite=Lax + Secure，支持 `token_version` 全端下线 |
| 密码 | PBKDF2，默认 10 万次迭代（`PASSWORD_ITERATIONS` 可调） |
| CSRF | 双提交 Cookie + 表单隐藏域 / `X-CSRF-Token`，常量时间比较 |
| XSS | Markdown **先整体转义再生成标签**，链接只允许 `http(s)` 与站内路径 |
| 响应头 | CSP、X-Frame-Options、nosniff、Referrer-Policy、HSTS、Permissions-Policy |

{% note warning Markdown 的渲染顺序是关键 %}
先渲染再转义会把用户内容里的脚本标签一并放行；先转义再渲染则会把正常内容破坏。正确做法是**先对原文做 HTML 转义，再执行 Markdown 语法转换生成标签**——这样生成出来的段落标签与代码标签是安全的，而用户自己写的裸 HTML 已经变成实体。
{% endnote %}

OAuth 支持 **GitHub / Google / GitLab / Gitee / Discord / 通用 OIDC** 六种，**配了环境变量就自动出现在登录页，没配就隐藏**。通用 OIDC 通过 `.well-known/openid-configuration` 自动发现，兼容 Keycloak、Authentik、Auth0、Linux.do 等任意符合标准的服务。

## 三层反爬：免费额度的生存战

这部分是项目里最有实战价值的内容。免费版 Workers 每天 10 万请求，一个 AI 训练爬虫扫两圈就能吃掉大半。所以做了三层防护：

{% timeline %}
{% event 第 1 层 · 应用层拦截 %}
`src/lib/botguard.ts` 在**路由和数据库之前**执行，命中直接 403，**不产生任何 D1 查询**。

AI 训练爬虫（GPTBot / CCBot / ClaudeBot / Bytespider…）、脚本客户端（curl / python-requests / sqlmap…）、空 UA、漏洞扫描路径（`/wp-login.php` `/.env` `/.git`…）全部拒绝；搜索引擎与社交预览放行但禁止进入 `/admin` `/api/` `/search`。
{% endevent %}
{% event 第 2 层 · Cloudflare 边缘防护 %}
`npm run guard` 一键配置：Bot Fight Mode、AI 爬虫阻断、4 条 WAF 自定义规则、1 条限流规则，**幂等可反复执行**。

命中后请求根本不进 Worker，**不消耗调用额度**——这是省钱最有效的一层。
{% endevent %}
{% event 第 3 层 · 用量监控与调优 %}
Workers / D1 的 Metrics 看趋势，Security → Events 按 UA 与路径定位异常来源，把新出现的 UA 关键词补进规则后重跑 `npm run guard`。
{% endevent %}
{% endtimeline %}

### 两个反直觉的实测发现

这部分值得单独记，因为它们是**文档里查不到、只能实测撞出来**的：

**发现一：Cache API 做跨 isolate 计数不可靠。**

第一版限流用 Cache API 存计数器，指望它跨 isolate 共享。实测高频 `put` / `match` 时**读不到刚写入的值**——连打 75 次全是 200，限流形同虚设。

改用 Workers 原生 **Rate Limiting binding**（`wrangler.toml` 的 `[[ratelimits]]`）后立刻正常（5 次/10 秒就返回 429）。

{% note danger wrangler 3 会静默忽略这个配置 %}
升级前的 `wrangler` 3.x 对 `[[ratelimits]]` 只打印一行 "Unexpected fields" 警告就跳过，**不报错**。如果限流配了却完全没生效，先确认 wrangler 版本——必须 4.x。

这也是"配置写了但没生效"这类问题最难查的原因：**它不报错，只是不起作用。**
{% endnote %}

**发现二：免费版的边缘 rate limiting 规则不执行。**

通过 API 写入规则**返回成功**（zone 的 version 递增），但边缘实际不触发——连 `expression: "true"` 这种恒真规则都不触发。

结论：**免费套餐下限流只能靠 Worker 内实现**，边缘那条规则仅作配置备份保留（换 Pro 及以上套餐后调整参数重跑即可）。

{% fold 当前的限流配额 %}
| 对象 | 配额 |
| --- | --- |
| 匿名访客（无会话 Cookie） | 40 次/分 |
| 已登录用户 | 180 次/分 |
| `/search` | 10 次/分 |

由于 CSS / JS 走 Static Assets 不经 Worker，匿名 40 次/分约等于**每分钟浏览 40 个页面**，正常用户碰不到上限。

本地开发没有 binding 时自动回退到 Cache API / 内存桶，阈值一致。
{% endfold %}

## 一键部署，以及一个差点让全员掉线的坑

`npm run ship` 把 9 个步骤串成一条命令：检查依赖与登录态 → 占位 `database_id` 时自动建库并写回 → 生成 `SESSION_SECRET` → 应用迁移 → 写入初始板块 → 类型检查 → 部署 → 轮询 `/healthz` 确认可用。

{% note danger 密钥处理的三态判断 %}
第一版判断 `SESSION_SECRET` 是否存在时用了「解析失败就当作不存在」，结果误判并**覆盖了线上密钥，导致所有已登录用户会话失效**。

正确做法是三态：`present` / `missing` / `unknown`。**只有明确 `missing` 时才写入**，`unknown` 跳过并提示；需要轮换必须显式传 `--rotate-secret`。

密钥这种"改错了会影响所有人"的操作，宁可保守。
{% endnote %}

另外也支持 GitHub Actions：**push 到 main 自动发布**，没配 `CLOUDFLARE_API_TOKEN` 时流水线只做类型检查并提示跳过——**不会出现红色失败记录**。

## 国际化

内置 `zh-CN` / `en-US` 两套完整词条，服务端按 `Cookie → 用户偏好 → Accept-Language` 协商。**板块名与描述本身也是双语字段**，不是"界面翻译了、内容还是中文"。

新增语言只需两步：在 `src/lib/i18n.ts` 加一份字典 + 在 `LOCALES` 里加一项。

{% note info 一个路由顺序的坑 %}
语言切换的 `/lang/*` 一开始写在路由分发**之后**，结果永远执行不到、返回 404。

非路由的"特殊路径"逻辑必须放在 `dispatch()` 判空之前，否则会被 `notFound` 提前拦截。这类 bug 静态看代码很难发现——它看起来完全合理。
{% endnote %}

## 功能一览

- 板块、主题、楼层回复、Markdown（代码块 / 引用 / 列表 / 图片 / @提及）
- 点赞、收藏、通知（回复 / 提及）、举报与版务处理
- 三级角色：成员 / 版主 / 管理员；置顶、加精、锁定、删除
- 搜索、用户主页、个人设置、密码修改、账号绑定
- 管理后台：概览指标、用户管理、板块 CRUD、举报队列、站点设置
- RSS、sitemap.xml、robots.txt、OG 标签、canonical
- 亮色 / 暗色 / 跟随系统，响应式（移动端底部导航化）

## 技术栈

| 层 | 选型 |
| --- | --- |
| 运行时 | Cloudflare Workers（无 Node.js API） |
| 数据库 | Cloudflare D1（SQLite 语义） |
| 语言 | TypeScript 5.6 严格模式 |
| 渲染 | 自写 SSR 模板函数，零运行时依赖 |
| 静态资源 | Workers Static Assets |
| 部署 | wrangler 4.x + 自写 `scripts/deploy.mjs` |

## 快速开始

```bash
npm install
npx wrangler d1 create cf-bbs          # 把返回的 database_id 填进 wrangler.toml
npm run db:migrate && npm run db:seed
npm run dev                            # http://localhost:8787
```

首次打开会自动进入 `/setup` 创建第一个管理员账号。部署到线上：

```bash
npx wrangler login   # 只需第一次
npm run ship
```

{% note warning 免费版的一个性能约束 %}
Workers 免费版单次请求的 CPU 上限较低，**PBKDF2 10 万次迭代在登录时可能触顶**。建议把 `PASSWORD_ITERATIONS` 调到 `50000`，或使用付费计划。

这是边缘运行时的固有约束：算力按请求计费，密集型运算要主动降级。
{% endnote %}



{% linkcard https://github.com/xfm0797/cloudflare-workers-bbs-Nexus, cf-bbs Nexus 源码仓库, 跑在 Workers + D1 上的零依赖论坛社区 · MIT %}

{% linkcard https://forum.lovou.pw, Nexus 线上站点, 项目的实际运行实例 · 可以直接注册体验 %}

{% note tip 相关阅读 %}
[xfm0797.github.io：我的 Hexo 建站学习站](/2026/10/11/opensource-xfm0797-github-io/) · [xongyi：雄亿仪器网 —— 主题的真实落地案例](/2026/10/11/opensource-xongyi/) · [hexo-theme-xfm：覆盖博客 / 笔记 / 文档的三模式主题](/2026/10/11/opensource-hexo-theme-xfm/)
{% endnote %}
