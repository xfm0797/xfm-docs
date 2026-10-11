---
mode: docs

title: Docs 文档模式
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 用 docs 模式搭建三栏产品文档站：文档树数据文件、树形结构、上下篇导航与编辑链接。
keywords: [docs 模式, 文档站, 文档树, docs.yml]
order: 22
---

# Docs 文档模式

```yaml
mode: docs
```

## 形态特征

docs 模式是主题里结构最完整的一种形态，三栏布局，对应产品文档站的典型需求。

```text
┌──────────────────────────────────────────────────────────┐
│  导航栏                                                   │
├─────────────┬──────────────────────────┬─────────────────┤
│  文档树      │  正文                     │  本页目录        │
│  · 分组      │  · 标题                   │  · 滚动跟随      │
│    · 页面    │  · 面包屑                 │  · 自动滚入      │
│    · 页面    │  · 正文                   │   可见区         │
│  · 分组      │  · 最后更新于              │                 │
│    · 页面    │  · 上一章 / 下一章         │                 │
└─────────────┴──────────────────────────┴─────────────────┘
```

| 档位 | 布局 | 文档树 | 目录 |
| --- | --- | --- | --- |
| desktop | 三栏 | `sticky` 吸附左栏 | `sticky` 吸附右栏 |
| tablet | 双栏 | `inline` 内联卡片 | 隐藏 |
| mobile | 单栏 | `offcanvas` 抽屉 + 悬浮按钮 | 正文顶部折叠面板 |

## 三步搭起来

### 第 1 步：切换模式

```yaml
mode: docs
```

### 第 2 步：写文档页

每篇文档是一个独立的 Page（不是 Post）：

```bash
hexo new page docs/xfm/intro
hexo new page docs/xfm/install
```

{% note warning 文档必须用 page 而不是 post %}
`hexo new page` 生成到 `source/docs/xfm/intro/index.md`，访问路径 `/docs/xfm/intro/`；`hexo new post` 会进 `source/_posts/` 并出现在文章流里。文档树只识别页面，用错命令会导致侧边栏匹配不上。
{% endnote %}

每篇的 front-matter：

```yaml
---
title: 主题简介
order: 1
---
```

`order` 用于**自动生成侧边栏时的排序**（不定义数据文件时生效），也用于树里同级节点的顺序参考。

### 第 3 步：定义文档树

创建 `source/_data/docs.yml`：

```yaml
- title: 快速开始
  children:
    - title: 主题简介
      path: /docs/xfm/intro/
    - title: 安装部署
      path: /docs/xfm/install/

- title: 配置参考
  children:
    - title: 配置总览
      path: /docs/xfm/config/
```

字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 节点显示文本 |
| `path` | 分组节点可省 | 目标地址，**必须与页面 URL 严格一致** |
| `children` | 否 | 子节点数组，**支持任意层级递归** |

兼容别名：`name` / `url` / `permalink` 等价于 `title` / `path`；`items` / `sections` 等价于 `children`。

## 不定义数据文件会怎样

当 `source/_data/docs.yml` 不存在（或为空）时，`xfm_docs_nav()` 自动降级：

1. 取 `site.pages`（全部独立页面）
2. 过滤掉首页
3. 按 `order` 升序、同序按标题字典序排列
4. 生成**扁平**侧边栏

```yaml
# 此时每篇文档只需要
---
title: 主题简介
order: 1
---
```

{% note tip 什么阶段用什么方式 %}
**内容少于 10 篇、不需要分组** → 直接靠 `order` 自动生成，零维护。
**需要分组、需要控制层级、多人协作** → 显式写 `docs.yml`，结构清晰且可版本管理。
{% endnote %}

## 配置项

```yaml
docs:
  # 侧边栏数据来源：在博客 source/_data/docs.yml 中定义的树形结构
  data_file: docs
  # 是否默认展开全部节点
  expanded: true
  # 当前页面所在分支是否自动展开
  auto_expand: true
  # 是否显示上下篇导航
  page_nav: true
  # 正文底部是否显示「最后更新时间」
  last_modified: true
  # 正文底部是否显示贡献 / 编辑链接
  edit_link: false
  # 编辑链接前缀，最终地址 = edit_base + page.source
  edit_base:
  # 右侧目录是否显示
  toc: true
```

