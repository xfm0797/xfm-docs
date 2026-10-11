---
mode: docs

title: 侧边栏与页脚
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 配置 blog 侧边挂件栏的位置与各挂件参数，以及页脚版权、运行时长、统计与备案信息。
keywords: [侧边栏, 挂件, 页脚, 备案, 运行时长, 社交]
order: 14
---

# 侧边栏与页脚

## 侧边栏（Blog 模式）

```yaml
sidebar:
  # 位置: left / right / none
  position: right
  # 是否在大屏 sticky
  sticky: true
  # 挂件列表（按数组顺序渲染）
  widgets:
    - profile
    - recent_posts
    - categories
    - tagcloud
    - archive_list
```

| 配置项 | 说明 |
| --- | --- |
| `position` | `left` 左栏 / `right` 右栏 / `none` 不显示 |
| `sticky` | 桌面档是否吸附（跟随滚动） |
| `widgets` | **数组顺序即渲染顺序** |

{% note info 侧边栏只属于 blog 模式 %}
`sidebar` 配置仅在 `mode: blog` 下生效。notes 与 docs 模式的左栏是文档树 / 笔记树，由各自的分组数据驱动，不受 `sidebar.widgets` 影响。
{% endnote %}

## 挂件列表

### profile 个人资料

```yaml
sidebar:
  profile:
    social: true
```

显示头像、站点标题（或作者名）、标语，以及社交图标。社交图标的数据来自 `social` 配置，见下文。

### recent_posts 最新文章

```yaml
sidebar:
  recent_posts:
    count: 5
```

### categories 分类

```yaml
sidebar:
  categories:
    count: 10
    show_count: true
```

`show_count` 控制是否在分类名后显示文章数。

### tagcloud 标签云

```yaml
sidebar:
  tagcloud:
    count: 30
    colorful: true
```

`colorful: true` 时，标签按文章数量着色，权重越高颜色越深。

### archive_list 归档

```yaml
sidebar:
  archive_list:
    count: 12
    # 折叠方式: monthly / yearly
    type: monthly
```

### toc 目录

把 `toc` 加入 `widgets` 即可在侧栏显示文章目录：

```yaml
sidebar:
  widgets:
    - profile
    - toc
    - recent_posts
```

## 社交账号

```yaml
social:
  github: https://github.com/xfm0797
  email: mailto:hi@example.com
  rss: /atom.xml
```

**键名即图标名**。主题按 `theme.social` 的键逐个查找内置同名图标（`#xfm-i-<键名>`），因此键名必须是图标库中存在的名字：

| 可用键名 | 说明 |
| --- | --- |
| `github` `twitter` `weibo` `qq` `wechat` | 通用社交 |
| `bilibili` `zhihu` `juejin` `youtube` | 国内平台 |
| `facebook` `instagram` `telegram` `whatsapp` `linkedin` `mastodon` | 海外平台 |
| `email` | 建议写 `mailto:you@example.com` |
| `rss` | 站点订阅地址，如 `/atom.xml` |

值为空字符串的项会被自动过滤，不渲染。

`social` 同时用于两个位置：侧边栏 profile 挂件，以及**移动端抽屉底部**（`layout/_partials/header.ejs` 引入）。

## 友链

```yaml
links:
  - name: XFM 主题源码
    url: https://github.com/xfm0797/hexo-theme-xfm
    avatar: /images/avatar.svg
    desc: 高端大气的 Hexo 三模式主题
```

字段：`name`（必填）、`url`（必填）、`avatar`（头像，可省）、`desc`（简介，可省）。

友链渲染在 `type: links` 的独立页面上：

```bash
hexo new page links
```

生成的 `source/links/index.md` 加上 `type`：

```yaml
---
title: 友链
type: links
---
```

## 页脚

```yaml
footer:
  # 是否显示
  enable: true
  # 建站年份（用于 © 2020-2026 格式），留空自动取当前年份
  since:
  # 是否显示站点运行时长
  runtime: false
  # 运行时长起始日期，格式 YYYY-MM-DD
  runtime_start:
  # 是否显示文章 / 字数统计
  statistics: true
  # 自定义页脚内容（HTML 可用），显示在版权行上方
  custom: ""
  # 是否显示备案号
  icp:
  # 是否显示公安备案
  police:
  police_code:
```

### 运行时长

```yaml
footer:
  runtime: true
  runtime_start: 2024-01-01
```

开启后页脚显示一个**每秒刷新**的计时器，格式为 `X 天 X 时 X 分 X 秒`。日期格式必须是 `YYYY-MM-DD`。

### 统计

```yaml
footer:
  statistics: true
```

显示全站文章数与累计字数。字数口径与文章页一致（中日韩按字符、拉丁按单词）。

### 自定义内容

```yaml
footer:
  custom: '<a href="https://beian.miit.gov.cn/">京ICP备xxxxxxxx号</a>'
```

支持任意 HTML，插入在版权行上方。

### 备案信息

```yaml
footer:
  icp: 京ICP备2024000000号
  police: 京公网安备11010502000000号
  police_code: 11010502000000
```

`police` 与 `police_code` 配合使用：显示备案号文本，并链接到公安备案查询页。

{% note warning 页脚统计占用组件开关 %}
页脚的统计区块对应[组件开关](/docs/xfm/adaptive-tiers/#组件开关-disable)中的 `footer_stats` 键，可以在手机档单独隐藏：

```yaml
adaptive:
  tiers:
    mobile:
      disable: [footer_stats]
```
{% endnote %}
