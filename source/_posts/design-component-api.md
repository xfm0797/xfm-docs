---
title: 组件 API 设计：让调用方不需要读你的源码
date: 2026-10-17 17:00:00
updated: 2026-10-17 17:00:00
categories: [设计]
tags: [组件设计, API, 工程化]
description: 组件的 props 就是它对外承诺的契约。讲清命名的三个原则、布尔属性的陷阱、配置对象与展开属性的取舍、插槽该开在哪里，以及版本迭代时如何不破坏既有调用。
---

判断一个组件设计得好不好，有个很朴素的标准：**用的人需不需要打开你的源码才知道怎么用**。

需要，就是失败。组件的 API 应该是自解释的——看名字就知道传什么，看类型就知道边界。

<!-- more -->

## 一、命名三原则

### 一、用"是什么"而非"长什么样"

```
❌ <Button blue round />
✅ <Button variant="primary" shape="pill" />
```

{% note danger 为什么 %}
`blue` 描述的是**当前的外观**，而 `variant="primary"` 描述的是**语义角色**。

当品牌色从蓝改绿时，`blue` 就成了谎言；而 `primary` 依然准确，只需改 CSS。

这条规则和"组件只引语义变量"是同一件事：**命名要绑定意图，不要绑定实现。**
{% endnote %}

### 二、同类属性要有统一前缀

```html
<Card
  header-title="标题"
  header-icon="star"
  footer-text="查看全部"
/>
```

比 `title` / `icon` / `footerText` 混乱命名好得多——前缀把属性**分组**了，调用方能凭直觉推断还有哪些属性。

### 三、动词与形容词要分清

| 类型 | 形式 | 例子 |
| --- | --- | --- |
| 状态 | 形容词 / 过去分词 | `disabled` `active` `loading` |
| 行为回调 | `on` + 动词 | `onSubmit` `onClose` |
| 配置 | 名词 | `size` `variant` `placement` |

## 二、布尔属性的三个陷阱

### 陷阱一：默认值的方向

```html
<Button disabled />        <!-- 默认可点，需要显式禁用 -->
<Input readonly />
```

{% note warning 布尔属性的默认值几乎总是 false %}
所以**布尔属性只能表达"开启某个非默认行为"**。如果你需要一个默认开启的功能，不要设计成 `notRounded` 这种否定式——改成枚举属性：

```html
❌ <Button notRounded />
✅ <Button shape="square | pill">
```
{% endnote %}

### 陷阱二：成对出现就是枚举

出现 `isOpen` / `isClosed`，或者 `showHeader` / `hideHeader` 时，说明这根本不是两个布尔，而是**一个枚举状态**：

```html
❌ <Panel expanded={true} collapsed={false} />
✅ <Panel state="expanded | collapsed | animating">
```

两个布尔能表达四种组合，其中两种是**无效状态**（都 true、都 false）。枚举从类型上就排除了它们。

### 陷阱三：布尔无法扩展

`size` 最初只有大小两种，用 `large` 布尔很自然。等到要加"超大"时，就得改成 `size="lg"`——**这是一次破坏性变更**。

{% note tip 有三个以上可能值的属性，一开始就用枚举 %}
宁可初期多写几个字符，也不要在后期被迫做破坏性迁移。
{% endnote %}

## 三、枚举 vs 配置对象

两种常见的扩展方式：

```html
<!-- 枚举：封闭、可校验 -->
<Button size="sm | md | lg" variant="primary | ghost | danger" />

<!-- 配置对象：开放、灵活 -->
<Table :columns="[{ key, title, width, align }]" />
```

| | 枚举 | 配置对象 |
| --- | --- | --- |
| 适用场景 | 外观、状态的**有限选项** | 数据驱动的**结构定义** |
| 能否穷举 | 能 | 不能（列名由业务决定） |
| 类型校验 | 容易 | 需要定义接口 |
| 扩展性 | 改组件 | 调用方自己扩展 |

{% note info 判断标准很简单 %}
**能穷举的用枚举，不能穷举的用配置对象。**

按钮尺寸能穷举；表格列不能。把表格列做成 `size="simple"` 是错的，把按钮尺寸做成 `config` 对象也是错的。
{% endnote %}

