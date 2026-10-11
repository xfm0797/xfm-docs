---
title: 功能与统计
mode: docs
layout: page
order: 34
description: features 功能开关、seo 搜索优化与 analytics 统计代码的配置方式。
keywords: [features, 暗色模式, 返回顶部, seo, jsonld, analytics]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 功能与统计

## features 功能开关

```yaml
features:
  dark_mode: true                # 暗色模式切换按钮
  back_to_top: true              # 返回顶部按钮
  reveal: true                   # 滚动进入视口淡入动画
  sticky_header: true            # 顶部导航吸顶
  stats_animation: true          # 数字滚动动画
```

| 开关 | 作用 | 关掉会怎样 |
| --- | --- | --- |
| `dark_mode` | 导航栏显示明暗切换按钮，选择被记忆 | 仅保留浅色，跟随系统的偏好也失效 |
| `back_to_top` | 右下角返回顶部按钮 | 长页面需要手动滚回顶部 |
| `reveal` | 元素进入视口时淡入上浮 | 内容直接显示，无入场动效 |
| `sticky_header` | 导航吸顶 | 导航随页面滚走，长页面跳转不便 |
| `stats_animation` | 数据统计数字滚动到目标值 | 数字直接显示最终值 |

{% note tip 动效与性能 %}
`reveal` 与 `stats_animation` 使用 `IntersectionObserver`，官方站保留即可。若你的访问者设备普遍较旧，或更看重"内容第一眼可见"，可以关掉 `reveal`。
{% endnote %}

主题同时遵循系统的 `prefers-reduced-motion`：用户在系统里开了"减弱动态效果"，主题会自动停用动效，与上面的开关无关。

## seo 搜索优化

```yaml
seo:
  description: ""                # 留空时回退到站点配置的 description
  keywords: ""                   # 留空时回退到站点配置的 keywords
  jsonld: true                   # 输出 Organization 结构化数据
```

| 字段 | 说明 |
| --- | --- |
| `description` | 页面 `<meta name="description">`，影响搜索结果摘要 |
| `keywords` | 页面 `<meta name="keywords">` |
| `jsonld` | 输出 Organization 结构化数据，帮助搜索结果展示机构信息 |

{% note info 留空则回退 %}
`seo.description` / `seo.keywords` 留空时会自动回退到站点 `_config.yml` 的 `description` / `keywords`，因此不必两处都写。
{% endnote %}

主题默认还输出了 Open Graph 与 Twitter Card 元信息（标题、摘要、封面、canonical），这部分**无需配置**，只要站点的 `url` 正确即可。

## analytics 统计代码

```yaml
analytics:
  google: ""                     # 如 G-XXXXXXXXXX
  cloudflare: ""                 # Cloudflare Web Analytics Beacon Token
```

| 字段 | 填什么 |
| --- | --- |
| `google` | Google Analytics 4 的衡量 ID，形如 `G-XXXXXXXXXX` |
| `cloudflare` | Cloudflare Web Analytics 的 Beacon Token |

**留空即关闭**，不会向页面注入任何统计脚本。

{% note warning 合规提示 %}
启用访问统计前，请确认符合你所在地区的隐私合规要求（如隐私政策披露、Cookie 告知等）。统计脚本由第三方提供，主题只负责按你填的 ID 注入。
{% endnote %}

## 一次配好

```yaml
features:
  dark_mode: true
  back_to_top: true
  reveal: true
  sticky_header: true
  stats_animation: true

seo:
  description: "XX 机构官网 —— 提供专业的一站式数字化服务。"
  keywords: "XX机构,数字化,解决方案"
  jsonld: true

analytics:
  google: "G-XXXXXXXXXX"
  cloudflare: ""
```

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/writing/, 写新闻与内容, file-doc, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/deploy/, 一键部署, arrow-up-right, outline %}
{% endcol %}
{% endrow %}
