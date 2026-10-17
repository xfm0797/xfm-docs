---
title: CSS 级联层 @layer：把「打不过的优先级」变成可管理的顺序
date: 2026-10-17 09:00:00
updated: 2026-10-17 09:00:00
categories: [前端]
tags: [CSS, 架构, 工程化]
description: 用 @layer 把样式表切成若干有序的层，让「谁覆盖谁」由层的顺序决定而不是选择器权重决定，彻底摆脱 specificity 军备竞赛。
---

我在给主题加一处站点级样式时，写过这样一段注释：「**必须放在最后加载，否则压不住主题那条规则**」。

这句话本身就是问题——它意味着项目的样式顺序靠**加载顺序**这种隐晦的约定维系，谁挪一下文件位置，页面就悄悄变样。后来我把这套东西换成了 `@layer`，这类约定就消失了。

<!-- more -->

## 一、传统优先级为什么必然失控

CSS 决定「谁生效」时看三样东西：**来源 → 特异性（权重）→ 书写顺序**。问题出在第二项：

```css
/* 主题样式 */
.links-grid { grid-template-columns: 1fr; }

/* 你的覆盖 */
html[data-tier="desktop"] .links-grid { grid-template-columns: repeat(3, 1fr); }
```

你赢了，因为你多堆了一个属性选择器。但下一次主题也堆一个，你就得堆两个。最终代码里会出现这种东西：

```css
html body .site-body .content .links-grid .link-card { … }
```

{% note danger 这就是军备竞赛 %}
特异性是一条**只增不减**的单行道。一旦开始堆选择器，后面每次覆盖都只能更重，永远回不去。
{% endnote %}

## 二、@layer 做的事：把「权重」换成「顺序」

级联层的核心规则只有一条：

> **在同一来源内，层的顺序优先于选择器权重。** 后声明的层里的规则，无条件胜过先声明的层——哪怕它的选择器只有一个类。

```css
@layer reset, base, components, utilities, overrides;
```

这一行**一次性声明了层的先后顺序**（写在最前面，顺序即优先级，越靠后越强）。之后不管各个层的内容在哪、什么时候加载，顺序都不变。

```css
@layer components {
  .links-grid { grid-template-columns: 1fr; }
}

@layer overrides {
  /* 只有一个类，但因为在后面的层里，照样生效 */
  .links-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

{% note tip 关键差异 %}
同样两个 `.links-grid`，没有 `@layer` 时后写的赢；有 `@layer` 时**后声明的层赢**，与书写位置无关。这才是"可管理"的意思——顺序是显式声明出来的，不是靠文件排列碰运气。
{% endnote %}

## 三、一个贴近真实项目的分层方案

| 层 | 放什么 | 权重定位 |
| --- | --- | --- |
| `reset` | 浏览器默认样式归零 | 最低，任何层都能改 |
| `base` | 元素级样式（`body`、`a`、`h1`） | 低 |
| `theme` | 设计令牌、变量定义 | 低（变量本身不参与级联竞争） |
| `components` | 组件样式 | 中 |
| `layout` | 栅格、页面骨架 | 中 |
| `utilities` | 工具类（`.mt-0`、`.hidden`） | 高，用于单点覆盖 |
| `overrides` | 站点/用户自定义 | 最高 |

写成代码：

```css
@layer reset, base, theme, components, layout, utilities, overrides;

@import url("reset.css") layer(reset);
@import url("tokens.css") layer(theme);
@import url("components.css") layer(components);

@layer overrides {
  /* 站点定制，永远压得住上面所有层 */
}
```

注意 `@import … layer(name)` 这个写法：**它能把第三方样式表直接塞进指定层**，而不用管对方文件里写了多复杂的选择器。这是 `@layer` 最有价值的场景之一。

{% note info 为什么它解决了第三方样式 %}
以前引入 Bootstrap 之类，你覆盖它必须比它更重。现在把它放进 `layer(vendor)`，而 vendor 排在你的 components 之前——你的单类选择器就能覆盖它的多重选择器。
{% endnote %}

## 四、`!important` 在层里的行为是反的

这是最容易踩的一点。普通规则里，后声明的层赢；但 **`!important` 规则的顺序完全相反**：

```css
@layer a, b;

@layer a { .btn { color: red !important; } }
@layer b { .btn { color: blue !important; } }
```

结果是 **红色**（`a` 层胜出）。因为 `!important` 的级联顺序是「先声明的层优先」，故意反着来——这样早期的低层可以用 `!important` 保住一些不可逾越的底线（比如无障碍强制样式）。

{% note warning 实践建议 %}
理解了这一点就该明白：**不要用 `!important` 去做覆盖**，它在层里的语义和你直觉相反。要覆盖就换层，或者把规则写进更靠后的层。
{% endnote %}

## 五、没有 @layer 的兜底做法

如果你的目标浏览器还不能支持（2022 年后的主流浏览器都已支持，但老项目可能要兜底），可以退回到「顺序 + 变量」的组合：

```css
/* 用变量把"该改什么"显式暴露出来，而不是让下游去覆盖规则 */
.xfm-card {
  background: var(--card-bg, var(--c-surface));
  padding: var(--card-pad, 20px);
}
```

{% fold 展开看为什么这比覆盖选择器好 %}
下游改样式时写 `--card-bg: #fff`，不需要知道原选择器是什么，也不需要比权重。变量的"覆盖"是**赋值**而不是**竞争**，天然没有军备竞赛。

代价是：你要提前预判哪些地方会被改，把它们做成变量。而 `@layer` 不需要预判。
{% endfold %}

## 六、本站的做法与教训

本站友链页改三列时，用的还是老办法——把自定义 CSS 登记成最后加载的资源来压住主题规则。它生效了，但留下了两个隐患：

1. **依赖加载顺序**：谁调整了样式表引入顺序，覆盖就失效，而且**不会报错**，只是悄悄变回单列。
2. **无法表达意图**：读者看不出那条规则是"定制"还是"主题本来就该这样"。

如果主题一开始就分好了层，站点侧只需要写进 `overrides` 层，这两点都不存在。

{% note tip 相关阅读 %}
[容器查询：让组件自己决定自己长什么样](/2026/10/17/fe-container-query/) · [现代 CSS 选择器：:has() 与 :is() 怎么用](/2026/10/17/fe-modern-selectors/) · [间距系统：为什么你的页面总差那么一点](/2026/10/17/design-spacing-system/)
{% endnote %}
