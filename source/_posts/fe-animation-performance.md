---
title: 动画性能：为什么有的动画卡有的不卡
date: 2026-10-17 12:00:00
updated: 2026-10-17 12:00:00
categories: [前端]
tags: [CSS, 性能, 动画]
description: 从浏览器的渲染流水线出发解释为什么改 width 会卡而改 transform 不卡，给出可动画属性的安全清单、will-change 的正确用法、FLIP 技巧与减弱动效的无障碍兜底。
---

两个看起来差不多的动画，一个丝滑一个掉帧。差别不在代码写得漂不漂亮，而在**它们触发了渲染流水线的哪几步**。

理解这一条，写动画时就不会再靠试。

<!-- more -->

## 一、渲染流水线的五步

浏览器把一帧画出来要走：

```text
JavaScript  →  Style（计算样式）  →  Layout（布局）  →  Paint（绘制）  →  Composite（合成）
```

关键在于：**不同属性触发的步骤不同，越靠前代价越大**。

| 改的属性 | 触发到哪一步 | 代价 |
| --- | --- | --- |
| `width` `height` `top` `left` `margin` | Layout + Paint + Composite | **最贵**，会引发整片重排 |
| `background` `color` `box-shadow` `border-radius` | Paint + Composite | 中等 |
| `transform` `opacity` `filter` | **只有 Composite** | **最便宜** |

{% note danger 核心结论 %}
只改 `transform` 和 `opacity` 的动画，可以完全跳过 Layout 和 Paint，直接在合成线程上完成——**哪怕主线程正忙，动画也不会卡**。

这就是为什么"位移"要用 `transform: translateX()` 而不是 `left`。
{% endnote %}

## 二、把「改 left」改成「改 transform」

```css
/* ❌ 每帧都触发重排 */
.box { position: absolute; left: 0; transition: left .3s; }
.box.is-open { left: 300px; }

/* ✅ 只在合成层上位移 */
.box { position: absolute; left: 0; transition: transform .3s; }
.box.is-open { transform: translateX(300px); }
```

两者视觉效果完全一样，性能差一个数量级。

{% fold 为什么 left 会触发 Layout %}
`left` 是布局属性，改变它会让元素脱离原来的位置计算，浏览器必须重新算**它可能影响的其它元素**的位置——这是递归的，代价随页面复杂度增长。

而 `transform` 发生在布局之后：布局结果（一个矩形）已经确定，transform 只是在最终合成时对这个矩形做一次矩阵变换，不影响任何其它元素。
{% endfold %}

## 三、常用动画属性的安全清单

{% row %}
{% col %}
**安全（仅合成）**

- `transform`（translate / scale / rotate）
- `opacity`
- `filter`（部分场景）

优先用这些，能解决 90% 的需求。
{% endcol %}
{% col %}
**谨慎（触发 Paint）**

- `background-color`、`color`
- `box-shadow`
- `border-radius`
- `border-color`

小面积、非连续变化时可以用。
{% endcol %}
{% endrow %}

{% note warning `box-shadow` 特别贵 %}
阴影的绘制成本随模糊半径和元素面积增长。给一个大卡片做 `box-shadow` 的过渡动画，在中低端手机上很容易掉帧。

替代方案：用两个叠加的元素，动画时只改上层伪元素的 `opacity`。
{% endnote %}

## 四、`will-change` 别乱加

```css
.card { will-change: transform; }
```

它的作用是**提前告诉浏览器"这个元素要动了"，让它先准备好合成层**。听起来应该到处加，实际相反：

{% timeline %}
{% event 别加在太多元素上 %}
每个 `will-change` 元素都可能被提升为独立合成层，而**合成层消耗显存**。几十个层会让内存占用飙升，反而变慢。
{% endevent %}
{% event 别一直挂着 %}
它是"即将变化"的提示，不是"一直会变"。动画结束后应该移除。
{% endevent %}
{% event 正确用法 %}
在交互开始前加（如 `mouseenter`），结束后移除；或者只在真正频繁动画的少量元素上常驻。
{% endevent %}
{% endtimeline %}

```js
el.addEventListener('mouseenter', () => { el.style.willChange = 'transform'; });
el.addEventListener('transitionend', () => { el.style.willChange = 'auto'; });
```

## 五、FLIP：让"改布局"也能丝滑

有些动画必须改布局（元素从列表的一处移到另一处）。FLIP 技巧把它转成 transform：

```js
// First：记录起始位置
const first = el.getBoundingClientRect();

// Last：执行布局变更（比如改变了 DOM 顺序或 class）
list.appendChild(el);
const last = el.getBoundingClientRect();

// Invert：用 transform 把它"拉回"起始位置（视觉上没变）
const dx = first.left - last.left;
const dy = first.top - last.top;
el.style.transition = 'none';
el.style.transform = `translate(${dx}px, ${dy}px)`;

// Play：下一帧清除 transform，让它动画到新位置
requestAnimationFrame(() => {
  el.style.transition = 'transform .3s ease';
  el.style.transform = '';
});
```

{% note info 思路 %}
**先跳到终点，再用 transform 假装还在起点，然后播放归零动画。** 布局只计算了一次（而不是每帧），动画全程只走合成。
{% endnote %}

## 六、必须做的无障碍兜底

有些用户开启了「减弱动效」（前庭功能障碍患者会因动效产生眩晕）。尊重这个偏好是硬性要求：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

{% fold 为什么要写成这样 %}
不是简单粗暴地 `display: none`（那会让依赖动画显示的元素永不出现），而是**把时长压到接近 0**——元素依然会到达终态，只是没有过程。

`scroll-behavior: auto` 是额外的：平滑滚动对这类用户同样不友好。
{% endfold %}

## 七、排查掉帧的实用方法

1. **DevTools → Performance** 录制，看 Frames 轨道有没有红色长帧；
2. 打开 **Rendering → Paint flashing**，动画时如果大面积绿色闪烁，说明在触发 Paint（不该有）；
3. 打开 **Layer borders** 看合成层数量是否失控；
4. 移动端用**真机 + 低端设备**测——桌面上 60fps 的动画在千元机上可能是 30fps。

{% note tip 相关阅读 %}
[IntersectionObserver：滚动动效与懒加载的正确写法](/2026/10/17/fe-intersection-observer/) · [前端性能：把 Core Web Vitals 拆成可执行的动作](/2026/10/17/fe-core-web-vitals/) · [加载与反馈：骨架屏、微交互与等待设计](/2026/10/17/design-loading-feedback/)
{% endnote %}
