---
mode: docs

title: 标签插件总览
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: XFM 内置全部标签插件的语法索引与通用约定。
keywords: [标签插件, tag plugin, 语法, 扩展]
order: 40
---

# 标签插件总览

所有标签插件在 Markdown 正文中直接使用，不需要安装任何插件——它们由主题的 `scripts/tags/index.js` 注册。

## 语法索引

| 插件 | 语法 | 说明 |
| --- | --- | --- |
| 提示块 | `{% raw %}{% note info 标题 %}…{% endnote %}{% endraw %}` | 八种语义色 |
| 折叠块 | `{% raw %}{% fold 标题 %}…{% endfold %}{% endraw %}` | 默认收起，可 `open` |
| 选项卡 | `{% raw %}{% tabs %}{% tab 标题 %}…{% endtab %}{% endtabs %}{% endraw %}` | 多标签切换 |
| 时间轴 | `{% raw %}{% timeline %}{% event 标题 / 时间 / 颜色 %}…{% endevent %}{% endtimeline %}{% endraw %}` | 纵向时间线 |
| 栅格 | `{% raw %}{% row %}{% col 6 %}…{% endcol %}{% endrow %}{% endraw %}` | 12 列栅格 |
| 按钮 | `{% raw %}{% button /path/, 标题, 图标, 样式 %}{% endraw %}` | 两种样式 |
| 徽标 | `{% raw %}{% label primary 文本 %}{% endraw %}` | 行内标签 |
| 图标 | `{% raw %}{% icon github, 20 %}{% endraw %}` | 内置 SVG 图标 |
| 流程图 | `{% raw %}{% mermaid %}…{% endmermaid %}{% endraw %}` | Mermaid 语法 |
| 链接卡片 | `{% raw %}{% linkcard url, 名称, 简介, 头像 %}{% endraw %}` | 富链接卡片 |

## 通用约定

### 参数分隔

大部分插件用**逗号**切分参数，且会自动去掉首尾引号：

```text
{% raw %}{% button /archives/, 查看归档, archive, outline %}{% endraw %}
        └─ 1 ────────┘└─ 2 ────┘└─ 3 ──┘└─ 4 ──┘
```

`note`、`label` 这类使用 `toList()` 解析的插件，**逗号和空格都算分隔符**，因此下面两种写法等价：

```text
{% raw %}{% label primary 新特性 %}{% endraw %}
{% raw %}{% label primary, 新特性 %}{% endraw %}
```

### 内容渲染

标签体内的内容会**尽量按 Markdown 渲染**。若标签体以块级 HTML 标签开头（如 `<p>` `<div>` `<table>` `<ul>`），则原样保留不重复渲染。

```text
{% raw %}{% note tip 支持 Markdown %}
这里可以写 **加粗**、`行内代码`、[链接](/)。

- 列表项一
- 列表项二
{% endnote %}{% endraw %}
```

### 嵌套

插件可以嵌套使用，但**同类型插件不要交叉嵌套**（如 `tabs` 里再放 `tabs`），因为渲染依赖一个内部栈，交叉嵌套会导致内容错位。

```text
{% raw %}{% row %}
{% col 6 %}
{% note info 左边 %}
栅格内可以放提示块。
{% endnote %}
{% endcol %}
{% col 6 %}
支持嵌套组合。
{% endcol %}
{% endrow %}{% endraw %}
```

{% note warning 在本文档里写示例要用 raw %}
本文档自身的源码里，示例用 `{% raw %}…{% endraw %}` 包裹，否则会被主题先解析掉。你写自己的内容时**不需要**这层包裹——直接写标签即可。
{% endnote %}

## 分页索引

| 页面 | 覆盖插件 |
| --- | --- |
| [提示与折叠](/docs/xfm/tags-note-fold/) | `note` / `fold` |
| [选项卡与时间轴](/docs/xfm/tags-tabs-timeline/) | `tabs` / `timeline` |
| [栅格与行内元素](/docs/xfm/tags-layout/) | `row` / `button` / `label` / `icon` |
| [图表与链接卡片](/docs/xfm/tags-mermaid/) | `mermaid` / `linkcard` |

## 写在哪

标签插件可以在任何 Markdown 内容里使用：

- 文章（`source/_posts/`）
- 页面（`source/xxx/index.md`）
- 甚至是 `source/_data/` 之外的 YAML 值中**不行**——标签只在 Markdown 渲染阶段解析

{% note info 状态是共享的 %}
`tabs` / `timeline` / `row` 三个插件在渲染时使用一个临时数组收集子项，父标签闭合时取出并清空。这意味着**同一页面内可以放多组同类标签**，主题会用递增的 `id` 区分（`xfm-tabs-0`、`xfm-tabs-1`…），互不干扰。
{% endnote %}
