---
mode: docs

title: xfmpress 手册
date: 2026-11-10 21:30:00
updated: 2026-11-10 21:30:00
description: xfmpress 官方文档导读 —— 一个零依赖的 Node.js 静态站点生成器，多线程渲染、Nunjucks 风格模板、即插即用的主题与插件。含定位、性能数据与三分钟上手。
keywords: [xfmpress, xfm, 静态站点生成器, SSG, Node.js, 零依赖, Markdown, 博客, 文档站]
order: 21
---

# xfmpress 手册

xfmpress 是一个跑在 Node.js 上的**静态站点生成器**：把 Markdown 压成纯静态 HTML，不需要数据库、不需要运行时框架，产物可以直接丢给 Nginx、对象存储或任何一家静态托管。

它由本站作者开发与维护，仓库在 [xfm0797/xfm](https://github.com/xfm0797/xfm)，npm 包名 `xfmpress`，命令行是 `xfm`。

## 一句话定位

**零运行时依赖 + 多线程渲染 + 构建期编译模板。** 装的时候不会拉一整个 `node_modules` 森林，跑的时候不解释模板、不构造 AST，构建完只剩 HTML/CSS/JS 三个文件夹该有的东西。

常见的对比坐标：

| 维度 | xfmpress 的做法 |
| --- | --- |
| 依赖 | 内核 **0** 个运行时依赖（`dependencies` 为空） |
| 模板 | Nunjucks 风格语法，构建期编译成 JS 函数 |
| 渲染 | 页面数 ≥ 40 时自动起 worker 池并行 |
| 增量 | 源文件哈希 + 主题指纹，未变页面直接复用缓存 HTML |
| 插件 | 不随内核发布，`npm i -D xfm-plugin-*` 装了就生效 |
| 主题 | 内置 `default`（博客）与 `docs`（侧栏文档），也可自己写 |

## 名字的由来

包名是 `xfmpress`，命令是 `xfm` —— 和 `hexo-theme-xfm` 共用同一个品牌前缀。项目早期叫 `bolt`，但 `bolt` / `bolt-ssg` 在 npm 上已被占用，`xmssg` 与 `xfm` 又分别被 npm 的「名字过于相似」校验拦下（撞 `xss`，以及 `xo` / `xml` / `htm` 等一批短包名），0.1.0 起定为 `xfmpress`。

## 性能

压测环境是 4 核 Windows 机器、Node 22、1000 篇中文文档（约 5 MB HTML 产出），运行 `npm run bench` 可复现：

| 指标 | 数值 |
| --- | --- |
| 全量冷构建 | **≈4.4–5.5 s**（约 180–230 页/秒） |
| 增量缓存命中后渲染阶段 | **1 ms**（1001 页） |
| 4 worker 渲染阶段 | **≈0.5 s**（1000 页） |
| dev 热更新单页重建 | **2–7 ms** |
| 产物运行时 | 纯静态 HTML + CSS，零 JavaScript 依赖 |

分阶段耗时（1000 页）如下。注意写盘占了绝大部分，这是文件系统的物理成本，不是生成器的开销：

| 阶段 | 耗时 | 优化手段 |
| --- | --- | --- |
| 扫描与解析 | ~690 ms | 目录并行遍历 + 源文件并行读取，raw 只读一次 |
| 哈希 | ~15 ms | 复用已读入的源文本，无二次 IO |
| 渲染 | ~510 ms | worker 池复用线程，上下文只序列化一次 |
| 写盘 | ~3800 ms | 同目录只 mkdir 一次，两阶段并行写 |

在 Windows / NTFS 上写盘是绝对瓶颈：1000 个小文件的落盘成本超过解析与渲染之和。换句话说，想再快就得改产物体积，而不是改生成器。

## 三分钟上手

```bash
npm i -g xfmpress      # Node ≥ 18
xfm create my-blog     # 30 秒建站，默认 blog 模板
cd my-blog
xfm dev                # http://127.0.0.1:4173，改文件即刷新
xfm build              # 产物在 dist/
```

想建文档站就把模板换成 `docs`：

```bash
xfm create my-docs --template=docs --title="我的知识库"
```

生成的目录很朴素，一眼能看懂全部：

```text
my-blog/
├── xfm.config.mjs      # 站点配置，全部字段都有默认值
├── content/            # 所有 Markdown 源文件
│   ├── index.md
│   ├── about.md
│   └── posts/
│       └── hello-world.md
├── plugins/            # 站点内的本地插件
├── public/             # 原样拷贝到产物根目录的静态文件
└── README.md
```

## 能力一览

- **内容**：YAML front-matter、草稿、标签 / 分类 / 系列聚合页、自动 prev / next、`weight` 排序、`.md` 相对链接自动重写。
- **写作**：GFM 常用语法之外，还有 `::: tip` 这类提示容器、引用式链接、脚注、Setext 标题、缩进代码块、任务列表续行。
- **主题**：`{% raw %}{% extend %}{% endraw %}` 继承 + `{% raw %}{% block %}{% endraw %}` 覆写 + `{% raw %}{% include %}{% endraw %}` 片段，CSS 变量驱动深浅色。
- **插件**：六个钩子覆盖「注入上下文 / 改 Markdown / 改 HTML / 跨页计算 / 追加产物 / 扩展 dev 服务器」，官方 15 个插件各自独立发布。
- **搜索**：`search` 插件产出 `search.json`，内置主题带 Ctrl / ⌘ + K 面板，纯前端筛选、零依赖。
- **SEO 与 AI 友好**：canonical、Open Graph、Twitter Card、JSON-LD，外加 `llms.txt` 与 `llms-full.txt`。
- **部署**：`site.base` 支持子路径（GitHub Pages 项目页），dev 预览同样按前缀访问。

## 文档导览

| 章节 | 内容 | 适合谁 |
| --- | --- | --- |
| [安装与升级](/docs/xfmpress/install/) | 三种安装方式、权限排错、升级 | 第一次用 |
| [命令行](/docs/xfmpress/cli/) | `create` / `dev` / `build` / `new` / `clean` / `info` 全部选项 | 日常操作 |
| [配置](/docs/xfmpress/config/) | 配置文件的查找顺序与全部字段默认值 | 调站点行为 |
| [内容与 Markdown](/docs/xfmpress/content/) | front-matter、目录约定、URL 规则、扩展语法 | 写内容 |
| [模板语法](/docs/xfmpress/templates/) | 变量、过滤器、控制结构、继承、模板上下文 | 改主题 |
| [主题开发](/docs/xfmpress/theme/) | 目录结构、布局与片段的职责、资源打包 | 做主题 |
| [插件](/docs/xfmpress/plugins/) | 钩子语义、自动加载、15 个官方插件、自己写插件 | 扩能力 |
| [构建与部署](/docs/xfmpress/deploy/) | 增量缓存、子路径、GitHub Pages / Netlify / Nginx | 上线 |
| [架构与性能](/docs/xfmpress/architecture/) | 渲染管线、worker 池、缓存指纹、bench 读法 | 想搞懂原理 |
| [版本记录](/docs/xfmpress/changelog/) | v0.1.0 → v0.4.6 十二个版本的主线 | 评估升级 |

{% note info 关于版本 %}
本文档对应 **xfmpress v0.4.6**（2026-11-09）。版本号规则是补丁位从 `0.4.0` 滚到 `0.4.99` 再升 `0.5.0`，循环往复 —— 因此 `0.4.x` 里会出现新增功能，不必等到 minor。
{% endnote %}
