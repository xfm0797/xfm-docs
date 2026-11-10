---
mode: docs

title: 版本记录
date: 2026-11-10 22:20:00
updated: 2026-11-10 22:30:00
description: xfmpress 从 v0.1.0 到 v0.4.8 的十四个版本：每个版本的主线改动、破坏性变更与升级要点，以及值得注意的版本号规则。
keywords: [xfmpress, 版本记录, CHANGELOG, 更新, 升级, v0.4.8, 破坏性变更]
order: 31
---

# 版本记录

**中文** · [English version](/en/docs/xfmpress/changelog/)

xfmpress 从 2026-11-02 的 v0.1.0 走到 v0.4.8，一周多时间发了十四个版本。这份记录按版本整理主线，方便判断该不该升、升级要注意什么。

## 版本号规则

这里有个与常见约定不同的地方：

```text
0.4.0 → 0.4.1 → … → 0.4.99 → 0.5.0
```

**补丁位从 0 滚到 99 再升 minor。** 也就是说 `0.4.x` 里会出现新增功能，而 `0.5.0` 只代表「一轮迭代结束」，不代表破坏性变更。判断能不能升，看下面每个版本的「破坏性变更」一栏，别只看版本号。

## 一览

| 版本 | 日期 | 主线 |
| --- | --- | --- |
| 0.4.8 | 11-10 | `xfm new` 支持 post / page / draft 与 scaffolds |
| 0.4.7 | 11-10 | 官方文档站上线，README 校正 |
| 0.4.6 | 11-09 | 插件扩到 15 个，dev 服务器修插件产物 |
| 0.4.5 | 11-09 | 脚手架输出打磨 |
| 0.4.4 | 11-09 | `create` 不再覆盖 `package.json` |
| 0.4.3 | 11-09 | 构建输出显示插件与附加产物 |
| 0.4.2 | 11-09 | **插件拆包**（破坏性） |
| 0.4.1 | 11-09 | 五个新插件 + `afterCollect` 钩子 |
| 0.4.0 | 11-09 | 站内搜索、分页、阅读体验 |
| 0.3.0 | 11-04 | 聚合页、索引页、主题重设计 |
| 0.2.1 | 11-04 | 命令别名与建议 |
| 0.2.0 | 11-04 | Markdown 语法补齐 |
| 0.1.1 | 11-03 | 文档与命名修正 |
| 0.1.0 | 11-02 | 首个版本 |

## v0.4.8

**`xfm new` 变成完整的内容命令**，形状与 `hexo new [layout] <title>` 一致：

| 命令 | 结果 |
| --- | --- |
| `xfm new "标题"` / `xfm new post "标题"` | `content/posts/<slug>.md`，文章（行为未变） |
| `xfm new page about` | `content/about.md`，地址 `/about/` |
| `xfm new draft "半成品"` | `content/posts/<slug>.md`，带 `draft: true` |
| `xfm new page about --dir=pages` | 换目录 → `content/pages/about.md` |

页面布局同时写入 `layout: page.html` 与 `type: page`：有独立地址、可以进 `site.nav`，但不进文章列表、RSS / JSON Feed、相关推荐与搜索索引。此前这套字段要手写，漏一个就会让页面变成文章。

**`scaffolds/`** —— `xfm new` 的初始内容改为读站点根目录的 `scaffolds/<layout>.md`，支持 `{% raw %}{{ title }}{% endraw %}` / `{% raw %}{{ date }}{% endraw %}` / `{% raw %}{{ layout }}{% endraw %}` 三个占位符，与 Hexo 同构。`xfm create` 会写出三份默认模板供修改；没有这个目录的站点回落到内置模板。自定义模板漏写的 `title` / `date` / `layout` / `type: page` / `draft` 会自动补齐。

其余变化：

- 输出带上布局与最终地址（`[page] → /about/`），并说明用的是哪个脚手架；首个词像布局但拼错时给出建议；
- 多词标题整体保留：`xfm new 我的 文章` 建的是「我的 文章」，不再只剩第一个词；单个参数永远是标题（`xfm new page` 是一篇叫 page 的文章，与 Hexo 一致）；
- 起始正文不再重复写一行 `# 标题` —— 主题已经从 `page.title` 渲染过了。

## v0.4.7

