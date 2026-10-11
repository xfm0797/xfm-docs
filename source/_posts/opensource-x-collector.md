---
title: 枫铃采集器 x-collector：关键词采集与多平台发布
date: 2026-10-11 21:10:00
categories: [开源项目]
tags: [Tauri, React, Rust, 采集, 内容工具]
description: 基于 Tauri 2 + React 18 + Rust + SQLite 的桌面采集与发布工具，覆盖采集、清洗、伪原创到 Hexo / CMS 发布的全链路。
---

**枫铃采集器（x-collector）** 是一款基于 Tauri 2 + React 18 + Rust + SQLite 的桌面采集与发布工具，把「采集 → 清洗 → 伪原创 → 发布」串成一条流水线。

<!-- more -->

## 流水线能力

| 阶段 | 能力 |
| --- | --- |
| 采集 | 百度 / Google / Bing / 搜狗关键词采集；RSS、单页、sitemap 批量发现；自定义 CSS 选择器 |
| 清洗 | 广告 / 导航 / 侧边栏移除、链接绝对化、GBK 编码识别、HTML → Markdown |
| 伪原创 | 同义词替换（120+ 词库）、句子改写、段落重排、首尾段重写、自定义词库 |
| 反爬 | UA 轮换、完整浏览器请求头、Cookie 携带、随机延迟、指数退避 |
| 去重 | URL 哈希 + 标题相似度（编辑距离 ≥ 85%）+ 内容指纹 |
| 发布 | Hexo 导出、WordPress / Typecho / Z-Blog XML-RPC 自动发布，发布记录追踪 |

## 上手三步

1. 「关键词采集」→ 添加关键词 → 点击采集
2. 「文章库」查看 / 编辑采集结果
3. 「发布管理」→ 选择文章 → 发布到 Hexo 或 CMS

## 技术栈

- **前端**：React 18 · TypeScript · Ant Design 5 · Tailwind CSS 3 · Zustand 4
- **后端**：Rust · Tauri 2 · SQLite（rusqlite）· reqwest · scraper · rust-embed

应用内置帮助中心：8 章用户手册、6 套配置示例与错误码速查，随二进制离线可用。

## 运行

```bash
npm install
npm run tauri dev     # 开发模式
npm run tauri build   # 打包
```

需 Node.js ≥ 18、Rust ≥ 1.80。

{% linkcard https://github.com/xfm0797/x-collector, x-collector 源码仓库, 关键词采集 · 内容清洗 · 伪原创 · 多平台发布 %}
