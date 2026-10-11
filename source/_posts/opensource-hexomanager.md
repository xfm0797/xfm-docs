---
title: HexoManager：桌面端 Hexo 多站点管理工具
date: 2026-10-11 22:40:00
categories: [开源项目]
tags: [Tauri, React, Rust, 桌面应用, Hexo]
description: 基于 Tauri 2 + React 18 的跨平台桌面应用，把多个 Hexo 站点的写作、构建、部署收敛进一个图形界面。
---

**HexoManager** 是一款基于 Tauri 2.x + React 18 的跨平台桌面应用，用于集中管理本地多个 Hexo 站点，把 `hexo new` / `hexo g` / `hexo d` 这条命令行链路整体搬进图形界面。

<!-- more -->

## 它解决什么问题

传统 Hexo 工作流要在终端里反复敲命令，站点一多就得来回切换目录，还要手工维护各平台的 CI 配置文件。HexoManager 把这些操作收敛到一处：所有站点集中管理、文章可视化编辑、部署配置一键生成、构建发布全流程留痕。

## 核心能力

- **站点管理**：4 步创建向导、导入已有站点、卡片 / 表格双视图、备份与复制
- **文章编辑**：Monaco 编辑器 + Markdown 实时预览、30 秒自动保存、Front Matter 模板一键套用
- **配置管理**：`_config.yml` 可视化表单与原始 YAML 双向编辑，带实时校验与差异对比
- **部署配置**：7 大平台 CI/CD 文件一键生成（含边缘层回源策略），支持构建、提交、推送、部署自动化
- **主题与插件**：主题市场、12 个推荐插件、npm / git 两种安装方式
- **Git 与记录**：改动暂存、提交回滚、部署历史表格与日志抽屉

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 18.3 · TypeScript 5.7 · Vite 5 · Ant Design 5 · Tailwind CSS 3 · Zustand |
| 后端 | Tauri 2.x · Rust · rusqlite（WAL）· tokio · handlebars |
| 编辑器 | Monaco Editor |

数据全部保存在本机 SQLite 中，站点源码始终留在你指定的原始目录，应用不会复制或上传。

## 快速开始

```bash
git clone https://github.com/xfm0797/HexoManager.git
cd HexoManager && npm install
npm run tauri dev      # 开发模式
npm run tauri build    # 打包发布
```

环境需 Node.js 18+、Rust 1.77+、Git 2.30+。

{% linkcard https://github.com/xfm0797/HexoManager, HexoManager 源码仓库, 桌面端 Hexo 多站点管理工具 · MIT %}
