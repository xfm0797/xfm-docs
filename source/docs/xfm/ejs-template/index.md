---
mode: docs

title: EJS 模板语法与设计
date: 2026-10-17 15:00:00
updated: 2026-10-17 15:00:00
description: 面向主题二开的 EJS 教程：五种标签的语义与坑、模板可用变量、控制流与组合方式，以及让模板可维护的六条设计原则。
keywords: [EJS, 模板, 语法, 主题二开, partial, helper]
order: 63
---

# EJS 模板语法与设计

本文面向**要改模板、做主题二开**的读者。读完你能读懂本主题 `layout/` 下的任意 `.ejs` 文件，并知道改动该放在模板、helper 还是配置里。

## EJS 在 Hexo 里做什么

Hexo 的产出是静态 HTML，拼装工作由模板引擎完成。本站用的是 **EJS**（`hexo-renderer-ejs`），它把 `.ejs` 文件编译成 JS 函数再执行——**模板里写的就是 JavaScript**，这是 EJS 相对其它模板引擎最大的特点，也是最容易写坏的地方。

一次构建的渲染顺序：

```text
source/*.md
  → Markdown 渲染器（renderer-marked）→ HTML 片段
  → 内容过滤器（filters：摘要、图片、代码折叠…）
  → 布局模板 layout.ejs（唯一的 HTML 外壳）
      → partial() 引入头部、侧栏、卡片、页脚…
          → 内部再调用 helper（xfm_icon / xfm_toc / xfm_related…）
  → 输出 public/**/*.html
```

{% note info 两层标签系统别混淆 %}
**EJS（`<% %>`）作用在模板层**，处理 HTML 骨架；
**标签插件（花括号 + 百分号语法）作用在正文层**，写文章时用（如本文里的提示块、选项卡）。
报错 `unknown block tag: xxx` 来自后者（Nunjucks），不是 EJS 的问题。
{% endnote %}

## 五种标签

| 标签 | 作用 | 典型用途 |
| --- | --- | --- |
| `<% %>` | 执行 JS，**不输出** | 条件、循环、计算、局部变量 |
| `<%= %>` | 输出并 **HTML 转义** | 标题、描述、配置项等纯文本 |
| `<%- %>` | **原样输出**，不转义 | 已含 HTML 的正文、partial、SVG |
| `<%# %>` | 注释，不输出也不执行 | 说明性注释 |
| `<%%` | 输出字面的 `<%` | 极少用（写 EJS 教程时） |

空白控制：`-%>` 去掉标签后的换行，`<%_` / `_%>` 控制前后空白。默认是**保留**换行，所以满屏 `<% %>` 会产生大量空行——这类空行不影响 HTML 渲染，但会让源码难读。

### 转义输出 vs 原样输出（最常见的坑）

```ejs
<%= page.title %>      <%# 正确：标题是纯文本 %>
<%- page.content %>    <%# 正确：正文已经是 HTML，转义会显示一堆 &lt;p&gt; %>
<%- partial('_partials/head') %>   <%# partial 返回 HTML，必须原样输出 %>
```

反过来就会出问题。举个真实例子：主题的文章版权块支持 `copyright_text` 里的 `{link}` 占位符，替换结果是一个 `<a>` 标签——**如果这一行用了转义输出，页面上显示的就是字面文本** `<a href="…">标题</a>`，而不是可点的链接。

{% note warning 判断标准 %}
问自己一句：**这个变量的值里会不会出现 `<` `>` `&` 且它们是想被浏览器当标签解析的？**
是 → `<%-`；否 → `<%=`。用户输入、标题、URL 一律走转义，能防住 XSS。
{% endnote %}

## 模板里能拿到什么

Hexo 在渲染每个模板时注入了一批变量，本主题另外注册了若干 helper。

### Hexo 内置

