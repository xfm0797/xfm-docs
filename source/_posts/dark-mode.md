---
title: 深色模式的实现要点
date: 2026-09-20 14:30:00
categories: [前端]
tags: [CSS, 设计系统]
---

深色模式不是简单地把背景变黑，而是一整套色彩语义的重构。

<!-- more -->

## 三层变量结构

{% note tip 核心思路 %}
所有组件只消费语义变量，不直接写死颜色。
{% endnote %}

```css
:root {
  --c-surface: #ffffff;
  --c-text: #1b1f26;
  --c-border: rgba(17, 24, 39, 0.08);
}

html[data-scheme="dark"] {
  --c-surface: #161b23;
  --c-text: #e6e9ef;
  --c-border: rgba(255, 255, 255, 0.09);
}
```

## 避免闪烁

在 `<head>` 内联一段同步脚本，先于 CSS 落地 `data-scheme`：

```html
<script>
  var dark = matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-scheme', dark ? 'dark' : 'light');
</script>
```

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| localStorage | 尊重用户选择 | 首屏需防闪烁脚本 |
| 跟随系统 | 零配置 | 无法手动覆盖 |
| 双优 | 三态切换 | 实现稍复杂 |
