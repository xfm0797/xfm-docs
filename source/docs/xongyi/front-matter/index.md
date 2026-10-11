---
title: 页面与 Front-matter
mode: docs
layout: page
order: 41
description: Xongyi 支持的 front-matter 字段：页面的 title / subtitle / layout，文章的 date / categories / tags / cover / excerpt。
keywords: [front-matter, subtitle, layout, cover, excerpt]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 页面与 Front-matter

Front-matter 是 Markdown 文件顶部 `---` 之间的 YAML 区块。Xongyi 只读取其中少数几个字段，其余交给 Hexo 核心处理。

## 页面（Page）

`source/<name>/index.md`：

```yaml
---
title: "关于我们"
subtitle: "专业 · 可靠 · 值得信赖"
---

正文……
```

| 字段 | 必需 | 作用 | 渲染位置 |
| --- | --- | --- | --- |
| `title` | 是 | 页面标题 | 页头大标题 + `<title>` |
| `subtitle` | 否 | 副标题 | 页头标题下方 |
| `description` | 否 | 页面摘要 | `<meta name="description">` 与 OG 描述 |
| `layout` | 否 | 指定布局 | 默认 `page`；写成 `news` 变成新闻列表页 |
| `subtitle` 之外的自定义字段 | — | 不生效 | 主题不会读取 |

{% note info 只有 news 需要显式指定 layout %}
`about` / `products` / `contact` 等页面**不需要**写 `layout`，默认走 `page.ejs`。只有新闻列表页要写 `layout: news`：

```yaml
---
title: "新闻动态"
subtitle: "了解我们的最新进展"
layout: news
---
```
{% endnote %}

## 文章（Post）

`source/_posts/xxx.md`：

```yaml
---
title: 机构荣获年度优秀服务奖
date: 2026-10-11 10:00:00
categories: [机构新闻]
tags: [荣誉, 服务]
cover: /images/thumb-1.svg
excerpt: 一句话摘要，用于列表卡片。
---
```

| 字段 | 必需 | 作用 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，决定新闻排序（倒序） |
| `categories` | 否 | 分类，对应新闻栏目；进入 `/categories/` |
| `tags` | 否 | 标签；进入 `/tags/` |
| `cover` | 否 | 封面图；列表卡片与 OG 图片都用它 |
| `excerpt` | 否 | 摘要；不填则截取正文前 80 字用于卡片 |

{% note tip 摘要与封面决定列表观感 %}
`post-grid` 卡片会依次尝试：`cover` → 占位图；`excerpt` → 正文前 80 字。想让新闻列表整齐好看，**统一封面比例 + 每篇写一句 `excerpt`** 是最划算的两件事。
{% endnote %}

## 各字段的实际效果

```text
page.title      → <h1>（页头）+ <title>（浏览器标签）
page.subtitle   → 页头副标题
post.excerpt    → 卡片摘要 + meta description
post.cover      → 卡片封面 + og:image
categories      → 文章页元信息 + /categories/ 聚合
tags            → 文章页底部标签 + /tags/ 聚合
```

## 常见写法对照

{% tabs %}
{% tab 关于我们 active %}
```yaml
---
title: "关于我们"
subtitle: "十余年深耕，只为更专业的服务"
---

## 我们是谁

我们是一家专注于数字化服务的科技公司，成立于 2016 年。
```
{% endtab %}
{% tab 新闻列表页 %}
```yaml
---
title: "新闻动态"
subtitle: "了解我们的最新进展"
layout: news
---
```
{% endtab %}
{% tab 一篇新闻 %}
```yaml
---
title: 我机构与某科技集团达成战略合作
date: 2026-10-08 09:30:00
categories: [合作动态]
tags: [战略合作]
cover: /images/thumb-3.svg
excerpt: 双方将在智慧园区与数据可视化领域展开深度合作。
---
```
{% endtab %}
{% endtabs %}

## 容易踩的坑

{% note warning 三个高频错误 %}
1. **`title` 没加引号却含冒号**：YAML 会把 `title: 合作: 新起点` 解析错，请写成 `title: "合作: 新起点"`。
2. **`date` 格式不规范**：请用 `YYYY-MM-DD HH:mm:ss`，其它格式可能导致排序异常。
3. **页面写成 `source/about.md`**：会生成 `/about.html`，与导航的 `/about/` 不匹配而 404。**务必用目录 + `index.md`**。
{% endnote %}

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/writing/, 写新闻与内容, file-doc, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/customize/, 自定义样式与模板, code, outline %}
{% endcol %}
{% endrow %}
