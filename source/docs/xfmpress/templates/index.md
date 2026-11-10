---
mode: docs

title: 模板语法
date: 2026-11-10 21:55:00
updated: 2026-11-10 21:55:00
description: xfmpress 模板语法完整参考：输出与转义、六个过滤器、if/for/set 控制结构、include 与 extend/block 继承、表达式规则，以及 site/page/content/headings 等模板上下文。
keywords: [xfmpress, 模板, 模板语法, Nunjucks, extend, block, include, 过滤器, 上下文]
order: 26
---

# 模板语法

**中文** · [English version](/en/docs/xfmpress/templates/)

语法与 Nunjucks / Liquid 高度接近，如果你写过 Hexo 主题，大部分写法可以直接迁移。实现方式不同：模板在**构建期一次性编译成 JS 函数**，渲染时只做字符串拼接 —— 没有解释器循环、没有 AST 遍历。

## 语法总览

| 语法 | 作用 |
| --- | --- |
| `{% raw %}{{ expr }}{% endraw %}` | 输出，默认 HTML 转义 |
| `{% raw %}{{ expr }}{% endraw %}` 加 `safe` 过滤器 | 输出，关闭转义 |
| `{% raw %}{% if %} … {% elif %} … {% else %} … {% endif %}{% endraw %}` | 条件 |
| `{% raw %}{% for x in list %} … {% endfor %}{% endraw %}` | 循环 |
| `{% raw %}{% set x = expr %}{% endraw %}` | 赋值 |
| `{% raw %}{% include "partials/toc.html" %}{% endraw %}` | 引入片段 |
| `{% raw %}{% extend "base.html" %} + {% block main %} … {% endblock %}{% endraw %}` | 继承与覆写 |
| `{% raw %}{% raw %} … {% endraw %}{% endraw %}` | 原样输出，不解析 |
| `{% raw %}{# 注释 #}{% endraw %}` | 注释，不进入产物 |

## 输出与转义

```html
<h1>{{ page.title }}</h1>
<div class="prose">{{ content | safe }}</div>
```

`{% raw %}{{ }}{% endraw %}` 默认转义 `& < > " '`，所以普通字段直接写就行。正文 HTML 必须加 `| safe`，否则整篇内容会变成一堆标签字面量。

未定义的变量**不会抛错**，输出空字符串。这条规则贯穿整个引擎：`{% raw %}{{ site.author }}{% endraw %}` 在没配 `author` 时安静地输出空，不会让构建中断。属性访问同理 —— 编译时点号被改写成可选链，`{% raw %}{{ page.data.prev.title }}{% endraw %}` 在 `prev` 不存在时得到 `undefined` 而不是 `TypeError`。

## 过滤器

| 过滤器 | 作用 |
| --- | --- |
| `safe` | 关闭 HTML 转义，正文 HTML 必用 |
| `length` | 长度：数组元素数 / 对象键数 / 字符串字符数 |
| `upper` | 转大写 |
| `lower` | 转小写 |
| `trim` | 去掉首尾空白 |
| `json` | 序列化成 JSON 字符串 |
| `default` | 值为空时给默认值 |

过滤器用竖线串联，从左到右依次执行：

```html
{{ page.title | trim | upper }}
{{ item.date | default("未标注") }}
{{ content | safe }}
```

写错过滤器名会**在编译期报错**，并列出可用清单 —— 不会静默输出空。这是刻意的：拼错 `| saft` 导致整页内容被转义，比构建失败更难查。

## 条件

```html
{% if page.url == '/' %}
  <h1>{{ site.title }}</h1>
{% elif page.description %}
  <h1>{{ page.title }}</h1>
  <p class="lead">{{ page.description }}</p>
{% else %}
  <h1>{{ page.title }}</h1>
{% endif %}
```

表达式支持 `and` / `or` / `not`（编译时翻译成 `&&` / `||` / `!`）、比较运算、成员访问与下标、以及 JS 的常规运算。三元表达式也直接用 JS 语法写。

## 循环

```html
<ul>
{% for post in site.posts %}
  <li><a href="{{ post.url }}">{{ post.title }}</a>
    <span>{{ post.date }}</span>
  </li>
{% endfor %}
</ul>
```

循环体内可用的 `loop` 对象：

| 属性 | 含义 |
| --- | --- |
| `loop.index` | 当前序号，从 1 开始 |
| `loop.index0` | 当前序号，从 0 开始 |
| `loop.first` | 是否第一项 |
| `loop.last` | 是否最后一项 |
| `loop.length` | 总条数 |
| `loop.revindex` | 倒序序号 |

空列表可以用 `else` 兜底：

```html
{% for post in site.posts %}
  <a href="{{ post.url }}">{{ post.title }}</a>
{% else %}
  <p>还没有文章。</p>
{% endfor %}
```

被迭代的值做了宽松处理：`null` / `undefined` 视为空数组；字符串按字符拆；**普通对象按 `{ key, value }` 拆成条目** —— 所以可以直接遍历对象，不用先转数组。

