---
mode: docs

title: 命令行
date: 2026-11-10 21:40:00
updated: 2026-11-10 22:30:00
description: xfmpress 命令行完整参考：create、dev、build、new、clean、info 六个命令的用法与选项，new 的 post / page / draft 三种布局与 scaffolds 模板，别名对照，以及构建输出的每一行含义。
keywords: [xfmpress, xfm 命令, CLI, create, dev, build, new, page, draft, scaffolds, clean, info, 别名]
order: 23
---

# 命令行

**中文** · [English version](/en/docs/xfmpress/cli/)

命令结构是 `xfm <命令> [目录] [选项]`。目录参数省略时取当前工作目录 —— 所以在站点根目录里，`xfm build` 就够了。

```bash
xfm --help        # 全部命令与选项
xfm --version     # 只打印版本号
```

## 命令总表

| 命令 | 作用 | 常用选项 |
| --- | --- | --- |
| `xfm create [目录]` | 创建站点脚手架 | `--template=blog` 或 `--template=docs`、`--title=` |
| `xfm dev [目录]` | 开发服务器，SSE 热更新 | `--port=` |
| `xfm build [目录]` | 生产构建 | `--dev` |
| `xfm new [布局] <标题>` | 新建文章 / 页面 / 草稿 | `--layout=`、`--dir=`、`--slug=`、`--draft`、`--force` |
| `xfm clean [目录]` | 清空产物与增量缓存 | — |
| `xfm info [目录]` | 打印解析后的配置 | — |

## 别名

照顾 Hexo 的使用习惯，`npx xfm init` 这类最自然的手势能直接生效，而不是丢一份帮助就退出：

| 别名 | 等价于 |
| --- | --- |
| `init` | `create` |
| `generate` / `gen` | `build` |
| `serve` / `server` / `preview` | `dev` |

打错命令时不用去翻文档：CLI 会按前缀和编辑距离猜一个最接近的，直接提示「你是不是想用 `xfm build`」。

## create

```bash
xfm create my-blog                        # 默认 blog 模板
xfm create my-docs --template=docs        # 文档模板
xfm create my-docs --template=docs --title="我的知识库"
xfm create .                              # 当前目录（非空目录会保留已有文件）
```

两套模板的差别：

| `--template` | 外观 | 适合 |
| --- | --- | --- |
| `blog`（默认） | 首页列表 + 文章页 + 右侧目录 | 个人博客、技术随笔 |
| `docs` | 左侧分组侧栏 + 正文 | 产品文档、知识库 |

脚手架不覆盖已有文件，因此往一个半成品目录里重跑是安全的。生成结束后会提示还缺哪些插件、对应的 `npm i` 命令是什么。

除站点骨架外，`xfm create` 还会写好 `scaffolds/` 下的三份内容模板（`post.md` / `page.md` / `draft.md`），`xfm new` 读的就是它们。

## dev

```bash
xfm dev
xfm dev --port=5000
xfm dev examples/blog
```

启动后做三件事：

1. 内存构建（不写盘），首次构建通常在百毫秒级；
2. 起一个 HTTP 服务，默认 `http://127.0.0.1:4173/`；
3. 监听 `content/`、`themes/`、`plugins/` 与配置文件，变更后通过 SSE 推给浏览器，**页面保留滚动位置刷新**。

热更新的粒度值得说明：改 Markdown 只重建受影响页面；改 CSS 是单独热替换样式表、不重载页面；改模板或配置则整体重算。实测单页重建 **2–7 ms**。

配置显式设置了 `server.host` / `server.open` 时同样生效 —— `open: true` 会在启动后自动打开浏览器。

## build

```bash
xfm build
xfm build --dev        # 开发模式下也启用增量缓存
```

`--dev` 不是「构建开发版」，而是「让增量缓存也在这个模式下工作」。产物本身不区分环境，只有个别插件（`giscus`、`analytics`）会按 `mode` 决定是否注入第三方脚本。

一次典型输出：

```console
$ xfm build

  ⚡ xfm build  /home/me/my-blog

  ✓ 页面      17 个
  ✓ 插件      sitemap, rss, search, seo, related, minify
  ✓ 附加产物  sitemap.xml, robots.txt, feed.xml, search.json, llms.txt, llms-full.txt
  ✓ 静态资源  6 个
  ✓ 输出目录  dist（共 412.18 KB）
  ✓ 并行渲染  4 个 worker 线程
  ✓ 缓存命中  12 页（增量构建）

  耗时 214 ms  (79 页/秒)
```

逐行读法：

| 行 | 含义 |
| --- | --- |
| 页面 | 内容页 + 聚合页（标签 / 分类 / 系列）+ 分页页 + 索引页 |
| 插件 | 实际加载成功的插件名，空则提示按需安装 |
| 附加产物 | 插件写出的非页面文件，超过 6 个会折叠显示 |
| 静态资源 | 主题 `assets/` 与站点 `public/` 的拷贝数量 |
| 并行渲染 | 出现这行说明页数达到 `workerThreshold` 且插件不阻塞 worker |
| 缓存命中 | 本次跳过渲染的页面数，只有命中缓存时才有这一行 |

