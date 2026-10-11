---
mode: docs

title: 栅格与行内元素
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: row/col 栅格、button 按钮、label 徽标、icon 图标的语法与参数。
keywords: [栅格, row, col, button, label, icon, 徽标, 图标]
order: 43
---

# 栅格与行内元素

## row / col 栅格

12 列栅格，用于并排展示内容。

### 语法

```text
{% raw %}{% row %}
{% col 6 %}左半栏{% endcol %}
{% col 6 %}右半栏{% endcol %}
{% endrow %}{% endraw %}
```

`col` 后的数字是**占用的列数**（1–12）。取值会被夹在 `1–12` 之间，非数字则按默认宽度。

### 示例

{% row %}
{% col 6 %}
**左半栏（6 列）**

适合放并列的两组信息。
{% endcol %}
{% col 6 %}
**右半栏（6 列）**

左右等高对齐。
{% endcol %}
{% endrow %}

{% row %}
{% col 4 %}
**三分之一**

`col 4`
{% endcol %}
{% col 4 %}
**三分之一**

`col 4`
{% endcol %}
{% col 4 %}
**三分之一**

`col 4`
{% endcol %}
{% endrow %}

{% row %}
{% col 3 %}
`col 3`
{% endcol %}
{% col 3 %}
`col 3`
{% endcol %}
{% col 3 %}
`col 3`
{% endcol %}
{% col 3 %}
`col 3`
{% endcol %}
{% endrow %}

### 栅格在窄屏的行为

栅格由主题的 `plugins.css` 控制，窄屏下会自动**堆叠为单列**。你不需要为移动端写第二套标签。

{% note warning 总列数不必正好 12 %}
`{% raw %}{% row %}{% endraw %}` 内各项的列数**不要求和为 12**。填 5 + 5 会留出空档，填 8 + 8 会溢出换行。建议刻意凑成 12 或它的因数（6+6、4+4+4、3×4）。
{% endnote %}

### 常见布局配方

```text
{% raw %}{% row %}
{% col 6 %}…{% endcol %}
{% col 6 %}…{% endcol %}
{% endrow %}{% endraw %}
        → 双栏对半

{% raw %}{% row %}
{% col 8 %}…{% endcol %}
{% col 4 %}…{% endcol %}
{% endrow %}{% endraw %}
        → 主次布局（2:1）

{% raw %}{% row %}
{% col 4 %}…{% endcol %}
{% col 4 %}…{% endcol %}
{% col 4 %}…{% endcol %}
{% endrow %}{% endraw %}
        → 三栏卡片
```

## button 按钮

### 语法

```text
{% raw %}{% button 链接, 标题, 图标, 样式 %}{% endraw %}
```

**逗号分隔**，四个位置参数：

| 位置 | 参数 | 必填 | 默认 |
| --- | --- | --- | --- |
| 1 | 链接地址 | 否 | `#` |
| 2 | 按钮文字 | 否 | `Button` |
| 3 | 图标名 | 否 | 无 |
| 4 | 样式 | 否 | `fill` |

### 样式

| 值 | 效果 |
| --- | --- |
| `fill` | 实心，主色背景 |
| `outline` | 描边，透明背景 |

### 示例

{% row %}
{% col 6 %}
{% button /docs/xfm/quick-start/, 开始使用, arrow-right, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xfm/config/, 查看配置, compass, outline %}
{% endcol %}
{% endrow %}