循环变量在循环外引用会得到 `undefined`，不会抛 `ReferenceError`。

## 赋值

```html
{% set count = site.posts | length %}
<p>共 {{ count }} 篇</p>
```

`set` 写入模板作用域，因此允许重复赋值、也允许在 `if` / `for` 内部赋值后在外部读取。

## include

```html
{% include "partials/toc.html" %}
```

路径解析顺序是 `layouts/` → `partials/` → 主题根目录，所以 `include "toc.html"` 也能命中 `partials/toc.html`。片段与主模板共享同一份上下文，内部还能继续 `include`（递归复用同一个环境）。

找不到模板会抛出明确错误：`[xfm] 模板不存在：xxx（主题：<路径>）`。

## extend 与 block

子模板声明父模板，并用同名 block 覆盖父模板里的对应区域：

```html
{% extend "base.html" %}

{% block main %}
<article>
  <h1>{{ page.title }}</h1>
  <div class="prose">{{ content | safe }}</div>
</article>
{% endblock %}
```

父模板 `base.html` 里对应的位置：

```html
<main>
  {% block main %}{{ content | safe }}{% endblock %}
</main>
```

几个约定值得记住：

- 继承是**构建期拼接**，只解析一层层的 `extend`，没有运行时开销；
- 只覆盖同名 block，父模板其他内容原样保留；
- 父模板里**没有**同名 block 时，子模板的内容会追加到末尾 —— 拼错 block 名不会报错，只是位置不对，所以改主题时先确认父模板的 block 名单；
- 不支持嵌套 block，也不支持 `super()`；
- 继承链深度上限 10 层。

## raw 与注释

需要原样输出的片段，用一对标签夹起来 —— 中间的模板语法不会被解析：

| 位置 | 标签 |
| --- | --- |
| 开头 | `{% raw %}{% raw %}{% endraw %}` |
| 结尾 | `{% raw %}{% endraw %}{% endraw %}` |

注释写成井号包起来的标签，不会出现在产物里：

{% raw %}{# 这是注释，产物里看不到 #}{% endraw %}

写「文档里要展示模板语法」这类内容时，`raw` 是唯一可靠的办法 —— 本页所有模板示例都套了这一层。

## 模板上下文

每次渲染都拿到同一套顶层键：

| 键 | 内容 |
| --- | --- |
| `site` | 站点配置 + 聚合数据（见下表） |
| `page` | 当前页元数据 |
| `content` | 正文 HTML |
| `headings` | 当前页标题列表，元素为 `{ level, text, id }` |
| `pagination` | 分页信息，仅列表页有 |

`site` 下可用的数据：

| 键 | 内容 |
| --- | --- |
| `site.title` / `site.description` / `site.lang` / `site.author` | 来自配置，其余自定义键也原样可见 |
| `site.base` | 规范化后的子路径 |
| `site.assets` | 资源前缀，默认 `/assets/` |
| `site.nav` | 导航项数组 |
| `site.pages` | 全部内容页（不含聚合页与分页页） |
| `site.posts` | 文章列表（排除首页、`type: page` 与无日期的页面） |
| `site.tags` | 标签数组，每项 `{ name, url, count? }` |
| `site.categories` | 分类数组，结构同上 |
| `site.series` | 系列数组，结构同上 |
| `site.navGroups` | 侧栏分组，每项 `{ title, items: [{ title, url }] }` |

`page` 下可用的字段：

| 键 | 内容 |
| --- | --- |
| `page.url` / `page.title` / `page.description` | 基础元数据 |
| `page.date` / `page.updated` | 已格式化的日期字符串 |
| `page.tags` / `page.category` / `page.series` | 归类信息 |
| `page.weight` / `page.layout` | 排序权重与布局名 |
| `page.data` | front-matter 原始对象，含 `prev` / `next` / `related` 等注入数据 |
| `page.excerpt` / `page.readTime` | 摘要与阅读时长（分钟） |
| `page.toc` | 该页标题列表 |

`page.data` 是最有用的一层：插件写入的跨页数据都挂在这里（`related` 相关文章、`prev` / `next` 上下篇），模板直接遍历即可。

## 一个完整布局

```html
<!DOCTYPE html>
<html lang="{{ site.lang }}">
<head>
  <meta charset="utf-8">
  <title>{{ page.title }} · {{ site.title }}</title>
  <meta name="description" content="{{ page.description | default(site.description) }}">
  <link rel="stylesheet" href="{{ site.assets }}style.css">
</head>
<body>
  <header>
    <a href="/">{{ site.title }}</a>
    <nav>{% for item in site.nav %}<a href="{{ item.url }}">{{ item.title }}</a>{% endfor %}</nav>
  </header>
  <main>{% block main %}{{ content | safe }}{% endblock %}</main>
</body>
</html>
```

注意 `href="/"` 这类根绝对路径可以直接写：`site.base` 的前缀是在**渲染出口统一补**的，模板、Markdown 链接与用户手写 HTML 三类来源都覆盖，模板层不必关心部署在根路径还是子路径。
