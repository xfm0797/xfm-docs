---
title: XFM 主题诞生记
date: 2026-10-01 10:00:00
updated: 2026-10-09 21:00:00
categories: [设计]
tags: [Hexo, 主题, 前端]
cover: /images/default-cover.svg
sticky: 100
description: 记录一款三模式 Hexo 主题的设计与实现过程。
---

这是一篇用于演示 XFM 主题排版效果的文章，包含丰富的 Markdown 扩展语法。

<!-- more -->

{% note info 写在前面 %}
XFM 主题支持 **博客 / 笔记 / 文档** 三种模式，一套配置即可切换形态。
{% endnote %}

## 排版演示

普通段落包含 **加粗**、*斜体*、~~删除线~~、[内链](/)、[外链](https://hexo.io) 与 `行内代码`。

> 引用块常用于强调重要观点。
> 支持多行内容。

### 列表

- 无序列表项一
- 无序列表项二
  - 嵌套子项
  - 另一个子项
- 无序列表项三

1. 有序列表项一
2. 有序列表项二
3. 有序列表项三

- [x] 已完成任务
- [ ] 未完成任务

### 表格

| 模式 | 适用场景 | 侧栏形态 |
| --- | --- | --- |
| blog | 个人博客 | 右侧挂件栏 |
| notes | 知识笔记 | 左侧笔记树 |
| docs | 产品文档 | 文档树 + 目录 |

## 代码演示

```javascript
const theme = {
  mode: 'blog',
  features: ['search', 'toc', 'lightbox']
};

export default theme;
```

```python
def hello(name: str) -> str:
    return f"Hello, {name}"
```

{% fold 点击查看隐藏内容 %}
折叠块适合放置冗长的补充材料，默认收起以保持正文清爽。
{% endfold %}

## 标签插件

{% tabs 演示 %}
<!-- tab 提示块 -->
支持多种语义色提示块。
<!-- endtab -->

<!-- tab 选项卡 -->
这是第二个选项卡的内容。
<!-- endtab -->

<!-- tab 时间轴 -->
时间轴用于展示历程。
<!-- endtab -->
{% endtabs %}

{% timeline %}
{% event 项目立项 / 2026-01 / primary %}
完成主题定位与原型设计。
{% endevent %}
{% event 首个预览版 / 2026-06 / success %}
三模式布局全部跑通。
{% endevent %}
{% event 正式发布 / 2026-10 / warning %}
发布 1.0 版本并开源。
{% endevent %}
{% endtimeline %}

{% row %}
{% col 6 %}
支持十二栅格布局，左侧列。
{% endcol %}
{% col 6 %}
支持十二栅格布局，右侧列。
{% endcol %}
{% endrow %}

{% note success 小贴士 %}
组合使用 {% label primary 标签 %} 与 {% button /archives/, 前往归档, archive, outline %} 可以做出丰富的排版。
{% endnote %}

{% linkcard https://hexo.io, Hexo 官方站, 快速、简洁且高效的博客框架 %}

## 数学公式

行内公式 $E=mc^2$ 与块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 流程图

{% mermaid %}
graph LR
  A[文章] --> B(主题渲染)
  B --> C{模式}
  C -->|blog| D[卡片流]
  C -->|notes| E[笔记树]
  C -->|docs| F[三栏文档]
{% endmermaid %}

## 图片

![演示图](/images/default-cover.svg)
