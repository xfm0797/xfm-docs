---
title: 板块配置详解
mode: docs
layout: page
order: 21
description: 逐个板块的配置字段与写法：hero、quicklinks、stats、services、products、news、team、partners、gallery、cta、about-contact。
keywords: [板块配置, hero, quicklinks, stats, services, products, news, team]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 板块配置详解

本页给出每个板块的配置字段与可直接套用的写法。所有片段都可以写进站点根的 `_config.hexo-theme-xongyi.yml`。

## hero 首屏横幅

```yaml
hero:
  badge: "Xongyi · 通用企业官网主题"      # 小徽标，可留空
  title: "让机构形象<br><em>更具竞争力</em>"  # 支持 <br> 换行与 <em> 高亮
  subtitle: "基于 Hexo 的高性能官网解决方案……"
  buttons:
    - { name: "了解我们", url: "/about/", primary: true }   # primary 为主按钮
    - { name: "查看产品", url: "/products/" }
  image: "/images/hero.svg"              # 首屏插图；留空则显示居中窄幅布局
```

{% note info title 里的两个小语法 %}
`<em>` 会渲染成主题主色的强调文字，`<br>` 用于手动换行 —— 二者是首屏标题唯一的"富文本"，避免标题过长导致排版失控。
{% endnote %}

## quicklinks 快捷入口

政务 / 校园场景的高频入口条，通常紧跟首屏：

```yaml
quicklinks:
  title: "快速通道"
  subtitle: "常用服务一键直达"
  items:
    - { icon: "zap", name: "在线申报", url: "/contact/" }
    - { icon: "file-text", name: "下载中心", url: "/about/" }
    - { icon: "search", name: "信息查询", url: "/archives/" }
    - { icon: "message-circle", name: "咨询反馈", url: "/contact/" }
```

## stats 数据统计

数字进入视口后自动滚动到目标值（`features.stats_animation` 控制开关）：

```yaml
stats:
  items:
    - { value: 500, suffix: "+", label: "服务客户" }
    - { value: 120, suffix: "+", label: "成功案例" }
    - { value: 10, suffix: " 年", label: "行业经验" }
    - { value: 99.9, suffix: "%", label: "服务可用性" }   # 支持小数
```

## services 核心业务

```yaml
services:
  title: "核心业务"
  subtitle: "我们为客户提供全方位的专业服务"
  items:
    - { icon: "monitor", title: "软件开发", desc: "定制化软件解决方案，助力机构数字化转型。", url: "/products/" }
    - { icon: "cloud", title: "云服务", desc: "高可用云架构设计与部署运维托管服务。", url: "/products/" }
    - { icon: "shield", title: "安全保障", desc: "等保合规、数据加密与安全审计服务。", url: "/products/" }
    - { icon: "chart", title: "数据分析", desc: "业务数据挖掘与可视化决策支持。", url: "/products/" }
```

{% note tip 图标用哪个 %}
`icon` 取[图标速查](/docs/xongyi/icons/)里的名称即可，找不到合适的就用 `star` / `zap` / `layers` 这类通用图标。
{% endnote %}

## about 关于我们

```yaml
about:
  title: "关于我们"
  subtitle: "十余年深耕，只为更专业的服务"
  image: "/images/about.svg"
  content: |
    <p>我们是一家专注于数字化服务的科技公司，成立于 2016 年。</p>
    <ul>
      <li>核心成员平均 8 年以上行业经验</li>
      <li>累计交付 500+ 企业级项目</li>
    </ul>
  link:
    name: "了解更多"
    url: "/about/"
```

{% note warning content 是 HTML %}
`about.content` 使用 `|` 块书写**原生 HTML**，不会被 Markdown 渲染 —— 这是有意为之，方便在里面放宽列表与段落。请确保标签闭合。
{% endnote %}

## products 产品与案例

