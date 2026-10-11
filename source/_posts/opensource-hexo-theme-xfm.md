---
title: hexo-theme-xfm：覆盖博客 / 笔记 / 文档的三模式主题
date: 2026-10-11 22:30:00
categories: [开源项目]
tags: [Hexo, 主题, 前端, EJS]
description: 高端大气的 Hexo 主题，一套代码切换 blog / notes / docs 三种形态，全站由设计令牌与配置驱动。
---

**hexo-theme-xfm** 是一套面向长期写作的 Hexo 主题：全套设计令牌驱动、深浅色对称、三模式切换，几乎所有形态都由配置决定，无需改动模板。

<!-- more -->

## 三种形态，一套代码

| 模式 | 布局 |
| --- | --- |
| `blog` | 卡片流 + 侧边挂件 |
| `notes` | 笔记树 + 沉浸阅读 |
| `docs` | 文档树 + 正文 + 目录三栏 |

手机档自动转为单栏，笔记 / 文档的左侧栏收起为抽屉，目录折叠为面板。

## 核心亮点

- **外观**：深浅色三态（浅色 / 深色 / 跟随系统）、主色自定义、圆角档位、磨砂导航、背景光晕
- **搜索**：内置全文检索索引，Cmd / Ctrl + K 唤起，支持键盘导航与关键词高亮
- **代码块**：语言标签、Mac 三色点、复制按钮、长代码折叠、行号与自研配色
- **标签插件**：提示块、折叠、选项卡、时间轴、栅格、按钮、徽标、图标、流程图、链接卡片
- **内容增强**：标题锚点、外链新窗、图片懒加载与灯箱、数学公式、Mermaid
- **评论**：giscus / utterances / waline / twikoo / disqus / valine 等八种任选
- **SEO**：OG / Twitter Card、canonical、JSON-LD、内置 sitemap.xml 与 robots.txt

## 安装

```bash
npm i hexo-theme-xfm
# 或跟随仓库最新提交
git clone https://github.com/xfm0797/hexo-theme-xfm.git themes/xfm
```

本站即以该主题的 `docs` 模式驱动。

{% linkcard https://github.com/xfm0797/hexo-theme-xfm, hexo-theme-xfm 源码仓库, 高端大气的 Hexo 三模式主题 · MIT %}
