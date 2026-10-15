---
title: 从零造一个 Hexo 主题（五）：从响应式到自适应式响应——为什么我删掉了所有宽度 @media
date: 2026-10-15 13:00:00
updated: 2026-10-15 13:00:00
categories: [主题开发]
tags: [CSS, 响应式, 自适应, 主题开发]
description: 记录把响应式改造成自适应式响应的全过程：先定档再出布局、data-tier 的四级判定链、档位样式生成器、与旧 responsive 配置的兼容，以及无头浏览器实测档位时的 DPI 陷阱。
---

第一版的响应式是标准的 `@media (max-width: 768px)` 三档断点，也能用。但我越用越别扭：**手机和桌面共用一套 DOM，只是缩放，形态差异做不出来。**

具体痛点是：文档模式在手机上需要「侧栏变抽屉」，在平板上需要「侧栏变折叠面板」，在桌面上才是常驻三栏。这三件事用宽度断点写，会变成一堆互相打架的 `@media` 补丁。

于是我改成了自适应式响应（adaptive）：**先识别设备档位，再交付该档专属布局。**

<!-- more -->

## 一、两种思路的本质区别

| | 响应式 Responsive | 自适应 Adaptive |
| --- | --- | --- |
| DOM | 一套 | 一套 |
| 布局 | 随宽度**连续缩放** | 按档位**跳变** |
| 实现 | `@media (max-width: …)` | `html[data-tier="mobile"] { … }` |
| 产物 | 断点写在 CSS 里 | 断点由配置生成，可整档禁用组件 |
| 适合 | 内容型页面、排版微调 | 形态差异大的应用型界面 |

{% note info 一句话概括 %}
响应式回答「多宽」，自适应回答「是什么设备」。三模式主题的形态差异属于后者。
{% endnote %}

改造后的硬约束：**产物里不允许出现宽度 `@media`**（`adaptive.css` 只保留打印样式和 `prefers-reduced-motion`）。这条约束倒逼所有形态判断走档位。

## 二、配置：把档位写进 _config.yml

```yaml
adaptive:
  enable: true
  strategy: adaptive        # adaptive | responsive | fixed
  default_tier: desktop
  remember: false           # 是否记住用户手动切换的档位
  detect:
    width: true
    ua: true                # UA 指纹：iPhone → mobile，iPad → tablet
    touch: false
    dpr: false
    orientation: true
    upgrade_large_screen: true
  tiers:
    mobile:
      max_width: 767
      layout: single
      nav: drawer           # 导航进抽屉
      sidebar: offcanvas    # 侧栏变抽屉
      toc: panel            # 目录变折叠面板
      container_width: 720
      density: compact
      disable: [toc-column] # 整档不渲染的组件
    tablet: { max_width: 1023, layout: single, nav: drawer, sidebar: inline, toc: panel }
    desktop: { layout: multi, nav: inline, sidebar: sticky, toc: inline }
```

`disable` 是我最喜欢的一项：**整档不渲染某个组件**（手机档不渲染右侧目录列）。用 `@media` 只能 `display: none`，而它们是不同的——不渲染意味着连 HTML 都不生成，DOM 更干净。

## 三、定档：四级判定链，同步执行

`adaptive-boot.ejs` 放在 `<head>` 最前面同步执行，顺序是：

```text
URL ?__tier=mobile  →  localStorage(remember)  →  UA 指纹  →  视口宽度  →  default_tier
```

```js
function resolve() {
  if (!CFG.enable) return CFG.default_tier;
  var manual = readManual();                 // URL > localStorage
  if (manual) return manual;
  var byUa = uaTier();                       // UA 指纹
  if (byUa) return byUa;
  return widthTier(window.innerWidth || document.documentElement.clientWidth);
}
```

判定结果写进 `<html>`：

```html
<html lang="zh-CN" data-mode="docs" data-tier="mobile" data-tier-strategy="adaptive"
      data-input="ua" data-dpr="3" data-orientation="portrait">
```

跨档时派发事件，让 JS 侧跟着切形态：

```js
document.documentElement.dispatchEvent(new CustomEvent('xfm:tierchange', {
  detail: { tier: next, prev: prev, input: source }
}));
```

