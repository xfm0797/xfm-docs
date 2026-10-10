---
title: Front-matter
mode: docs
layout: page
order: 7
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

文章 / 页面通过在文件头部写 front-matter 来控制单篇行为：

```yaml
---
title: 文章标题
date: 2026-10-01
updated: 2026-10-09
categories: [分类]
tags: [标签一, 标签二]
cover: /images/cover.jpg      # 首图卡片封面 + OG 图
banner: /images/banner.jpg    # 同 cover，优先级更高
description: 自定义描述
keywords: 关键词
sticky: 100                   # 置顶权重，越大越靠前
toc: false                    # 单篇关闭目录
sidebar: false                # 单篇关闭侧边栏
comments: false               # 单篇关闭评论
mode: docs                    # 单篇指定模式
cover_style: inline           # inline 时封面不作为 Hero
order: 1                      # 笔记/文档模式排序权重
---
```

## 字段说明

| 字段 | 说明 |
| --- | --- |
| `title` | 文章标题 |
| `date` / `updated` | 创建时间 / 更新时间；`updated` 用于文档页底部的「最后更新时间」 |
| `categories` | 分类，数组 |
| `tags` | 标签，数组 |
| `cover` | 封面图，用于卡片首图与 OG 分享图 |
| `banner` | 同 `cover`，但优先级更高 |
| `description` | 自定义描述（列表摘要 / meta description） |
| `keywords` | meta keywords |
| `sticky` | 置顶权重，数值越大越靠前 |
| `toc` | `false` 关闭本篇目录 |
| `sidebar` | `false` 关闭本篇侧边栏（blog 模式） |
| `comments` | `false` 关闭本篇评论 |
| `mode` | 单篇指定模式，覆盖整站 `theme.mode` |
| `cover_style` | `inline` 时封面不作为 Hero 大图 |
| `order` | 笔记 / 文档模式下的排序权重 |

## 典型用法

文档页常见写法：

```yaml
---
title: 安装部署
mode: docs
layout: page
order: 2
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---
```

{% note info layout: page %}
文档 / 独立页面建议使用 `layout: page`，并设置 `mode: docs`，以便套用文档三栏布局与上下篇导航。
{% endnote %}
