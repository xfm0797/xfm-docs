---
mode: docs

title: 版本记录
date: 2026-11-10 22:20:00
updated: 2026-11-15 22:00:00
description: xfmpress 从 v0.1.0 到 v0.4.13 的十九个版本：每个版本的主线改动、破坏性变更与升级要点，以及值得注意的版本号规则。
keywords: [xfmpress, 版本记录, CHANGELOG, 更新, 升级, v0.4.13, 破坏性变更]
order: 31
---

# 版本记录

**中文** · [English version](/en/docs/xfmpress/changelog/)

xfmpress 从 2026-11-02 的 v0.1.0 走到 v0.4.13，两周时间发了十九个版本。这份记录按版本整理主线，方便判断该不该升、升级要注意什么。

## 版本号规则

这里有个与常见约定不同的地方：

```text
0.4.0 → 0.4.1 → … → 0.4.99 → 0.5.0
```

**补丁位从 0 滚到 99 再升 minor。** 也就是说 `0.4.x` 里会出现新增功能，而 `0.5.0` 只代表「一轮迭代结束」，不代表破坏性变更。判断能不能升，看下面每个版本的「破坏性变更」一栏，别只看版本号。

## 一览

| 版本 | 日期 | 主线 |
| --- | --- | --- |
| 0.4.13 | 11-15 | 重复构建跳过未变化文件，写盘 5.3 s → 0.9 s |
| 0.4.12 | 11-15 | 列表项内的缩进代码块、段落前导空格 |
| 0.4.11 | 11-15 | 松散列表：空行不再把列表拆成两个 |
| 0.4.10 | 11-15 | 列表项内块级内容、脚注缩进、链接定义 |
| 0.4.9 | 11-15 | CLI 与 dev 服务器八处「静默出错」修正 |
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

## v0.4.13

**重复构建不再重写没变化的文件。** 1000 页站点上，写盘阶段从 5.3 s 降到 0.9 s，冷构建不变。两处浪费都是数文件系统调用数出来的：

| 浪费 | 以前 | 现在 |
| --- | --- | --- |
| 清理旧产物 | 每次构建对 `dist` 里每个目录试一次 `rmdir`，1000 个目录约 3.3 s（NTFS 上顺序执行） | 只有真的删过文件才清理，且只扫被删文件的祖先目录（自深向浅、并行）；没删过就一次 `rmdir` 都不调 |
| 写页面 | 每次都把全部页面刷盘（约 1.5 s）并为它们 `mkdir`（约 1.1 s），哪怕字节完全一样 | 逐文件比对（先比大小再比内容），一致就跳过；跳过的文件也不需要目录 |

静态资源同理：大小相等且目标文件不早于源文件就不动它，大图因此不会被读进来。目录不可能凭空变空 —— 它只会因为里面的文件被删而空，这是第一处能省掉的前提。

配套变化：

- `xfm build` 多一行 `未变化 N 个文件（内容一致，未重写）`；
- `bench/bench.js` 把冷构建（先删 `dist`）与重复构建分开报，不再混成一个中位数。

## v0.4.12

**缩进（四空格）代码块在列表项里与外面表现一致**，最后一条「这里只支持围栏」的限制消失。

- **`-     code`（标记后 5 个空格）以前渲染成纯文本。** 条目正则把标记后的空格全吃掉了，而正是那多出来的一格缩进让首行成为代码块。按 CommonMark，标记后 1–4 个空格是 padding，5 个以上表示「一格 padding + 其余属于内容」——现在条目直接以代码块开头，后续缩进到内容列再加四格的行并入同一个块。
- **段落前导空格泄漏。** 以 1–3 个空格开头的段落行会保留那些空格（`<p>  code</p>`），去掉列表项内容缩进后也能看到。最多三个前导空格算缩进，直接丢弃。

列表项内空行后的缩进代码块、引用内的缩进代码块、`:::` 容器与脚注里的同类写法本来就是好的，这些路径没动。

## v0.4.11

**松散列表：空行不再结束列表。** 改动全部落在 `lib/engine/markdown.js`。

- **项间一个空行会把一个列表拆成两个 `<ul>`。** `- a`、空行、`- b` 得到两段独立列表，`ol` 编号被打断、嵌套关系变形、`li + li` 这类样式全部失效。现在空行分隔的项仍在同一个列表里。
- **项内空行之后的内容掉出列表。** `- 第一段`、空行、缩进的第二段，第二段会渲染到 `li` 外面并且缩进错位。现在它属于本项，并交给块解析器处理 —— 后续段落、子列表、围栏代码块、引用都能正常嵌进来。

渲染形态按 CommonMark 的松散规则：只要有相邻项被空行分隔，或某一项内部含空行，整个列表的段落都补 `<p>`；紧凑列表保持 `<li>a</li>` 不变，本来就有块级内容的项保留它已有的 `<p>`。列表之后的空行仍然结束列表，空行后也不允许惰性续行。

