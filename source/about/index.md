---
title: 关于本站
layout: page
date: 2026-10-10 20:00:00
updated: 2026-10-11 22:30:00
description: 关于 XFM开源官方文档 —— 收录 hexo-theme-xfm 与 hexo-theme-xongyi 两套 Hexo 主题的官方技术文档。
---

**XFM开源官方文档** 是 [XFM](https://github.com/xfm0797) 为旗下两套开源 Hexo 主题搭建的官方文档站，沉淀主题的安装、配置、用法与原理，力求与源码保持一致。

## 收录主题

| 主题 | 定位 | 形态 | 仓库 |
| --- | --- | --- | --- |
| **hexo-theme-xfm** | 面向长期写作的综合主题 | 一套代码覆盖 博客 / 笔记 / 文档 三种模式 | [GitHub](https://github.com/xfm0797/hexo-theme-xfm) |
| **hexo-theme-xongyi** | 面向机构官网的通用主题 | 企业 / 政务 / 教育 三套预设 + 12 个首页板块 | [GitHub](https://github.com/xfm0797/hexo-theme-xongyi) |

两套主题的文档分别位于 [/docs/xfm/](/docs/xfm/) 与 [/docs/xongyi/](/docs/xongyi/)，可在左侧文档树中查阅。

## 本站能力

本站自身即运行在 **hexo-theme-xfm** 之上，站点默认形态为 **blog**，文档页则以 **docs** 形态呈现，同一站点内多形态共存：

{% row %}
{% col 4 %}
**三形态共存**
首页 / 归档为博客形态，`/docs/` 为三栏文档形态，`/notes/` 为笔记形态。
{% endcol %}
{% col 4 %}
**全文检索与深色模式**
内置搜索面板（快捷键 `/`），并支持跟随系统的明暗主题切换。
{% endcol %}
{% col 4 %}
**订阅与评论**
提供 Atom 订阅（`/atom.xml`）与基于自建 Waline 的评论系统。
{% endcol %}
{% endrow %}

{% row %}
{% col 4 %}
**编辑此页**
每篇文档底部提供「编辑此页」链接，直达 GitHub 上的 Markdown 源文件。
{% endcol %}
{% col 4 %}
**站点地图**
自动生成 `sitemap.xml` 与 `robots.txt`，便于搜索引擎收录。
{% endcol %}
{% col 4 %}
**文档树交互**
文档侧栏分组默认收起、点击展开，只看当前阅读路径。
{% endcol %}
{% endrow %}

## 文档结构

```
source/docs/
├── index.md            # 文档中心（总入口）
├── xfm/                # hexo-theme-xfm 官方文档
└── xongyi/             # hexo-theme-xongyi 官方文档
```

文档侧栏树由 `source/_data/docs.yml` 定义，按「主题 → 分组 → 页面」组织，新增页面时只需在树中登记对应路径。

{% note info 文档来源 %}
每篇文档均由对应主题仓库的 `README.md`、`_config.yml`、`examples/` 示例配置与主题源码解析整理而成，并随主题版本持续更新。
{% endnote %}

## 技术栈

| 项 | 说明 |
| --- | --- |
| 静态站点 | [Hexo](https://hexo.io) 8 |
| 主题 | [hexo-theme-xfm](https://github.com/xfm0797/hexo-theme-xfm)（以 `git submodule` 引用官方仓库） |
| 评论系统 | [Waline](https://waline.js.org)（自建服务端） |
| 订阅 | `hexo-generator-feed` → `/atom.xml` |
| 站点地图 | `hexo-generator-sitemap` → `sitemap.xml` |

## 更新日志

本站的建设与迭代记录已归档为笔记，可在 [笔记](/notes/) 分区按分类查阅，最近的更新包括主题引用方式调整、站点形态切换、文档迁移与功能完善等。

## 反馈

问题与建议欢迎通过 [GitHub Issues](https://github.com/xfm0797/xfm-docs/issues) 反馈，或发送邮件至 [xfm@xfm.qzz.io](mailto:xfm@xfm.qzz.io)。
