---
mode: docs

title: Notes 笔记模式
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 使用笔记模式把文章组织成按分类或日期分组的笔记树，配合沉浸式窄栏阅读。
keywords: [notes 模式, 笔记, 知识库, 分组, 窄栏阅读]
order: 21
---

# Notes 笔记模式

```yaml
mode: notes
```

## 形态特征

notes 模式面向"知识库 / 学习笔记"的场景，把散落的文章组织成一棵可分组的树，并把正文收窄到适合长时间阅读的宽度。

```text
┌──────────────────────────────────────────────┐
│  导航栏                                       │
├───────────────┬──────────────────┬───────────┤
│  笔记树        │   正文（窄栏）     │  目录      │
│  · 分组头      │   沉浸式阅读宽度   │  · 滚动跟随 │
│    · 笔记 1    │                  │  · 自动滚入 │
│    · 笔记 2    │                  │   可见区    │
│  · 分组头      │                  │           │
│    · 笔记 3    │                  │           │
└───────────────┴──────────────────┴───────────┘
```

与 blog 模式最大的差别：**左栏不是可配置的挂件列表，而是由你的文章数据自动生成的笔记树**。

## 笔记树是怎么生成的

模板 `layout/_partials/notes/nav.ejs` 调用 `xfm_notes_nav()`（`scripts/helpers/index.js`），执行逻辑是：

1. 取出站点全部**有标题的文章**（`site.posts`，不含独立页面）
2. 按 `notes.sort_by` 排序
3. 按 `notes.group_by` 分组成若干组
4. 每组渲染为可折叠的卡片，包含**组名 + 篇数**，点击组头折叠 / 展开

```text
分组依据 group_by: category
↓
┌ 前端基础  3 ┐        ← 组名 + 篇数
   CSS 盒模型
   Flex 布局
   响应式原理
┌ 工程化  2 ┐
   构建工具
   模块规范
```

当前页所在的组会**自动展开**（`is-open`），其余组保持默认状态。树的顶部还会显示总篇数（`共 N 篇笔记`）。

## 配置项

```yaml
notes:
  # 侧边栏分组依据: category / date / none
  group_by: category
  # 每组内的排序: title / date / order
  sort_by: date
  # 排序方向: asc / desc
  order: desc
  # 是否默认折叠分组
  collapsed: false
  # 侧边栏是否显示搜索框
  search: true
  # 是否显示每篇笔记的日期
  show_date: true
  # 正文最大宽度（px）
  content_width: 820
  # 是否显示右侧内置目录（不占用 generate 的 toc）
  toc: true
```

### 分组依据 `group_by`

| 值 | 分组键 | 示例组名 |
| --- | --- | --- |
| `category` | 文章的一级分类 | `前端基础`、`工程化` |
| `date` | 发布日期到月 | `2026-10`、`2026-09` |
| `none` | 不分组 | 全部笔记平铺 |

{% note info category 分组取的是分类全路径 %}
一篇属于 `前端 / CSS` 的文章，组名会显示为 `前端 / CSS`。若文章没有分类，归入"未分组"。
{% endnote %}

### 排序 `sort_by` + `order`

| `sort_by` | 排序基准 |
| --- | --- |
| `title` | 标题字典序 |
| `date` | 发布日期 |
| `order` | front-matter 的 `order` 字段（未填按 9999） |

`order: desc` 降序、`asc` 升序。组合 `sort_by: order` + `order: asc` 可以实现**手工编排的笔记顺序**，此时在每篇笔记的 front-matter 里写：

```yaml
---
title: CSS 盒模型
categories: [前端基础]
order: 1
---
```

### 正文宽度 `content_width`

```yaml
notes:
  content_width: 820
```

窄栏阅读的核心参数。**建议控制在 640–860 之间**——中文每行 30–40 字是舒适区；超过 900 会导致视线回扫困难，低于 600 则频繁换行。

### 折叠与日期

```yaml
notes:
  collapsed: false   # 分组默认是否折叠
  show_date: true    # 每条笔记右侧是否显示 MM-DD
  search: true       # 左栏顶部是否显示搜索按钮
```

`collapsed: true` 时所有分组初始折叠，只有当前页所在的组展开——笔记量很大时很实用。

### 右侧目录

```yaml
notes:
  toc: true
```

开启后正文右侧出现独立目录栏（不占用 blog 的 `toc` 挂件）。手机档自动折叠为正文顶部的面板。

## 与 docs 模式的取舍

| | notes | docs |
| --- | --- | --- |
| 组织方式 | 按分类 / 日期**自动分组** | 手工定义**树形结构** |
| 数据来源 | 文章本身 | `source/_data/docs.yml` |
| 层级 | 两级（组 → 笔记） | 任意层级 |
| 上下篇 | 无 | 有（按树顺序） |
| 适合 | 个人知识库、学习笔记 | 产品文档、使用手册 |

一句话判断：**内容会持续零散增加 → notes；结构需要精心编排且长期稳定 → docs。**

## 推荐的笔记写法

```yaml
---
title: Flex 布局的三条主轴规则
date: 2026-10-08 20:00:00
categories: [前端基础, CSS]
tags: [flex, 布局]
description: 一句话概括这篇笔记解决什么问题
order: 12
---
```

关键点：

- **分类只挂一级**，避免出现 `前端 / CSS / 子类` 这种过深的组名，笔记树会变得难读。
- **`description` 一定要写**——它会进入搜索索引的摘要字段，也会用于该页的 SEO 描述。
- 用 `order` 手工定序，比依赖日期更稳定。

## 一个可直接使用的配置

```yaml
mode: notes

appearance:
  scheme: auto
  primary: "#4f6bed"
  radius: normal

notes:
  group_by: category
  sort_by: order
  order: asc
  collapsed: false
  search: true
  show_date: true
  content_width: 820
  toc: true

post:
  toc: true
  toc_depth: [2, 3, 4]
  breadcrumb: true

search:
  enable: true
  hotkey: true

adaptive:
  tiers:
    mobile:
      sidebar: offcanvas
      toc: panel
```
