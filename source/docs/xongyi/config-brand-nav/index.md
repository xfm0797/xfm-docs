---
title: 品牌与导航
mode: docs
layout: page
order: 31
description: brand 品牌信息与 menu / nav_button 顶部导航的配置方式与注意事项。
keywords: [brand, menu, nav_button, 导航, logo]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 品牌与导航

## brand 品牌信息

```yaml
brand:
  name: "Xongyi"                 # 站点名称，logo 为空时显示
  slogan: "专业 · 可靠 · 值得信赖"
  logo: "/images/logo.svg"       # 建议高度 40px；留空 "" 则仅显示文字
  favicon: "/images/favicon.svg"
```

| 字段 | 作用 | 备注 |
| --- | --- | --- |
| `name` | 站点名称 | 出现在导航栏品牌区、页脚与 SEO 元信息 |
| `slogan` | 一句话标语 | 导航栏品牌名下方（空间不足时自动隐藏） |
| `logo` | 品牌图形 | 建议**高度 40px** 的 SVG / PNG；留空只显示文字 |
| `favicon` | 浏览器标签图标 | 建议 `.svg` 或 32×32 的 `.png` |

{% note info 图片放在哪 %}
主题自带的示例图在 `themes/hexo-theme-xongyi/source/images/`。**你自己的图片应该放在站点** `source/images/` 下，路径写 `/images/xxx.svg` 即可（`source/` 下的内容会原样复制到 `public/`）。
{% endnote %}

## menu 顶部导航

导航是**数组**形式，顺序即显示顺序：

```yaml
menu:
  - { name: "首页", url: "/" }
  - { name: "关于我们", url: "/about/" }
  - { name: "产品服务", url: "/products/" }
  - { name: "新闻动态", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }
```

| 字段 | 说明 |
| --- | --- |
| `name` | 菜单文字 |
| `url` | 目标地址。**站内地址以 `/` 开头并以 `/` 结尾**（pretty URL） |
| `icon` | 可选，图标名（见[图标速查](/docs/xongyi/icons/)） |

{% note warning 站内链接请用 pretty URL %}
写 `/about/` 而不是 `/about` 或 `/about/index.html`，既符合主题生成的路由形态，也能避免部署到子目录时的相对路径问题。
{% endnote %}

## nav_button 导航右侧按钮

导航栏最右侧的行动按钮，用于突出最重要的转化入口：

```yaml
nav_button:
  name: "立即咨询"
  url: "/contact/"
```

**不填 `name` 则不显示按钮** —— 若你的站点不需要行动按钮，直接删掉这一段或留空即可。

## 移动端表现

导航在移动端自动收进抽屉菜单（由 `source/js/main.js` 控制），无需额外配置。但请遵守两条实践：

- **菜单项控制在 7 个以内**，超过后小屏会挤；
- **名称尽量短**（2–6 字），中文比英文更省空间。

## 常见组合

{% tabs %}
{% tab 企业官网 active %}
```yaml
menu:
  - { name: "首页", url: "/" }
  - { name: "关于我们", url: "/about/" }
  - { name: "产品服务", url: "/products/" }
  - { name: "新闻动态", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }
nav_button: { name: "立即咨询", url: "/contact/" }
```
{% endtab %}
{% tab 政务门户 %}
```yaml
menu:
  - { name: "首页", url: "/" }
  - { name: "政务公开", url: "/about/" }
  - { name: "办事服务", url: "/products/" }
  - { name: "通知公告", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }
nav_button: { name: "政务服务入口", url: "/contact/" }
```
{% endtab %}
{% tab 学校官网 %}
```yaml
menu:
  - { name: "首页", url: "/" }
  - { name: "学校概况", url: "/about/" }
  - { name: "教育教学", url: "/products/" }
  - { name: "校园动态", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }
nav_button: { name: "招生咨询", url: "/contact/" }
```
{% endtab %}
{% endtabs %}

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/config-contact/, 联系与地图, map-pin, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/config-footer/, 页脚与备案, settings, outline %}
{% endcol %}
{% endrow %}
