---
title: 主题简介
mode: docs
layout: page
order: 1
description: 了解 Xongyi 主题的定位、三套预设、12 个首页板块与整体技术形态。
keywords: [Hexo 主题, Xongyi, 企业官网, 政务, 教育, 预设]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 主题简介

**Xongyi** 是一款面向**机构官网**场景的 Hexo 通用主题。它的出发点很简单：**机构官网的内容结构高度相似**——首屏讲清楚"我是谁"，中间讲业务与案例，末尾给联系方式——所以完全可以把这套结构固化下来，用配置而不是代码来驱动。

> 演示站：[hexo-theme-xongyi-demo](https://github.com/xfm0797/hexo-theme-xongyi-demo) —— 完整 Hexo 站点，含全部页面、示例文章与五大平台一键部署配置。

## 它解决什么问题

用通用 Hexo 主题搭官网，通常会卡在三件事上：

| 痛点 | Xongyi 的做法 |
| --- | --- |
| 首页要"攒"出来，每个板块都得手写 HTML | 内置 12 个首页板块，用 `sections` 数组拼装，顺序即结构 |
| 企业 / 政务 / 学校的视觉基调差别很大 | 三套预设布局，`preset` 一行切换配色与默认板块 |
| 备案号、地图、表单、统计这些"国内官网刚需"要自己写 | 全部内置为配置项，填值即生效 |

主题不追求"什么都能做"，而是把**机构官网这一件事**做到开箱即用。

## 三套预设

`preset` 是主题配置的第一项，决定默认配色与视觉基调：

| 预设 | 基调 | 典型场景 | 主色倾向 |
| --- | --- | --- | --- |
| `enterprise` | 商务蓝 | 企业官网、科技公司（默认） | 沉稳专业 |
| `government` | 中国红 | 政府门户、政务服务中心 | 庄重权威 |
| `education` | 学院青 | 学校、教育机构 | 清新活力 |

预设之间不只是配色差异，默认板块组合与文案基调也会随场景调整。详见[预设布局](/docs/xongyi/preset/)。

{% note tip 预设可以混用 %}
预设只提供**默认值与基调**，任何一项都可以在 `_config.yml` 里单独覆盖。例如用 `enterprise` 的版式 + 自定义主色，完全可行。
{% endnote %}

## 12 个首页板块

首页由 `sections` 数组驱动，删除一行即隐藏、调整顺序即改变结构：

| 板块 | 作用 |
| --- | --- |
| `hero` | 首屏横幅（徽标、大标题、副标题、按钮、插图） |
| `quicklinks` | 快捷入口（办事大厅、下载中心等高频入口） |
| `stats` | 数据统计（数字滚动动画） |
| `services` | 核心业务 / 服务网格 |
| `about` | 关于我们（支持 HTML 富文本） |
| `products` | 产品与案例卡片 |
| `news` | 新闻动态（自动读取最新文章） |
| `team` | 团队 / 名师风采 |
| `partners` | 合作伙伴（logo 或纯文字） |
| `gallery` | 机构风采图库 |
| `cta` | 行动号召条 |
| `contact` | 联系我们（含表单与地图） |
| `about-contact` | 关于我们 + 联系我们左右合排（一屏收尾） |

每个板块的数据都在 `_config.yml` 对应节点下配置，详见[首页板块](/docs/xongyi/sections/)。

## 特性一览

- 🏢 **三套预设布局**：`enterprise`（商务蓝）/ `government`（政务红）/ `education`（学院青），一行配置切换
- 🧩 **12 个首页板块**：支持启用 / 关闭 / 自由排序，另有「关于我们 + 联系我们」左右合排版
- ⚙️ **60+ 配置项**：品牌、导航、页脚、备案号、社交链接、SEO、统计代码、联系表单、地图嵌入，全部配置化
- 🌙 **暗色模式**：跟随记忆的明暗切换，三套预设各自适配
- 📱 **完全响应式**：桌面 / 平板 / 手机抽屉菜单，移动端体验完整
- 🚀 **轻量高性能**：零框架依赖（原生 JS + 单 CSS 文件）
- 🔍 **SEO 友好**：Open Graph / Twitter Card / JSON-LD 结构化数据、canonical 全覆盖
- 🌐 **国际化**：内置 zh-CN / en 文案包
- 📰 **新闻系统**：文章即动态，自动生成新闻列表、归档、分类、标签页
- ♿ **无障碍**：跳转链接、aria 标签、`prefers-reduced-motion` 支持

## 技术形态

区别于多形态主题，Xongyi 是**单形态**的：它只有一个"首页 + 内容页"的骨架，把复杂度放在首页板块的编排能力上。

```text
请求 → layout.ejs（HTML 骨架：head / header / footer）
         ├── 首页        index.ejs   → 遍历 sections 渲染 13 个板块
         ├── 文章        post.ejs    → 新闻详情
         ├── 独立页面    page.ejs    → about / products / contact ...
         ├── 新闻列表    news.ejs    → 由 layout: news 的页面触发
         └── 归档 / 分类 / 标签  archive / category / tag
```

主题零运行时依赖：`scripts/icons.js` 只提供一个图标 helper，`source/js/main.js` 负责暗色模式、返回顶部、滚动淡入、数字动画与移动端菜单，除此之外没有别的 JavaScript。

## 目录结构

仓库根目录即主题本体，可直接放进站点 `themes/` 目录：

```text
hexo-theme-xongyi/
├── _config.yml                    # ★ 主题配置（带中文注释，日常只需改这个文件）
├── layout/                        # EJS 布局
│   ├── layout.ejs                 # HTML 骨架
│   ├── index.ejs                  # 首页（按 sections 渲染板块）
│   ├── page.ejs / post.ejs        # 页面 / 文章
│   ├── news.ejs / archive.ejs     # 新闻列表 / 归档
│   ├── category.ejs / tag.ejs     # 分类 / 标签
│   └── _partial/                  # 头部、页脚、脚本与 13 个首页板块
├── scripts/icons.js               # 图标 helper（30+ Feather 线性图标）
├── source/
│   ├── css/style.css              # 全部样式（CSS 变量 + 三套预设 + 暗色）
│   ├── js/main.js                 # 交互脚本
│   └── images/                    # logo / favicon / 插图 / 缩略图
├── languages/                     # zh-CN / en 文案包
├── examples/                      # 政务 / 教育两套完整预设示例
├── docs/                          # 预览图与部署按钮素材
├── package.json
└── LICENSE
```

{% note info 命名规范 %}
目录名遵循 Hexo 官方主题命名规范 **`hexo-theme-<name>`**：主题的 `_config.yml`、`layout/`、`source/`、`scripts/`、`languages/` 全部独立收纳在该文件夹内，可直接复制到任意 Hexo 站点的 `themes/` 目录下使用。
{% endnote %}

## 兼容性

| 项目 | 要求 |
| --- | --- |
| Hexo | 7.x（推荐） |
| Node.js | >= 18 |
| 渲染器 | `hexo-renderer-ejs`（必需）、`hexo-renderer-marked`（或其它 Markdown 渲染器） |
| 生成器 | 新闻 / 归档 / 分类 / 标签页需要 `hexo-generator-index`、`hexo-generator-archive`、`hexo-generator-category`、`hexo-generator-tag` |

浏览器支持 Chrome / Edge / Firefox / Safari 最近两个大版本；使用了 CSS 变量、`IntersectionObserver` 与 `prefers-reduced-motion`，旧浏览器会优雅降级（失去动画，不影响阅读）。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/install/, 安装与部署, download, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/preset/, 三套预设, layers, outline %}
{% endcol %}
{% endrow %}
