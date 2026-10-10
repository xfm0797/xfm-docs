---
title: 标签插件
mode: docs
layout: page
order: 6
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

所有标签插件在 Markdown 正文中直接使用，无需额外引入。

## 提示块 note

支持 `default / primary / info / success / warning / danger / tip / quote` 八种语义：

```
{% note success 标题 %}
内容
{% endnote %}
```

{% note success 效果预览 %}
这是一个 success 提示块，适合放置正向结论或小贴士。
{% endnote %}

## 折叠块 fold

默认收起，加 `open` 参数可默认展开：

```
{% fold 标题 open %}
内容
{% endfold %}
```

{% fold 展开查看折叠内容 %}
折叠块适合放置冗长的补充材料，默认收起以保持正文清爽。
{% endfold %}

## 选项卡 tabs

```
{% tabs 演示 %}
<!-- tab 第一项 -->
内容一
<!-- endtab -->
<!-- tab 第二项 -->
内容二
<!-- endtab -->
{% endtabs %}
```

{% tabs 演示 %}
<!-- tab 第一项 -->
选项卡的第一项内容。
<!-- endtab -->
<!-- tab 第二项 -->
选项卡的第二项内容。
<!-- endtab -->
{% endtabs %}

也兼容 `{% tab 标题 active %}…{% endtab %}` 的原生写法。

## 时间轴 timeline

```
{% timeline %}
{% event 标题 / 2026-01 / primary %}
节点内容
{% endevent %}
{% endtimeline %}
```

{% timeline %}
{% event 项目立项 / 2026-01 / primary %}
完成主题定位与原型设计。
{% endevent %}
{% event 首个预览版 / 2026-06 / success %}
三模式布局全部跑通。
{% endevent %}
{% endtimeline %}

## 栅格 row / col

```
{% row %}
{% col 6 %}左半栏{% endcol %}
{% col 6 %}右半栏{% endcol %}
{% endrow %}
```

{% row %}
{% col 4 %}
**12 栅格**左列
{% endcol %}
{% col 4 %}
中列
{% endcol %}
{% col 4 %}
右列
{% endcol %}
{% endrow %}

## 按钮 / 徽标 / 图标

```
{% button /archives/, 查看归档, archive, outline %}
{% label primary 新特性 %}
{% icon github, 20 %}
```

{% label primary 新特性 %} {% label success 已发布 %} {% label warning 实验性 %}

{% button /docs/xfm/, 返回文档首页, home, outline %}

## 流程图 mermaid

```
{% mermaid %}
graph LR
  A --> B
{% endmermaid %}
```

## 链接卡片 linkcard

```
{% linkcard https://example.com, 站名, 简介, /images/avatar.svg %}
```

{% linkcard https://github.com/xfm0797/hexo-theme-xfm, hexo-theme-xfm, 高端大气的三模式 Hexo 主题 %}
