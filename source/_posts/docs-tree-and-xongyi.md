---
title: 文档树默认收起点击展开，xongyi 文档按 xfm 结构重写
date: 2026-10-11 22:00:00
updated: 2026-10-11 22:00:00
categories: [更新日志]
tags: [Hexo, 文档, 交互]
mode: notes
description: 文档侧栏分组改为默认收起、点击展开（对后续新增文档同样生效），并把 xongyi 文档由 8 篇扁平重写为与 xfm 同构的 21 篇分组文档。
---

两项收尾工作：让**文档侧栏的分组默认收起、点击再展开**，并把 **xongyi 文档重写**成与 xfm 一致的分组结构。

<!-- more -->

## 一、文档树：默认收起 + 点击展开

### 根因（主题的三个缺口）

主题对 docs 侧栏只输出 `.xfm-nav-item.has-children` + `.xfm-nav-toggle` + 空 `<i class="xfm-arrow">`，但：

1. CSS 只实现了 `.xfm-nav-group`（**笔记**侧栏）的折叠，`.xfm-sidebar-nav` 下**没有任何收起规则** → 整棵树永远全展开；
2. `core.js` 只给 `.xfm-nav-group-head` 绑了点击，`.xfm-nav-toggle` **无任何事件** → 点箭头毫无反应；
3. `.xfm-arrow` **全主题没有样式** → 连箭头都看不见。

### 站点层修复

| 新增文件 | 职责 |
| --- | --- |
| `source/css/xfm-docs-tree.css` | 两列栅格让子列表独占一行；核心规则 `.has-children:not(.is-open) > .xfm-nav-list { display: none }`；用 border 画 chevron 并随展开态旋转 |
| `source/js/xfm-docs-tree.js` | document 级事件委托：点整行标签或箭头切换 `.is-open` 并同步 `aria-expanded`；支持 Enter / Space |

两者经 `theme_config.custom.css / custom.js` 引入。

{% note success 设计要点：通用规则，后续新增文档自动生效 %}
默认只展开**当前页所在的那条路径**（主题早已给各级祖先写了 `.is-open`），其余分组一律收起。收起态是**纯 CSS**，因此即使 JS 未加载也**不会闪开**。规则全部基于 `.has-children`，**后续新增任何分组都自动生效**，无需逐页配置。
{% endnote %}

## 二、xongyi 文档按 xfm 结构重写（8 篇 → 21 篇）

原先 xongyi 只有 8 篇扁平文档。这次重写为与 xfm 同构的分组树：

| 分组 | 页面 |
| --- | --- |
| 文档首页 | `/docs/xongyi/` |
| 快速开始 | 主题简介 / 安装与部署 / 5 分钟上手 |
| 预设布局 | 三套预设 / 预设示例 |
| 首页板块 | 板块总览 / 板块配置详解 |
| 配置参考 | 配置总览 / 品牌与导航 / 联系与地图 / 页脚与备案 / 功能与统计 |
| 内容与新闻 | 写新闻与内容 / 页面与 Front-matter |
| 定制与进阶 | 图标速查 / 自定义样式与模板 / 目录结构与运行时 |
| 部署 | 一键部署 |
| 帮助 | 常见问题 / 故障排查 |

内容取自主题权威源：`README.md`、`_config.yml`、`examples/config.*.yml`、`scripts/icons.js`（**52 个图标**）、`languages/`、`layout/` 与 `style.css` 的 CSS 令牌。front-matter 与 xfm 对齐，`_data/docs.yml` 的 xongyi 分组改为同构三级树。

## 校验

- 构建 **91 files，0 error**；文档页未渲染的标签残留 0。
- 侧栏 **49 条链接全部命中**，50 个文档页无孤儿，70 个 HTML 中 `/docs/` 链接 0 失效。
- **jsdom 模拟点击**：收起分组 `aria-expanded=false` → 点标签展开 → 点箭头收起 → `preventDefault` 正确；叶子链接不被拦截。

{% note tip 若想让当前分支也收起 %}
现在默认会展开当前页所在分支（便于定位）。若希望连当前分支也默认收起，把 CSS 里的 `:not(.is-open)` 改为对全部 `.has-children` 生效即可。
{% endnote %}
