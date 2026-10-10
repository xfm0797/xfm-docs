---
title: 首页板块
mode: docs
layout: page
order: 12
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

首页由 `sections` 数组驱动：**删除任意一行即隐藏该板块，调整顺序即调整首页结构**。每个板块的数据（标题、副标题、条目、图标、链接）都在 `_config.yml` 对应节点下配置。

## 可用板块

```yaml
sections:
  - hero            # 首屏横幅
  - quicklinks      # 快捷入口（政务/校园常用）
  - stats           # 数据统计（数字滚动动画）
  - services        # 核心业务
  - about           # 关于我们
  - products        # 产品与案例
  - news            # 新闻动态（自动取最新文章）
  - team            # 团队 / 名师风采
  - partners        # 合作伙伴
  - gallery         # 风采图库
  - cta             # 行动号召条
  - contact         # 联系我们
  - about-contact   # 关于我们 + 联系我们 左右合排（一屏收尾）
```

## 板块说明

| 板块 | 作用 | 关键配置 |
| --- | --- | --- |
| `hero` | 首屏横幅 | `hero.badge / title / subtitle / buttons / image`（`title` 支持 `<em>` 高亮与 `<br>` 换行） |
| `quicklinks` | 快捷入口（办事大厅、下载中心等） | `quicklinks.items[]`（icon / name / url） |
| `stats` | 数据统计，数字自动滚动 | `stats.items[]`（value 支持小数、suffix、label） |
| `services` | 核心业务 / 服务 | `services.items[]`（icon / title / desc / url） |
| `about` | 关于我们 | `about.content`（支持 HTML）、`about.link` |
| `products` | 产品与案例 | `products.items[]`（image / title / desc / url / tags） |
| `news` | 新闻动态，自动取最新文章 | `news.count`、`news.more` |
| `team` | 团队 / 名师风采 | `team.items[]`（name / role / avatar / desc） |
| `partners` | 合作伙伴（logo 为空时显示名称文字） | `partners.items[]` |
| `gallery` | 机构风采图库 | `gallery.items[]`（image / caption） |
| `cta` | 行动号召条 | `cta.title / subtitle / button` |
| `contact` | 联系我们 | `contact.address / phone / email / hours / wechat / form_action / map` |
| `about-contact` | 关于我们 + 联系我们左右合排 | `about-contact.enable`（文案取自 `about` 与 `contact` 节点） |

## 板块渲染流程

{% mermaid %}
graph TD
  A[theme.sections] --> B[遍历每个名称]
  B --> C["_partial/section-<name>.ejs"]
  C --> D[读取 _config.yml 对应节点]
  D --> E[渲染板块 HTML]
{% endmermaid %}

{% note tip 合排版板块 %}
`about-contact` 是一个合并板块：它不读自己的文案，而是把 `about` 与 `contact` 两个节点的内容左右合排展示，适合放在首页末尾一屏收尾。需在 `sections` 中显式存在才会渲染。
{% endnote %}
