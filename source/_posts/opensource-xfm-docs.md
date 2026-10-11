---
title: xfm-docs：XFM 开源官方文档站
date: 2026-10-11 22:00:00
categories: [开源项目]
tags: [Hexo, 文档站, 开源]
description: 收录 hexo-theme-xfm 与 hexo-theme-xongyi 两套主题官方技术文档的站点，由主题 docs 模式驱动、Hexo 8 构建。
---

**xfm-docs** 是 XFM 两套开源 Hexo 主题的官方文档站，收录 `hexo-theme-xfm` 与 `hexo-theme-xongyi` 的完整技术文档，共 **49 篇**。

<!-- more -->

## 站点构成

| 主题 | 定位 | 文档 |
| --- | --- | --- |
| hexo-theme-xfm | 三模式主题（博客 / 笔记 / 文档） | 27 篇 |
| hexo-theme-xongyi | 机构官网通用主题（企业 / 政务 / 教育） | 21 篇 |

整站由 **hexo-theme-xfm 的 docs 模式**驱动，使用 Hexo 8 构建；主题通过 **git submodule** 引用官方仓库 `themes/xfm`，仓库内不存放主题源码。

## 文档侧栏树

侧栏树由 `source/_data/docs.yml` 定义，按主题分区、可递归到三级，并支持点击展开 / 收起、默认折叠：

```yaml
- title: hexo-theme-xfm
  children:
    - title: 快速开始
      children:
        - title: 主题简介
          path: docs/xfm/intro
```

文档页统一采用「目录 + index.md」的组织方式，以产出 pretty URL。

## 站点级补丁

主题以 submodule 引入，所有定制都通过站点层实现，主题升级不冲突：

- `source/css/xfm-docs-tree.css` + `source/js/xfm-docs-tree.js`：文档树分组折叠
- `source/js/xfm-tabs.js`：选项卡切换
- `scripts/pagination-view.js`：统一分页结构

## 本地构建

```bash
git clone --recursive https://github.com/xfm0797/xfm-docs.git
cd xfm-docs && npm install
hexo clean && hexo generate
```

{% linkcard https://github.com/xfm0797/xfm-docs, xfm-docs 源码仓库, XFM 开源官方文档站 · Hexo 8 %}