| 配置项 | 说明 |
| --- | --- |
| `data_file` | 数据文件的**键名**。填 `docs` 读 `_data/docs.yml`；改为 `manual` 则读 `_data/manual.yml` |
| `expanded` | 全部节点是否默认展开。关闭后只有 `auto_expand` 命中的分支展开 |
| `auto_expand` | 当前页所在的分支自动展开（推荐保持开启） |
| `page_nav` | 底部"上一章 / 下一章"导航 |
| `last_modified` | 底部"最后更新于 YYYY-MM-DD" |
| `edit_link` + `edit_base` | 底部"在 GitHub 上编辑此页"链接 |
| `toc` | 右侧目录栏总开关 |

## 自动展开与高亮

树的渲染逻辑（`renderNavNodes`）对每个节点做两项判定：

- **`is-active`**：节点 `path` 与当前页路径一致 → 加高亮
- **`is-open`**：节点的子孙中存在当前页 → 自动展开该分支

路径比较前会做**归一化**，因此下面几种写法都能正确匹配：

```text
侧边栏写 /docs/xfm/intro/
页面实际路径 docs/xfm/intro/index.html

归一化后
→ /docs/xfm/intro/
→ /docs/xfm/intro/
```

{% note warning path 写错的典型症状 %}
侧边栏能显示，但**点击后总是跳到首页，或者当前项不高亮**。九成是 `path` 与实际 URL 不一致——多写/少写尾部斜杠一般没事（会被归一化），但**目录名拼错、忘了 `/docs/` 前缀、或写成 `docs/intro`（缺前导斜杠）**都会失配。
{% endnote %}

## 上一章 / 下一章

`layout/page.ejs` 在 docs 模式下会遍历 `docs.yml` 的整棵树，**按深度优先顺序拍平**，然后取当前页的前后相邻项：

```text
docs.yml 顺序
  快速开始
    ├ 主题简介      ← 第 1 项
    └ 安装部署      ← 第 2 项
  配置参考
    └ 配置总览      ← 第 3 项

（当前页 = 安装部署）
上一章 → 主题简介
下一章 → 配置总览
```

因此**树的顺序就是阅读顺序**。想让读者按某个路径读完整个文档，调整 `docs.yml` 的节点次序即可，不需要在每篇里手工写"下一篇"。

{% note info 上一章 / 下一章依赖数据文件 %}
这个导航基于 `docs.yml` 计算。若未定义数据文件，主题无法推知阅读顺序，底部翻页导航不会出现（`page_nav` 即使为 `true` 也无内容可渲染）。
{% endnote %}

## 编辑此页链接

想让读者一键跳转 GitHub 提 PR：

```yaml
docs:
  edit_link: true
  edit_base: https://github.com/<user>/<repo>/edit/main/source/
```

最终链接 = `edit_base` + `page.source`。以 `source/docs/xfm/intro/index.md` 为例：

```text
https://github.com/user/repo/edit/main/source/docs/xfm/intro/index.md
```

## 文档树顶部

`layout/_partials/docs/nav.ejs` 会在树的顶部渲染：

1. 一个标题行"文档目录"（文案取自 `languages/zh-CN.yml` 的 `docs.sidebar`）
2. 一个搜索按钮（受 `search.enable` 控制），点击唤起全站搜索面板

手机档下，整块左栏收起为抽屉，由正文左下角的悬浮按钮"文档目录"唤起，点击链接后自动关闭。

## 一个可直接使用的配置

```yaml
mode: docs

appearance:
  scheme: auto
  primary: "#4f6bed"
  radius: sharp

docs:
  data_file: docs
  expanded: true
  auto_expand: true
  page_nav: true
  last_modified: true
  edit_link: false
  toc: true

post:
  toc: true
  toc_depth: [1, 2, 3]
  breadcrumb: true

search:
  enable: true
  hotkey: true
  index_content: true

navbar:
  sticky: true
  auto_hide: false    # 文档站建议常驻，方便随时跳章节

adaptive:
  tiers:
    mobile:
      sidebar: offcanvas
      toc: panel
    tablet:
      sidebar: inline
      toc: hide
    desktop:
      sidebar: sticky
      toc: sticky
```

{% note tip 文档站把 auto_hide 关掉 %}
博客上"滚动隐藏导航栏"能提升沉浸感，但文档站的读者经常需要回导航或搜索。把 `navbar.auto_hide` 设为 `false` 更实用。
{% endnote %}
