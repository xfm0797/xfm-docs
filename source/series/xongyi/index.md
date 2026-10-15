---
title: 系列文章 · 从零造一个机构官网主题
layout: page
date: 2026-10-15 17:00:00
updated: 2026-10-15 23:30:00
description: hexo-theme-xongyi 开发全过程的 8 篇系列文章总入口：机构官网的需求拆解、三套预设、首页板块编排、配置产品化、内容建模、零依赖前端、五平台部署与产品化落地。
comments: false
---

这是 **hexo-theme-xongyi** 的开发过程系列：一套面向机构官网（企业 / 政务 / 教育）的 Hexo 通用主题，从需求拆解到真实客户站落地的完整路径。

{% note tip 一句话 %}
三套预设 + 12 个可编排首页板块 + 60+ 项配置，客户改文案不用碰代码，推到 GitHub 就上线。
{% endnote %}

## 全系列篇目

| # | 篇目 | 你会拿到什么 |
| --- | --- | --- |
| 一 | [机构官网到底需要什么](/2026/10/15/series-xongyi-01-institutional-website/) | 与个人博客的四个本质差异、三类客户诉求、仓库形态的两次取舍 |
| 二 | [三套预设布局](/2026/10/15/series-xongyi-02-preset-system/) | `body.preset-*` 只覆盖变量、预设的边界、政务红对比度、新增第四套预设 |
| 三 | [首页板块系统](/2026/10/15/series-xongyi-03-section-system/) | 7 行模板 + 一个数组驱动 12 个板块、合并板块静默跳过的坑 |
| 四 | [配置即产品](/2026/10/15/series-xongyi-04-config-as-product/) | 按页面区域分组、`_config.<主题名>.yml` 覆盖升级不丢、配置项取舍 |
| 五 | [内容建模](/2026/10/15/series-xongyi-05-content-modeling/) | 新闻 / 页面 / 结构化数据三层模型、front-matter 与目录约定 |
| 六 | [零依赖前端](/2026/10/15/series-xongyi-06-vanilla-frontend/) | 防闪烁暗色、内联 SVG 图标 helper、无后端表单、两个 IntersectionObserver |
| 七 | [部署工程化](/2026/10/15/series-xongyi-07-deploy-engineering/) | 五平台配置对照、三个「本地能跑平台 404」的坑 |
| 八 | [从主题到产品](/2026/10/15/series-xongyi-08-from-theme-to-product/) | 仓库形态改造、演示站、真实客户站、两套主题的方法论差异 |

## 建议的阅读顺序

{% timeline %}
{% event 先理解需求 / 第一、四篇 / primary %}
机构官网的客户不是开发者——这个约束决定了后面所有取舍。读完这两篇就能判断这套思路适不适合你的场景。
{% endevent %}
{% event 再看两个核心机制 / 第二、三篇 / info %}
预设（换气质）与板块数组（换结构）是这套主题的两根支柱，各自独立，可挑着读。
{% endevent %}
{% event 然后是实现细节 / 第五、六篇 / success %}
内容怎么存、前端怎么做。写过 Hexo 主题的人可以跳过第五篇的前半部分。
{% endevent %}
{% event 最后是交付 / 第七、八篇 / warning %}
部署与产品化。如果你的主题要给客户用，这两篇的取舍判断比代码更有参考价值。
{% endevent %}
{% endtimeline %}

## 适合谁

- **要给机构 / 客户做官网**：第一、四、八篇讲的是需求、配置组织与交付方式；
- **想做可换肤的主题**：第二篇的预设机制可直接照搬；
- **想让首页可编排**：第三篇的数组驱动 + 命名约定；
- **关心零依赖前端**：第六篇的暗色、图标、表单、动效实现。

## 相关资源

{% row %}
{% col 6 %}
**源码与演示**

[hexo-theme-xongyi · GitHub](https://github.com/xfm0797/hexo-theme-xongyi) · [演示站仓库](https://github.com/xfm0797/hexo-theme-xongyi-demo)
{% endcol %}
{% col 6 %}
**官方文档**

[主题简介](/docs/xongyi/intro/) · [配置参考](/docs/xongyi/config/) · [首页板块](/docs/xongyi/sections/) · [部署](/docs/xongyi/deploy/)
{% endcol %}
{% endrow %}

{% note info 姐妹系列 %}
本系列面向「机构官网」，另一系列 [从零造一个 Hexo 主题](/series/) 面向「博客 / 笔记 / 文档」三模式主题。两者是同一套作者、不同的产品定位，第八篇末尾有对比。
{% endnote %}
