---
title: 现代 CSS 选择器：:has() 与 :is() 怎么用
date: 2026-10-17 12:30:00
updated: 2026-10-17 12:30:00
categories: [前端]
tags: [CSS, 选择器]
description: :has() 让 CSS 第一次拥有"父选择器"能力，:is() 和 :where() 解决选择器列表的权重与冗长问题。讲清三者的语义、权重规则和能替代掉哪些 JS。
---

`:has()` 是 CSS 十多年来最重要的一次能力升级：**它让样式可以基于子元素的状态来决定**。

以前这类需求只能写 JS（"如果卡片里有图片，就加个 class"），现在一行 CSS 就够。

<!-- more -->

## 一、`:has()`：终于有了父选择器

```css
/* 含有图片的卡片，改成横排布局 */
.card:has(img) {
  display: flex;
  gap: 16px;
}

/* 表单项校验失败时，整行高亮 */
.form-row:has(input:invalid) {
  border-color: var(--c-danger);
}

/* 导航里有下拉菜单的项，加个箭头 */
.nav-item:has(.submenu)::after {
  content: '';
}
```

{% note info 语法直觉 %}
`:has()` 里的参数是**相对于前面元素的选择器**。`.card:has(img)` 读作「含有 img 的 .card」，注意它匹配的是 `.card` 本身，不是 img。
{% endnote %}

### 能替代掉的 JS

{% row %}
{% col %}
**以前**

```js
document.querySelectorAll('.card').forEach(c => {
  if (c.querySelector('img')) {
    c.classList.add('has-cover');
  }
});
```
{% endcol %}
{% col %}
**现在**

```css
.card:has(img) { … }
```
{% endcol %}
{% endrow %}

省掉的不只是那几行 JS——还省掉了「内容异步加载后要重新执行一遍」的麻烦。CSS 是**实时求值**的，DOM 一变样式立刻跟上。

### 也可以做兄弟关系判断

```css
/* 标题后面紧跟着段落时才给间距 */
h2:has(+ p) { margin-bottom: .6em; }

/* 前面有图标的按钮，减小左内边距 */
.button:has(> svg) { padding-left: 8px; }
```

## 二、`:is()`：让选择器列表不再冗长

以前要写：

```css
.article h1, .article h2, .article h3, .article h4 { line-height: 1.3; }
```

现在：

```css
.article :is(h1, h2, h3, h4) { line-height: 1.3; }
```

{% note danger 权重规则（重要且反直觉） %}
`:is()` 的权重等于**参数列表中权重最高的那一项**。

```css
:is(.class, #id) { }   /* 权重 = (1,0,0)，等价于 #id */
:is(h1, p) { }         /* 权重 = (0,0,1)，等价于元素选择器 */
```

这意味着 `:is()` **不能降低权重**。想降低权重要用 `:where()`。
{% endnote %}

## 三、`:where()`：权重永远为 0 的 `:is()`

```css
:where(.card, .panel) .title { color: red; }   /* 总权重只有 .title 的 (0,1,0) */
```

| | 权重 | 用途 |
| --- | --- | --- |
| `:is()` | 取参数中最高 | 简化书写，保持覆盖能力 |
| `:where()` | **恒为 0** | 写"默认样式"，让下游轻松覆盖 |

{% note tip 主题开发的用法 %}
写组件库的**基础默认样式**用 `:where()`——这样使用方用单类选择器就能覆盖，不必堆权重。

本站主题如果要开放定制，把默认样式包在 `:where()` 里，比让站点侧写更重的选择器友好得多。
{% endnote %}

## 四、`:has()` 的权重同样取决于参数

```css
.card:has(img) { }        /* 权重 = .card + img = (0,1,1) */
.card:has(.cover) { }     /* 权重 = (0,2,0) */
```

一样的规则：参数参与权重计算。

## 五、几个能立刻用上的实战写法

### 空态处理

```css
/* 列表里没有任何项时，显示占位提示 */
.list:not(:has(> *))::before {
  content: '暂无内容';
  color: var(--c-text-3);
}
```

### 相邻项的间距（比 `> * + *` 更灵活）

```css
.toolbar:has(> :nth-child(2)) {
  /* 至少有两个子元素时才需要 gap */
  gap: 8px;
}
```

### 深色模式的容器级判断

```css
/* 只在含有代码块的区域启用等宽字体优化 */
.prose:has(pre) { font-variant-ligatures: none; }
```

### 表单联动

```css
/* 复选框被选中时，给它所在的整行加样式 */
.field:has(input[type="checkbox"]:checked) {
  background: var(--c-primary-weak);
}
```

## 六、兼容性渐进增强

`:has()` 在较老的浏览器里**整条规则会被丢弃**（不是忽略参数，而是整个选择器无效）。这是好事——不会错乱，只是没效果。

安全做法是**分开写**，不要把它和关键样式放一起：

```css
/* 基础样式：所有浏览器都有 */
.card { display: block; }

/* 增强：支持 :has() 的浏览器才应用 */
.card:has(img) { display: flex; }
```

{% fold 需要 JS 兜底时怎么检测 %}
```js
const supportsHas = CSS.supports('selector(:has(img))');
if (!supportsHas) {
  // 退化到旧方案：给元素打 class
}
```

`CSS.supports('selector(...)')` 可以检测任意选择器是否被支持，比 UA 判断可靠得多。
{% endfold %}

## 七、别过度使用

`:has()` 虽强，但有两个代价：

1. **性能**：复杂参数的 `:has()` 需要浏览器做额外匹配，在超大 DOM 上频繁触发可能有开销。避免在 `:has()` 里嵌套 `:has()`。
2. **可读性**：`.list:has(> .item:nth-child(n+3))` 这种写法，半年后你自己都读不懂。能用简单类名表达的逻辑，别炫技。

{% note tip 相关阅读 %}
[CSS 级联层 @layer：把「打不过的优先级」变成可管理的顺序](/2026/10/17/fe-css-cascade-layers/) · [容器查询：让组件自己决定自己长什么样](/2026/10/17/fe-container-query/) · [空状态设计：没有数据时的那一屏](/2026/10/17/design-empty-state/)
{% endnote %}
