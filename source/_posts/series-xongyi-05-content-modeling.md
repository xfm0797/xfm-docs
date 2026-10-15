---
title: 从零造一个机构官网主题（五）：内容建模——新闻 / 产品 / 团队怎么存
date: 2026-10-15 21:00:00
updated: 2026-10-15 21:00:00
categories: [主题开发]
tags: [Hexo, 内容建模, 主题开发, 官网]
description: 机构官网的内容不止文章：文章即新闻、页面承载固定栏目、front-matter 字段约定、目录组织，以及为什么产品与团队不放进文章系统。
---

博客的内容模型很简单：一切都是文章。机构官网不一样——**新闻是文章，产品不是，团队不是，案例也不是**。如果硬把所有内容塞进文章系统，分类页会变得莫名其妙。

这一篇讲我怎么给三类内容分层，以及踩到的坑。

<!-- more -->

## 一、三层内容模型

| 层 | 内容 | 载体 | 谁在维护 |
| --- | --- | --- | --- |
| **动态内容** | 新闻动态 | `source/_posts/*.md`（文章） | 经常更新 |
| **固定栏目** | 关于我们 / 产品服务 / 联系我们 | `source/<slug>/index.md`（页面） | 半年改一次 |
| **结构化数据** | 产品列表 / 团队成员 / 合作伙伴 | `_config.yml` 配置项 | 偶尔增删 |

{% note tip 判据：更新频率 × 是否需要独立页面 %}
- **需要独立页面 + 按时间倒序** → 文章（新闻）；
- **需要独立页面 + 数量固定** → 页面（关于/联系）；
- **不需要独立页面，只在首页露脸** → 配置项（产品卡片、团队成员）。

产品我没有做成文章，因为它**不需要详情页**（客户习惯在首页看，点进去是联系页）。做成配置项后，客户改一个产品只要改三行 YAML。
{% endnote %}

## 二、新闻：文章即动态

新闻列表页用独立 layout：

```ejs
<%# layout/news.ejs %>
<section class="page-hero">
  <h1><%= page.title %></h1>
  <% if (page.subtitle) { %><p class="page-hero__subtitle"><%= page.subtitle %></p><% } %>
</section>
<div class="container page-content">
  <%- partial('_partial/post-grid', { posts: site.posts.sort('date', -1) }) %>
</div>
```

页面只要在 front-matter 里指定 layout：

```yaml
---
title: 新闻动态
layout: news
subtitle: 了解我们的最新动向
---
```

卡片渲染读这些字段：

```ejs
<% if (post.cover) { %>
  <img src="<%- url_for(post.cover) %>" alt="<%= post.title %>" loading="lazy">
<% } else { %>
  <span class="post-card__placeholder"><%- icon('image') %></span>
<% } %>
<span class="post-card__date"><%- icon('calendar') %><%= date(post.date, 'YYYY-MM-DD') %></span>
<% var desc = post.excerpt ? strip_html(post.excerpt).trim() : strip_html(post.content || '').trim(); %>
<%= desc.substring(0, 80) %>
```

{% note info front-matter 约定（写给客户看） %}
```yaml
---
title: 公司通过 ISO9001 认证
date: 2026-10-01
categories: [公司新闻]
tags: [认证, 资质]
cover: /images/news/iso.jpg     # 不填则显示占位图标
---
正文……（用 `<!-- more -->` 控制列表页摘要）
```
**`cover` 和 `<!-- more -->` 是两个最值得教客户的字段**——它们直接决定列表页好不好看。
{% endnote %}

## 三、固定栏目：page 形态

关于我们、联系我们这些页面走 `page.ejs`，它自带页面头图区：

```ejs
<article class="page">
  <section class="page-hero">
    <h1><%= page.title %></h1>
    <% if (page.subtitle) { %><p class="page-hero__subtitle"><%= page.subtitle %></p><% } %>
  </section>
  <div class="container page-content reveal">
    <%- page.content %>
  </div>
</article>
```

目录约定是**一个页面一个目录**（产出 pretty URL）：

```
source/
├─ about-us/index.md      → /about-us/
├─ contact/index.md       → /contact/
└─ products/index.md      → /products/
```

{% note danger 不要写成 source/about-us.md %}
写成单文件会得到 `/about-us.html`，而导航菜单里写的是 `/about-us/`（带斜杠），链接直接 404。

**规则：每个页面建自己的目录，文件一律叫 `index.md`。**
{% endnote %}

## 四、真实案例的目录长什么样

以落地的企业站（`cn.xongyi.com`）为例：

```
source/
├─ _posts/          # 新闻动态（文章）
├─ about-us/        # 关于我们（页面）
├─ contact/         # 联系我们（页面）
├─ xongyi/          # 品牌/业务介绍（页面）
├─ search/          # 搜索页
├─ categories/      # 分类页
└─ images/          # 站点图片资源
```

注意 `search/` 和 `categories/` 也是手建的页面目录——**分类页和搜索页都需要一个承载页面**，否则链接进去是 404。

{% note warning 依赖必须显式安装 %}
分类页 / 标签页 / 归档页需要 `hexo-generator-category` / `-tag` / `-archive`，**Hexo 核心不带**（这一点在 xfm 系列的坑 2 里也提过）。

表现是：页面模板在、菜单链接在，但访问 404。而且 `hexo generate` **不报错**。
{% endnote %}

## 五、多语言内容：界面和内容分开

`languages/zh-CN.yml` 和 `en.yml` 只管**界面文案**（"了解更多"、"联系我们"）：

```ejs
<a class="post-card__more" href="<%- url_for(post.path) %>"><%= __('read_more') %><%- icon('arrow-right') %></a>
```

**文章内容不参与翻译**——这是刻意的：机构官网的英文版通常是另一套内容，不是逐句翻译。

{% note info 如果要做真双语站 %}
做法是两套内容目录 + 两个站点配置（`_config.yml` 里 `language` 不同），而不是在单页里塞两种语言。静态站做「同一 URL 双语言切换」的代价很高，机构官网通常不需要。
{% endnote %}

## 六、回头看这个模型

最满意的一点：**客户新增一条内容永远只需要做一件事**——

- 发新闻 → 在 `_posts/` 加一个 md 文件；
- 加产品 → 在配置里加三行；
- 加页面 → 建一个目录写 `index.md`。

不需要理解主题结构，不需要碰模板。这就是第一篇说的「客户要能自己改」落到实处。

## 系列导航

{% note tip 系列导航 %}
[xongyi 系列总入口](/series/xongyi/) · 上一篇：[配置即产品](/2026/10/15/series-xongyi-04-config-as-product/) · 下一篇：[零依赖前端](/2026/10/15/series-xongyi-06-vanilla-frontend/)
{% endnote %}
