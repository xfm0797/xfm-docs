---
title: 站点初始化：接入远程仓库并上线两套主题文档
date: 2026-10-10 12:00:00
updated: 2026-10-11 22:00:00
categories: [更新日志]
tags: [Hexo, 部署, 文档]
description: 记录本站从初始化、连接远程仓库、配置 docs 模式，到解析并上线两套主题官方文档的完整过程。
---

从零搭建文档站的第一步：初始化 Hexo 站点、接入远程仓库、把主题配置为 **docs 模式**，再把两套主题的官方资料解析成结构化文档发布上线。

<!-- more -->

## 站点初始化

站点基于 Hexo 8，工作目录为 `D:/xfm-work/.xfm-smoke/site`。初始化时确认了三件事：

1. **依赖完整**：站点已装 `hexo-renderer-marked`、`hexo-renderer-ejs` 以及 index / archive / category / tag 生成器，可直接 `hexo generate`。
2. **主题就位**：`themes/xfm` 为 `hexo-theme-xfm`。
3. **构建可复现**：`hexo clean && hexo generate` 通过。

## 连接远程仓库

站点初始化为 Git 仓库并绑定远端：

```bash
git init -b main
git remote add origin https://github.com/xfm0797/xfm-docs.git
```

同时新增 `.gitignore`，排除 `node_modules/`、`public/`、`db.json` 与 `.workbuddy/` 等构建产物与本地数据。

{% note warning Windows 下推送的一个坑 %}
直接 `git push` 会因 Git Credential Manager 交互而挂起被中断。解决办法是禁用交互，走缓存凭证：

```bash
GCM_INTERACTIVE=never GIT_TERMINAL_PROMPT=0 git push origin main
```
{% endnote %}

## 配置 docs 模式

站点以**双重配置**保证运行在 docs 模式：站点 `_config.yml` 的 `theme_config.mode: docs` 与主题 `_config.yml` 的 `mode` 同时设置为 `docs`。产物 HTML 上会带 `data-mode="docs"`，即三栏文档布局。

同时更新了站点标题、描述，并在导航中新增「文档」入口。

## 解析并生成两套主题文档

内容来源为两套主题仓库的权威资料：

| 主题 | 资料来源 |
| --- | --- |
| hexo-theme-xfm | `README.md` + `_config.yml` |
| hexo-theme-xongyi | `README.md` + `_config.yml` + `examples/` 示例配置 |

据此整理出 **17 篇**文档：文档中心 1 篇、`hexo-theme-xfm` 8 篇、`hexo-theme-xongyi` 8 篇。侧栏树 `source/_data/docs.yml` 随之重构为「开始 / hexo-theme-xfm / hexo-theme-xongyi」三段。

## 踩坑与经验

{% fold 文档页为什么必须写成「目录 / index.md」？ %}
一开始把文档写成 `source/docs/xfm/adaptive.md`，构建产物是 `docs/xfm/adaptive.html`，而侧栏链接指向 `/docs/xfm/adaptive/`（pretty URL），两者不匹配导致 404。

**正确写法**是 `source/docs/xfm/adaptive/index.md`（目录 + index.md），这样才会产出 pretty URL。这条经验后来成为本站文档目录的硬性约定。
{% endfold %}

## 结果

- 首次提交 101 个文件，已推送 `main`。
- `hexo clean && hexo generate` → **53 files，0 error**。
- 侧栏树、激活态、上下篇导航、标签插件（note / tabs / row / mermaid）均正常渲染。

下一篇将记录：**站点更名与主题引用方式的调整**。
