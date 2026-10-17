---
title: 前端性能：把 Core Web Vitals 拆成可执行的动作
date: 2026-10-17 13:00:00
updated: 2026-10-17 13:00:00
categories: [前端]
tags: [性能, 浏览器, 工程化]
description: 不讲概念，只讲每个指标对应哪一类具体问题、怎么测、以及最有效的那几个修复动作。附静态站点（Hexo 这类）的针对性清单。
---

Core Web Vitals 的三个指标看着抽象，但它们各自对应一类**非常具体**的用户体验问题。把映射关系搞清楚，优化就有明确的着力点，不用再对着分数瞎猜。

<!-- more -->

## 一、三个指标各对应什么

| 指标 | 全称 | 回答的问题 | 良好阈值 |
| --- | --- | --- | --- |
| **LCP** | Largest Contentful Paint | 主要内容**什么时候出现** | ≤ 2.5s |
| **INP** | Interaction to Next Paint | 点了之后**多久有反应** | ≤ 200ms |
| **CLS** | Cumulative Layout Shift | 页面**有没有乱跳** | ≤ 0.1 |

{% note info INP 已取代 FID %}
旧的 FID 只测量「首次输入的延迟」，INP 测量**所有交互**中较慢的那一批。这意味着只优化首屏已经不够了——页面上任何一个卡顿的按钮都会拉低分数。
{% endnote %}

## 二、LCP：内容出得慢

LCP 元素通常是**首屏最大的图片或文本块**。先确定它是谁：

```js
new PerformanceObserver(list => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1];
  console.log('LCP 元素：', last.element, last.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

### 最有效的四个动作

{% timeline %}
{% event 一 %}
**别让图片成为 LCP 元素**——首屏主图用 `<img>` 且不加 `loading="lazy"`（懒加载会推迟 LCP），并加 `fetchpriority="high"`。
{% endevent %}
{% event 二 %}
**消除渲染阻塞资源**——CSS 里 `@import`、同步 `<script>` 都会推迟首屏。关键 CSS 内联，其余异步。
{% endevent %}
{% event 三 %}
**服务端响应要快**——静态站点天生占优；动态站要看 TTFB。CDN 是最直接的手段。
{% endevent %}
{% event 四 %}
**字体不要阻塞文本**——`font-display: swap` 让文字先用系统字体显示，避免"白屏等字体"。
{% endevent %}
{% endtimeline %}

```html
<link rel="preload" as="image" href="hero.jpg" fetchpriority="high">
```

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  font-display: swap;   /* 关键 */
}
```

## 三、INP：点了没反应

INP 差的原因几乎总是同一个：**主线程被长任务占满**。

一个任务超过 50ms 就被认定为"长任务"。用户点击时主线程正在跑一个 300ms 的任务，就得等它跑完。

### 诊断

```js
new PerformanceObserver(list => {
  list.getEntries().forEach(e => {
    if (e.duration > 50) console.warn('长任务：', e.duration, e.name);
  });
}).observe({ type: 'longtask', buffered: true });
```

### 三类修复

{% row %}
{% col %}
**切分长任务**

把一个大循环切成小块，中间让出主线程：

```js
async function processAll(items) {
  for (const item of items) {
    process(item);
    if (index % 50 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
```
{% endcol %}
{% col %}
**减少事件里的同步工作**

点击回调里不要做重计算。能延后的用 `requestIdleCallback`，能缓存的先缓存。

表单校验这类"每次输入都跑"的逻辑一定要**防抖**。
{% endcol %}
{% endrow %}

{% note danger 最常见的元凶：第三方脚本 %}
统计、广告、客服插件是长任务的主要来源。它们通常同步加载、体积不小、你还改不动它们的实现。

对策：`async` / `defer` 加载、按需加载（滚动到才加载评论区）、以及**定期审视是否还需要**。
{% endnote %}

## 四、CLS：页面乱跳

布局偏移几乎全部来自**尺寸未知的内容后来才确定**：

| 原因 | 修法 |
| --- | --- |
| 图片没写尺寸 | `width` / `height` 属性或 CSS `aspect-ratio` |
| 字体加载后文字重排 | `font-display: optional` 或预加载字体 |
| 广告/嵌入内容动态插入 | 预留固定高度的容器 |
| 异步数据渲染 | 骨架屏占位，且骨架尺寸与真实内容一致 |

```css
img { aspect-ratio: 16 / 9; height: auto; }
.ad-slot { min-height: 250px; }   /* 广告位预留 */
```

{% note warning 骨架屏本身也会造成 CLS %}
如果骨架屏的高度和真实内容差很多，替换那一刻依然会跳。**骨架屏要照着真实内容的尺寸做**，不然只是把偏移延后了。
{% endnote %}

## 五、怎么测：实验室数据 vs 真实数据

{% row %}
{% col %}
**实验室数据（Lab）**

Lighthouse、PageSpeed Insights 的"分析"部分。

- 优点：立刻可得、可复现、能定位具体元素
- 缺点：**是模拟环境**，不代表用户真实体验
{% endcol %}
{% col %}
**真实数据（Field）**

Chrome 用户体验报告（CrUX）、自己的 RUM 上报。

- 优点：真实用户、真实网络与设备
- 缺点：需要累积数据，定位具体问题较难
{% endcol %}
{% endrow %}

{% note tip 正确顺序 %}
用**实验室数据定位问题**（它告诉你哪个元素是 LCP、哪个任务是长任务），用**真实数据验证效果**（分数是否真的改善了）。

只看 Lighthouse 分数容易陷入"本地跑 100 分但用户还是说慢"的困境——因为你的设备比用户的好太多。
{% endnote %}

## 六、静态站点的针对性清单

本站是 Hexo 生成的纯静态站，这类站点的性能瓶颈很集中，按性价比排序：

1. **图片**：这是静态站最大的变量。压缩（WebP/AVIF）、写尺寸、首屏不懒加载。
2. **字体**：中文字体动辄几 MB，不要全量引入。用系统字体栈是最优解：
   ```css
   font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
   ```
3. **第三方脚本**：评论区、统计、广告——它们是静态站里唯一"动态"的部分，也是唯一会拖慢交互的部分。延迟加载或按需加载。
4. **CSS/JS 体积**：静态站通常天生就小，优先度最低。别在这上面花时间做微优化。

{% fold 一个容易忽略的点 %}
**构建产物里不要有未压缩的资源。** 有些主题的 `source/` 里放了未经压缩的图片或完整版 JS 库（而不是 min 版本），构建时原样拷贝进 `public/`。

检查方法：看 `public/` 目录里有没有几百 KB 以上的单个文件。静态站的 HTML 通常只有几十 KB，异常大的文件一眼就能看出来。
{% endfold %}

## 七、别做的事

- **不要为了分数做视觉妥协**：延迟加载首屏图片会让 LCP 数字更好看，但用户看到的是空白。
- **不要堆 `will-change` 和 `transform: translateZ(0)`**：强制提升合成层会增加内存，得不偿失。
- **不要只看首页**：分类页、文章页、移动端各测一遍。本站文档页和文章页的资源结构完全不同。

{% note tip 相关阅读 %}
[IntersectionObserver：滚动动效与懒加载的正确写法](/2026/10/17/fe-intersection-observer/) · [动画性能：为什么有的动画卡有的不卡](/2026/10/17/fe-animation-performance/) · [CommonJS 与 ESM：一次 require 报错背后的模块之争](/2026/10/17/fe-js-modules/)
{% endnote %}