还有一条容易忽略的边界：属于外层列表的空行（例如 `- a` / 缩进 `- b` / 空行 / `- d`）会交还给外层，不会把内层列表标记成松散。

## v0.4.10

一次清掉三条长期挂在「已知限制」里的 Markdown 边界，都在 `lib/engine/markdown.js`：

- **列表项内的块级内容按块渲染。** `- 安装：` 后面跟一个缩进围栏，以前会被压成一行文本；缩进的 `>` 被转义成 `&gt;`。现在条目在内容缩进处收集内容，把引用、围栏代码、`:::` 容器、分隔线交给块解析器，产出 `<li><p>安装：</p><div class="code-block">…</div></li>`。`- 标题` 加下一行 `  ---` 也保持 Setext 语义，不会变成分隔线。
- **脚注的块级内容要求规范的 4 空格缩进。** 旧规则接受 2 空格并去缩进 4 格，于是紧跟在脚注定义后的两空格嵌套列表被吞进注释里。现在 4 个空格（或一个 tab）才表示块级内容，1–3 个空格仍是「同一段落的下一行」（不破坏已有散文），后面不缩进的段落仍是普通段落。
- **链接定义不再打断段落。** `collectDefinitions` 以前把正文里每个 `[a]: /url` 行都抽走，句中一个定义会把段落切成两半、还少一行。现在只在段落起始处收集（也是 CommonMark 的要求）—— 句中出现的 `[a]: /url` 保持字面，且不注册引用。

默认主题与 docs 主题同时修了列表项的间距：带块级子元素的 `li` 不再被子元素 `p` 的 margin 额外撑开行距。测试从 128 增到 131。

## v0.4.9

对 CLI 与 dev 服务器的一轮复查。下面八处都属于同一种病：**工具宁肯产出错结果，也不肯报错**。

- **`xfm new` 在非站点目录里报错退出。** 以前会在空目录里建出 `content/posts/<slug>.md`，还提示「已经可以发布了，`xfm build` 就行」，而构建本身因为缺主题直接失败。现在打印当前路径、提示用 `xfm create`，什么都不创建。
- **`xfm create` 认得所有配置形式。** 以前只检查 `xfm.config.mjs`，用 `xfm.config.js` / `.cjs` / `.json`，或在 `package.json` 里写 `"xfm"` 字段配置的站点，被当成空目录覆盖（`content/index.md`、`content/about.md`、起始文章），而且没要 `--force`。新的 `hasConfig()` 同时给 create 与 dev 的配置监听用。
- **UTF-8 BOM 不再吞掉 front-matter。** 部分 Windows 编辑器默认存成「UTF-8 with BOM」，整个块会被丢掉：标题回落成文件路径，`date` / `layout` / `tags` 全部消失。现在找 `---` 之前先剥掉 BOM。
- **布局压过自相矛盾的脚手架。** `scaffolds/draft.md` 里残留 `draft: false` 或 `layout: page.html`（从别的模板复制过来时的常见情形）会产出一个「已发布」的页面，而 CLI 还在说「不会出现在构建产物里」。现在 `layout` / `type` / `draft` 按请求的布局强制写入；反向的情形 —— post 脚手架里残留 `draft: true` —— 会被写回 `false`，两边不会再打架。
- **`--dir=` 带反斜杠。** `xfm new page about --dir=docs\sub` 的摘要显示 `/docs\sub/about/`，真实 URL 却是 `/docs/sub/about/`。现在先规范化路径再打印摘要，并且 `--dir` 拒绝跳出内容目录。
- **只有日期的 front-matter 按本地日历日解释。** 按规范 `new Date('2026-11-10')` 是 UTC 零点，UTC 以西的时区会把这类文章整体渲染早一天。现在 date-only 与 `YYYY-MM-DD HH:mm` 显式按本地时间构造，带时间戳的值保持原样。
- **子路径下的 dev 服务器（`site.base: '/blog/'`）。** 热更新事件流跟随 base（`/blog/__xfm/events`），404 页里的链接带上前缀，半关闭的浏览器连接不再中断重建，`xfm.config.cjs` / `config.js` 与其他配置文件一样被监听 —— 以前它们被静默忽略。
- **`xfm create` 顺手写 `.gitignore`。** 内容为 `node_modules/`、`dist/`、`.xfm/` 与系统垃圾文件，首次构建不再刷屏 `git status`；已存在的 `.gitignore` 保持不动。

测试从 120 增到 128，新增的用例正对着上面这些：BOM、日期解析、脚手架与布局冲突、`--dir` 规范化、非站点防护、配置识别、`.gitignore`。

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
| 0.4.2 – 0.4.13 | 直接升，无破坏性变更 |
| 任意版本 | 升级后 `xfm clean && xfm build`，排除旧缓存干扰 |

完整原文见仓库的 [`CHANGELOG.md`](https://github.com/xfm0797/xfm/blob/main/CHANGELOG.md)，每条都按 Keep a Changelog 规范分为 Added / Changed / Fixed / Breaking。
