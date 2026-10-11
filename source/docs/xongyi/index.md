---
title: hexo-theme-xongyi 主题文档
mode: docs
layout: page
order: 0
description: hexo-theme-xongyi 官方文档 —— 机构官网通用主题，三套预设布局 + 12 个可排序首页板块。
keywords: [Hexo 主题, Xongyi, 企业官网, 政务网站, 学校网站]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# hexo-theme-xongyi 主题文档

**Xongyi** 是一款面向**机构官网**场景的 Hexo 通用主题：内置**企业（enterprise）/ 政务（government）/ 教育（education）三套预设布局**与 **12 个可自由排序的首页板块**，60+ 项配置全部集中在 `_config.yml`，**无需修改任何模板或样式代码**即可完成整站搭建。

{% note info %}
本页是 **hexo-theme-xongyi** 文档分区的入口（位于 `/docs/xongyi/`）。左侧文档树由站点根目录的 `source/_data/docs.yml` 驱动，每一篇文档都是一个独立的 Hexo 页面（`source/docs/xongyi/<slug>/index.md`）。
{% endnote %}

## 从哪儿开始

{% row %}
{% col %}
{% note success %}
**第一次用？**
先看 [主题简介](/docs/xongyi/intro/) 与 [5 分钟上手](/docs/xongyi/quick-start/)，十分钟内跑起你的第一个 Xongyi 官网。
{% endnote %}
{% endcol %}
{% col %}
{% note info %}
**要改外观 / 内容？**
直接翻 [配置参考](/docs/xongyi/config/)，整站的文案与开关都由 `_config.yml` 决定。
{% endnote %}
{% endcol %}
{% endrow %}

## 文档结构

{% row %}
{% col %}
- [快速开始](/docs/xongyi/intro/) —— 简介、安装、上手
- [预设布局](/docs/xongyi/preset/) —— 企业 / 政务 / 教育
- [首页板块](/docs/xongyi/sections/) —— 12 个板块的编排与配置
{% endcol %}
{% col %}
- [配置参考](/docs/xongyi/config/) —— 品牌、导航、联系、页脚、功能
- [内容与新闻](/docs/xongyi/writing/) —— 写新闻、建页面、front-matter
- [定制与进阶](/docs/xongyi/icons/) —— 图标、样式、目录结构
{% endcol %}
{% col %}
- [部署](/docs/xongyi/deploy/) —— 五大平台一键部署
- [帮助](/docs/xongyi/faq/) —— 常见问题与故障排查
{% endcol %}
{% endrow %}

## 核心特性速览

{% timeline %}
{% event 三套预设，一行切换 / 预设 / primary %}
`preset` 一行配置即可在企业蓝、政务红、学院青之间切换。预设不只是配色——默认板块组合与文案基调都随之调整，并且三套预设各自适配暗色模式。

{% endevent %}
{% event 12 个首页板块自由编排 / 首页 / info %}
首页由 `sections` 数组驱动：**删除一行隐藏板块，调整顺序改变结构**。从首屏横幅到行动号召条，一屏之内即可讲完一个机构的故事。

{% endevent %}
{% event 60+ 项配置全部配置化 / 配置 / success %}
品牌、导航、页脚、备案号、社交链接、SEO、统计代码、联系表单、地图嵌入……全部集中在 `_config.yml` 并带中文注释，改配置即可上线。

{% endevent %}
{% event 零框架依赖 / 性能 / warning %}
原生 JavaScript + 单 CSS 文件，没有 jQuery、没有构建工具，配合 Hexo 静态生成，Lighthouse 表现优异。

{% endevent %}
{% event 五大平台一键部署 / 部署 / danger %}
仓库自带 GitHub Pages / Vercel / Netlify / Cloudflare Pages / 腾讯 EdgeOne Pages 配置，Fork 演示站即可上线。

{% endevent %}
{% endtimeline %}

## 能力全景

| 维度 | 能力 |
| --- | --- |
| 预设 | `enterprise` 商务蓝 / `government` 中国红 / `education` 学院青 |
| 首页板块 | 横幅、快捷入口、数据统计、核心业务、关于我们、产品案例、新闻动态、团队、合作伙伴、风采图库、行动条、联系我们，以及「关于我们 + 联系我们」左右合排版 |
| 导航 | 顶部菜单 + 右侧行动按钮、吸顶、移动端抽屉菜单 |
| 内容 | 文章即新闻，自动生成新闻列表 / 归档 / 分类 / 标签页；页面支持 `subtitle` 副标题 |
| 联系 | 地址 / 电话 / 邮箱 / 服务时间 / 微信二维码 / 表单服务 / 地图嵌入 |
| 合规 | ICP 备案号与公安备案号（含跳转地址） |
| 交互 | 暗色模式、返回顶部、滚动淡入、数字滚动动画（均可开关） |
| SEO | Open Graph / Twitter Card / JSON-LD、canonical 全覆盖 |
| 统计 | Google Analytics / Cloudflare Web Analytics |
| 国际化 | 内置 `zh-CN` / `en` 文案包 |
| 无障碍 | 跳转链接、aria 标签、`prefers-reduced-motion` 降级 |
| 资源 | 30+ Feather 风格线性图标、logo / favicon / 插图 / 缩略图全套 SVG |

## 与 hexo-theme-xfm 的关系

本站收录 XFM 开源的两套主题文档，二者定位互补：

| | hexo-theme-xfm | hexo-theme-xongyi |
| --- | --- | --- |
| 定位 | 面向长期**写作** | 面向机构**官网** |
| 形态 | blog / notes / docs 三模式 | 单形态（首页板块流） |
| 核心 | 文档树、笔记树、阅读体验 | 预设布局、首页板块编排 |
| 适合 | 个人博客、知识库、产品文档 | 企业官网、政务门户、学校网站 |
| 文档 | [hexo-theme-xfm 主题文档](/docs/xfm/) | 你正在阅读的本篇 |

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/install/, 安装与部署, download, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/quick-start/, 5 分钟上手, arrow-right, outline %}
{% endcol %}
{% endrow %}