{% row %}
{% col 4 %}
[实心按钮 `fill`]
{% button /docs/xfm/install/, 安装, download, fill %}
{% endcol %}
{% col 4 %}
[描边按钮 `outline`]
{% button /docs/xfm/faq/, 常见问题, info, outline %}
{% endcol %}
{% col 4 %}
[外链按钮（自动新窗口）]
{% button https://github.com/xfm0797/hexo-theme-xfm, GitHub, github, fill %}
{% endcol %}
{% endrow %}

### 外链自动处理

链接以 `http://` / `https://` 开头时，插件会自动加上 `target="_blank" rel="noopener noreferrer"`，无需手动处理。

### btn 别名

```text
{% raw %}{% btn /docs/, 文档, book, fill %}{% endraw %}
```

## label 徽标

行内小标签，用于版本号、状态、分类标记。

### 语法

```text
{% raw %}{% label 颜色 文本 %}{% endraw %}
```

颜色与文本**顺序可换**，逗号或空格均可分隔。

### 可用颜色

| 颜色 | 效果 |
| --- | --- |
| `default` | 中性灰 |
| `primary` | 主色 |
| `success` | 绿色 |
| `warning` | 橙色 |
| `danger` | 红色 |
| `info` | 蓝色 |
| `purple` | 紫色 |
| `gray` | 灰色 |

### 示例

{% label success 稳定 %} 已通过全量测试，可放心使用。

{% label warning 实验性 %} 功能可用，但接口可能变动。

{% label danger 已废弃 %} 请迁移到新方案。

{% label primary 新特性 %} 本次版本新增。

{% label info 需要配置 %} 请先在 `_config.yml` 中开启。

{% label purple 进阶 %} 面向有经验的用户。

{% label gray 可选 %} 不配置也能正常工作。

### 组合成状态行

{% label success 已支持 %} {% label info v1.0 %} {% label purple 文档模式 %}

### badge 别名

```text
{% raw %}{% badge primary 新 %}{% endraw %}
```

## icon 图标

插入主题内置的 SVG 图标。

### 语法

```text
{% raw %}{% icon 图标名, 尺寸 %}{% endraw %}
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| 图标名 | 否 | 默认 `star`；不匹配时渲染为空 |
| 尺寸（px） | 否 | 默认继承字号大小 |

### 示例

{% icon home, 18 %} 首页
{% icon archive, 18 %} 归档
{% icon folder, 18 %} 分类
{% icon tag, 18 %} 标签
{% icon search, 18 %} 搜索
{% icon github, 18 %} GitHub
{% icon rss, 18 %} 订阅
{% icon download, 18 %} 下载
{% icon info, 18 %} 信息
{% icon warning, 18 %} 警告
{% icon star, 18 %} 收藏
{% icon fire, 18 %} 热门
{% icon bulb, 18 %} 灵感

### 常用图标名

{% row %}
{% col 6 %}
**导航**
`home` `archive` `folder` `tag` `compass` `link` `list` `book` `file-doc`
{% endcol %}
{% col 6 %}
**账号**
`user` `github` `twitter` `weibo` `qq` `email` `rss` `globe`
{% endcol %}
{% endrow %}

{% row %}
{% col 6 %}
**状态**
`info` `warning` `check` `close` `star` `bulb` `quote` `fire` `heart`
{% endcol %}
{% col 6 %}
**操作**
`search` `copy` `download` `external` `share` `arrow-right` `chevron-down`
{% endcol %}
{% endrow %}

完整清单见 `layout/_partials/sprite.ejs`。

### fa 别名

```text
{% raw %}{% fa github, 20 %}{% endraw %}
```

## 组合示例

下面是本页"开始使用"区块的实际写法：

```text
{% raw %}{% row %}
{% col 6 %}
{% button /docs/xfm/quick-start/, 开始使用, arrow-right, fill %}
{% endcol %}
{% col 6 %}
{% note tip 提示 %}
{% label success 推荐 %} 先跑通最小示例。
{% endnote %}
{% endcol %}
{% endrow %}{% endraw %}
```

{% row %}
{% col 6 %}
{% button /docs/xfm/quick-start/, 开始使用, arrow-right, fill %}
{% endcol %}
{% col 6 %}
{% note tip 提示 %}
{% label success 推荐 %} 先跑通最小示例，再回过头精调配置。
{% endnote %}
{% endcol %}
{% endrow %}
