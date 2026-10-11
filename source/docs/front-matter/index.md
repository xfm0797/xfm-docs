---
mode: docs

title: Front-matter 字段
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 主题支持的全部 front-matter 字段，以及每篇内容的推荐写法。
keywords: [front-matter, 字段, 元数据, sticky, cover]
order: 61
---

# Front-matter 字段

## 完整字段表

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

## 字段详解

| 字段 | 类型 | 作用于 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 全部 | 页面标题。**页面被搜索索引收录的硬条件** |
| `date` | date | 全部 | 发布日期，参与排序 |
| `updated` | date | 全部 | 更新日期，显示于 meta 与 docs 的"最后更新于" |
| `categories` | array | blog / notes | 分类。notes 模式的**分组依据** |
| `tags` | array | blog | 标签。参与相关文章评分与搜索索引 |
| `cover` | string | blog | 卡片封面与 OG 分享图 |
| `banner` | string | blog | 同 `cover`，**优先级更高** |
| `description` | string | 全部 | SEO 描述、搜索摘要，**建议每篇都写** |
| `keywords` | string | 全部 | 追加到 meta keywords |
| `sticky` | number | blog | 置顶权重，越大越靠前 |
| `toc` | bool | 全部 | 覆盖 `post.toc`，单篇关闭目录 |
| `sidebar` | bool | blog | 覆盖站点侧边栏开关 |
| `comments` | bool | 全部 | 单篇关闭评论 |
| `mode` | string | 全部 | 单篇指定形态：`blog` / `notes` / `docs` |
| `cover_style` | string | blog | 设为 `inline` 时封面不作 Hero 大图 |
| `order` | number | notes / docs | 排序权重 |

## 按用途分组

### 内容识别

```yaml
---
title: 文档标题
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 一句话说明这篇讲什么
keywords: [关键词一, 关键词二]
---
```

{% note tip description 是收益最高的字段 %}
它同时供给四处在用：

1. `<meta name="description">`
2. 搜索索引的 `excerpt` 字段
3. 站点地图与社交分享卡的描述
4. 页面自身的副标题（`page.ejs` 中渲染）

写与不写，长期差异很大。
{% endnote %}

### 组织与排序

```yaml
---
categories: [前端基础]
tags: [css, 布局]
order: 12
sticky: 100
---
```

| 场景 | 用哪个 |
| --- | --- |
| blog 里让某篇浮到最前 | `sticky`（数值越大越前） |
| notes 里手工编排顺序 | `order` + `notes.sort_by: order` |
| docs 自动生成侧边栏时排序 | `order` |
| docs 用 `docs.yml` 控制顺序 | 不需要 `order`，改数据文件即可 |

### 布局覆盖

```yaml
---
mode: docs           # 这篇用文档布局
toc: false           # 不要目录
sidebar: false       # 不要侧边栏
comments: false      # 不要评论
cover_style: inline  # 封面不用作 Hero
---
```

这四个字段是"单篇例外"的开关，让你在统一形态下处理特例。

### 视觉

```yaml
---
cover: /images/cover.jpg
banner: /images/banner.jpg
cover_style: inline
---
```

封面的取值优先级：

```text
banner  →  cover  →  正文首图  →  theme.default_cover  →  纯色渐变
```

`cover_style: inline` 的效果：封面**仍然显示**，但降级为正文内的插图，不再占据顶部 Hero 区域。适合"文章配图但不想占满首屏"的情况。

## 按内容类型推荐写法

{% tabs %}
<!-- tab 博客文章 -->
```yaml
---
title: 一次 Hexo 主题重构的复盘
date: 2026-10-01 20:30:00
updated: 2026-10-09 11:00:00
categories: [前端, 工程化]
tags: [hexo, 主题, 重构]
cover: /images/posts/hexo-refactor.jpg
description: 记录把站点从三个仓库合并成一个主题的完整过程与踩过的坑。
keywords: [Hexo, 主题开发, 重构]
sticky: 10
---
```
<!-- endtab -->
<!-- tab 文档页 -->
```yaml
---
title: 配置总览
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: XFM 主题全部配置项的分组索引与优先级规则。
keywords: [配置, _config.yml, 主题配置]
order: 10
---
```
{% note info 文档页不需要的字段 %}
`categories` / `tags` / `cover` / `sticky` / `comments` 在文档页基本用不上——文档树由 `docs.yml` 组织，不需要分类标签；封面会干扰三栏布局。**保持简洁即可。**
{% endnote %}
<!-- endtab -->
<!-- tab 笔记 -->
```yaml
---
title: Flex 布局的三条主轴规则
date: 2026-10-08 20:00:00
categories: [前端基础]
tags: [flex, css]
description: 用一句话概括这篇笔记解决什么问题。
order: 12
---
```
<!-- endtab -->
<!-- tab 独立页面 -->
```yaml
---
title: 关于
date: 2026-01-01 00:00:00
description: 关于本站与作者。
comments: false
toc: false
---
```
<!-- endtab -->
{% endtabs %}

## 页面类型页面

`tags` / `categories` / `links` 三类页面除了常规字段，还需要 `type`：

```yaml
---
title: 标签
type: tags
---

---
title: 分类
type: categories
---

---
title: 友链
type: links
---
```

归档页（`source/archives/index.md`）**不需要** `type`。

## 注意事项

{% note warning YAML 的坑 %}
| 写法 | 问题 |
| --- | --- |
| `date: 2026-10-01` | 合法，但建议补上时间 `2026-10-01 20:30:00` 以稳定排序 |
| `tags: css, html` | 会被当成**一个**字符串，应为 `[css, html]` |
| `title: 主题: 配置` | 冒号后空格会被解析为映射，需加引号：`"主题: 配置"` |
| `sticky: "100"` | 字符串，可能不参与数值比较，去掉引号 |
| `updated: 2026-13-01` | 非法日期，会导致构建报错 |
{% endnote %}

{% note info 未识别字段会怎样 %}
主题不认识的 front-matter 字段**不会报错**，只是不产生任何效果。它们仍可通过 `page.xxx` 在自定义模板中访问。
{% endnote %}
