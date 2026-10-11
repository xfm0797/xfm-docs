---
title: 写新闻与内容
mode: docs
layout: page
order: 40
description: 用 Xongyi 写文章（新闻动态）与建独立页面：front-matter 字段、目录结构、内容来源说明。
keywords: [写文章, 新闻, 页面, front-matter, 内容]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 写新闻与内容

Xongyi 把"文章"直接当作"新闻动态"用，不需要额外的 CMS。

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

也可以直接用命令创建：

```bash
hexo new post "我机构荣获年度优秀服务奖"
```

文章会自动出现在三处：

- **首页「新闻动态」板块**（取最新 `news.count` 条）
- **`/news/` 新闻列表页**
- **`/archives/` 归档页**，并按 `categories` / `tags` 进入 `/categories/` 与 `/tags/`

{% note info 排序靠什么 %}
新闻列表按 `date` **倒序**排列，首页取的也是最新几篇。想让某篇置顶，把 `date` 写成更晚的时间即可。
{% endnote %}

## 独立页面

`about` / `products` / `contact` 等页面在站点 `source/` 下以**目录 + `index.md`** 的形式创建：

```bash
hexo new page about
hexo new page products
hexo new page contact
hexo new page news
```

生成的结构：

```text
source/
├── about/index.md      → /about/
├── products/index.md   → /products/
├── contact/index.md    → /contact/
└── news/index.md       → /news/     （需 layout: news）
```

页面用常规 front-matter 即可：

```yaml
---
title: "关于我们"
subtitle: "专业 · 可靠 · 值得信赖"
---

## 我们是谁

正文内容，正常写 Markdown 就好。
```

{% note warning 必须用「目录 / index.md」 %}
写成 `source/about.md` 会生成 `/about.html`，与导航里写的 `/about/` 不匹配，点击会 404。请始终用 `source/about/index.md` 的形式。
{% endnote %}

## content 与页面的分工

| 内容 | 放哪 | 说明 |
| --- | --- | --- |
| 首页各板块文案 | `_config.yml` | 标题、副标题、条目、图标、链接 |
| 新闻 / 动态 | `source/_posts/` | 带日期的文章，自动进列表与归档 |
| 独立页面正文 | `source/<page>/index.md` | 关于我们、产品服务、联系我们等长文 |

## 首页数据来源

| 来源 | 板块 |
| --- | --- |
| 取自 `_config.yml` 静态配置 | hero / quicklinks / stats / services / about / products / team / partners / gallery / cta / contact |
| 取自站点文章（动态） | news（最新 N 篇） |

{% note info 可配置程度 %}
除 `news` 板块会动态读取最新文章外，其余板块的内容全部来自主题 `_config.yml`（或站点覆盖文件），**改配置即可更新首页，无需动模板**。
{% endnote %}

## 写作小贴士

- **摘要很重要**：`excerpt` 会出现在首页新闻卡片与列表页，不填则截取正文开头；
- **封面尺寸统一**：`cover` 建议用同一比例的图（如 16:9），列表才整齐；
- **分类用于栏目**：`categories` 对应新闻栏目（如「公司新闻」「行业动态」），`tags` 用于横向聚合；
- **图片路径**：放在站点 `source/images/`，引用写 `/images/xxx.svg`。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/front-matter/, 页面与 Front-matter, file-doc, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/deploy/, 部署上线, arrow-up-right, outline %}
{% endcol %}
{% endrow %}
