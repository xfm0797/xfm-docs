---
title: 无障碍不是可选项：对比度、焦点与语义
date: 2026-10-17 17:30:00
updated: 2026-10-17 17:30:00
categories: [设计]
tags: [无障碍, 用户体验, 语义化]
description: 无障碍不是给少数人的额外照顾，而是检验界面是否扎实的标准。讲清三个投入产出比最高的方向：颜色对比度、键盘可达性、语义结构，以及每个方向的最小改动清单。
---

提到无障碍，常见的反应是"那是给残障人士做的，我们用户里没有"。

实际情况是：**无障碍做得好的界面，对所有人都更好**。键盘可达意味着操作高效，语义清晰意味着 SEO 和朗读都正常，对比度达标意味着在户外强光下也看得清。

而且无障碍有法律合规要求（多国都有），不是可选项。

<!-- more -->

## 一、先做这三件，覆盖率最高

无障碍的规范很长（WCAG 有几十条），但**投入产出比最高的只有三块**：

{% row %}
{% col %}
**一、颜色对比度**

影响人群最广（弱视、老化、户外强光）。

改动最小：调色值。
{% endcol %}
{% col %}
**二、键盘可达性**

影响所有用键盘的人（含重度用户、运动障碍者）。

改动较小：补 tabindex 与焦点样式。
{% endcol %}
{% endrow %}

{% note info 三、语义结构 %}
影响屏幕阅读器、SEO、以及浏览器阅读模式。

改动中等：改 HTML 标签与属性。
{% endnote %}

## 二、对比度：具体要改哪里

达标线（WCAG AA）：

| 内容 | 最低对比度 |
| --- | --- |
| 正文文本 | 4.5:1 |
| 大文本（≥18pt 或 ≥14pt 粗体） | 3:1 |
| 界面组件边界、图标 | 3:1 |

### 四个最常不达标的位置

{% timeline %}
{% event 占位符文字 %}
常被写成 `#ccc` 或 `#aaa`，对比度只有 2:1 左右。改成 `--c-text-3` 并测到 3:1 以上。
{% endevent %}
{% event 品牌色上的白字 %}
鲜亮的品牌蓝配白字常常只有 3.x:1。改用色阶里更深的一档（如 blue-600）。
{% endevent %}
{% event 禁用态 %}
常被压得太淡。禁用态也需可辨认（WCAG 对禁用态豁免，但用户仍需知道那里有个控件）。
{% endevent %}
{% event 链接色 %}
为了与正文区分常被调浅。如果链接只靠颜色区分，还需满足与正文 3:1 的对比度。
{% endevent %}
{% endtimeline %}

{% note warning 要测的是实际渲染色 %}
变量经过透明度叠加后的实际颜色，和你写的变量值不一样。**在 DevTools 里取元素实际计算出的颜色**再算对比度，不要拿设计稿的数值算。
{% endnote %}

### 不要仅靠颜色传达信息

```html
<!-- ❌ 只有颜色不同，色觉障碍者无法区分 -->
<span style="color: green">成功</span>
<span style="color: red">失败</span>

<!-- ✅ 颜色 + 图标 + 文字 -->
<span class="status status-success"><svg …/>成功</span>
<span class="status status-danger"><svg …/>失败</span>
```

## 三、键盘可达性

### 一、别乱删焦点框

```css
/* ❌ 这是最常见的无障碍破坏行为 */
*:focus { outline: none; }
```

{% note danger 为什么要保留焦点框 %}
键盘用户靠焦点框知道"我现在在哪"。删掉它，等于让用户闭着眼睛操作。

如果觉得默认焦点框难看，**换一个更好看的，而不是删掉**：

```css
:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```
{% endnote %}

`:focus-visible` 是关键：它只在**键盘操作**时显示焦点框，鼠标点击时不显示——兼顾了美观与可达。

### 二、非原生元素要能被聚焦

用 `div` 做的"按钮"默认不能被 Tab 聚焦，也没有键盘事件：

```html
<!-- ❌ -->
<div class="btn" onclick="submit()">提交</div>

<!-- ✅ 直接用原生元素 -->
<button type="button" onclick="submit()">提交</button>
```

{% note tip 优先用原生元素 %}
原生 `<button>` 自带：可聚焦、Enter/Space 触发、正确的 role、禁用态语义。

用 `div` 模拟要自己补齐全部这些，而且很容易漏。**能不用就不用。**
{% endnote %}

如果必须用自定义元素：

