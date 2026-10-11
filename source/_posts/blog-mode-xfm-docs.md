---
title: 主题默认形态改为 blog 并导入官方 xfm 文档集
date: 2026-10-11 10:00:00
updated: 2026-10-11 22:00:00
categories: [更新日志]
tags: [Hexo, 主题, 文档]
description: 站点默认形态由 docs 改为 blog，文档页靠 front-matter 覆盖仍走三栏形态；同时导入官方 xfm 文档 28 篇替换手写版本。
---

本站不再是一份纯粹的文档站，而是一个**默认博客形态**、按需在文档页切到三栏形态的站点。同时把此前手写的 xfm 文档替换为官方整理的完整文档集。

<!-- more -->

## 关键机制：单页 front-matter 覆盖主题形态

主题 `layout.ejs` 的形态解析顺序是：

```text
page.mode  ||  theme.mode  ||  'blog'
```

也就是说 **单页 front-matter 的 `mode` 会覆盖主题默认模式**。所以「站点默认 blog + 文档页 docs」可以在同一站共存：

| 页面 | front-matter | 渲染形态 |
| --- | --- | --- |
| 首页 / 归档 / 文章 | 无 | `data-mode="blog"` |
| `/docs/` 及各文档页 | `mode: docs` | `data-mode="docs"` |

据此把 `theme_config.mode` 由 `docs` 改为 **`blog`**。

## 导入官方 xfm 文档集

从外部导入了一套官方 xfm 文档（28 篇，扁平结构 `/docs/<slug>/`），处理方式：

- **替换**：移除此前手写的 `source/docs/xfm/`（8 篇），改用导入集。
- **保留**：`source/docs/xongyi/`（8 篇）原样保留。
- **侧栏**：`source/_data/docs.yml` 采用导入版的 8 个分组，并在末尾**追加「hexo-theme-xongyi」分组**，共 9 组 / 35 条链接。

`source/docs/` 合计 **36 篇**（28 xfm + 8 xongyi）。

## 修复导入内容的一处错误

导入的 `tags-tabs-timeline` 页里残留了一个 **`tabs_end` 收尾标签** —— 主题并未注册它（只有 `tabs` / `endtabs`），导致构建抛出：

```text
Nunjucks Error: unknown block tag: tabs_end
```

删除该行后恢复正常。为此我全量比对了文档用到的全部标签与主题注册标签，确认除它之外没有其它未知标签。

{% note warning 经验：未知标签会直接中断构建 %}
主题注册的标签有 `note`、`fold`/`collapse`、`tabs`/`tab`、`timeline`/`event`、`row`/`col`、`button`、`label`、`icon`、`mermaid`、`linkcard`。**没有 `tabs_end`**。导入外部内容时，先扫一遍全文用到的标签名与注册表比对，能省掉一次返工。
{% endnote %}

## 结果

- 构建 **72 files，0 error**。
- 侧栏 35 条链接全部命中，36 篇文档无孤儿页。
- 搜索索引与 sitemap 各收录 36 条文档。
