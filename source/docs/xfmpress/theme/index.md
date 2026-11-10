---
mode: docs

title: 主题开发
date: 2026-11-10 22:00:00
updated: 2026-11-10 22:00:00
description: xfmpress 主题开发指南：目录结构与各目录职责、布局文件的必需与可选清单、theme.config.js 的用法、资源打包规则、内置 default 与 docs 两套主题的差异，以及一个从零写起的最小主题。
keywords: [xfmpress, 主题开发, layouts, partials, assets, theme.config.js, base.html, 布局]
order: 27
---

# 主题开发

**中文** · [English version](/en/docs/xfmpress/theme/)

主题是纯文件，不需要打包、不需要注册。指向一个目录，构建时按约定读布局、拷资源。

## 目录结构

```text
themes/my-theme/
├── theme.config.js     # 可选：主题级配置
├── layouts/            # 页面骨架
│   ├── base.html
│   ├── index.html
│   ├── post.html
│   └── page.html
├── partials/           # 可复用片段
│   └── toc.html
└── assets/             # 静态资源，构建时复制到站点 site.assets
    ├── style.css
    └── ux.js
```

三个目录各有明确职责：

| 目录 | 作用 | 是否必需 |
| --- | --- | --- |
| `layouts/` | 页面骨架，按布局名被 `page.layout` 选中 | 至少要有 `base.html` |
| `partials/` | 被 `include` 的片段，本身不会被单独渲染 | 可选 |
| `assets/` | CSS / JS / 字体 / 图片，原样复制 | 可选 |

## 布局清单

引擎按页面类型挑布局，找不到就少生成那一类页面 —— 不报错，但功能会缺一块：

| 布局 | 何时被选中 | 必需 |
| --- | --- | --- |
| `base.html` | 不直接渲染，供其他布局 `extend` | 是 |
| `post.html` | 带 `date` 的文章（`defaults.layout` 默认指向它时） | 建议有 |
| `page.html` | `defaults.layout` 的兜底值，也用于没有 `title` 的文件 | 建议有 |
| `index.html` | 站点首页（`/`）与分页页 | 建议有 |
| `taxonomy.html` | 标签 / 分类 / 系列聚合页 | 可选 |
| `categories.html` | 分类索引页（`/categories/`） | 可选 |
| `archives.html` | 按年归档页（`/archives/`） | 可选 |

布局的选择顺序是：front-matter 的 `layout` → 配置里的 `defaults.layout` → `page.html`。首页固定用 `index.html`，聚合页固定用 `taxonomy.html`。

`categories.html` 与 `archives.html` 是引擎的 `indexes` 配置驱动的：主题提供布局 + 配置 `enabled: true`，两者同时满足才生成。

## theme.config.js

可选文件，导出对象或函数（传入 `site` 实例）：

```js
module.exports = {
  name: 'my-theme',
  // 主题自己的默认值，模板里通过 site.theme.* 读取（如果主题需要）
  options: { wide: false },
};
```

```js
module.exports = (site) => ({
  name: 'my-theme',
  options: { wide: (site.config.site.title || '').length > 12 },
});
```

不写这个文件完全没影响 —— 大多数主题用不上它。

## 模板解析顺序

`include` 与 `extend` 找文件时按固定顺序尝试：

1. `layouts/<name>`
2. `partials/<name>`
3. `<theme>/<name>`

所以 `include "toc.html"` 能命中 `partials/toc.html`，不必写全路径。找不到时抛错并指明主题路径，不会静默输出空。

## 继承与覆写

子布局用 `extend` 声明父布局，用同名 `block` 覆盖父布局的对应区域：

```html
<!-- layouts/post.html -->
{% extend "base.html" %}

{% block main %}
<article class="post">
  <h1>{{ page.title }}</h1>
  <div class="prose">{{ content | safe }}</div>
</article>
{% endblock %}
```

父布局 `base.html` 留出可覆盖的位置：

```html
<head>
  <title>{% block title %}{{ page.title }} · {{ site.title }}{% endblock %}</title>
  {% block head %}{% endblock %}
</head>
<body>
  <main>{% block main %}{{ content | safe }}{% endblock %}</main>
</body>
```

block 的默认内容就是父布局里写的那一段 —— 子布局不覆盖时原样保留，所以 `base.html` 里给 `{% raw %}{% block head %}{% endblock %}{% endraw %}` 留空是常见做法，供子布局插入额外的 `<meta>`。

## 资源打包

