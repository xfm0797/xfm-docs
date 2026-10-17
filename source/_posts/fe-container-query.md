---
title: 容器查询：让组件自己决定自己长什么样
date: 2026-10-17 09:30:00
updated: 2026-10-17 09:30:00
categories: [前端]
tags: [CSS, 响应式, 组件化]
description: 媒体查询回答的是「屏幕多宽」，容器查询回答的是「我有多宽」。前者做页面级布局，后者做组件级自适应，二者不是替代关系而是分工。
---

一个卡片组件在侧栏里应该竖排、在正文里应该横排——用媒体查询你做不到，因为这两种情况**屏幕宽度是一样的**。

这就是容器查询存在的唯一理由：**响应式断点的依据，从视口换成了父容器**。

<!-- more -->

## 一、先看清媒体查询解决不了什么

```css
/* 屏幕宽 → 卡片横排 */
@media (min-width: 900px) {
  .card { display: flex; }
}
```

这段代码在「卡片被放进 300px 宽的侧栏」时会出错：屏幕确实大于 900px，于是卡片横排，然后在 300px 里挤成一团。

问题的本质：**组件不知道自己被放在哪，只能猜屏幕有多大**。

## 二、三行代码启用容器查询

```css
/* 第一步：声明一个"容器" */
.card-wrap {
  container-type: inline-size;
  container-name: card;
}

/* 第二步：按容器宽度写规则 */
@container card (min-width: 480px) {
  .card { display: flex; gap: 20px; }
  .card .cover { width: 180px; flex: none; }
}
```

{% note info 只有一行是关键 %}
`container-type: inline-size` 把元素标记为「可以被查询的容器」。`inline-size` 表示只查询**行内方向（宽度）**，这也是绝大多数场景需要的。
{% endnote %}

现在卡片是横排还是竖排，取决于 `.card-wrap` 有多宽，与屏幕无关。同一个组件放进侧栏和正文，会自己长成两个样子。

## 三、容器查询单位

配套出了一组新单位，按容器尺寸计算而非视口：

| 单位 | 含义 | 对比视口单位 |
| --- | --- | --- |
| `cqw` | 容器宽度的 1% | `vw` |
| `cqh` | 容器高度的 1% | `vh` |
| `cqi` | 容器行内尺寸的 1% | `vi` |
| `cqb` | 容器块尺寸的 1% | `vb` |
| `cqmin` / `cqmax` | 取小 / 取大 | `vmin` / `vmax` |

用它做流体字号，可以让标题随卡片缩放而不是随屏幕缩放：

```css
.card-title {
  font-size: clamp(1rem, 4cqi, 1.5rem);
}
```

## 四、注意这个反直觉的坑

**容器不能查询自己。** 这条规则卡过我一次：

```css
/* ❌ 无效：.card 自己是容器，不能在自己的规则里查询自己 */
.card {
  container-type: inline-size;
}
@container (min-width: 480px) {
  .card { display: flex; }
}
```

查询的永远是**祖先容器**里最近的那一个。所以标准做法是**外面包一层**专门当容器的元素（第一节的 `.card-wrap`）。

{% note danger 另一个坑：container-type 会改变布局 %}
设置 `container-type: inline-size` 会给元素加上 `contain: layout style inline-size`，意味着它的**尺寸不再受内容撑开**（行内方向），必须由外部决定。

如果你给一个本来靠内容撑宽的元素加了这个属性，它可能突然塌成 0 宽。**记得给它一个明确的宽度来源**（栅格列宽、百分比或父级约束）。
{% endnote %}

## 五、和媒体查询怎么分工

不是"用谁替换谁"，而是**各管一段**：

| 关注点 | 用什么 | 例子 |
| --- | --- | --- |
| 页面骨架：几栏、侧栏是否显示 | 媒体查询（或档位方案） | 桌面三栏、手机单栏 |
| 组件内部：横排竖排、字号、显隐 | 容器查询 | 卡片、标签云、统计块 |
| 用户偏好：深色、减弱动效 | 媒体查询 | `prefers-color-scheme` |
| 打印 | 媒体查询 | `@media print` |

{% fold 展开看本站的做法 %}
本站主题用的是「自适应式响应」：不在 CSS 里写宽度断点，而是由脚本探测出 `mobile / tablet / desktop` 档位，打在 `<html>` 的 `data-tier` 上，样式按档位出。

这是**页面骨架层**的方案，和容器查询不冲突。真正合适的组合是：

- 骨架用档位（因为要联动 JS 行为：抽屉、目录浮层）；
- 组件内部用容器查询（纯样式，不需要 JS 参与）。

把两者混在一起，就会出现"改个卡片样式要动 JS 配置"这种别扭事。
{% endfold %}

## 六、一个完整的组件例子

```css
.stat-grid { container-type: inline-size; }

/* 窄容器：单列，数值居中 */
.stat-item { text-align: center; padding: 12px; }
.stat-item .value { font-size: 1.5rem; }

/* 宽容器：横排，数值靠左，标签在右 */
@container (min-width: 360px) {
  .stat-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    text-align: left;
  }
  .stat-item .value { font-size: 2rem; }
}
```

把它放进 280px 的侧栏、560px 的正文、880px 的通栏，会各自呈现合适的形态——**而这个组件从始至终不知道屏幕有多宽**。

{% note tip 相关阅读 %}
[CSS Grid 实战：minmax、auto-fill 与区域命名](/2026/10/17/fe-css-grid/) · [现代 CSS 选择器：:has() 与 :is() 怎么用](/2026/10/17/fe-modern-selectors/) · [视觉层级：让用户第一眼看到对的东西](/2026/10/17/design-visual-hierarchy/)
{% endnote %}
