---
mode: docs

title: 主题简介
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 了解 XFM 主题的定位、设计理念、能力边界与整体架构。
keywords: [Hexo 主题, XFM, 文档站, 笔记, 博客]
order: 1
---

# 主题简介

**XFM** 是一套面向长期写作的 Hexo 主题：**一套代码同时覆盖博客、笔记、文档三种形态**，全套设计令牌驱动，几乎所有形态都由配置决定，不需要改模板。

## 它解决什么问题

大多数 Hexo 主题把"博客"当作唯一形态，写文档要么另起一个站，要么用外挂的第三方文档系统。XFM 把三种场景收敛到同一份代码里：

| 形态 | 开关 | 适合场景 | 布局特征 |
| --- | --- | --- | --- |
| **blog** | `mode: blog` | 个人博客、技术随笔 | 首页 Hero + 卡片流 + 右侧挂件栏 |
| **notes** | `mode: notes` | 知识库、学习笔记 | 左侧笔记树 + 沉浸窄栏阅读 + 右侧目录 |
| **docs** | `mode: docs` | 产品文档、使用手册 | 左侧文档树 + 正文 + 右侧目录三栏 |

形态可以在站点级切换（`_config.yml` 的 `mode`），也可以由**单篇内容**用 front-matter 覆盖（`mode: docs`），因此同一站点里博客与文档可以共存。

## 设计理念

### 1. 配置化，而不是模板化

主题把"长什么样"完全外化为 `_config.yml` 里的键值，模板只负责"把配置翻译成节点"。配色、圆角、栏数、导航形态、组件开关、字重密度——全部可配，改配置即可，**不需要动 `layout/` 与 `source/css/`**。

### 2. 设计令牌驱动

全站视觉建立在一套 CSS 变量之上：主色、圆角、容器宽度、栏宽、间距、导航高度、六级字号。改一个令牌，全站同步生效：

```yaml
appearance:
  primary: "#4f6bed"   # 链接、按钮、进度条、选中态同步变化
  radius: normal       # sharp / normal / round
```

### 3. 自适应（Adaptive），而不是响应式（Responsive）

传统响应式是"同一套 DOM 靠媒体查询连续缩放"，容易在任何宽度都处于"半桌面半手机"的中间态。XFM 采用**档位跳变**：先识别设备档位（mobile / tablet / desktop），再交付该档专属的布局结构。详见[自适应式响应](/docs/adaptive/)。

### 4. 零第三方依赖

主题自带搜索索引生成器、站点地图生成器、404 生成器、内容增强过滤器与完整 SVG 图标库。**除了 Hexo 核心渲染器，不需要安装任何额外插件**即可获得全量功能。

## 能力全景

| 维度 | 能力 |
| --- | --- |
| 形态 | blog 卡片流 / notes 笔记树 / docs 三栏文档，单篇可覆盖 |
| 外观 | 深浅色三态切换（浅色、深色、跟随系统）、主色自定义、圆角档位、磨砂导航、背景光晕 |
| 导航 | 两级下拉菜单、移动端抽屉、当前项高亮、滚动自动隐藏、RSS 入口 |
| 搜索 | 内置全文检索索引 + `Cmd/Ctrl + K` 唤起 + 键盘导航 + 关键词高亮 |
| 目录 | 侧栏目录件 / 独立目录栏，滚动跟随高亮、自动滚入可见区、移动端折叠面板 |
| 代码块 | 语言标签、Mac 风格三色点、复制按钮、长代码折叠、gutter 行号、深浅色配色 |
| 标签插件 | 提示块、折叠、选项卡、时间轴、栅格、按钮、徽标、图标、流程图、链接卡片 |
| 内容增强 | 标题锚点、表格滚动容器、外链新窗、图片懒加载与灯箱、任务列表、数学公式、Mermaid |
| 评论 | giscus / utterances / waline / twikoo / disqus / disqusjs / valine / 畅言 |
| SEO | OG / Twitter Card、canonical、JSON-LD、内置 sitemap.xml 与 robots.txt、404 页 |
| 阅读体验 | 阅读进度条、返回顶部、平滑滚动、滚动入场动画、文章过时提醒、版权卡、打赏、分享、相关文章 |
| 国际化 | 内置 `zh-CN` / `en`，文案抽离到 `languages/` |
| 交付质量 | 三档自适应、触摸与刘海屏适配、打印样式、动效降级、语义化标签 |

## 架构总览

```text
themes/xfm
├── _config.yml          # 唯一配置入口（全部中文注释）
├── languages/           # i18n：default / zh-CN / en
├── layout/              # EJS 模板
│   ├── layout.ejs       # 三模式外壳分发（栏数、导航、目录形态在这里决定）
│   ├── index / post / page / archive / category / tag / 404
│   └── _partials/       # head / header / footer / sidebar / toc / search …
├── scripts/             # Hexo 扩展：过滤器、生成器、辅助函数、标签插件
└── source/              # 静态资源：css / js / images
```

## 浏览器支持

Chrome / Edge / Firefox / Safari 最近两个大版本。主题使用了 CSS 变量、`backdrop-filter`、`aspect-ratio`、`IntersectionObserver`；旧浏览器会优雅降级（失去磨砂与动画，不影响阅读）。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/install/, 安装与部署, download, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/quick-start/, 5 分钟上手, arrow-right, outline %}
{% endcol %}
{% endrow %}