```yaml
products:
  title: "产品与案例"
  subtitle: "经典案例见证专业实力"
  items:
    - { image: "/images/thumb-1.svg", title: "智慧园区管理平台", desc: "园区一体化运营管理。", url: "/products/", tags: ["SaaS", "物联网"] }
    - { image: "/images/thumb-2.svg", title: "数据可视化决策平台", desc: "实时大屏与经营看板。", url: "/products/", tags: ["大数据", "BI"] }
  link:
    name: "查看全部"
    url: "/products/"
```

`tags` 为可选的角标数组，用于在卡片上标注技术 / 行业属性。

## news 新闻动态

**唯一一个动态板块**——内容取自站点文章，不需要配置内容，只控制展示条数与跳转：

```yaml
news:
  title: "新闻动态"
  subtitle: "了解我们的最新进展"
  count: 3                       # 首页展示条数
  more:
    name: "查看全部"
    url: "/news/"
```

{% note info 内容从哪儿来 %}
`news` 读取站点最新文章（按 `date` 倒序），等价于 `/news/` 列表页的前 `count` 条。写作方式见[写新闻与内容](/docs/xongyi/writing/)。
{% endnote %}

## team 团队 / 名师风采

```yaml
team:
  title: "核心团队"
  subtitle: "经验丰富的专业团队"
  items:
    - { name: "张明", role: "创始人 / CEO", avatar: "/images/avatar.svg", desc: "15 年软件行业经验" }
    - { name: "李婷", role: "技术合伙人 / CTO", avatar: "/images/avatar.svg", desc: "前一线大厂架构师" }
```

校园场景可把 `title` 改为「名师风采」，`role` 写成「特级教师 / 语文」之类。

## partners 合作伙伴

```yaml
partners:
  title: "合作伙伴"
  subtitle: "与众多优秀机构长期同行"
  items:
    - { name: "科技集团", logo: "" }     # logo 留空则显示名称文字
    - { name: "商业银行", logo: "" }
```

{% note tip 没 logo 也不尴尬 %}
`logo` 留空时板块会渲染成文字标签墙，同样整洁；有正式 logo 时再替换为图片地址。
{% endnote %}

## gallery 机构风采

```yaml
gallery:
  title: "机构风采"
  subtitle: "工作环境与团队活动"
  items:
    - { image: "/images/thumb-1.svg", caption: "年度技术峰会" }
    - { image: "/images/thumb-2.svg", caption: "团队建设活动" }
```

## cta 行动号召条

```yaml
cta:
  title: "准备好了吗？让我们一起开始合作"
  subtitle: "告诉我们您的需求，1 个工作日内获得专属方案"
  button:
    name: "立即咨询"
    url: "/contact/"
```

## about-contact 合排版

```yaml
about-contact:
  enable: true
```

它把 `about` 与 `contact` 两个节点的内容左右合排，适合作为首页的收尾。文案**不在这里配置**，而是复用上面两个节点。

## 完整示例：一个精简首页

```yaml
sections:
  - hero
  - quicklinks
  - stats
  - services
  - news
  - cta
  - about-contact

hero:
  badge: "XX 机构"
  title: "让服务<br><em>更值得信赖</em>"
  subtitle: "一句话说清你的价值主张。"
  buttons:
    - { name: "了解我们", url: "/about/", primary: true }

quicklinks:
  title: "快速通道"
  items:
    - { icon: "zap", name: "在线办理", url: "/contact/" }
    - { icon: "download", name: "资料下载", url: "/about/" }

stats:
  items:
    - { value: 500, suffix: "+", label: "服务客户" }
    - { value: 10, suffix: " 年", label: "行业经验" }

services:
  title: "核心业务"
  items:
    - { icon: "monitor", title: "软件开发", desc: "定制化解决方案。", url: "/products/" }

news:
  title: "新闻动态"
  count: 3

cta:
  title: "联系我们获取专属方案"
  button: { name: "立即咨询", url: "/contact/" }

about-contact:
  enable: true
```

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/config/, 配置参考, settings, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/icons/, 图标速查, star, outline %}
{% endcol %}
{% endrow %}
