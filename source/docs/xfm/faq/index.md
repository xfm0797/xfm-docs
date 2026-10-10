---
title: 常见问题
mode: docs
layout: page
order: 8
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

{% fold 站点首页 / 归档不生成怎么办？ %}
确认站点根目录 `package.json` 含 `"hexo": { "version": "..." }` 字段，且已安装 `hexo-generator-index` / `hexo-generator-archive` / `hexo-generator-category` / `hexo-generator-tag`。Hexo 8 核心不带这些生成器。
{% endfold %}

{% fold 搜索结果为空怎么办？ %}
确认 `search.enable` 为 `true`，执行 `hexo clean` 后重新生成；搜索索引依赖构建时生成的 `search.json`。
{% endfold %}

{% fold 如何自定义主色？ %}
在 `appearance.primary` 中填入十六进制色值即可，全站链接、按钮、进度条、选中态会同步生效。
{% endfold %}

{% fold 如何切换整站为文档模式？ %}
把 `mode` 设为 `docs`，并在 `source/_data/docs.yml` 中定义文档树（或留空让主题按 `order` + `title` 自动生成）。
{% endfold %}

{% fold 评论系统怎么开启？ %}
在 `comments` 中设置 `enable: true` 与 `type`（如 `giscus`），再补齐对应服务商的参数（repo / category 等）。
{% endfold %}

{% fold 代码块行号不显示？ %}
行号同时依赖站点 `_config.yml` 的 `highlight.line_number: true` 与主题的 `code_block.line_number: true`，两者都要打开。
{% endfold %}

{% fold 外链会自动新窗口打开吗？ %}
会。`vendors.external_link: true` 时，正文外链自动追加 `target="_blank" rel="noopener"`。
{% endfold %}

{% fold 如何注入自定义样式或脚本？ %}
使用 `custom.css` / `custom.js` 列出相对 `/css/`、`/js/` 的文件名；也可用 `custom.head` / `custom.body_end` 直接注入 HTML 片段。
{% endfold %}
