---
title: 三种模式
mode: docs
layout: page
order: 3
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

只需修改一处配置即可切换整站形态：

```yaml
mode: docs   # blog / notes / docs
```

| 模式 | 布局 | 侧栏形态 | 适用 |
| --- | --- | --- | --- |
| `blog` | 卡片流 + 右侧挂件栏 | 右侧挂件栏 | 个人博客 |
| `notes` | 左侧笔记树 + 沉浸窄栏 | 左侧笔记树（按分类 / 日期分组） | 知识库 / 笔记 |
| `docs` | 左侧文档树 + 正文 + 右侧目录 | 文档树 + 顶部搜索 | 产品文档 |

## 文档模式侧边栏

在站点 `source/_data/docs.yml` 中定义树形结构（字段名可通过 `docs.data_file` 修改）：

```yaml
- title: 快速开始
  children:
    - title: 主题简介
      path: /docs/intro/
    - title: 安装部署
      path: /docs/install/
- title: 进阶配置
  children:
    - title: 模式切换
      path: /docs/mode/
```

节点结构说明：

| 字段 | 说明 |
| --- | --- |
| `title` | 侧栏显示名称 |
| `path` | 该节点指向的页面路径（以 `/` 开头、`/` 结尾） |
| `children` | 子节点数组，可无限层级嵌套 |

{% note tip 自动生成 %}
若未定义 `_data/docs.yml`，主题会自动按页面的 `order` + `title` 生成侧边栏，无需手工维护。
{% endnote %}

## 文档模式相关配置

```yaml
docs:
  data_file: docs      # 侧栏数据文件名（对应 source/_data/docs.yml）
  expanded: true       # 是否默认展开全部节点
  auto_expand: true    # 当前页面所在分支是否自动展开
  page_nav: true       # 是否显示上下篇导航
  last_modified: true  # 正文底部是否显示「最后更新时间」
  edit_link: false     # 是否显示「编辑此页」链接
  edit_base:           # 编辑链接前缀，最终地址 = edit_base + page.source
  toc: true            # 右侧目录是否显示
```

## 页面级覆盖

单篇文章 / 页面可通过 front-matter 覆盖整站模式：

```yaml
---
title: 某一篇笔记
mode: notes
---
```

结合 `page_nav`，文档模式会自动按 `_data/docs.yml` 的平坦顺序生成「上一篇 / 下一篇」。
