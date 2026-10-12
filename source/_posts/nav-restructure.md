---
title: 导航栏重构为七项并新增笔记入口
date: 2026-10-11 16:00:00
updated: 2026-10-11 22:00:00
categories: [更新日志]
tags: [Hexo, 导航, 主题]
mode: notes
description: 导航栏调整为「首页 / 归档 / 分类 / 标签 / 文档 / 笔记 / 更多」，新增笔记页，并用站点脚本精确控制菜单顺序。
---

导航栏从「首页 / 文档 / 归档 / 关于」扩展为信息架构更完整的 **七项**，并新增了「笔记」分区入口。

<!-- more -->

## 目标结构

```text
首页 · 归档 · 分类 · 标签 · 文档 · 笔记 · 更多 ▾
                                          ├─ 友链
                                          └─ 关于
```

「更多」在主题里本就支持 `children` 下拉，直接复用。

## 新增笔记入口

「笔记」指向 `/notes/`，新建 `source/notes/index.md` 并设置 `mode: notes`，左侧会渲染按分类归集的笔记树。

## 一个坑：Hexo 合并配置时的键顺序

主题自带一份默认菜单（含「更多」），站点 `theme_config.menu` 会与之合并。问题在于 Hexo 用的是 `deepMerge(theme.config, theme_config)`，**底层保留主题已有的键序，站点新增的键一律追加到末尾** —— 于是「文档 / 笔记」被排到了「更多」之后，顺序错乱。

{% note tip 解决方案：站点脚本重排，不改主题 %}
没有去改主题 submodule（那样不可复现），而是新增站点脚本 `scripts/menu-order.js`：

```javascript
// before_generate 时把 theme.menu 的键重排为期望顺序，
// 未列出的键按原序追加，便于日后扩展。
```

Hexo 会加载站点根目录的 `scripts/`，因此该脚本无需改动主题即可生效。
{% endnote %}

## 校验

- 导航顺序正确：首页 → 归档 → 分类 → 标签 → 文档 → 笔记 → 更多，下拉内为友链 / 关于。
- `/notes/` 渲染 `data-mode="notes"`，笔记侧栏按分类分组。
- 八个导航目标（`/`、`/archives/`、`/categories/`、`/tags/`、`/docs/`、`/notes/`、`/links/`、`/about/`）全部返回 200。
- 构建 **73 files，0 error**。
