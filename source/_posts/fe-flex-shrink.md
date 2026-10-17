---
title: flex 布局的收缩陷阱：为什么一个按钮会变成 0 宽
date: 2026-10-17 10:30:00
updated: 2026-10-17 10:30:00
categories: [前端]
tags: [CSS, Flex, 移动端, 踩坑]
description: 复现并分析一次真实的移动端事故：导航菜单按钮在手机上既看不见也点不着，根因是 flex 收缩把它压成了 0 宽。附 flex 三个属性的完整语义与排查清单。
---

手机端导航栏的菜单按钮**消失了**。不是样式错了、不是图标没加载——元素在 DOM 里好好的，宽高计算结果是 `0`，点它的时候命中到的是旁边的元素。

这个 bug 我查了两轮才找到根因，因为它违反直觉：**Flex 容器会默认允许子元素被压缩，而且压缩的优先级不是你以为的那个顺序。**

<!-- more -->

## 一、事故现场

导航栏结构大致是这样：

```html
<header class="nav">
  <a class="brand">站点名称比较长的时候</a>
  <nav class="nav-menu">…</nav>
  <div class="nav-tools">
    <button class="nav-toggle">☰</button>
    <button class="lang-toggle">中/EN</button>
  </div>
</header>
```

```css
.nav { display: flex; align-items: center; gap: 12px; }
.brand { /* 没写 flex 相关属性 */ }
.nav-tools { /* 同上 */ }
```

手机上一放，品牌名占满了整行，`.nav-toggle` 被压成 0 宽。

## 二、根因：`flex` 默认值不是「不收缩」

`flex` 是三个属性的简写，默认值是 `0 1 auto`：

| 属性 | 默认值 | 含义 |
| --- | --- | --- |
| `flex-grow` | `0` | 有剩余空间时**不放大** |
| `flex-shrink` | `1` | 空间不足时**允许收缩**（罪魁祸首） |
| `flex-basis` | `auto` | 基准尺寸取内容宽度 |

因为 `flex-shrink: 1`，空间不够时所有 item **按比例一起缩**。而收缩的分配不是平均的——它按 `flex-shrink × flex-basis` 加权，内容越宽的 item 承担越多收缩量。

{% note danger 真正的坑在这里 %}
收缩**没有下限保护**。当可用空间小于所有 item 的内容宽度之和时，item 会被一路压到 `min-content`；如果连 `min-content` 都放不下（比如容器本身被限制死了），**item 会被压到 0 宽**。

而图标按钮这种小元素，正是最先被压没的那一类——它的基准宽度小，收缩量占比低，但绝对值上很容易被压到 0。
{% endnote %}

## 三、三种修法，适用不同场景

### 修法一：给不该缩的元素关掉收缩

```css
.nav-toggle,
.lang-toggle {
  flex: 0 0 auto;   /* 不放大、不收缩、尺寸取内容 */
}
```

最直接。适合**尺寸固定、必须完整显示**的元素：图标按钮、头像、开关。

### 修法二：给该让位的元素开启收缩并设下限

```css
.brand {
  flex: 1 1 auto;
  min-width: 0;              /* 关键：允许收缩到 0 以下 */
}
.brand-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;   /* 超长时显示省略号 */
}
```

{% note warning `min-width: 0` 是必写项 %}
Flex item 的 `min-width` 默认是 `auto`，意思是「不小于内容的 `min-content` 宽度」。这会**阻止收缩真正生效**——你设了 `flex-shrink: 1`，元素依然纹丝不动，因为有下限兜着。

所以「希望这个元素可以被压缩」必须显式写 `min-width: 0`（纵向则是 `min-height: 0`）。
{% endnote %}

### 修法三：给容器一个保底策略

```css
.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}
.nav > * { flex-shrink: 0; }        /* 默认谁都不缩 */
.brand { flex-shrink: 1; min-width: 34px; }  /* 只有品牌区可以让位 */
```

这是本站最终采用的思路：**默认不许缩，只显式允许最该让位的那一个缩，并给它一个下限**。这样以后往导航栏加新按钮，也不会重蹈覆辙。

## 四、完整的排查清单

遇到「元素不见了 / 点不着 / 挤成一团」，按顺序查：

{% timeline %}
{% event 第一步 %}
元素实际尺寸是多少？用开发者工具看 Computed 的 width/height。如果是 0，直接就是收缩问题。
{% endevent %}
{% event 第二步 %}
它的 `flex-shrink` 是几？如果父级没显式设置，那就是默认的 1。
{% endevent %}
{% event 第三步 %}
它的 `min-width` 是 `auto` 还是 `0`？想让它能缩小，必须是 0 或具体数值。
{% endevent %}
{% event 第四步 %}
容器的可用空间够不够？`gap` 和 `padding` 也占空间，容易被忽略。
{% endevent %}
{% event 第五步 %}
用 `elementFromPoint` 验证点击命中：元素可见不代表可点，可能被上层透明元素盖住。
{% endevent %}
{% endtimeline %}

{% note info 第五步为什么重要 %}
我这次的 bug 是"看得见但点不着"和"完全看不见"两种状态交替出现的——因为不同页面品牌名长度不同。只在开发者工具里看 DOM 结构永远发现不了，**必须真机口径渲染后测点击命中**。
{% endnote %}

## 五、`flex: 1` 到底是什么意思

顺带厘清几个常见写法：

| 写法 | 展开 | 行为 |
| --- | --- | --- |
| `flex: 1` | `1 1 0%` | 平分空间，**忽略内容宽度** |
| `flex: auto` | `1 1 auto` | 先按内容分，剩余再按比例分 |
| `flex: none` | `0 0 auto` | 完全按内容，不放大不收缩 |
| `flex: 0 1 auto` | 默认值 | 按内容，可收缩 |

{% fold 什么时候用 `flex: 1`，什么时候用 `flex: auto` %}
想让几个 item **等宽**（比如三等分工具栏）用 `flex: 1`——因为 basis 是 0，内容宽度不参与分配。

想让 item **在内容宽度基础上再按比例分配剩余空间**（比如侧栏固定、主区自适应，且主区内容短时也要占满）用 `flex: auto`。

混用会出现"明明都写了 flex:1 但宽度不一样"的困惑——那是因为其中某个写了 `flex: auto` 或没写。
{% endfold %}

## 六、Grid 为什么没这个问题

Grid 的轨道默认最小尺寸也是 `auto`，同样会被内容撑开——这就是上一篇文章说的 `minmax(0, 1fr)` 必须用 `0` 做下限的原因。

两者的差别在于：**Flex 的问题表现为"元素被压没"，Grid 的问题表现为"网格被撑破"**。前者更难发现，因为元素还在，只是尺寸是 0。

{% note tip 相关阅读 %}
[CSS Grid 实战：minmax、auto-fill 与区域命名](/2026/10/17/fe-css-grid/) · [移动端触控设计：热区、安全区与误触](/2026/10/17/design-touch-target/) · [无障碍不是可选项：对比度、焦点与语义](/2026/10/17/design-accessibility/)
{% endnote %}
