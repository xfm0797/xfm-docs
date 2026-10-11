---
mode: docs

title: Blog 博客模式
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 了解 blog 模式的布局结构、适用场景与关键配置。
keywords: [blog 模式, 博客, 卡片流, 挂件栏]
order: 20
---

# Blog 博客模式

```yaml
mode: blog
```

## 形态特征

blog 模式是主题的默认形态，面向"内容展示 + 个人品牌"的场景。

```text
┌──────────────────────────────────────────────┐
│  导航栏（吸顶 / 磨砂 / 滚动自动隐藏）           │
├──────────────────────────────────────────────┤
│  Hero 大卡：头像 + 标题 + 标语 + 数据统计       │
├────────────────────────────┬─────────────────┤
│                            │   侧边挂件栏      │
│  文章卡片流                 │   · 个人资料      │
│  · 封面大图                 │   · 最新文章      │
│  · 标题 / 摘要 / meta      │   · 分类          │
│  · 标签                     │   · 标签云        │
│  · 置顶标记                 │   · 归档          │
│                            │   · 目录          │
└────────────────────────────┴─────────────────┘
```

三档下的栏数变化：

| 档位 | 布局 | 侧边栏 | 目录 |
| --- | --- | --- | --- |
| desktop | 双栏（内容 + 挂件） | `sticky` 吸附 | 挂件内 |
| tablet | 双栏（内容 + 挂件） | `inline` 内联折叠 | 隐藏 |
| mobile | 单栏 | `offcanvas` 几乎不显示 | 折叠面板 |

## 适合什么内容

- 个人博客、技术随笔、生活记录
- 作品集、项目展示
- 需要强调"人"与"品牌"的站点

## 关键配置

### 首页承载大部分配置

```yaml
index:
  layout: card           # card / list / grid / classic
  hero: true             # 首页大卡
  sticky: true           # 置顶文章
  excerpt: excerpt       # 摘要来源
  excerpt_length: 140
  cover: true
  alternate_layout: true # 带图卡片左右交替
```

详细说明见[首页与文章页](/docs/config-index-post/#首页blog-模式)。

### 侧边挂件栏

```yaml
sidebar:
  position: right
  widgets:
    - profile
    - recent_posts
    - categories
    - tagcloud
    - archive_list
```

挂件参数与社交图标见[侧边栏与页脚](/docs/config-sidebar-footer/)。

### 正文之外的部分

blog 模式下文章页默认会渲染这些区块，全部可单独关闭：

```yaml
post:
  breadcrumb: true       # 面包屑
  tags: true             # 标签
  share: true            # 分享组
  copyright: true        # 版权卡
  reward: false          # 打赏
  post_nav: true         # 上下篇
  related_posts: true    # 相关文章
```

## 与其它模式共存

blog 是站点默认形态，但不妨碍你在其中放置文档或笔记。给单篇内容的 front-matter 加 `mode` 即可切换布局：

```yaml
---
title: 用户手册
mode: docs
---
```

这样一篇文章会以三栏文档布局呈现，左栏是文档树、右栏是目录，而站点其余部分仍是博客形态。这是"博客 + 文档"混合站的推荐做法。

{% note tip 混合站的侧边栏数据 %}
即便站点形态是 `blog`，只要你写了一个 `mode: docs` 的页面，主题就会读取 `source/_data/docs.yml` 来渲染它的左栏。所以混合站同样需要维护这份数据文件。
{% endnote %}

## 一个可直接使用的配置

```yaml
mode: blog

appearance:
  scheme: auto
  primary: "#4f6bed"
  radius: normal
  glass_navbar: true
  animation: true

navbar:
  sticky: true
  auto_hide: true

index:
  layout: card
  hero: true
  sticky: true
  excerpt: excerpt
  cover: true
  alternate_layout: true

sidebar:
  position: right
  sticky: true
  widgets: [profile, recent_posts, categories, tagcloud, archive_list]
  recent_posts:
    count: 5
  categories:
    count: 10
    show_count: true
  tagcloud:
    count: 30
    colorful: true
  archive_list:
    count: 12
    type: monthly

post:
  toc: true
  toc_depth: [2, 3, 4]
  meta: [author, date, updated, categories, wordcount, reading]
  copyright: true
  related_posts: true
  related_count: 4

reading:
  progress_bar: true
  back_to_top: true
  outdated_notice: true
  outdated_days: 365
```
