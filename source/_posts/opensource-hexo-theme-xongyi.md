---
title: hexo-theme-xongyi：面向机构官网的三预设 Hexo 主题
date: 2026-10-11 22:20:00
categories: [开源项目]
tags: [Hexo, 主题, 官网, 响应式]
description: 内置企业 / 政务 / 教育三套预设布局与 12 个可自由排序首页板块的机构官网主题，60+ 项配置全部集中在 _config.yml。
---

**Xongyi** 是一款面向机构官网场景的 Hexo 通用主题，内置**企业 / 政务 / 教育**三套预设布局与 12 个可自由排序的首页板块，60+ 项配置全部集中在 `_config.yml`，无需修改代码即可完成整站搭建。

<!-- more -->

## 三套预设

| 预设 | 配色 | 适用 |
| --- | --- | --- |
| `enterprise` | 商务蓝 | 企业官网 |
| `government` | 政务红 | 政务门户 |
| `education` | 学院青 | 学校 / 教育机构 |

一行配置即可切换。

## 12 个首页板块

横幅、快捷入口、数据统计、核心业务、关于我们、产品案例、新闻动态、团队、合作伙伴、风采图库、行动条、联系我们 —— 支持启用 / 关闭 / 自由排序，另有「关于我们 + 联系我们」左右合排版。

## 其他特性

- **零框架依赖**：原生 JS + 单 CSS 文件，Lighthouse 表现优异
- **暗色模式**：跟随系统的明暗切换，三套预设各自适配
- **完全响应式**：桌面 / 平板 / 手机抽屉菜单
- **SEO 友好**：OG / Twitter Card / JSON-LD、canonical 全覆盖
- **新闻系统**：文章即动态，自动生成新闻列表、归档、分类、标签页
- **无障碍**：跳转链接、aria 标签、`prefers-reduced-motion` 支持

## 安装

```bash
git clone https://github.com/xfm0797/hexo-theme-xongyi.git themes/xongyi
```

也支持下载解压与 git submodule 两种引入方式，配合[官方演示站](/2026/10/11/opensource-hexo-theme-xongyi-demo/)可一键部署到五大平台。

{% linkcard https://github.com/xfm0797/hexo-theme-xongyi, hexo-theme-xongyi 源码仓库, 机构官网通用 Hexo 主题 · MIT %}
