---
mode: docs

title: 5 分钟上手
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 从零到跑通一个 docs 模式文档站的最短路径。
keywords: [快速开始, 上手, docs 模式]
order: 3
---

# 5 分钟上手

这一页用最短路径跑通一个 docs 模式站点。假设你已经装好主题（见[安装与部署](/docs/install/)）。

## 第 1 步：切换模式

编辑 `themes/xfm/_config.yml`：

```yaml
mode: docs
```

## 第 2 步：配置站点信息

编辑站点根目录 `_config.yml`：

```yaml
title: 我的产品文档
subtitle: 稳定版 v1.0
author: 你的名字
url: https://docs.example.com
language: zh-CN
```

再回到 `themes/xfm/_config.yml` 配置品牌与外观：

```yaml
logo:
tagline: 面向开发者的产品手册
avatar: /images/avatar.svg
favicon: /images/favicon.svg

appearance:
  scheme: auto
  primary: "#4f6bed"
  radius: normal
  glass_navbar: true
```

## 第 3 步：写第一篇文档

创建 `source/docs/getting-started/index.md`：

```markdown
---
title: 快速上手
order: 1
---

# 快速上手

这里写你的第一篇文档内容。
```

{% note info 目录名即 URL %}
文件放在 `source/docs/getting-started/index.md`，访问路径就是 `/docs/getting-started/`。侧边栏 `path` 必须与此严格对应。
{% endnote %}

## 第 4 步：定义文档侧边栏

创建 `source/_data/docs.yml`：

```yaml
- title: 入门
  children:
    - title: 快速上手
      path: /docs/getting-started/
```

**不做这一步也能跑**：当 `_data/docs.yml` 不存在时，主题会自动扫描所有页面，按 `order` 加 `title` 排序生成侧边栏。只是自动生成的树是扁平的，正式文档建议显式定义。

## 第 5 步：预览

```bash
hexo clean && hexo s
```

打开 `http://localhost:4000/docs/getting-started/`，你会看到三栏布局：左侧文档树、中间正文、右侧目录。

## 接下来做什么

{% row %}
{% col 4 %}
**配置全站**
[配置总览](/docs/config/) 逐项说明 `_config.yml`。
{% endcol %}
{% col 4 %}
**丰富内容**
[标签插件](/docs/tags/) 提供提示块、选项卡、时间轴等扩展语法。
{% endcol %}
{% col 4 %}
**调整响应**
[三档配置](/docs/adaptive-tiers/) 定制手机 / 平板 / 桌面表现。
{% endcol %}
{% endrow %}

## 一个典型的最小配置

把下面这段贴进 `themes/xfm/_config.yml`，就是一个可用的文档站起点：

```yaml
mode: docs

appearance:
  scheme: auto
  primary: "#4f6bed"
  radius: normal

navbar:
  enable: true
  sticky: true
  auto_hide: true

menu:
  首页:
    path: /
    icon: home
  文档:
    path: /docs/
    icon: file-doc
  归档:
    path: /archives/
    icon: archive

docs:
  data_file: docs
  expanded: true
  auto_expand: true
  page_nav: true
  last_modified: true
  toc: true

search:
  enable: true
  hotkey: true

post:
  toc: true
  toc_depth: [1, 2, 3]

footer:
  enable: true
  statistics: true
```
