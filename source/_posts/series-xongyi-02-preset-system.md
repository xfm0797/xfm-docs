---
title: 从零造一个机构官网主题（二）：三套预设——一行配置切换行业气质
date: 2026-10-15 18:00:00
updated: 2026-10-15 18:00:00
categories: [主题开发]
tags: [CSS, 设计系统, 主题开发, 官网]
description: 拆解 hexo-theme-xongyi 的 preset 机制：body.preset-* 只覆盖 CSS 变量、预设该管什么不该管什么、政务红的对比度处理、以及新增第四套预设的步骤。
---

第一篇说过，三套预设（企业 / 政务 / 教育）**只换气质不换结构**。这一篇讲这个机制具体怎么实现，以及我在「预设该管多少」这件事上反复调整的过程。

<!-- more -->

## 一、机制：一行配置 + 一个 body class

配置里就一行：

```yaml
preset: enterprise   # enterprise | government | education
```

模板把它写成 body class：

```ejs
<body class="preset-<%= theme.preset || 'enterprise' %>">
```

CSS 里每套预设只做一件事——**覆盖 CSS 变量**：

```css
/* 默认（企业）：商务蓝 */
:root {
  --primary: #2563eb;
  --primary-strong: #1d4ed8;
  --primary-soft: #eff6ff;
  --accent: #0ea5e9;
}

/* 政务：中国红 */
body.preset-government {
  --primary: #c2372e;
  --primary-strong: #a32720;
  --primary-soft: #fdeeed;
  --accent: #d9534a;
}
body.preset-government h1,
body.preset-government h2 { font-weight: 700; }   /* 标题加重，更权威 */

/* 教育：学院青 */
body.preset-education {
  --primary: #0e7490;
  --primary-strong: #155e75;
  --primary-soft: #ecfeff;
  --accent: #06b6d4;
}
```

**整套预设一共 15 行 CSS。** 因为组件全部消费变量，换预设就是换一组值，组件一行不动——这和我在 xfm 主题里用的令牌分层是同一套思路。

{% note tip 为什么用 body 而不是 :root 覆盖 %}
预设只对当前页面生效，`body.preset-*` 的选择器特异性高于 `:root`，覆盖关系天然成立。而且方便未来做「某几页用不同预设」的扩展。
{% endnote %}

## 二、预设该管什么：一张边界表

这是踩过坑之后定下来的边界：

| 该管（气质） | 不该管（结构） |
| --- | --- |
| 主色 / 强调色 | 首页板块顺序 |
| 主色的深浅变体 | 布局（单栏 / 双栏） |
| 标题字重 | 文案内容 |
| 特定板块的渐变方向 | 功能开关 |

{% fold 一个反面例子 %}
最初我给政务预设加了「隐藏数据统计板块」的规则——因为觉得政府网站不需要炫数字。

结果有个政务客户偏偏要放「年度办实事数据」，只能去改模板。**预设一旦开始管结构，就变成了硬编码的甲方偏好。**

后来删掉了这条规则，改成让客户自己在 `sections` 数组里决定放不放。
{% endfold %}

**判据很简单**：如果这个差异是「换个客户就不一样」，那它是配置；如果是「这个行业普遍如此」，它才是预设。

## 三、政务红的对比度问题

红色是三类预设里最难处理的：

```css
--primary: #c2372e;
```

问题在于**红色在白底上的明度偏高**，白字按钮的对比度容易不达标。三个处理：

1. **主色压暗**：`#c2372e` 而非鲜艳的 `#ff0000`，保证白字可读；
2. **提供 `--primary-strong`**：hover / 激活态用更深的 `#a32720`；
3. **提供 `--primary-soft`**：浅红背景 `#fdeeed`，用于标签、卡片底色——**大面积铺色时永远用 soft 版本**。

{% note warning 深色模式下的二次适配 %}
暗色模式（`:root[data-theme="dark"]`）会再覆盖一轮变量。三套预设 × 明暗两态 = 6 种组合，理论上要调 6 套值。

实际做法是**暗色只覆盖中性色**（背景 / 文字 / 边框 / 阴影），主色三件套保持预设值不变——这样组合数从 6 降到 2 + 3。**凡是会组合爆炸的维度，都要想办法解耦。**
{% endnote %}

## 四、新增第四套预设要改什么

假设要给医疗机构加一套 `medical`（生命绿），完整步骤只有三步：

**1. 加 CSS 变量块**

```css
body.preset-medical {
  --primary: #0d9488;
  --primary-strong: #0f766e;
  --primary-soft: #f0fdfa;
  --accent: #14b8a6;
}
```

**2. 更新配置注释**

```yaml
## enterprise: 商务蓝 | government: 政务红 | education: 学院青 | medical: 生命绿
preset: enterprise
```

**3. 提供示例配置**

复制 `examples/config.government.yml` 改成 `examples/config.medical.yml`。

**不需要改任何模板。** 这就是「预设只换皮」的收益——扩展成本是 O(1) 而不是 O(模板数)。

## 五、两个必须守住的纪律

### 1. 组件里绝不硬编码颜色

```css
/* ❌ 预设切换后这块永远是蓝色，成为"补丁色" */
.btn--primary { background: #2563eb; }

/* ✅ */
.btn--primary { background: var(--primary); }
```

只要有一处硬编码，客户就会发现「换了预设，有个按钮颜色没变」。这类 bug 排查起来很烦，因为**它看起来像缓存问题**。

### 2. 换预设后要重新生成预览图

README 里的三张预览图是**真实构建后截的**，不是设计稿。改了预设配色就必须重截，否则文档和实物不一致。

{% note info 截图时的两个坑 %}
1. 页面有 `IntersectionObserver` 滚动淡入动画，直接截全页会得到**下半页全透明**。必须在截图前给所有 `.reveal` 加上 `.in` 类，并把 `.stat__number` 填成终值；
2. 浏览器会缓存静态资源，改完配置重新构建后要**加 query 参数**访问（`http://localhost:4173/?v=2`）才能看到新产物。

两个坑都不会报错，只会让你得到一张错的图。
{% endnote %}

## 系列导航

{% note tip 系列导航 %}
[xongyi 系列总入口](/series/xongyi/) · 上一篇：[机构官网到底需要什么](/2026/10/15/series-xongyi-01-institutional-website/) · 下一篇：[首页板块系统](/2026/10/15/series-xongyi-03-section-system/)
{% endnote %}