| 变量 / 函数 | 含义 |
| --- | --- |
| `config` | 站点 `_config.yml` |
| `theme` | 主题 `_config.yml`（**已与站点 `theme_config` 深合并**，站点覆盖优先） |
| `page` | 当前页面的数据（文章、页面、归档页各不相同） |
| `site` | 全站数据：`site.posts`、`site.pages`、`site.categories`… |
| `url_for(path)` | 生成站内链接（自动带 `root`） |
| `full_url_for(path)` | 生成绝对链接（基于 `config.url`） |
| `partial(name, locals)` | 引入局部模板并可传参 |
| `date(d, format)` | 按 `date_format` 格式化日期 |
| `__(key)` | 取 `languages/*.yml` 里的文案 |
| `is_post()` / `is_page()` / `is_archive()` | 当前页类型判断 |

### 本主题注册的 helper

在 `scripts/helpers/index.js` 里注册，模板中直接调用：

| helper | 用途 |
| --- | --- |
| `xfm_icon(name, cls)` | 内联 SVG 图标（走 sprite） |
| `xfm_cover(post)` | 统一取封面（cover / banner 优先级） |
| `xfm_toc(content)` | 从正文抽取目录 |
| `xfm_related(post, count)` | 相关文章推荐 |
| `xfm_config(path, dft)` | 按点号路径安全读配置 |
| `xfm_enabled(path, dft)` | 读布尔开关 |
| `xfm_adaptive()` | 取得归一化后的自适应档位配置 |
| `xfm_docs_nav()` / `xfm_notes_nav()` | 文档树 / 笔记侧栏数据 |

{% note tip 读配置用 helper 而不是手写链路 %}
`(theme.sidebar && theme.sidebar.position) || 'right'` 这类防御式写法在主题里到处都是，
因为**主题配置可能被站点覆盖，任意一层都可能是 `undefined`**。
新代码优先用 `xfm_config('sidebar.position', 'right')`，少写重复的三元表达式。
{% endnote %}

## 控制流与局部变量

模板就是 JS，所以 `if` / `for` / `forEach` / `const` 都能用。真正决定可读性的，是**怎么组织计算与输出**。

### 先算后渲染

坏写法：在输出区里边判断边拼字符串，条件一多就失控。

好写法（取自 `layout/layout.ejs`）：顶部用一段 `<% %>` 把所有判断算完，下面只做输出：

```ejs
<%
  const currentMode = page.mode || theme.mode || 'blog';
  const hasSidebar = currentMode === 'blog' &&
    (theme.sidebar && theme.sidebar.position) !== 'none' &&
    page.sidebar !== false;
  // 目录正文先算出来：页面真有标题才渲染右侧目录栏
  const tocBody = tocEnabled ? xfm_toc(page.content || '') : '';
  const rightToc = tocEnabled && tocBody.trim() !== '';
  const bodyClass = [
    'mode-' + currentMode,
    hasSidebar ? 'has-sidebar' : 'no-sidebar',
    rightToc ? 'has-inline-toc' : ''
  ].filter(Boolean).join(' ');
%>
<body class="<%= bodyClass %>">
```

两个细节值得学：

1. **`tocBody.trim() !== ''` 这种守卫**——正文没有小标题时不渲染目录栏，否则索引页会留一个只剩「目录」二字的空面板。
2. **class 用数组 + `filter(Boolean).join(' ')`**——条件为假时得到空串被过滤掉，不会留下多余空格。

### 循环

```ejs
<% posts.forEach(function (p, i) { %>
  <%- partial('_partials/post/card', { post: p, index: i }) %>
<% }); %>
```

注意 partial 的第二个参数会作为局部变量传入子模板，子模板里直接写 `post.title` 即可。

## 模板组合

### partial

```ejs
<%- partial('_partials/head') %>              <%# 不传参 %>
<%- partial('_partials/post/card', { post: p, layoutType: 'list' }) %>   <%# 传参 %>
```

