---
title: hexo-theme-xfm 主题文档
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: hexo-theme-xfm 官方文档 —— 一套代码同时覆盖博客、笔记、文档三种形态。
keywords: [Hexo 主题, XFM, 文档, 博客, 笔记]
order: 0
mode: docs
---

# hexo-theme-xfm 主题文档

**XFM** 是一套面向长期写作的 Hexo 主题：**一套代码同时覆盖博客（blog）、笔记（notes）、文档（docs）三种形态**，全程由配置与设计令牌驱动，无需改动模板。

本手册即使用 XFM 的 **docs 模式** 编写，你正在阅读的这套三栏界面（文档树 + 正文 + 目录）本身就是主题的产出。

{% note info %}
本页是 **hexo-theme-xfm** 文档分区的入口（位于 `/docs/xfm/`）。左侧文档树由站点根目录的 `source/_data/docs.yml` 驱动，每一篇文档都是一个独立的 Hexo 页面（`source/docs/xfm/<slug>/index.md`）。
{% endnote %}

## 从哪儿开始

{% row %}
{% col %}
{% note success %}
**第一次用？**
先看 [主题简介](/docs/xfm/intro/) 与 [5 分钟上手](/docs/xfm/quick-start/)，十分钟内跑起你的第一个 XFM 站点。
{% endnote %}
{% endcol %}
{% col %}
{% note info %}
**要改外观/配置？**
直接翻 [配置参考](/docs/xfm/config/)，所有形态都由 `_config.yml` 决定。
{% endnote %}
{% endcol %}
{% endrow %}

## 文档结构

{% row %}
{% col %}
- [快速开始](/docs/xfm/intro/) —— 简介、安装、上手
- [配置参考](/docs/xfm/config/) —— 外观、导航、首页、侧栏
- [三种模式](/docs/xfm/mode-blog/) —— blog / notes / docs
{% endcol %}
{% col %}
- [自适应式响应](/docs/xfm/adaptive/) —— 三档而非响应式
- [标签插件](/docs/xfm/tags/) —— note / tabs / mermaid …
- [扩展能力](/docs/xfm/search/) —— 搜索、评论、SEO
{% endcol %}
{% col %}
- [定制与进阶](/docs/xfm/customize/) —— 注入、front-matter、API
- [帮助](/docs/xfm/faq/) —— 常见问题与故障排查
{% endcol %}
{% endrow %}

## 核心特性速览

{% timeline %}
{% event 一套代码三形态 %}
blog 卡片流、notes 笔记树、docs 三栏文档站，切换只改一个配置项 `mode`。
{% endevent %}
{% event 自适应（Adaptive）而非响应式 %}
先 `<head>` 同步定档（mobile / tablet / desktop），再按档生成样式，杜绝布局抖动与首屏闪白。
{% endevent %}
{% event 富标签插件 %}
内置 note、fold、tabs、timeline、row/col、button、mermaid、linkcard 等，写作即排版。
{% endevent %}
{% event 零构建增强 %}
搜索、站点地图、404、评论懒加载、代码块工具条全部内置，开箱即用。
{% endevent %}
{% endtimeline %}

## 本页用途说明

{% fold 为什么这页不在左侧文档树的翻页序列里？ %}
`/docs/xfm/` 是 **hexo-theme-xfm** 文档分区的**落地页**，它本身不在 `source/_data/docs.yml` 的节点列表中，因此不会出现在「上一页 / 下一页」翻页序列里。文档树里的节点才是可翻页的正文章节。
{% endfold %}

{% button #, 返回顶部, arrow-up, fill %}

> 文档仍在持续完善。若发现错误或有建议，欢迎通过站点页脚的评论区反馈。