```html
<div role="button" tabindex="0"
     onclick="submit()"
     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();submit();}">
  提交
</div>
```

### 三、焦点顺序与陷阱

- **Tab 顺序**应与视觉顺序一致。用 `tabindex` 的正值（1、2、3）会打乱顺序，**只在必要时用 `0` 或 `-1`**。
- **弹层/抽屉打开时焦点要移进去**，关闭时移回触发元素——否则键盘用户会"丢失焦点"。
- 弹层打开时应**锁定焦点在内部**（焦点陷阱），避免 Tab 跑到背景内容上。

## 四、语义结构

### 一、标题级别表达结构，不是字号

```html
<h1>文章标题</h1>
  <h2>一、对比度</h2>
    <h3>达标线</h3>
  <h2>二、键盘可达</h2>
```

{% note danger 常见错误 %}
为了"字号小一点"而用 `h4`——这会让屏幕阅读器的文档大纲错乱。

字号由 CSS 控制，级别由内容层级决定。**用 `h2` 配小字号 class 是正确做法。**
{% endnote %}

### 二、按钮与链接不要混用

```html
<!-- 跳转用链接 -->
<a href="/archives/">查看全部</a>

<!-- 执行动作（不跳转）用按钮 -->
<button type="button" onclick="openDialog()">打开设置</button>
```

区别不只是语义：链接可以新标签打开、可以右键复制链接；按钮不能。反过来，屏幕阅读器对链接的提示是"前往某处"，对按钮是"执行某操作"——**用错了会误导用户**。

### 三、图片必须有 alt

```html
<!-- 有意义的内容图 -->
<img src="chart.png" alt="2026 年各季度访问量柱状图，Q4 最高">

<!-- 纯装饰图：alt 留空（不要省略属性） -->
<img src="divider.svg" alt="">
```

{% fold alt 的写法原则 %}
`alt` 应该描述**这张图传达了什么信息**，而不是"一张图片"这种废话。

- 装饰性图片：`alt=""`（空字符串，让屏幕阅读器跳过）
- 内容图片：描述信息本身
- 图片已是链接：描述链接目标（"查看大图"而非图的样子）

**不要省略 `alt` 属性**——省略时部分阅读器会朗读文件名。
{% endfold %}

### 四、表单要有 label

```html
<!-- ❌ 只有占位符，屏幕阅读器读不出这是什么 -->
<input type="text" placeholder="邮箱">

<!-- ✅ -->
<label for="email">邮箱</label>
<input id="email" type="email" placeholder="you@example.com">
```

{% note warning placeholder 不是 label %}
placeholder 在用户输入后消失，且很多屏幕阅读器不朗读它。它只能作为**示例补充**，不能替代标签。

如果设计上不允许显示 label，可以用视觉隐藏的 label（`sr-only`），但属性必须存在。
{% endnote %}

## 五、动效的无障碍

部分用户会因动效产生眩晕（前庭功能障碍）。必须尊重系统偏好：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

{% note info 为什么压到 .01ms 而不是 0 %}
设为 `0` 可能导致依赖 `transitionend` 事件的 JS 不触发。`.01ms` 既无感知，又保留了事件机制。
{% endnote %}

## 六、最小改动清单

{% timeline %}
{% event 一 %}
全局搜索 `outline: none`，全部改成 `:focus-visible` 自定义样式。
{% endevent %}
{% event 二 %}
用 DevTools 测所有文本/背景组合的对比度，重点查占位符、白字按钮、链接色。
{% endevent %}
{% event 三 %}
检查 `div onclick` 这类假按钮，改成原生 `button`。
{% endevent %}
{% event 四 %}
检查标题是否跳级（h2 直接到 h4）。
{% endevent %}
{% event 五 %}
全局搜索 `img` 是否都有 `alt`（包括空的）。
{% endevent %}
{% event 六 %}
补一段 `prefers-reduced-motion` 的全局样式。
{% endevent %}
{% event 七 %}
只用键盘（不用鼠标）走一遍主流程：能不能到每个控件、焦点框看得见吗。
{% endevent %}
{% endtimeline %}

{% note tip 相关阅读 %}
[从品牌色到语义色阶：一套配色系统怎么搭](/2026/10/17/design-color-system/) · [视觉层级：让用户第一眼看到对的东西](/2026/10/17/design-visual-hierarchy/) · [移动端触控设计：热区、安全区与误触](/2026/10/17/design-touch-target/)
{% endnote %}