## new

结构与 Hexo 的 `hexo new [layout] <title>` 一致：第一个位置参数是布局时可以省略布局名，写文章时什么都不用加。

```bash
xfm new "我的第一篇文章"                 # 文章 → content/posts/我的第一篇文章.md
xfm new post "Hello, World!"            # 显式写布局，效果同上
xfm new page about                      # 页面 → content/about.md，地址 /about/
xfm new draft "半成品想法"               # 草稿 → content/posts/半成品想法.md，带 draft: true
xfm new page about --dir=pages          # 换目录 → content/pages/about.md
xfm new "部署笔记" --slug=deploy-notes   # 手动指定文件名
xfm new --layout=page page              # 标题本身就叫 page 时，用 --layout 消歧
xfm new "同名文章" --force               # 覆盖同名文件
```

三种布局的落点与语义：

| 布局 | 落盘位置 | 写入的 front-matter | 语义 |
| --- | --- | --- | --- |
| `post`（默认） | `content/posts/<slug>.md` | `layout: post.html` | 文章：进首页列表、RSS、搜索与上下篇 |
| `page` | `content/<slug>.md` | `layout: page.html`、`type: page` | 固定页：有自己的地址，但不进任何列表 |
| `draft` | `content/posts/<slug>.md` | `layout: post.html`、`draft: true` | 草稿：`xfm build` 不输出，`xfm dev` 照常预览 |

`page` 这一项是 0.4.8 才成为一等命令的。之前建「关于」「友链」这类页面，得自己把文件放到 `content/` 根目录、并记得手写 `type: page` —— 漏了就会被当成文章塞进列表和 RSS。现在布局一次到位。

几个行为细节：

- **布局只在「第一个词是已知布局且有第二个参数」时生效**：`xfm new page` 是一篇叫「page」的文章（与 Hexo 一致），`xfm new page about` 才是页面。想强制指定就用 `--layout=`。
- **多词标题整体保留**：`xfm new 我的 文章` 得到「我的 文章」，不会只剩第一个词。
- **拼错布局会给建议**：`xfm new apge about` 会提示「没有名为 apge 的布局，已按文章标题处理；想建页面用 xfm new page <标题>」。
- **slug 生成规则**：转小写，非字母数字字符折叠成 `-`，去掉首尾连字符；纯符号标题回落到 `post`。
- **同名不报错**：自动追加 `-2`、`-3`，想覆盖原文件才用 `--force`。
- **标题转义**：标题里可能出现 `:` `#` 等 YAML 特殊字符，写进 front-matter 时统一用双引号包裹。

生成的文件长这样（起始正文不再重复写 `# 标题` —— 主题已经从 `page.title` 渲染过了）：

```markdown
---
title: "我的第一篇文章"
date: 2026-11-10 22:30:00
description: ""
tags: []
layout: post.html
---

开始写作…
```

命令的输出会带上布局与最终地址，方便确认落在哪儿：

```console
$ xfm new page about
✓ 已创建 content/about.md  [page] → /about/
  模板：scaffolds/page.md
  页面不进文章列表、RSS 与相关推荐；想让它出现在导航里，加进 xfm.config.mjs 的 site.nav。
```

### 用 scaffolds 定制初始内容

`xfm new` 的初始内容来自站点根目录的 `scaffolds/<布局>.md`，与 Hexo 的同名目录同构，支持三个占位符：

| 占位符 | 替换成 |
| --- | --- |
| `{% raw %}{{ title }}{% endraw %}` | 标题 |
| `{% raw %}{{ date }}{% endraw %}` | 当前时间（本地时区） |
| `{% raw %}{{ layout }}{% endraw %}` | 目标布局文件名，如 `post.html` |

`xfm create` 会写出 `scaffolds/post.md`、`scaffolds/page.md`、`scaffolds/draft.md` 三份默认模板，改完立刻生效，不用重启。没有这个目录的站点回落到内置模板，所以老站点不需要迁移。

自定义脚手架漏掉关键字段时会自动补齐（`title`、`date`、`layout`、`type: page`、`draft`）—— 否则一个只有标题的空模板就能造出「页面当文章发布」「草稿直接上线」这类难查的问题。

## clean

```bash
xfm clean
# ✓ 已删除 dist
# ✓ 已删除 .xfm
```

删两个东西：`outDir`（默认 `dist/`）与增量缓存目录 `.xfm/`。遇到「明明改了却还是旧页面」这类怪事，`clean` 是最快的排除法。

## info

```bash
xfm info
```

只读命令，不构建、不写盘。输出的「配置文件」一项会告诉你配置到底从哪儿读的 —— 若显示「默认值」，说明站点里没有配置文件，全部走内置默认。

## 退出码

| 场景 | 退出码 |
| --- | --- |
| 成功 | `0` |
| 未知命令 / 未知选项 | `1` |
| 构建或渲染抛错 | `1` |

CI 里可以直接用它判断成败：引擎主动抛出的 `[xfm]` 错误（例如声明的插件没装）会打印一行修复指引，而不是一屏调用栈。