## 四、插槽开在哪里，是设计决策

插槽（slot / children）的开放程度决定了组件的**可定制上限**：

{% row %}
{% col %}
**不开插槽**

```html
<Alert text="操作成功" />
```

最封闭。调用方只能改文案。
{% endcol %}
{% col %}
**开默认插槽**

```html
<Alert>操作<strong>成功</strong></Alert>
```

允许富文本，但结构固定。
{% endcol %}
{% endrow %}

{% note tip 按"最可能的变化点"开插槽 %}
不要把所有区域都开成插槽（那等于没封装），也不要一个都不开（那等于不可定制）。

观察真实使用：哪个部分的变体最多，就把那个部分开成插槽。

本站主题的做法是：**结构由模板固定，内容用配置驱动，样式开放 CSS 变量**——因为主题的使用者不会改 HTML 结构，但一定会改配色和间距。
{% endnote %}

## 五、样式定制的接口：CSS 变量优于 className

组件库常见的两种定制方式：

```html
<!-- 方式一：传 class（脆弱） -->
<Button class="my-btn" />

<!-- 方式二：覆盖变量（稳定） -->
<Button style="--btn-bg: #333; --btn-radius: 4px;" />
```

{% note danger 方式一的问题 %}
传 `class` 意味着调用方要**匹配或压过组件内部的权重**，一旦组件内部结构微调，覆盖就可能失效。

而 CSS 变量是**赋值而非竞争**：组件内部写 `background: var(--btn-bg, #4F6BED)`，调用方传什么就是什么，与选择器权重无关。

这就是为什么现代组件库（以及本站主题）都选择暴露变量而不是开放 class。
{% endnote %}

## 六、默认值要"最常见"而不是"最安全"

```js
// ❌ 保守默认：调用方每次都要改
props: { size: 'md', align: 'left', closable: false }

// ✅ 按真实使用频率定默认
props: { size: 'md', align: 'left', closable: true }
```

{% fold 如何确定「最常见」 %}
统计现有调用点的传参分布。如果 80% 的调用都传了 `closable`，那默认值就应该是 `true`，剩下 20% 传 `false`。

**默认值的目标是让典型调用最简洁**——理想情况是大多数调用方什么都不用传。
{% endfold %}

## 七、迭代时不破坏既有调用

组件发布后修改 API 的成本远高于设计时多想一步。三条铁律：

{% timeline %}
{% event 一 %}
**只增不改**。新增属性，不要改已有属性的含义。`size` 从布尔改成枚举必须走大版本。
{% endevent %}
{% event 二 %}
**废弃要留过渡期**。旧属性继续生效并打警告，至少一个版本后再移除。
{% endevent %}
{% event 三 %}
**未知属性要透传**。用 v-bind="$attrs" 或展开运算符把未识别的属性传到根元素，这样调用方加 `aria-*` / `data-*` 时你不用改组件。
{% endevent %}
{% endtimeline %}

```jsx
function Button({ variant = 'primary', ...rest }) {
  return <button className={`btn btn-${variant}`} {...rest} />;
}
```

{% note warning 透传要小心的地方 %}
透传会把调用方传的 `class` / `style` / `onClick` 也带到根元素。如果组件内部也要用这些，记得**合并而不是覆盖**：

```jsx
<button className={['btn', rest.className].filter(Boolean).join(' ')} />
```
{% endnote %}

## 八、文档即 API 的一部分

一个没有文档的组件，等于 API 不完整。最小可用文档要包含：

1. **一个能跑的最小示例**（不是所有属性的罗列）；
2. **每个属性的类型、默认值、可选值**；
3. **至少一个真实场景示例**（比"基础用法"更有用）。

{% note tip 相关阅读 %}
[CommonJS 与 ESM：一次 require 报错背后的模块之争](/2026/10/17/fe-js-modules/) · [无障碍不是可选项：对比度、焦点与语义](/2026/10/17/design-accessibility/) · [视觉层级：让用户第一眼看到对的东西](/2026/10/17/design-visual-hierarchy/)
{% endnote %}
