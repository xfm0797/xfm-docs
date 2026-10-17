---
title: CSS Grid 实战：minmax、auto-fill 与区域命名
date: 2026-10-17 10:00:00
updated: 2026-10-17 10:00:00
categories: [前端]
tags: [CSS, 布局, Grid]
description: 不背 API，只讲 Grid 在真实项目里最有用的四件事：minmax 为什么必须配 minmax(0,1fr)、auto-fill 与 auto-fit 的差异、区域命名怎么让响应式少写一半代码、子网格解决什么痛点。
---

Grid 的文档很长，但真正在项目里反复用到的就那么几处。我把最有用的四个点连同它们对应的坑写在这里——每个坑我都亲自趟过。

<!-- more -->

## 一、`1fr` 会让内容撑破网格，要用 `minmax(0, 1fr)`

这是 Grid 最高频的坑。看这段代码：

```css
.grid { display: grid; grid-template-columns: 1fr 1fr; }
```

看起来两列平分。但如果某一列里放了一段**不会换行的长内容**（长英文单词、URL、`pre` 代码块），这一列会被撑宽，另一列被挤扁，甚至整个网格溢出容器。

原因是 `1fr` 的完整含义是 `minmax(auto, 1fr)`——**最小尺寸自动，等于内容的固有最小宽度**。长单词的固有宽度很大，就把轨道顶开了。

```css
/* ✅ 正确：显式把最小值设为 0，允许轨道收缩 */
.grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
```

{% note danger 记忆口诀 %}
**写 Grid 时永远用 `minmax(0, 1fr)`，不要裸写 `1fr`。** 除非那个轨道你确实希望被内容撑开。
{% endnote %}

本站友链三列栅格就是这么写的：

```css
.links-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

## 二、`auto-fill` 与 `auto-fit`：只差一个字，行为完全不同

两者都用于「列数不固定、按容器自动排」：

```css
.grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.grid { grid-template-columns: repeat(auto-fit,  minmax(240px, 1fr)); }
```

| | 容器能放 4 个但只有 2 个item时 | 适用场景 |
| --- | --- | --- |
| `auto-fill` | **保留 4 个空轨道**，2 个item各占 240px 靠左排 | 希望item保持固定尺寸、左对齐 |
| `auto-fit` | **折叠多余轨道**，2 个item被拉伸平分整行 | 希望item铺满整行 |

{% note tip 怎么选 %}
想让卡片**随容器弹性拉伸**用 `auto-fit`；想让卡片**保持统一尺寸、多了就换行左对齐**用 `auto-fill`。

大部分卡片列表（博客、产品、友链）用 `auto-fit` 观感更好。
{% endnote %}

## 三、区域命名：响应式布局的写法可以少一半

传统写法在响应式时要重写整个 `grid-template-columns` 和每个item的 `grid-column`：

```css
/* 桌面三栏 */
.layout {
  grid-template-columns: 240px 1fr 260px;
}
.layout .nav  { grid-column: 1; }
.layout .main { grid-column: 2; }
.layout .side { grid-column: 3; }

/* 手机：全部重排，五个属性都要改 */
@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
  .layout .nav, .layout .main, .layout .side { grid-column: 1; }
}
```

用区域命名，只改一处 `grid-template-areas`：

```css
.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 260px;
  grid-template-areas:
    "nav main side";
}
.layout .nav  { grid-area: nav; }
.layout .main { grid-area: main; }
.layout .side { grid-area: side; }

/* 手机只改这一处，item 的归属完全不用动 */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "nav"
      "main"
      "side";
  }
}
```

{% fold 为什么这样更好 %}
item 的 `grid-area` 只声明一次，**位置信息全部集中在上层的模板字符串里**。改布局时你是在"重画一张图"，而不是逐个调整 item——这在三栏以上的复杂布局里差距非常明显。

另外区域命名有自解释性，看一眼字符串就知道页面长什么样。
{% endfold %}

## 四、子网格 `subgrid`：解决卡片对齐问题

一组并排的卡片，每张卡里都有「标题 / 正文 / 按钮」三行。你希望**所有卡片的标题在同一水平线上**，但每张卡的标题可能是一行也可能是两行。

不用 subgrid 时做不到——每张卡是独立的网格，内部自己算行高。用了就可以：

```css
.card-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }

.card {
  display: grid;
  /* 关键：继承父网格的行定义，而不是自己另起一套 */
  grid-template-rows: subgrid;
  grid-row: span 3;
}
```

现在所有卡片共享同一套行轨道，标题行会自动对齐到同一高度。

{% note warning 兼容性提醒 %}
`subgrid` 的浏览器支持晚于 Grid 本体。用之前先确认目标环境；不支持时它会退化成普通网格（卡片内部独立排布），**不会报错也不会崩版**，可以放心渐进增强。
{% endnote %}

## 五、对齐属性速查

Grid 有两组对齐属性，最容易混：

| 属性 | 作用对象 | 常用值 |
| --- | --- | --- |
| `justify-items` | 所有item在**自己格子内**的水平位置 | `start` / `center` / `stretch`（默认） |
| `align-items` | 所有item在**自己格子内**的垂直位置 | 同上 |
| `justify-content` | **整个网格**在容器内的水平位置 | `start` / `center` / `space-between` |
| `align-content` | **整个网格**在容器内的垂直位置 | 同上 |

{% note info 一句话区分 %}
`*-items` 管格子里的东西，`*-content` 管整张网格。当轨道总和小于容器（比如列宽用 `px` 而非 `fr`）时，`*-content` 才看得出效果。
{% endnote %}

## 六、什么时候不该用 Grid

不是所有布局都适合 Grid：

- **一维排列**（一排按钮、一行标签）用 Flex 更直接，Grid 的二维能力用不上。
- **需要内容反向影响布局**（如文字流环绕）那是 Flex/浮动的场景。
- **简单居中**：`display: grid; place-items: center` 确实好用，但别忘了 `flex` 也能做到，保持项目内统一即可。

{% note tip 相关阅读 %}
[容器查询：让组件自己决定自己长什么样](/2026/10/17/fe-container-query/) · [flex 布局的收缩陷阱：为什么一个按钮会变成 0 宽](/2026/10/17/fe-flex-shrink/) · [间距系统：为什么你的页面总差那么一点](/2026/10/17/design-spacing-system/)
{% endnote %}
