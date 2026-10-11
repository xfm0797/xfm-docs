---
title: x-site：跨平台静态博客桌面客户端
date: 2026-10-11 21:20:00
categories: [开源项目]
tags: [Tauri, Vue, Rust, 桌面应用, 静态站点]
description: 基于 Tauri v2 + Vue 3 + Rust 的类 Gridea 静态博客客户端，安装包小于 15MB，内置编辑器、站点生成、主题与一键部署。
---

**x-site** 是一款类 Gridea 的跨平台静态博客桌面客户端，基于 **Tauri v2 + Vue 3 + TypeScript + Rust** 构建。安装包小于 15MB，启动快、内存占用低，支持 Windows / macOS / Linux。

<!-- more -->

## 内容管理

- 文章增删改查，草稿与已发布双状态
- CodeMirror 6 编辑器 + markdown-it 实时预览 + highlight.js 高亮
- 编辑停顿 1 秒防抖写入 SQLite，状态栏显示保存状态
- 从系统拖入图片自动复制到资源目录并插入相对路径
- 元数据面板：标题、Slug、分类、标签、封面、发布状态

## 站点生成（纯 Rust 实现）

| 环节 | 选型 |
| --- | --- |
| 模板 | Tera（支持继承、变量、过滤器） |
| Markdown | pulldown-cmark（表格 / 脚注 / 任务列表） |
| 高亮 | syntect，内嵌 base16-ocean.dark |
| 并发 | rayon 多文章并行渲染，进度经 Tauri 事件推送 |

产物覆盖首页分页、文章页、归档页、标签页、分类页、友链页，以及 `sitemap.xml` / `feed.xml` / `robots.txt`。

## 主题与部署

主题为约定式目录结构（`theme.json` + 若干 `.tera` + `assets/`），支持一键激活与 **ZIP 导入**。部署支持 **Local Copy** 与 **Git Push**（可指定分支推送到 GitHub Pages 或任意仓库），本地预览由 Rust 端 `axum` 提供静态服务。应用内置自动更新（签名校验 + CI 发布）。

{% linkcard https://github.com/xfm0797/x-site, x-site 源码仓库, 跨平台静态博客桌面客户端 · v0.1.0 %}