**官方文档站上线**：[doc.lovou.pw/docs/xfmpress](https://doc.lovou.pw/docs/xfmpress/)，十章覆盖安装、命令行、配置、内容、模板、主题、插件、部署与架构。两个 README 加了 `docs` 徽章与文档目录表，CLI / 配置 / 插件 / 主题 / 部署几节各自链到对应章节。

同时修正：README 里的测试数量是旧值（111 → 118），npm 的 `homepage` 与脚手架生成的站点 README 都指向手册，脚手架 README 的插件清单从九个补到十五个。

这一版没有引擎改动，纯文档与元数据。

## v0.4.6

新增六个插件，从九个变成十五个，仍然全部零依赖：

| 插件 | 能力 |
| --- | --- |
| `analytics` | Umami / Plausible / GA / 百度 / 自定义片段，`provider` 支持数组以便迁移期双跑 |
| `giscus` | GitHub Discussions 评论，`postMessage` 跟随主题切换（深色不会闪白） |
| `redirect` | 每个旧地址一个跳转页，`meta refresh` + `location.replace` + 可见链接 |
| `pwa` | manifest、service worker（页面 network-first、资源 cache-first）、离线页、自动生成的 `icon.svg` |
| `deadlinks` | 构建后用真实产物校验站内链接，`strict: true` 时升级为构建失败 |
| `image-size` | 读 PNG / JPEG / GIF / WebP / SVG 头字节，补 `width` / `height` 消除 CLS |

修复了两处 dev 服务器问题：插件产物只在精确文件路径响应（`old/index.html` 生成后访问 `/old/` 是 404），以及目录 URL 的 MIME 类型退化成 `application/octet-stream`（Chrome 因此拒绝安装 manifest）。

## v0.4.5

`xfm create` 在**当前目录**建站时不再打印多余的 `cd .`；`package.json` 里已经存在的插件直接列出来，不再重复提示安装命令。

## v0.4.4

`xfm create` 不再覆盖已有 `package.json`，改为合并。这修的是一个很隐蔽的问题：先装插件、后跑 `create` 的站点，`xfm-plugin-*` 依赖会被生成的 `package.json` 整个替换掉，插件随即静默失效。

## v0.4.3

`xfm build` 与 `xfm dev` 开始打印**实际加载的插件**以及它们产出的文件清单。插件拆包之后，「装了但没被识别」必须在命令行里可见，而不是让人去翻配置。

## v0.4.2

{% note warning 破坏性变更 %}
插件不再随内核发布。`lib/plugins/` 被移除，九个插件迁到 `packages/` 下，各自以 `xfm-plugin-*` 独立发布。

老站点如果写的是 `plugins: ['rss']`，必须补一条 `npm i -D xfm-plugin-rss`。缺插件现在会**直接构建失败**并给出准确的安装命令，不再静默回退到内置副本。
{% endnote %}

配套变化：

- `xfm create` 生成的站点**零插件**，也不再往配置里写 `plugins`；
- 插件自动发现：站点 `package.json` 里任何 `xfm-plugin-*`（含 `@scope/xfm-plugin-*`）依赖都会自动加载；
- 解析顺序明确为「站点本地文件 → 站点 `node_modules` → CLI 自身 `node_modules`」，全局安装的插件也能用；
- 新增 `site.helpers`（`absoluteUrl`、`withBase`、`normalizeBase`、`applyBase`、`plainText`、`markdownPlain`、`escapeHtml`），插件不再伸手进内核目录；
- 仓库改为 npm workspace，`npm publish --workspaces` 一次发布全套；
- 移除 `xfm:<name>` 前缀与 `lib/plugins/<name>.js` 兜底；遇到老写法会抛出带迁移指引的错误。

## v0.4.1

五个新插件，加上一个关键钩子：

- `seo` —— 每页 canonical、Open Graph、Twitter Card、JSON-LD（文章用 Article，首页用 WebSite + SearchAction）；模板里手写的 canonical / `og:title` 会被尊重，不重复注入。
- `related` —— 渲染前按标签（3 分）/ 分类（2 分）/ 系列（3 分）算好，写进 `page.data.related`。
- `llms` —— `llms.txt` 与 `llms-full.txt`，遵循 llmstxt.org 约定。
- `feed-json` —— JSON Feed 1.1。
- `minify` —— 仅生产构建，跳过 `pre` / `code` / `textarea` / `script` / `style`。

新增 **`afterCollect` 钩子**：全部页面收集完毕、渲染开始前执行一次，跨页数据在这里算，因此 worker 池不受影响。同时 `transformHtml` 不再禁用并行 —— worker 渲染完，钩子在主线程补跑一遍。

修复：`xfm dev` 之前根本不跑 `afterBuild`，所以插件产物（`search.json` 等）在本地一律 404。

## v0.4.0

三件事：

**站内搜索。** `search` 插件把每个内容页压成一条 `search.json` 记录（标题 / 描述 / 标签 / 正文前 N 字符），两套主题自带 Ctrl / ⌘ + K（或 `/`）面板，懒加载索引、纯前端筛选。首页、聚合页、分页页默认不进索引，单页可用 `search: false` 退出。

**列表分页。** `pagination.perPage` 把列表切成 `/page/2/`、`/page/3/` 等**真实静态页**，带省略号分页器。第 1 页就是首页本身，模板到处读同一份 `pagination` 结构。分页页不进 RSS、导航分组、prev/next 与搜索索引。

**阅读体验。** 两套主题共用 `ux.js`：代码块复制按钮、图片点击放大、文章阅读进度条、外链新窗口打开（带 `noopener noreferrer`）；Markdown 图片默认 `loading="lazy"` 与 `decoding="async"`。

同版本还有一个重要的架构调整：**`site.base` 改由引擎自己施加**。渲染出口统一给根绝对链接补前缀（模板、Markdown、原始 HTML 全覆盖），sitemap / RSS / 搜索索引走同一个 helper，dev 服务器也按前缀提供服务。`scripts/pages-base.js` 这个构建后补丁脚本随之删除，Pages 工作流改用 `SITE_BASE` 环境变量。

## v0.3.0

**聚合页补齐。** 每个标签 / 分类 / 系列终于有了真实页面（`/tags/<name>/` 等），用主题的 `taxonomy.html` 渲染，按时间倒序。在此之前模板里有链接、但没有生成页面，点任何一个标签都是 404。

**索引页。** 新增 `indexes` 配置，由引擎生成 `/categories/`（带文章数的分类卡片）与 `/archives/`（按年分组）。前提是主题提供对应布局，所以自定义主题照常工作。

**默认主题重设计。** 玉青色系、首页双列卡片、粘性挂件栏、胶囊式导航高亮、文章卡片上的分类标签，断点覆盖到手机宽度。目录开始跟随滚动高亮。

同期修了三个问题：`.mjs` 配置热重载用 `Date.now()` 做缓存击穿，同一毫秒内两次保存会读到旧模块（改成单调计数器）；百分号编码的 URL 落盘成 `%E6%8F%92%E4%BB%B6` 目录，静态服务器解码后找不到文件（落盘改解码，URL 与 sitemap 保持编码）；未配 `site.url` 时 sitemap / feed 输出相对 `<loc>`。

## v0.2.1

命令别名（`init` / `generate` / `gen` / `serve` / `server` / `preview`）与「你是不是想用 xfm build」的猜测提示。

修了两个小坑：`xfm constructor` 这类原型链上的键会被当成命令执行（改用 own property 判定）；`xfm --port=4173` 这类把选项当命令写的输入，现在报「未知选项」而不是把整个命令表刷一遍。

## v0.2.0

把 Markdown 的短板补齐：引用式链接与图片、脚注（多引用各自回链）、Setext 标题、四空格缩进代码块、反斜杠转义、无缩进惰性列表续行、有序列表保留起始编号。

顺带修了三处边界：标题锚点忽略行内标记（`## 用 [xfm](/x) **now**` 得到 `use-xfm-now` 而不是 `use-xfmx-now`）；自动摘要剔除链接定义与脚注标记；含 `:` `#` 的标题写进 front-matter 时用双引号包裹，避免 YAML 解析失败。

`xfm new` 遇到同名文件不再报错，自动追加 `-2`、`-3`。

## v0.1.1

文档工程修正：英文 README 成为 npm 页默认，中文版作为 `README_CN.md` 并存；文档拆成中英成对四组；dev 端口在文档与脚手架里统一为 `4173`（此前 `4000` / `4321` 混用）；安装命令从错误的 `npm i -D xfm` 改为 `npm i -g xfmpress`。

## v0.1.0

首个版本，起点就包含完整的核心设计：

- 零依赖，主线程与 worker 共用一套渲染管线；
- 多线程渲染 + 内容哈希增量构建；
- Nunjucks 风格模板在构建期编译成函数，可选链守卫在编译期生成；
- 插件钩子 `markdown` / `transformHtml` / `extendContext` / `afterBuild` / `configureServer` / `finish`；
- 内置 `default` 与 `docs` 两套主题 + `xfm create` 脚手架；
- dev 服务器支持 SSE 实时刷新与配置热重载；
- `new` / `build` / `dev` / `clean` 四个命令。

## 升级建议

| 你的版本 | 建议动作 |
| --- | --- |
| 0.4.2 之前 | 必须先装插件包：`npm i -D xfm-plugin-sitemap xfm-plugin-rss …`，否则构建会失败 |
| 0.4.0 – 0.4.1 | 直接升；`transformHtml` 插件不再拖慢并行 |
| 0.4.2 – 0.4.8 | 直接升，无破坏性变更 |
| 任意版本 | 升级后 `xfm clean && xfm build`，排除旧缓存干扰 |

完整原文见仓库的 [`CHANGELOG.md`](https://github.com/xfm0797/xfm/blob/main/CHANGELOG.md)，每条都按 Keep a Changelog 规范分为 Added / Changed / Fixed / Breaking。