路径相对 `layout/` 目录，不带 `.ejs` 后缀。找不到时 Hexo 会抛错并**中断整个构建**，改模板时最容易撞到的就是这个。

### 单外壳分发

本主题只有 `layout.ejs` 一个 HTML 外壳，形态差异全部由它计算出来的 `data-*` 与 `body class` 表达，CSS 再按这些选择器分支：

```ejs
<html data-mode="<%= page.mode || theme.mode || 'blog' %>" data-tier="<%= __fallbackTier %>">
<body class="<%= bodyClass %>">
```

渲染结果形如 `<body class="mode-blog has-sidebar sidebar-right">`。**排查页面形态问题时，第一件事就是看这个 class**——它比翻模板快得多。

页面级入口则由 `page.type` 决定（`page.ejs` 内部）：`tags` / `categories` / `links` 各走一套局部模板。

## 设计原则

1. **模板只做装配**。取值、排序、格式化、业务判断下沉到 helper / filter，模板里只留「把 A 放进 B」。
2. **计算区与输出区分开**。文件顶部一段 `<% %>` 准备数据，下方纯输出。
3. **防御式取值**。主题配置可能被站点覆盖，任何一层都可能是 `undefined`：`(theme.x && theme.x.y) || dft`。
4. **别在模板里做重计算**。模板是**每页执行一次**的，37 篇文章就是 37 次；能提到 helper 里缓存的别放进循环。
5. **可变的东西放配置，不要硬编码**。列数、开关、文案、断点——凡是用户可能想改的，都应该是 `_config.yml` 的一个键。
6. **注释写清"为什么"**。`// 目录正文先算出来：页面真有标题才渲染` 这类注释比「计算 toc」有用得多。

## 调试与常见坑

| 现象 | 原因与处理 |
| --- | --- |
| `Could not find matching close tag for "<%#"` | 注释块里出现了 EJS 起始标记（`<%`、`<%=` 等）。**注释内只能写自然语言** |
| 页面上出现 `<a href="…">…</a>` 字面文本 | 该用 `<%-` 的地方用了 `<%=`（见上文） |
| `partial xxx not found` | 路径写错，或忘了路径相对 `layout/` 且不带后缀 |
| 输出 `undefined` | 取值链路断了一层，加默认值 |
| 改了模板没生效 | 需要重新构建；`hexo server` 会监听，但新增文件有时要重启 |
| EJS 报错行号对不上 | 报错行号指向**编译后的 JS**，从报错往上找第一个 `<%` 块 |

{% note warning 注释里的陷阱 %}
写 `<%# 说明 %>` 时，说明文字里**不要出现任何 EJS 起始标记**，哪怕只是想写「把 `<%=` 改成 `<%-`」——
EJS 会把它当成新标签的开始，注释被提前截断，构建直接失败。
这条在覆盖模板时踩过，注释请写自然语言描述。
{% endnote %}

## 改动该放哪里

| 你想做的事 | 放哪里 | 是否需要改主题 |
| --- | --- | --- |
| 改配色、间距、字体 | 站点 `source/css/` + `custom.css` 登记 | 否 |
| 换某个局部的 HTML 结构 | `overrides/` 覆盖对应 partial | 否（站点层） |
| 加一个模板里能用的函数 | 主题 `scripts/helpers/` | 是 |
| 改全站外壳/形态分发 | 主题 `layout/layout.ejs` | 是 |
| 只是开关或文案不同 | `_config.yml` 的 `theme_config` | 否 |

{% note tip 优先选最右边一列的方案 %}
站点层能解决的，不要动主题。主题是 submodule，改了会在升级时冲突，而且你的改动无法随主题分发给别人。
{% endnote %}

---

**相关文档**：[自定义样式与注入](/docs/xfm/customize/) · [运行时 API 与目录结构](/docs/xfm/api-structure/) · [Front-matter 字段](/docs/xfm/front-matter/)