{% note danger 为什么必须同步放在 head 首行 %}
异步或放在 body 末尾，会先按桌面上档渲染再跳变——**用户会看到一帧错版**。这就是「首屏闪烁」最常见的来源，不是性能问题，是执行时机问题。
{% endnote %}

顺带说一个细节：构建期会先把 `default_tier` 写进 `data-tier`，boot 脚本随后纠正为真实档位。这样即使 JS 被禁用，页面也有一个可用的档位样式。

## 四、出样式：配置翻译成档位规则

`adaptive-style.ejs` 在构建期把配置翻译成 CSS，每档一整套令牌：

```css
/* 由 adaptive 配置生成，非手写 */
html[data-tier="desktop"] {
  --gutter: 24px; --gap: 28px; --nav-w: 286px; --toc-w: 244px;
  --widget-w: 292px; --nav-h: 64px; --page-max: 1280px;
  --fs-base: 15px;
}
html[data-tier="tablet"] {
  --gutter: 20px; --gap: 22px; --nav-w: 246px; --toc-w: 0px;
  --fs-base: 14.8px;
}
html[data-tier="mobile"] {
  --gutter: 16px; --gap: 18px; --nav-w: 200px; --widget-w: 0px;
  --nav-h: 46px; --page-max: 720px;
  --fs-base: 14.5px;
}
```

注意 tablet 的 `--toc-w: 0px`：**把宽度变量置零**，比给每个组件写 `display: none` 干净得多。

块里还有形态规则和禁用规则：

```css
html[data-tier="mobile"] .toc-column { display: none !important; }  /* disable: [toc-column] */
html[data-tier="mobile"] .site-nav   { /* offcanvas 定位 + transform 收起 */ }
```

**档位相关的值全部由配置生成，CSS 源文件里不写断点。** 想改手机档的间距，改配置即可，不用碰 CSS。

## 五、唯一来源：xfm_adaptive() helper

档位信息有三个消费方：boot 脚本、样式生成器、`layout.ejs`。如果各自解析一遍配置，迟早不一致。所以做一个 helper 当唯一来源，它负责：

1. 补默认值；
2. **边界纠正**：`mobile.max_width` 必须小于 `tablet.max_width`，用户写反了自动纠正；
3. 变体白名单校验（如 `sidebar: offcanvas | inline | hide`）；
4. 输出组件选择器表，供样式生成器使用。

```ejs
<% const __A = xfm_adaptive(); %>
<html data-tier="<%= __A.default_tier %>" data-tier-strategy="<%= __A.strategy %>">
```

{% note warning 兼容旧配置时的坑 %}
老版本用的是 `responsive:` 配置节。改造时如果无脑做「responsive → adaptive」推导，主题自带的 adaptive 默认值会被旧值覆盖，导致**用户什么都没配却拿到了响应式默认值**。

正确做法是：只有「站点显式写过 responsive」时才启用推导（判断 `hexo.config.theme_config.responsive` 是否存在），否则直接用 adaptive 默认值。

这个坑的本质是：**无法区分「用户显式写的默认值」和「压根没写」**。凡是做配置迁移，都要处理这个二义性。
{% endnote %}

## 六、实测档位时的一个陷阱

我用无头 Chrome 按 UA + 窗口尺寸实测档位，一度以为移动端布局溢出了——**其实是截图伪影**：

- 本机系统 DPI 缩放使 `--screenshot` 的布局视口 = `--window-size × 0.75`。想要 414 视口得传 `--window-size=552,1173`；
- `--dump-dom` 不受这个系数影响，显式传 `--window-size` 就是实际视口；
- 两者语义不同，**不能互相推断**。

判断溢出要用设备宽度而非 `innerWidth`（移动端页面被撑大时 `innerWidth` 会变大，掩盖真实的横向溢出）。

{% note tip 什么时候不该用自适应 %}
如果你的主题只有博客形态、手机和桌面的差异只是「栏数从 2 变 1」，那 `@media` 完全够用，不要为了架构好看引入档位系统。**自适应解决的是「形态差异」，不是「尺寸差异」。**
{% endnote %}

## 系列导航

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[三模式外壳的形态分发](/2026/10/15/series-04-mode-shell/) · 下一篇：[标签插件与内容过滤器](/2026/10/15/series-06-tag-plugins/)
{% endnote %}