`assets/` 下的文件按相对路径复制到 `site.assets`（默认 `/assets/`）：

```text
themes/my-theme/assets/style.css   →  dist/assets/style.css
themes/my-theme/assets/ux.js       →  dist/assets/ux.js
themes/my-theme/assets/fonts/a.woff2 → dist/assets/fonts/a.woff2
```

模板里用 `site.assets` 拼路径，换主题或改前缀都不必改模板：

```html
<link rel="stylesheet" href="{{ site.assets }}style.css">
<script src="{{ site.assets }}ux.js" defer></script>
```

站点 `public/` 下的文件是另一条通道，直接落到产物根目录 —— 放 `favicon.ico`、`robots.txt`、需要固定路径的文件。

## 链接与子路径

模板里可以放心写根绝对路径：

```html
<a href="/about/">关于</a>
<img src="/assets/logo.svg" alt="">
```

`site.base` 的前缀在**渲染出口统一补一次**，覆盖模板、Markdown 与用户手写 HTML 三类来源。因此主题不需要自己拼 `site.base + 'about/'` 这样的前缀，写错反而会双重前缀。

需要绝对地址（RSS、canonical）时由插件负责，插件通过 `site.helpers.absoluteUrl` 拿，主题不用管。

## 内置的两套主题

| | `default` | `docs` |
| --- | --- | --- |
| 形态 | 博客：首页列表 + 文章页 + 右侧目录 | 文档：左侧分组侧栏 + 正文 |
| 布局 | base / index / post / page / taxonomy / **archives** / **categories** | base / index / post / page / taxonomy |
| 侧栏 | 无（挂件式信息展示） | `site.navGroups` 驱动，按 `group` 分组、`weight` 排序 |
| 额外交互 | 深浅色切换、代码复制、图片放大、阅读进度 | 搜索面板、目录高亮、移动端抽屉 |
| 适合 | 个人博客、技术随笔 | 产品文档、知识库 |

注意 `docs` 主题**没有** `archives.html` 与 `categories.html` —— 所以文档站不会生成 `/archives/` 与 `/categories/`。要这两页就把布局补上，配置里 `enabled` 默认已经是 `true`。

## 从零写一个最小主题

四个文件就能跑起来：

```text
themes/mini/
├── layouts/base.html
├── layouts/index.html
├── layouts/post.html
└── assets/style.css
```

`layouts/base.html`：

```html
<!DOCTYPE html>
<html lang="{{ site.lang }}">
<head>
  <meta charset="utf-8">
  <title>{{ page.title | default(site.title) }}</title>
  <link rel="stylesheet" href="{{ site.assets }}style.css">
</head>
<body>
  <header><a href="/">{{ site.title }}</a></header>
  <main>{% block main %}{{ content | safe }}{% endblock %}</main>
</body>
</html>
```

`layouts/index.html`：

```html
{% extend "base.html" %}
{% block main %}
<h1>{{ site.title }}</h1>
<ul>
{% for post in site.posts %}
  <li><a href="{{ post.url }}">{{ post.title }}</a> <time>{{ post.date }}</time></li>
{% else %}
  <li>还没有文章。</li>
{% endfor %}
</ul>
{% endblock %}
```

`layouts/post.html`：

```html
{% extend "base.html" %}
{% block main %}
<article>
  <h1>{{ page.title }}</h1>
  <div class="prose">{{ content | safe }}</div>
</article>
{% endblock %}
```

然后在配置里指过去：

```js
export default { theme: 'themes/mini' };
```

`xfm dev` 会立刻用新主题渲染，改模板即时生效 —— 模板按 mtime 缓存，保存即重新编译。

## 调试要点

**模板报错定位到文件**
语法错误会带上模板路径与原因，例如 `partials/toc.html: 不支持的过滤器 "safee"（可用：safe, length, …）`。按提示改即可。

**改了 block 却没生效**
先确认父布局里有没有同名 block。父布局缺少该 block 时，子布局内容会**追加到页面末尾**而不是替换 —— 页面底部突然多出一块 HTML，通常就是 block 名拼错了。

**样式对了但内容没变**
内容来自 `page` / `site`，与模板无关。检查 front-matter 的 `layout` 字段是否指向了另一个布局。

**避免在模板里做重活**
模板是字符串拼接，`for` 里套复杂运算会被执行 N 次。需要在渲染前算好的跨页数据，交给 `afterCollect` 钩子写进 `page.data` —— 那一步是单线程的一次性计算。
