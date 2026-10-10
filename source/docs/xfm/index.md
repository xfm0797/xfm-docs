---
title: 主题简介
mode: docs
layout: page
order: 1
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

**hexo-theme-xfm** 是一套面向长期写作的高端 Hexo 主题。它用同一套代码覆盖 **博客 / 笔记 / 文档** 三种形态，全套设计令牌驱动、深浅色对称，几乎所有的形态差异都由 `_config.yml` 决定，无需改动模板。

## 设计原则

- **克制**：不堆砌特效，让内容成为主角
- **一致**：全套设计令牌驱动，浅色与深色对称
- **可配置**：绝大多数形态由 `_config.yml` 决定，改配置即可换形态

## 特性总览

| 维度 | 能力 |
| --- | --- |
| 形态 | blog 卡片流 / notes 笔记树 / docs 三栏文档 |
| 外观 | 深浅色三态切换、主色自定义、圆角档位、磨砂导航、背景光晕 |
| 导航 | 两级下拉菜单、移动端抽屉、当前项高亮、滚动自动隐藏、RSS 入口 |
| 搜索 | 内置全文检索索引 + `Cmd/Ctrl+K` 唤起 + 键盘导航 + 关键词高亮 |
| 目录 | 侧栏目录件 / 独立目录栏，滚动跟随高亮、自动滚入可见区 |
| 代码块 | 语言标签、Mac 风格三色点、复制按钮、长代码折叠、行号、自研深浅色配色 |
| 标签插件 | 提示块、折叠、选项卡、时间轴、栅格、按钮、徽标、图标、流程图、链接卡片 |
| 内容增强 | 标题锚点、表格滚动容器、外链新窗、图片懒加载与灯箱、任务列表、数学公式、Mermaid |
| 评论 | giscus / utterances / waline / twikoo / disqus / disqusjs / valine / 畅言 |
| SEO | OG / Twitter Card、canonical、JSON-LD、内置 sitemap.xml 与 robots.txt、404 页 |
| 阅读体验 | 阅读进度条、返回顶部、平滑滚动、入场动画、文章过时提醒、版权卡、打赏、分享、相关文章 |
| 国际化 | 内置 zh-CN / en，文案抽离到 `languages/` |
| 交付质量 | 自适应三档、触摸与刘海屏适配、打印样式、动效降级、语义化标签 |

## 三种模式

在主题 `_config.yml` 顶部一处配置即可切换整站形态：

```yaml
mode: blog    # blog / notes / docs
```

| 模式 | 形态 | 适用场景 |
| --- | --- | --- |
| `blog` | 首页 Hero + 文章卡片流 + 右侧挂件栏 | 个人博客 |
| `notes` | 左侧笔记树（按分类 / 日期分组）+ 沉浸式窄栏阅读 | 知识库 / 笔记 |
| `docs` | 左侧文档树 + 正文 + 右侧目录的三栏布局 | 产品文档 |

单篇文章可通过 front-matter 覆盖整站模式，例如 `mode: docs`。

## 形态如何决定

主题的形态由「站点配置 → 主题配置 → 页面覆盖」三级决定：

{% mermaid %}
graph LR
  A[site _config.yml] --> B[themes/xfm/_config.yml]
  B --> C{theme.mode}
  C -->|blog| D[卡片流 + 挂件栏]
  C -->|notes| E[笔记树 + 窄栏]
  C -->|docs| F[文档树 + 正文 + 目录]
  G[page front-matter<br>mode] -.覆盖.-> C
{% endmermaid %}

{% note tip 优先级 %}
站点 `_config.yml` 的 `theme_config` 会覆盖主题自带 `_config.yml` 的同名键；页面 front-matter 的 `mode` 又优先于两者。因此可以「整站 docs、个别页面 notes」。
{% endnote %}
