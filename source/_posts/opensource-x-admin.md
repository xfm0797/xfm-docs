---
title: X-admin：动静分离的轻量级 PHP CMS
date: 2026-10-11 21:40:00
categories: [开源项目]
tags: [PHP, CMS, SQLite, 静态化]
description: 后台 PHP 动态管理内容，前端由 Nginx/Apache 直接输出静态 HTML 的轻量级内容管理系统，单文件数据库零配置。
---

**X-admin** 是一套开源、免费、可自由修改分发的轻量级 CMS，核心设计理念是**动静分离**：后台使用 PHP 动态管理内容，前端由 Nginx / Apache 直接输出静态 HTML，完全不经过 PHP。

<!-- more -->

## 设计取舍

| 维度 | 做法 |
| --- | --- |
| 数据 | 单文件 SQLite 数据库，零配置，上传即用 |
| 前端 | 纯静态 HTML 直出，访问不经过 PHP |
| 模板 | 原生 PHP 模板引擎，支持多主题切换 |
| 扩展 | 钩子系统，支持插件化功能扩展 |
| 生成 | 智能增量：发布 / 更新 / 删除时只重建受影响的页面 |
| 搜索 | 前端 JS 加载索引文件做全文检索，无需 PHP |

## 产物结构

静态文件按语义分目录输出：`index.html`、`article/{slug}.html`、`category/{slug}.html`、`tag/{slug}.html`、`page/{slug}.html`，另有 `search-index.json`、`rss.xml`、`sitemap.xml`、`robots.txt`。

后台与数据库收在 `x-admin/` 子目录，与静态产物完全隔离。

## 部署

- **Apache / Nginx**：站点根指向项目根，静态直出；代码目录单独做访问限制
- **最简部署**：无需 Rewrite 规则也能跑
- **GitHub Pages**：附带 `deploy.yml`，用 CLI 构建脚本产出 `dist/` 后自动发布

{% linkcard https://github.com/xfm0797/X-admin, X-admin 源码仓库, 动静分离轻量级 PHP CMS · MIT %}
