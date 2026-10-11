---
title: hexo-theme-lovou 墨痕：极简现代中文博客主题
date: 2026-10-11 22:10:00
categories: [开源项目]
tags: [Hexo, 主题, 中文排版, 博客]
description: 极简现代风、专为中文博客设计的 Hexo 主题，零外部 JS 依赖、零追踪脚本，内置悬浮目录与 Sveltia CMS。
---

**墨痕（lovou）** 是一款极简现代风、专为中文博客设计的 Hexo 主题。它把重点放在中文排版与阅读体验上，同时保持零外部 JS 依赖、零追踪脚本。

<!-- more -->

## 设计与排版

- 极简现代设计，中文排版优化（系统字体栈、1.9 行高）
- 明 / 暗双主题：默认跟随系统，可手动切换并记忆，无闪烁
- 响应式布局，支持 `prefers-reduced-motion`
- 服务端代码高亮，内置明暗两套配色

## 功能

- 宽屏文章页右侧悬浮目录，sticky 跟随滚动、可折叠
- 字数统计与阅读时长（中英混合计数）
- 归档按年分组、分类页、标签云、上下篇导航、分页
- 卡片式友链页：构建时自动抓取友链站点的 OG 信息
- 文末分享：微信二维码 / 微博 / X / Telegram / 复制链接
- 评论区：Giscus / Waline / Gitalk / Disqus 四选一
- **Sveltia CMS**：浏览器中写文章、传图片，保存即自动发布

## 快速开始

```bash
npm install
npm run server   # 本地预览 http://localhost:4000
npm run build    # 生成到 public/
```

同一份代码可同时部署到 EdgeOne Pages、Cloudflare Pages 与 GitHub Pages，路径由工作流自动适配。

{% linkcard https://github.com/xfm0797/hexo-theme-lovou, hexo-theme-lovou 源码仓库, 极简现代中文博客主题 · 演示站已上线 %}
