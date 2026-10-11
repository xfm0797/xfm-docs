---
mode: docs

title: 选项卡与时间轴
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: tabs 选项卡与 timeline 时间轴的语法、参数与组合技巧。
keywords: [tabs, timeline, 选项卡, 时间轴, event]
order: 42
---

# 选项卡与时间轴

## tabs 选项卡

把并列的多套内容装进同一块区域，减少页面长度。

### 语法

```text
{% raw %}{% tabs %}
{% tab 第一项 %}
内容一
{% endtab %}
{% tab 第二项 %}
内容二
{% endtab %}
{% endtabs %}{% endraw %}
```

{% tabs %}
{% tab 第一项 %}
这是第一项的内容。选项卡适合展示「同一件事的多种做法」，例如不同包管理器的安装命令。
{% endtab %}
{% tab 第二项 %}
这是第二项的内容。切换时内容区不会跳变高度，阅读体验稳定。
{% endtab %}
{% endtabs %}

### 指定默认选中项

在某个 `tab` 后加 `active`（或 `on` / `true` / `1` / `default`）：

```text
{% raw %}{% tabs %}
{% tab 第一个 %}
默认不选中。
{% endtab %}
{% tab 第二个 active %}
这是默认选中的项。
{% endtab %}
{% endtabs %}{% endraw %}
```

{% tabs %}
{% tab 第一个 %}
默认不选中。
{% endtab %}
{% tab 第二个 active %}
因为带了 `active`，打开页面时这一项默认选中。
{% endtab %}
{% endtabs %}

{% note info 多个 active 时取最后一个 %}
若不慎给多项加了 `active`，主题会以**最后出现的那一项**为准。
{% endnote %}

### 八种注释写法（兼容其它主题）

如果你的内容来自其它主题，可能用的是 HTML 注释标记。主题同样兼容：

```text
{% raw %}{% tabs %}
<!-- tab 第一项 -->
内容一
<!-- endtab -->
<!-- tab 第二项 -->
内容二
<!-- endtab -->
{% endtabs %}{% endraw %}
```

{% tabs %}
<!-- tab 注释写法 A -->
用 HTML 注释切分标签。这是移植内容时最省事的写法。
<!-- endtab -->
<!-- tab 注释写法 B -->
主题会按正则逐段提取，第一项自动选中。
<!-- endtab -->
{% endtabs %}

{% note warning 两种写法不要混用 %}
同一个 `tabs` 块内，要么全用 `{% raw %}{% tab %}{% endraw %}`，要么全用 `<!-- tab -->`。混用会导致其中一种被当作普通文本输出。
{% endnote %}

### 典型场景

{% tabs %}
<!-- tab npm -->
```bash
npm i hexo-theme-xfm
```
<!-- endtab -->
<!-- tab pnpm -->
```bash
pnpm add hexo-theme-xfm
```
<!-- endtab -->
<!-- tab yarn -->
```bash
yarn add hexo-theme-xfm
```
<!-- endtab -->
{% endtabs %}

把"同一目的、不同工具"的内容做成选项卡，既省版面又方便读者跳到自己的路径。

## timeline 时间轴

适合呈现**有先后顺序**的内容：版本发布记录、操作步骤、项目里程碑。

### 语法

```text
{% raw %}{% timeline %}
{% event 标题 / 时间 / 颜色 %}
节点内容
{% endevent %}
{% endtimeline %}{% endraw %}
```

`event` 的三个参数用 `/` 分隔，**顺序固定为 标题 / 时间 / 颜色**：

| 位置 | 内容 | 必填 |
| --- | --- | --- |
| 1 | 标题 | 否 |
| 2 | 时间（任意文本，如 `2026-10`） | 否 |
| 3 | 颜色 | 否，默认 `primary` |

### 可用颜色

`primary` `success` `warning` `danger` `info` `default` `gray`

### 示例

{% timeline %}
{% event 项目启动 / 2026-01 / primary %}
确定技术选型与目录结构，完成第一版设计稿。
{% endevent %}
{% event 首个可用版本 / 2026-04 / success %}
发布 v0.1，具备完整的博客形态与配置体系。
{% endevent %}
{% event 三模式发布 / 2026-07 / info %}
新增 notes 与 docs 形态，支持单篇内容切换布局。
{% endevent %}
{% event 自适应重构 / 2026-10 / warning %}
从响应式改为自适应，三档独立令牌与形态。
{% endevent %}
{% endtimeline %}

### 时间轴与普通列表的取舍

{% row %}
{% col 6 %}
**用时间轴**

- 有明确的时间点或版本号
- 节点之间存在单向前后关系
- 希望强调"演进过程"
- 节点数量在 3–8 之间
{% endcol %}
{% col 6 %}
**用有序列表**

- 只是操作步骤，无时间属性
- 步骤超过 10 个（时间轴会过长）
- 需要嵌套子步骤
- 步骤之间可以并行
{% endcol %}
{% endrow %}

{% note tip 时间轴更适合"阶段"而不是"步骤" %}
每一步都很短的操作流程（如"点击设置 → 选择语言"），用有序列表更紧凑。时间轴的视觉重量较大，适合承载**有分量的阶段**。
{% endnote %}

## 组合示例

两者可以嵌套在其它插件内：

{% row %}
{% col 6 %}
{% note info 左侧选项卡 %}
{% raw %}{% tabs %}{% endraw %} 可以放进栅格或提示块。
{% endnote %}
{% endcol %}
{% col 6 %}
{% note tip 右侧时间轴 %}
{% raw %}{% timeline %}{% endraw %} 同理。
{% endnote %}
{% endcol %}
{% endrow %}

{% note warning 避免深层嵌套 %}
"选项卡里套时间轴、时间轴里再套栅格"这类深层组合在窄屏上会挤压得很难看。**嵌套深度建议不超过两层**。
{% endnote %}
