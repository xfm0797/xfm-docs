---
mode: docs

title: SEO 与站点地图
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: OG / Twitter Card、canonical、JSON-LD、sitemap.xml、robots.txt 与 404 页的配置。
keywords: [SEO, OG, Twitter Card, sitemap, robots, JSON-LD, 404]
order: 53
---

# SEO 与站点地图

## SEO 配置

```yaml
seo:
  # 是否在 <head> 输出 Open Graph / Twitter Card meta
  og_meta: true
  # 默认分享图（封面图缺失时的兜底）
  og_image:
  # JSON-LD 结构化数据
  json_ld: true
  # canonical 链接
  canonical: true
  # meta 关键词兜底（文章取 tags）
  keywords: ""
  # 是否输出百度站点验证所需的 meta（需自行配置 key）
  baidu_verify:
  google_verify:
```

| 配置项 | 说明 |
| --- | --- |
| `og_meta` | 输出 `og:*` 与 `twitter:*` 系列 meta |
| `og_image` | 文章无 `cover` / `banner` 时的分享图兜底 |
| `json_ld` | 输出 `BlogPosting` 结构化数据 |
| `canonical` | 输出 `<link rel="canonical">`，避免重复内容 |
| `keywords` | 与文章 tags、站点 keywords 合并去重后输出 |
| `baidu_verify` | 填入百度站长平台给的验证串 |
| `google_verify` | 填入 Search Console 给的验证串 |

{% note danger url 必须正确 %}
`canonical`、OG 图、`sitemap.xml` 全部基于站点 `_config.yml` 的 `url` 拼接。**`url` 填错会导致搜索引擎收录到错误的地址**。部署前务必核对。

```yaml
# 站点 _config.yml
url: https://docs.example.com
root: /
```
{% endnote %}

## 描述与关键词的取值

主题按以下优先级生成 `<meta name="description">`：

```text
page.description
  ↓ 无则
page.excerpt
  ↓ 无则
config.description（站点 _config.yml）
```

最终统一做 160 字截断。**SEO 的收益几乎全在 `description` 上**，所以每篇文档都应认真写这一项。

关键词的合并规则：

```text
文章的 tags
  + theme.seo.keywords（逗号分隔）
  + config.keywords（逗号分隔）
  ↓
去重、去空、保序
```

## Open Graph 与 Twitter Card

`og_meta: true` 时输出：

```html
<meta property="og:site_name" content="...">
<meta property="og:type" content="article">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
<meta property="og:image" content="...">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">
```

分享图的取值：

```text
page.cover  →  page.banner  →  theme.seo.og_image
```

{% note info 文档站的 OG 图从哪来 %}
文档页通常没有 `cover`。建议设置一张统一的品牌分享图：

```yaml
seo:
  og_image: /images/og-cover.png
```

尺寸建议 1200×630。这样任何文档被分享到社交平台时都有统一、可辨识的预览图。
{% endnote %}

## 站点地图

```yaml
sitemap:
  enable: true
  robots: false
  # sitemap 中排除的路径
  exclude: []
```

主题**内置**生成器（`scripts/generators/sitemap.js`），不需要安装 `hexo-generator-sitemap`。

### 收录范围

| 来源 | 说明 |
| --- | --- |
| 首页 | 优先级 `1.0` |
| 全部文章 | 跳过草稿，优先级 `0.6` |
| 全部页面 | 跳过首页 |
| 全部标签页 | 优先级 `0.6` |
| 全部分类页 | 优先级 `0.6` |

每条带 `lastmod`（取 `updated` 或 `date`），并对 URL 去重。

### 排除路径

```yaml
sitemap:
  exclude:
    - /draft/
    - /internal/
```

命中的 URL 会被剔除。匹配方式是**子串包含**，因此 `/draft/` 会排除所有含该片段的地址。

### robots.txt

```yaml
sitemap:
  robots: true
```

开启后会额外生成：

```text
User-agent: *
Allow: /

Sitemap: https://docs.example.com/sitemap.xml
```

{% note warning robots 默认关闭 %}
`sitemap.robots` 默认是 `false`。如果你已在站点 `source/robots.txt` 手写了规则，保持关闭即可；否则打开它会生成一份基础版。
{% endnote %}

## 404 页

```yaml
error_404:
  enable: true
  # 自动注入主题内置的 404 页（若站点已有 404 页则忽略）
  auto_generate: true
  # 标题与文案
  title: 页面走失了
  subtitle: 你访问的页面不存在，或许它已被移动或删除。
  # 显示的推荐文章数量
  recommend_count: 4
```

### 智能行为

生成器会先检查站点里是否**已经存在**自定义 404 页面：

```text
public/404.html
source/404.md
```

只要命中任一个，主题就**不再生成**，尊重你的自定义版本。

### 内置 404 页包含什么

- 配置的标题与副标题
- 返回首页按钮
- 按发布日期倒序的 `recommend_count` 篇推荐文章

### 手动定制

想完全掌控 404 页，创建 `source/404.md`：

```yaml
---
title: 页面走失了
layout: 404
---

你访问的页面不存在。

[返回首页](/) 或 [查看全部文档](/docs/)
```

{% note tip 文档站把 404 页做成导航页 %}
文档站的 404 页最好的做法是**列出文档树的顶层入口**，让走错的读者能快速找到目标，而不是只有一个"返回首页"。可以用标签插件拼一个：

```text
{% raw %}{% row %}
{% col 6 %}
{% button /docs/quick-start/, 快速开始, arrow-right, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/config/, 配置参考, compass, outline %}
{% endcol %}
{% endrow %}{% endraw %}
```
{% endnote %}

## 检查清单

上线前逐项确认：

{% timeline %}
{% event 站点 url 正确 / 必查 / danger %}
`_config.yml` 的 `url` 与最终访问地址完全一致（含协议、无尾部斜杠）。
{% endevent %}
{% event 每篇都有 description / 必查 / warning %}
影响搜索结果摘要与 SEO 权重，是收益最高的一项。
{% endevent %}
{% event sitemap 可访问 / 必查 / warning %}
访问 `/sitemap.xml` 应返回合法 XML，且包含你的文档页。
{% endevent %}
{% event robots 策略明确 / 建议 / info %}
要么开启生成，要么自己写 `source/robots.txt`。不留空白。
{% endevent %}
{% event 分享图统一 / 建议 / success %}
设置 `seo.og_image`，用社交平台的调试工具验证预览效果。
{% endevent %}
{% event 站点验证串已填 / 可选 / primary %}
`seo.baidu_verify` / `seo.google_verify` 填好后在站长平台点击验证。
{% endevent %}
{% endtimeline %}
