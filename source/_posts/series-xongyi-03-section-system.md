---
title: 从零造一个机构官网主题（三）：首页板块系统——把首页做成可编排的数组
date: 2026-10-15 19:00:00
updated: 2026-10-15 19:00:00
categories: [主题开发]
tags: [Hexo, EJS, 架构, 主题开发]
description: 用 7 行模板 + 一个数组驱动 12 个首页板块：命名约定、开关与排序规则、合并板块静默跳过的坑，以及新增自定义板块的标准姿势。
---

机构官网的首页是最难做通用的一页：企业要放产品，学校要放师资，政府要放办事入口。**如果首页写死成一个模板，这个主题就只能用在一个客户身上。**

我的解法是把首页做成一个**可编排的数组**——`layout/index.ejs` 只有 7 行。

<!-- more -->

## 一、核心：7 行模板

```ejs
<%# 首页：按 theme.sections 配置的顺序渲染各板块 %>
<% (theme.sections || []).forEach(function (name) {
  var conf = theme[name];
  if (!conf || conf.enable === false) return;
%>
<%- partial('_partial/section-' + name) %>
<% }) %>
```

配合配置里的数组：

```yaml
sections:
  - hero
  - quicklinks
  - stats
  - services
  - products
  - news
  - team
  - partners
  - gallery
  - cta
  - about-contact
```

{% note tip 三个约定撑起整套机制 %}
1. **数组顺序 = 渲染顺序**：想调整首页结构，拖动数组元素即可；
2. **partial 命名 = `section-<name>.ejs`**：约定优于配置，不需要注册表；
3. **板块数据 = `theme.<name>`**：每个板块的配置节点与它同名。
{% endnote %}

客户的典型操作：「把新闻放到产品前面」——在 YAML 里挪一行，不用碰任何代码。

## 二、12 个板块与它们的职责

| 板块 | 内容 | 数据来自 |
| --- | --- | --- |
| `hero` | 首屏横幅 + 主视觉 | `theme.hero` |
| `quicklinks` | 快捷入口（图标 + 标题） | `theme.quicklinks` |
| `stats` | 数据统计（带数字滚动） | `theme.stats` |
| `services` | 核心业务 / 服务 | `theme.services` |
| `about` | 关于我们 | `theme.about` |
| `products` | 产品 / 案例 | `theme.products` |
| `news` | 新闻动态（自动取最新文章） | `site.posts` |
| `team` | 团队 / 师资 | `theme.team` |
| `partners` | 合作伙伴 Logo 墙 | `theme.partners` |
| `gallery` | 风采图库 | `theme.gallery` |
| `cta` | 行动条（引导咨询） | `theme.cta` |
| `contact` | 联系我们（信息 + 表单） | `theme.contact` |
| `about-contact` | 关于 + 联系 左右合排 | `theme.about` + `theme.contact` |

注意 `news` 板块的数据源不同——它读 `site.posts`（文章即新闻），这是第五篇的主题。

## 三、开关与隐藏：两种方式

```yaml
# 方式一：从数组里删掉这一行（最直观）
sections:
  - hero
  - services
  # - team      ← 删掉即隐藏

# 方式二：配置节点里关掉
team:
  enable: false
```

{% note info 为什么两种都要 %}
删数组对客户最直观（「看不见就是没有」）；`enable: false` 则适合**临时下线但保留配置**的场景（比如师资信息暂时不展示，但数据还在）。

模板里 `conf.enable === false` 的判断很关键：**只有显式写 `false` 才关闭**，写 `enable: true` 或省略都渲染。这样配置里少写一个键也不会出问题。
{% endnote %}

## 四、坑：合并板块会静默跳过

后来加了一个「关于我们 + 联系我们左右合排」的板块 `about-contact`。写好 partial、加进数组、构建成功——**但页面上什么都没出现**。

根因在模板这一行：

```ejs
var conf = theme[name];
if (!conf || conf.enable === false) return;   // ← conf 是 undefined，直接跳过
```

`about-contact` 是新造的板块名，`_config.yml` 里**没有 `about-contact:` 这个配置节点**，于是 `theme['about-contact']` 是 `undefined`，被静默跳过。

```yaml
# 必须在配置里显式存在这个节点
about-contact:
  enable: true
```

{% note danger 静默失败是最贵的一类 bug %}
它没有报错、没有警告、构建完全成功，只是少了一块内容。

规避办法：**凡是靠「配置节点是否存在」来决定渲染的逻辑，都要在文档里明确写出「该节点必须存在」**，并且最好给一个兜底：
```ejs
var conf = theme[name] || {};   // 至少让它渲染出默认内容，而不是消失
```
{% endnote %}

顺便说：合并板块的复用是值得的——我把联系信息和表单抽成了 `contact-info.ejs` / `contact-form.ejs`，让 `contact` 和 `about-contact` 两个板块共用同一份代码。

## 五、新增一个自定义板块：三步

假设客户要加一个「资质荣誉」板块：

**第 1 步**：写 partial `_partial/section-certificates.ejs`

```ejs
<% var c = theme.certificates || {}; %>
<% if (!c.enable) return; %>
<section class="section certificates">
  <div class="container">
    <h2 class="section__title"><%= c.title %></h2>
    <div class="cert-grid">
      <% (c.items || []).forEach(function (item) { %>
        <div class="cert-card"><img src="<%- url_for(item.image) %>" alt="<%= item.name %>"></div>
      <% }) %>
    </div>
  </div>
</section>
```

**第 2 步**：配置里加节点

```yaml
certificates:
  enable: true
  title: 资质荣誉
  items:
    - { name: "ISO9001", image: "/images/cert-1.png" }
```

**第 3 步**：数组里加一行

```yaml
sections:
  - hero
  - certificates     # ← 插在这里
  - services
```

**不用改 index.ejs，不用改任何已有文件。** 这就是「约定优于配置」的收益——扩展点在配置里，不在模板里。

## 六、这套设计的边界

两个我没做的事，说说为什么：

1. **没做板块的布局变体**（左右 / 居中 / 通栏）。加了这个，每个板块就要多一个配置项，配置表会膨胀一倍，而客户其实只会用默认样式。
2. **没做板块的嵌套**（板块里套板块）。嵌套会让 `sections` 从数组变成树，配置和模板的复杂度都上一个台阶，而官网首页的实际需求是一维的。

{% note warning 通用性的成本由复杂度支付 %}
每增加一个「可配置维度」，配置表和理解成本都在增加。**判断标准是：这个维度在 10 个客户里会有几个用？** 低于 3 个就不做，宁可让他们改 CSS。
{% endnote %}

## 系列导航

{% note tip 系列导航 %}
[xongyi 系列总入口](/series/xongyi/) · 上一篇：[三套预设布局](/2026/10/15/series-xongyi-02-preset-system/) · 下一篇：[配置即产品](/2026/10/15/series-xongyi-04-config-as-product/)
{% endnote %}
