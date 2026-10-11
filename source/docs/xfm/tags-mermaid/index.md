---
mode: docs

title: 图表与链接卡片
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: mermaid 流程图与 linkcard 链接卡片的语法，以及数学公式的写法。
keywords: [mermaid, 流程图, linkcard, 链接卡片, 数学公式, katex]
order: 44
---

# 图表与链接卡片

## mermaid 流程图

在正文里直接画流程图、时序图、状态图。

### 语法

```text
{% raw %}{% mermaid %}
graph LR
  A --> B
{% endmermaid %}{% endraw %}
```

标签体内写**标准 Mermaid 语法**，内容原样输出到 `<div class="mermaid">`，由前端加载的 Mermaid 库渲染。

### 前置条件

Mermaid 需要在主题配置里开启（默认开启）：

```yaml
vendors:
  mermaid: true
  mermaid_version: "10.9.1"
  mermaid_theme: default      # default / forest / dark / neutral
```

库从 CDN 按需加载，**不需要安装任何依赖**。渲染使用动态 `import()`，因此不会阻塞首屏。

### 示例：流程图

{% mermaid %}
graph LR
  A[用户请求] --> B{已登录？}
  B -->|是| C[读取缓存]
  B -->|否| D[跳转登录]
  C --> E[返回页面]
  D --> A
{% endmermaid %}

### 示例：时序图

{% mermaid %}
sequenceDiagram
  participant U as 读者
  participant B as 浏览器
  participant S as 静态站
  U->>B: 打开 /docs/xfm/intro/
  B->>S: 请求 index.html
  S-->>B: 返回 HTML
  B->>B: 执行 boot 脚本定档
  B-->>U: 渲染对应档位布局
{% endmermaid %}

### 示例：状态图

{% mermaid %}
stateDiagram-v2
  [*] --> 浅色
  浅色 --> 深色: 点击切换
  深色 --> 跟随系统: 再次点击
  跟随系统 --> 浅色: 再次点击
{% endmermaid %}

### 深浅色跟随

主题注册了 `xfm:schemechange` 事件监听：当用户在浅色 / 深色之间切换时，Mermaid 会**重新初始化并重绘**，图表的配色跟随页面主题变化。

{% note warning 图表数量不宜过多 %}
Mermaid 是前端渲染，图表较多或较复杂时会拖慢页面。**单页建议不超过 3 张**。复杂的架构图更适合用图片（可被灯箱放大查看）。
{% endnote %}

### 常见语法错误

{% tabs %}
<!-- tab 节点文字含特殊字符 -->
```text
graph LR
  A[标签: 说明] --> B    %% 冒号可能引起解析歧义
```
含 `:` `()` `,` 的文字建议用引号包裹：
```text
graph LR
  A["标签: 说明"] --> B
```
<!-- endtab -->
<!-- tab 箭头写法 -->
```text
A -> B      %% 错误：Mermaid 用 -->

A --> B     %% 正确
A --- B     %% 无箭头连线
```
<!-- endtab -->
<!-- tab 缩进与换行 -->
标签体内**首尾空行会被自动去除**，但内部缩进会被保留。第一行必须直接是 `graph` / `sequenceDiagram` 等声明，不能有空行。
<!-- endtab -->
{% endtabs %}

## linkcard 链接卡片

比普通 Markdown 链接更醒目的站外链接展示。

### 语法

```text
{% raw %}{% linkcard 链接, 名称, 简介, 头像 %}{% endraw %}
```

**逗号分隔**，四个位置参数：

| 位置 | 参数 | 必填 | 说明 |
| --- | --- | --- | --- |
| 1 | 链接地址 | 否 | 默认 `#` |
| 2 | 名称 | 否 | 留空则显示域名 |
| 3 | 简介 | 否 | 一两句话描述 |
| 4 | 头像 / 图标 | 否 | 图片地址；留空显示链接图标 |

### 示例

{% linkcard https://github.com/xfm0797/hexo-theme-xfm, XFM 主题源码, 高端大气的 Hexo 三模式主题，一套代码覆盖博客 / 笔记 / 文档, /images/avatar.svg %}

{% linkcard https://hexo.io/, Hexo 官网, 快速、简洁且高效的博客框架 %}

{% linkcard https://github.com/xfm0797/hexo-theme-xfm, 不带简介的卡片 %}

### 卡片结构

插件会从链接中**自动解析域名**并显示在卡片底部：

```text
┌────────┬──────────────────────────────┬───┐
│ 头像   │ 名称                          │ → │
│        │ 简介                          │   │
│        │ github.com                    │   │
└────────┴──────────────────────────────┴───┘
```

### 与友链卡片的区别

| | `{% raw %}{% linkcard %}{% endraw %}` | `links:` 友链 |
| --- | --- | --- |
| 位置 | 正文中任意位置 | `type: links` 页面的专属网格 |
| 数据源 | 写在标签参数里 | 主题 `_config.yml` 的 `links` 数组 |
| 布局 | 单个卡片，可并排 | 自动网格排列 |
| 适用 | 正文中引用外部资源 | 单独的友链页 |

## 数学公式

数学公式**不使用标签插件**，而是按 Markdown 常规语法书写，由主题按 `vendors.math` 加载 KaTeX 或 MathJax 渲染。

```yaml
vendors:
  math: katex                # katex / mathjax / none
  katex_version: "0.16.9"
  mathjax_version: "3.2.2"
  math_auto_render: true
```

### 行内公式

行内公式用 `$…$`：

```text
质能方程 $E = mc^2$ 揭示了两者的关系。
```

### 块级公式

块级公式用 `$$…$$`：

```text
$$
\text{阅读时长} = \left\lceil \frac{\text{字数}}{\text{每分钟字数}} \right\rceil
$$
```

### 转义注意

在 Markdown 中，公式里的下划线 `_` 可能被解析为斜体标记。若遇到公式渲染异常，用反斜杠转义或改用块级公式：

```text
行内风险写法： $a_1 + a_2$
安全写法：     $a\_1 + a\_2$    或     $$a_1 + a_2$$
```

### 引擎选择

| 引擎 | 特点 | 适合 |
| --- | --- | --- |
| `katex` | 解析快、无二次排版跳动 | 默认，公式不复杂的场景 |
| `mathjax` | 语法覆盖广、支持更多宏包 | 大量 LaTeX 迁移内容 |
| `none` | 不加载任何数学库 | 完全不需要公式，省带宽 |

{% note info 关闭自动渲染 %}
如果你已在其它地方（如站点注入脚本）手动初始化了数学渲染，把 `vendors.math_auto_render` 设为 `false`，避免重复渲染。
{% endnote %}

### 示例

阅读时长按以下方式估算：

$$
\text{minutes} = \max\left(1,\ \text{round}\left(\frac{\text{words}}{\text{wpm}}\right)\right)
$$

其中 `wpm` 由 `post.words_per_minute` 配置（默认 350）。
