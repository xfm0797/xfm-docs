---
title: 配置总览
mode: docs
layout: page
order: 30
description: Xongyi 主题配置的全貌：配置生效优先级、模块划分与常用项速查表。
keywords: [配置, _config.yml, 覆盖, 速查]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 配置总览

Xongyi 的全部可调项都在 `_config.yml` 中，**60+ 项、带中文注释**。本页是总入口，具体模块见各分页。

## 配置放在哪

```text
站点根/
├── _config.yml                       # Hexo 站点配置（title / url / theme ...）
└── _config.hexo-theme-xongyi.yml     # ★ 你的主题覆盖（只写要改的键）
        ↓ 深合并
themes/hexo-theme-xongyi/_config.yml # 主题默认值（不要直接改）
```

| 文件 | 谁维护 | 说明 |
| --- | --- | --- |
| `_config.yml` | 你 | 站点级配置：`title`、`description`、`language`、`url`、`root`、`theme`、`permalink` |
| `_config.hexo-theme-xongyi.yml` | 你 | 主题覆盖：品牌、导航、板块、页脚、SEO……**日常只改这个** |
| `themes/hexo-theme-xongyi/_config.yml` | 主题作者 | 默认值与注释，作为参考查阅 |

{% note tip 优先级记忆法 %}
**越靠近站点根，优先级越高。** 站点覆盖文件 > 主题默认值；未覆盖的键自动回退到主题默认值。
{% endnote %}

## 模块划分

| 模块 | 配置键 | 说明 | 详见 |
| --- | --- | --- | --- |
| 预设 | `preset` | 三套预设布局切换 | [三套预设](/docs/xongyi/preset/) |
| 品牌 | `brand` | 名称、slogan、logo、favicon | [品牌与导航](/docs/xongyi/config-brand-nav/) |
| 导航 | `menu` / `nav_button` | 顶部菜单与右侧行动按钮 | [品牌与导航](/docs/xongyi/config-brand-nav/) |
| 板块 | `sections` + 各板块节点 | 首页结构与内容 | [首页板块](/docs/xongyi/sections-config/) |
| 联系 | `contact` | 地址、电话、邮箱、表单、地图 | [联系与地图](/docs/xongyi/config-contact/) |
| 页脚 | `footer` | 简介、栏目、版权、备案号 | [页脚与备案](/docs/xongyi/config-footer/) |
| 社交 | `social` | 页脚 / 头部的社交入口 | [页脚与备案](/docs/xongyi/config-footer/) |
| 功能 | `features` | 暗色模式、返回顶部、动画、吸顶 | [功能与统计](/docs/xongyi/config-features/) |
| SEO | `seo` | 描述、关键词、JSON-LD | [功能与统计](/docs/xongyi/config-features/) |
| 统计 | `analytics` | GA / Cloudflare 统计 ID | [功能与统计](/docs/xongyi/config-features/) |

## 常用项速查

| 配置 | 说明 |
| --- | --- |
| `preset` | 预设风格：enterprise / government / education |
| `brand` | 站点名称、slogan、logo、favicon |
| `menu` / `nav_button` | 顶部导航与右侧按钮 |
| `sections` | 首页板块顺序 |
| `hero` | 首屏文案、按钮、插图 |
| `contact` | 地址 / 电话 / 邮箱 / 服务时间 / 微信二维码 / 表单 / 地图 |
| `footer.icp` | ICP 备案号与公安备案号 |
| `features` | 暗色模式、返回顶部、滚动动画、吸顶导航开关 |
| `seo` | 描述、关键词、JSON-LD |
| `analytics` | Google Analytics / Cloudflare Analytics ID |

## 一份覆盖文件的样子

```yaml
# 站点根目录 _config.hexo-theme-xongyi.yml
preset: enterprise

brand:
  name: "我的机构"
  slogan: "专业 · 可靠 · 值得信赖"

menu:
  - { name: "首页", url: "/" }
  - { name: "关于我们", url: "/about/" }
  - { name: "产品服务", url: "/products/" }
  - { name: "新闻动态", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }

nav_button:
  name: "立即咨询"
  url: "/contact/"

sections:
  - hero
  - stats
  - services
  - news
  - cta
  - about-contact

contact:
  phone: "400-000-0000"
  email: "hello@example.com"

footer:
  copyright: "© 2026 我的机构 · 保留所有权利"
```

## 改完配置做什么

```bash
hexo clean && hexo generate     # 或 hexo server 边改边看
```

{% note warning 为什么必须 clean %}
Hexo 会缓存渲染结果与主题配置。改完 YAML 若页面没变化，多半是缓存 —— 先 `hexo clean` 再构建即可。
{% endnote %}

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/config-brand-nav/, 品牌与导航, settings, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/icons/, 图标速查, star, outline %}
{% endcol %}
{% endrow %}
