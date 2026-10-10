---
title: 核心配置
mode: docs
layout: page
order: 5
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

主题全部配置集中在 `themes/xfm/_config.yml`，站点可用 `theme_config` 覆盖同名键。以下按模块速查常用项。

## 外观 appearance

```yaml
appearance:
  scheme: auto        # light / dark / auto（跟随系统）
  primary: "#4f6bed"  # 主色，作用于链接、按钮、进度条、选中态
  radius: normal      # sharp / normal / round
  glass_navbar: true  # 磨砂玻璃导航栏
  animation: true     # 元素入场动画
  site_title: true    # 导航栏是否显示站点标题
```

## 导航 navbar 与菜单 menu

```yaml
navbar:
  sticky: true        # 固定在顶部
  auto_hide: true     # 滚动时自动隐藏
  height: 64

menu:
  首页:
    path: /
    icon: home
  文档:
    path: /docs/
    icon: file-doc
  更多:
    icon: compass
    children:
      友链:
        path: /links/
        icon: link
```

菜单支持两级：一级为菜单项，二级通过 `children` 定义下拉子菜单；字段 `path` / `icon` / `children` / `external`。

## 首页 index

```yaml
index:
  layout: card         # card / list / grid / classic
  hero: true           # 欢迎语 + 站点数据大卡
  sticky: true         # 是否显示置顶（front-matter sticky: 100）
  excerpt: excerpt     # excerpt / auto / none
  excerpt_length: 140
  cover: true
  alternate_layout: true
```

## 文章页 post

```yaml
post:
  toc: true
  toc_depth: [2, 3, 4]
  breadcrumb: true
  meta: [author, date, updated, categories, wordcount, reading]
  show_updated: true
  wordcount: true
  post_nav: true
  copyright: true
  tags: true
  share: true
  reward: false
  related_posts: true
  related_count: 4
```

## 侧边栏 sidebar（blog 模式）

```yaml
sidebar:
  position: right      # left / right / none
  sticky: true
  widgets: [profile, recent_posts, categories, tagcloud, archive_list]
```

## 搜索与代码块

```yaml
search:
  enable: true         # 生成 search.json 索引
  path: search.json
  index_content: true
  hotkey: true

code_block:
  line_number: true
  language: true
  copy: true
  max_height: -1       # 设为 20 表示超过 20 行自动折叠
  mac_style: true
```

## 评论 comments

支持 `giscus / utterances / waline / twikoo / disqus / disqusjs / changyan / valine`：

```yaml
comments:
  enable: false
  type: giscus
  lazyload: true       # 滚动到评论区再注入
  giscus:
    repo: user/repo
    category: Announcements
    mapping: pathname
```

## 第三方增强 vendors

```yaml
vendors:
  math: katex          # katex / mathjax / none
  mermaid: true
  lightbox: true       # 图片灯箱
  lazyload: true
  external_link: true  # 外链自动 target="_blank"
  content_enhance: true
  rss:                 # 留空自动 /atom.xml
  rss_navbar: true
```

## SEO 与分享

```yaml
seo:
  og_meta: true
  json_ld: true
  canonical: true

share:
  services: [copy, weibo, qq, twitter]
  qrcode: true
```

## 自定义注入 custom

```yaml
custom:
  head: ""             # 注入 <head>
  body_end: ""         # 注入 </body> 前
  css: [custom]        # 加载 /css/custom.css
  js: [custom]         # 加载 /js/custom.js
  post_footer: ""      # 每篇文章底部
```

{% note tip 主色与圆角 %}
改 `appearance.primary` 即可让全站链接、按钮、进度条、选中态同步生效（基于 CSS 变量）；圆角改 `appearance.radius`，三档可选 sharp / normal / round。
{% endnote %}
