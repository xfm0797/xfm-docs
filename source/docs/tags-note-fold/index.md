---
mode: docs

title: 提示与折叠
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: note 提示块与 fold 折叠块的完整语法、语义色与使用场景。
keywords: [note, fold, 提示块, 折叠, 警告框]
order: 41
---

# 提示与折叠

## note 提示块

用于强调信息、给出警告或补充说明。

### 语法

```text
{% raw %}{% note 类型 标题 %}
内容，支持 Markdown。
{% endnote %}{% endraw %}
```

类型与标题**顺序可换**，插件会逐个判断：命中语义色则作为类型，其余的第一个作为标题。

```text
{% raw %}{% note info 标题 %}…{% endnote %}{% endraw %}
{% raw %}{% note 标题 info %}…{% endnote %}{% endraw %}   ← 等价
{% raw %}{% note info %}…{% endnote %}{% endraw %}          ← 无标题
{% raw %}{% note %}…{% endnote %}{% endraw %}               ← 默认样式
```

### 八种语义色

| 类型 | 颜色 | 图标 | 典型用途 |
| --- | --- | --- | --- |
| `default` | 中性灰 | 📄 note | 普通补充说明 |
| `primary` | 主色 | ⭐ star | 重点强调 |
| `info` | 蓝色 | ⓘ info | 背景信息、前置知识 |
| `success` | 绿色 | ✓ check | 推荐做法、正确示范 |
| `warning` | 橙色 | ⚠ warning | 注意事项、易错点 |
| `danger` | 红色 | ✕ close | 破坏性操作、严重警告 |
| `tip` | 青色 | 💡 bulb | 技巧、优化建议 |
| `quote` | 灰紫 | ❝ quote | 引用、摘录 |

{% note info 信息 %}
这是 `info` 类型，用于给出背景信息或前置知识。
{% endnote %}

{% note success 推荐 %}
这是 `success` 类型，用于展示推荐做法。
{% endnote %}

{% note warning 注意 %}
这是 `warning` 类型，用于提示容易踩坑的地方。
{% endnote %}

{% note danger 危险 %}
这是 `danger` 类型，用于警告破坏性操作或严重问题。
{% endnote %}

{% note tip 技巧 %}
这是 `tip` 类型，用于给出优化建议。
{% endnote %}

{% note quote 引用 %}
这是 `quote` 类型，用于摘录他人观点或大段引用。
{% endnote %}

### 简写形式

除 `default` 外，每种类型都有一个**独立标签**，可以省去类型参数：

```text
{% raw %}{% info 标题 %}…{% endinfo %}{% endraw %}
{% raw %}{% success 标题 %}…{% endsuccess %}{% endraw %}
{% raw %}{% warning 标题 %}…{% endwarning %}{% endraw %}
{% raw %}{% danger 标题 %}…{% enddanger %}{% endraw %}
{% raw %}{% tip 标题 %}…{% endtip %}{% endraw %}
{% raw %}{% quote 标题 %}…{% endquote %}{% endraw %}
```

{% tip 简写的价值 %}
在写作时更省事：写 `{% raw %}{% warning 注意 %}{% endraw %}` 比 `{% raw %}{% note warning 注意 %}{% endraw %}` 少打一个词，语义一样清晰。
{% endtip %}

### 标签体支持 Markdown

{% note primary 这是一个复杂示例 %}
标签体内可以包含：

1. **有序列表**，以及
2. `行内代码`、[链接](/docs/tags/)
3. 甚至是引用：

> 引用块也能正常工作。

以及代码块：

```js
const a = 1;
```
{% endnote %}

{% note warning 标题会被转义 %}
标题中的 HTML 特殊字符会被转义为实体，因此不能在标题里写 HTML 标签。标题只接受纯文本。
{% endnote %}

## fold 折叠块

用于收纳长内容——代码、详细步骤、日志等，保持阅读节奏。

### 语法

```text
{% raw %}{% fold 标题 %}
默认收起的内容。
{% endfold %}{% endraw %}
```

### 默认展开

在标题后加 `open`（或 `show` / `true` / `1`）：

```text
{% raw %}{% fold 标题 open %}
这段内容默认展开。
{% endfold %}{% endraw %}
```

{% fold 点击展开查看内容 %}
这里是折叠起来的内容。折叠块本身是一个 `<details>` 元素，**不依赖 JavaScript**，因此即使脚本被禁用也能正常展开收起。
{% endfold %}

{% fold 默认展开的示例 open %}
因为加了 `open` 参数，这段内容初始就是展开状态。适用于"内容重要但篇幅较长"的场景。
{% endfold %}

### 不写标题

```text
{% raw %}{% fold %}
无标题内容，摘要行显示默认文案。
{% endfold %}{% endraw %}
```

此时摘要行显示"展开查看更多"。

{% fold %}
这是一个无标题折叠块。
{% endfold %}

### collapse 别名

`collapse` 与 `fold` 完全等价，任选其一：

```text
{% raw %}{% collapse 标题 %}…{% endcollapse %}{% endraw %}
```

## 使用建议

{% row %}
{% col 6 %}
**note 用在什么位置**

- 章节开头交代前置条件 → `info`
- 步骤中间提示易错点 → `warning`
- 结尾给出最佳实践 → `tip` 或 `success`
- 部署 / 删库 / 重置类操作前 → `danger`
{% endcol %}
{% col 6 %}
**fold 用在什么位置**

- 大段代码的全量实现
- 可选的详细推导过程
- 完整的配置清单
- 报错日志原文

判断标准：**读者"可能"需要** → fold；**读者"必须"看到** → 直接展开。
{% endcol %}
{% endrow %}

{% note danger 不要滥用强调 %}
一页里出现五六个 `danger` 块，读者会逐渐麻木，真正危险的信息反而被忽略。**每种语义色的使用频次建议不超过每页 2 次。**
{% endnote %}
