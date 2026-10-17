---
title: 中文排版：被忽略的那些细节
date: 2026-10-17 16:30:00
updated: 2026-10-17 16:30:00
categories: [设计]
tags: [排版, 中文, CSS]
description: 中文排版有一套与西文完全不同的规则：没有词间空格、没有大小写、字符等宽、标点占满字身。讲清九个能立刻提升观感的中文排版细节及其 CSS 实现。
---

把一套西文排版规范直接套到中文上，会得到"说不出哪里别扭"的结果。因为中文和西文的**排版单位完全不同**：西文以「词」为单位（靠空格分隔），中文以「字」为单位（等宽排列）。

这九处细节，每改一处观感就有可见提升。

<!-- more -->

## 一、中英混排加空格（盘古之白）

```text
❌ 本站使用Hexo 8构建，基于hexo-theme-xfm主题。

✅ 本站使用 Hexo 8 构建，基于 hexo-theme-xfm 主题。
```

在中英文/数字之间插入一个空格，是中文排版界的通行规范。原因是中英文字形的**视觉密度差异大**，紧挨着会显得拥挤且不易断行。

{% note tip 如果手工加空格太麻烦 %}
可以用工具自动处理（如 `pangu.js`），或在构建流程里加一步文本处理。但**手工处理的质量最高**，因为工具可能误伤代码、URL 等不该加空格的地方。

本站的做法是在写作时就加好空格，代码块与行内代码不受影响。
{% endnote %}

## 二、字体栈要把中文放在后面

```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto,
             "PingFang SC", "Hiragino Sans GB",
             "Microsoft YaHei", "Source Han Sans SC",
             "Noto Sans CJK SC", sans-serif;
```

{% note warning 顺序不能反 %}
西文字体在前、中文字体在后。因为中文字体**也包含西文字形**（通常质量一般），如果中文字体在前，英文会用中文字体里的西文字形渲染，观感明显变差。

浏览器逐字查找：遇到西文字符时用前面的西文字体，遇到中文时前面的字体没有该字形，fallback 到中文字体。
{% endnote %}

## 三、行高要比西文更大

| | 推荐行高 |
| --- | --- |
| 西文正文 | 1.5 ~ 1.6 |
| **中文正文** | **1.7 ~ 1.8** |

原因：汉字笔画密度高、字面率高（字符几乎填满字身框），行与行之间需要更多空间才能区分清楚。

```css
.prose { line-height: 1.75; }
```

## 四、标点占位与挤压

中文标点**占满一个字身**（全角），而西文标点只占半角。这带来两个问题：

### 一、连续标点出现过宽空隙

```text
他说：「好的。」    ← 「」之间空隙明显
```

用 CSS 处理：

```css
.prose {
  /* 相邻标点挤压（支持度有限，作为渐进增强） */
  text-spacing-trim: punctuation;
}
```

### 二、避头尾规则

行首不能出现 `。，、！？：；）》」` 等标点，行尾不能出现 `（《「` 等开引号。

{% note info 浏览器默认会做一点 %}
现代浏览器默认应用了基本的避头尾（`line-break: auto`）。如需更严格：

```css
.prose { line-break: strict; }
```

但 `strict` 在某些场景会造成稀疏的行，一般 `auto` 就够了。
{% endnote %}

## 五、字重：中文没有真正的梯度

```css
/* 西文字体常有 9 个字重，中文字体通常只有 2~3 个 */
```

当你写 `font-weight: 600` 而字体只有 Regular 和 Bold 两档时，浏览器会**合成伪粗体**——把笔画加粗描边，效果是笔画粘连、发虚。

{% row %}
{% col %}
**建议**

- 正文用 `400`
- 强调/标题用 `600` 或 `700`（对应实际 Bold 档）
- 避免 `500`（最容易触发不稳定的合成）
{% endcol %}
{% col %}
**变量字体的机会**

现代中文字体（如思源黑体 VF）支持连续字重。用变量字体时 `500` 是真实存在的，可以放心用。

```css
@font-face {
  font-family: 'SourceHanVF';
  src: url('...woff2') format('woff2-vf');
  font-weight: 100 900;
}
```
{% endcol %}
{% endrow %}

## 六、行内代码在中文里的字号

```css
code {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: .9em;   /* 关键 */
}
```

等宽字体的西文字符比中文宽，如果 `code` 用 `1em`，在中文段落里会明显"顶"出来，破坏行内节奏。`0.9em` 能让它在视觉上与汉字高度接近。

## 七、数字与西文的对齐（`font-variant-numeric`）

```css
.prose { font-variant-numeric: proportional-nums; }  /* 正文：比例数字 */
table, .stat { font-variant-numeric: tabular-nums; } /* 表格/统计：等宽数字 */
```

{% fold 为什么要区分 %}
很多字体的数字默认是**等宽**（tabular），每个数字占相同宽度——这是为了表格对齐。但在正文里，等宽数字的观感偏"机械"，比例数字（proportional）更自然。

反过来，表格和统计数字**必须**用等宽数字，否则数字变化时列宽会跳动。
{% endfold %}

## 八、首行缩进要不要

{% row %}
{% col %}
**中文传统排版**：段落首行缩进 2 字符

```css
.prose p { text-indent: 2em; }
```
{% endcol %}
{% col %}
**现代网页排版**：段落间空行，不缩进

```css
.prose p { margin-bottom: 1em; }
```
{% endcol %}
{% endrow %}

{% note danger 不要两个都用 %}
**缩进 + 空行**是重复表达段落分隔，会让页面显得松散且冗余。

网页场景（尤其是技术文档、博客）推荐**空行不缩进**——因为屏幕阅读时，空行的分隔效果比缩进更清晰，且首行缩进在窄屏上会浪费两字符的空间。
{% endnote %}

## 九、断行规则

```css
.prose {
  word-break: normal;      /* 中文不要用 break-all */
  overflow-wrap: break-word;  /* 只让超长 URL 这类断开 */
  line-break: auto;
}
```

{% note warning 不要用 `word-break: break-all` %}
它会让**中文在任意字符处断行**，本该正常换行的文本被拆得七零八落。中文默认就可以在任意字符间断行，不需要这个属性。

`break-all` 只对长串无分隔的西文（URL、哈希值）有意义，而那个场景应该用 `overflow-wrap: break-word`（只在必要时断）。
{% endnote %}

## 十、九个细节的检查清单

{% timeline %}
{% event 一 %}
中英文之间是否都有空格？
{% endevent %}
{% event 二 %}
字体栈是否西文在前、中文在后？
{% endevent %}
{% event 三 %}
正文行高是否 ≥ 1.7？
{% endevent %}
{% event 四 %}
行内代码是否缩小到 0.9em？
{% endevent %}
{% event 五 %}
标题字重是否落在真实字重档位上？
{% endevent %}
{% event 六 %}
表格数字是否用了等宽数字？
{% endevent %}
{% event 七 %}
是否同时用了首行缩进和段间空行？（不该同时用）
{% endevent %}
{% event 八 %}
是否误用了 `word-break: break-all`？
{% endevent %}
{% event 九 %}
窄屏（390px）下一行大约多少字？应在 22~30 字之间。
{% endevent %}
{% endtimeline %}

{% note tip 相关阅读 %}
[字号阶梯：为什么随便写的字号一定会乱](/2026/10/17/design-type-scale/) · [间距系统：为什么你的页面总差那么一点](/2026/10/17/design-spacing-system/) · [空状态设计：没有数据时的那一屏](/2026/10/17/design-empty-state/)
{% endnote %}
