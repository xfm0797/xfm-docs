---
title: xongyi：雄亿仪器网 —— 主题的真实落地案例
date: 2026-10-11 21:00:00
categories: [开源项目]
tags: [Hexo, 站点案例, 企业官网, 部署]
description: 用 hexo-theme-xongyi 搭建的真实企业官网案例源码 —— 佛山市顺德区雄亿检测仪器有限公司站点。
---

**xongyi** 仓库是一份公开的 Hexo 站点源码，也是 [hexo-theme-xongyi](/2026/10/11/opensource-hexo-theme-xongyi/) 主题的**真实落地案例** —— 佛山市顺德区雄亿检测仪器有限公司官网。

<!-- more -->

## 站点信息

| 项 | 内容 |
| --- | --- |
| 站点名 | 雄亿仪器网 |
| 定位 | 检测仪器 · 实验设备专业供应商 |
| 主题 | hexo-theme-xongyi |
| 框架 | Hexo 8.1.2 |
| 地址 | https://www.xongyi.com |

站点内容覆盖涂料检测仪器、橡胶检测仪器、实验室通用分析仪器、光学仪器、进口仪器与实验耗材等产品线。

## 目录结构

```
xongyi/
├── _config.yml        # 站点配置（品牌、SEO、关键词）
├── source/
│   ├── _posts/        # 新闻 / 动态
│   ├── about-us/      # 关于我们
│   ├── contact/       # 联系我们
│   ├── categories/    # 分类页
│   ├── search/        # 站内搜索
│   └── images/        # 站点图片资源
├── scripts/           # 站点级扩展脚本
├── tools/             # 辅助工具
└── themes/xongyi/     # 主题
```

它把主题的 12 个首页板块与三套预设真实用在了生产环境，可作为「主题如何支撑一个完整机构官网」的参考。

{% linkcard https://github.com/xfm0797/xongyi, xongyi 站点源码, 雄亿仪器网 · hexo-theme-xongyi 落地案例 %}
