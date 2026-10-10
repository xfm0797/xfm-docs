---
title: 写新闻与内容
mode: docs
layout: page
order: 14
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

## 写文章（新闻动态）

在站点 `source/_posts/` 下新建 Markdown：

```markdown
---
title: 文章标题
date: 2026-10-01 10:00:00
categories: [公司新闻]
tags: [活动]
cover: /images/thumb-1.svg   # 可选封面
excerpt: 摘要（可选，用于列表卡片）
---
正文内容……
```

文章会自动出现在三处：

- 首页「新闻动态」板块（取最新 `news.count` 条）
- `/news/` 新闻列表页
- `/archives/` 归档页

## 独立页面

`about` / `products` / `contact` 等页面在站点 `source/` 下以目录 + `index.md` 形式创建：

```
source/
├── about/index.md
├── products/index.md
├── contact/index.md
└── news/index.md
```

页面只需常规 front-matter：

```yaml
---
title: 关于我们
layout: page
---
```

## 首页数据来源说明

首页各板块的数据来源分两类：

| 来源 | 板块 |
| --- | --- |
| 取自 `_config.yml` 静态配置 | hero / quicklinks / stats / services / about / products / team / partners / gallery / cta / contact |
| 取自站点文章（动态） | news（最新 N 篇） |

{% note info 可配置程度 %}
除 `news` 板块会动态读取最新文章外，其余板块的内容全部来自主题 `_config.yml`（或站点覆盖文件），改配置即可更新首页，无需动模板。
{% endnote %}
