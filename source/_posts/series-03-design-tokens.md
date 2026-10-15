---
title: 从零造一个 Hexo 主题（三）：设计令牌——一套变量如何撑起深浅色与三模式
date: 2026-10-15 11:00:00
updated: 2026-10-15 11:00:00
categories: [主题开发]
tags: [CSS, 设计系统, 主题开发, 深色模式]
description: 拆解 hexo-theme-xfm 的设计令牌分层：品牌色用 RGB 三元组派生透明度、中性色阶与语义色分离、深色方案只换变量不换组件、阴影与字号的档位跳变。
---

主题写到三分之一时我发现一件事：**只要有一个组件偷偷写了 `#fff`，深色模式就永远修不干净**。你会在深夜里对着某个灰底白字的卡片怀疑人生，而它的兄弟卡片一切正常。

这一篇讲我用「设计令牌」把这类问题一次性解决的思路——不是理论，是这套主题里真正在跑的分层。

<!-- more -->

## 一、令牌分三层，组件只准消费最上面那层

```text
第一层  品牌 / 原始值      --xfm-primary  --xfm-primary-rgb  --xfm-radius
   ↓
第二层  中性色阶 + 语义色  --c-surface  --c-text  --c-success  --c-border
   ↓
第三层  组件               .post-card { background: var(--c-surface) }
```

**规则：组件只准引用第二层（语义层），任何时候都不准写死颜色值或原始数值。**

```css
/* ❌ 违反分层：组件直接引用第一层 */
.tag-cloud a { background: rgba(79, 107, 237, 0.09); }

/* ✅ 消费语义层 */
.tag-cloud a { background: var(--c-primary-bg); }
```

这条规则的价值在改配色时才显现：换品牌色只需要改第一层，改深浅只需要换第二层，组件一行不动。

## 二、品牌色为什么要存两份

```css
:root {
  --xfm-primary: #4f6bed;
  --xfm-primary-rgb: 79, 107, 237;   /* 同一颜色的 RGB 分量 */
}
```

因为 CSS 至今没有「给已有颜色加透明度」的函数（`color-mix()` 兼容性还不够放心）。存了 RGB 三元组，就能派生出一整套透明变体：

```css
--c-primary-bg:   rgba(var(--xfm-primary-rgb), 0.09);  /* 标签底色 */
--c-primary-soft: rgba(var(--xfm-primary-rgb), 0.14);  /* hover 底色 */
--shadow-ring:    0 0 0 3px rgba(var(--xfm-primary-rgb), 0.16); /* 聚焦环 */
```

品牌色由用户在 `_config.yml` 里配置，`head.ejs` 把它注入到 `<head>` 的内联样式里覆盖默认值：

```ejs
<style>:root{ --xfm-primary: <%= primary %>; }</style>
```

{% note tip 一个小技巧 %}
主题里凡是「需要 N 种透明度的颜色」，都应该同时定义 `--x` 和 `--x-rgb`。我在中性色上没这么做（中性色不需要透明度派生），只在品牌色上做了——**规则不必一刀切，按用途决定**。
{% endnote %}

## 三、深色方案：只换变量，不换组件

整套深色模式就是这一块：

```css
html[data-scheme="dark"] {
  --c-bg: #0e1116;
  --c-surface: #161b23;
  --c-surface-alt: #1a202a;
  --c-text: #e6e9ef;
  --c-text-soft: #b6bdc9;
  --c-border: rgba(255, 255, 255, 0.09);
  ...
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.44);
  color-scheme: dark;
}
```

**没有一条针对具体组件的深色规则。** 这就是分层带来的复利：组件的深浅适配成本是零。

三个容易忽略的点：

1. **阴影不是反色，是加重。** 浅色下 `rgba(16,24,40,0.07)`，深色下要变成 `rgba(0,0,0,0.44)`。深色背景上浅色阴影几乎看不见，必须大幅提高不透明度。
2. **边框在深色下要反过来用白色透明。** `--c-border: rgba(255,255,255,0.09)`——深色下用黑色描边只会让元素「消失」。
3. **记得设 `color-scheme`。** 一行 `color-scheme: dark` 能让浏览器原生控件（滚动条、表单、`<select>` 下拉）自动切深色，否则你的表单在深色页上会是一块刺眼的白。

切换动作由 `head.ejs` 里首行同步脚本完成（跟随系统 / 强制浅色 / 强制深色三态），并写 `data-scheme-pref` 记录用户偏好。

## 四、字号与动效也进令牌

```css
--fs-xs: 12px;  --fs-sm: 13px;  --fs-base: 15px;
--fs-md: 16px;  --fs-lg: 18px;  --fs-xl: 22px;
--fs-2xl: 28px; --fs-3xl: 34px;

--lh-base: 1.75;   /* 正文行高：中文需要比拉丁文更松 */
--lh-tight: 1.4;   /* 标题行高 */

--ease: cubic-bezier(0.22, 0.61, 0.36, 1);
--t-fast: 0.16s;  --t-base: 0.26s;  --t-slow: 0.42s;
```

把行高做成令牌的理由：中文正文在 `1.5` 行高下会显得拥挤，而标题用 `1.75` 又太散。分开定义后，改排版不用满文件找数字。

动效令牌的意义更实在——**它让「关闭动画」变成一行配置**：

```css
body.no-animation * { transition: none !important; animation: none !important; }
```

## 五、z-index 必须集中管理

```css
--z-nav: 200;  --z-float: 300;  --z-drawer: 400;
--z-modal: 500; --z-lightbox: 600; --z-toast: 700; --z-progress: 800;
```

看起来很教条，直到我遇到这个 bug：移动端抽屉的遮罩 `z-index: 399` 高于悬浮按钮的 `--z-float: 300`，于是**侧栏打开后悬浮按钮还浮在遮罩上面——看得见、点不着**。

如果有这张层级表，写遮罩时就会先查「我要盖住谁」，而不是随手写一个 `999`。

{% note warning 教训 %}
浮层类组件的 `z-index` 一定从令牌里取，禁止写数字字面量。**「看不见」和「点不着」这两类 bug，八成是层级问题。**
{% endnote %}

## 六、这套分层的边界

设计令牌不是万能的，有两个地方我刻意没用它：

1. **档位相关的间距与栏宽。** 手机档的 gutter 是 16px、桌面是 24px，这是「跳变」而非「换肤」，交给第五篇的自适应档位样式去生成，不写在 `variables.css` 里。
2. **一次性的装饰值。** 只在一个地方用到的数值写成局部变量即可，强行抽成全局令牌反而让文件变得难读。

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[Hexo 8 主题开发的九个坑](/2026/10/15/series-02-hexo8-pitfalls/) · 下一篇：[三模式外壳的形态分发](/2026/10/15/series-04-mode-shell/)
{% endnote %}
