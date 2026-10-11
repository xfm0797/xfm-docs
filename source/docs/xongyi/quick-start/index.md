---
title: 5 分钟上手
mode: docs
layout: page
order: 3
description: 从空白站点到跑通一个完整 Xongyi 官网的最短路径。
keywords: [快速开始, 上手, 官网搭建]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 5 分钟上手

这一页用最短路径跑通一个官网。假设你已经把主题装好（见[安装与部署](/docs/xongyi/install/)）。

## 第 1 步：启用主题

站点根目录 `_config.yml`：

```yaml
title: "我的机构"
description: "专注于数字化服务的专业团队"
language: "zh-CN"
timezone: "Asia/Shanghai"

theme: hexo-theme-xongyi
```

## 第 2 步：写一份站点级覆盖配置

在**站点根目录**新建 `_config.hexo-theme-xongyi.yml`。先只填最关键的几项，跑通之后再逐步补全：

```yaml
# 站点根目录 _config.hexo-theme-xongyi.yml
preset: enterprise

brand:
  name: "我的机构"
  slogan: "专业 · 可靠 · 值得信赖"

menu:
  - { name: "首页", url: "/" }
  - { name: "关于我们", url: "/about/" }
  - { name: "新闻动态", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }

hero:
  badge: "我的机构官网"
  title: "让服务<br><em>更值得信赖</em>"
  subtitle: "一句话说清你是做什么的、为谁服务。"
  buttons:
    - { name: "了解我们", url: "/about/", primary: true }

contact:
  phone: "400-000-0000"
  email: "hello@example.com"
```

## 第 3 步：建三个页面

Hexo 的页面就是"目录 + `index.md`"，导航才能用漂亮的 `/about/` 这样的地址：

```bash
hexo new page about
hexo new page products
hexo new page contact
hexo new page news
```

其中 `/news/` 需要指定新闻列表布局：

```yaml
# source/news/index.md
---
title: "新闻动态"
subtitle: "了解我们的最新进展"
layout: news
---
```

其余页面用普通过滤：

```yaml
# source/about/index.md
---
title: "关于我们"
subtitle: "专业 · 可靠 · 值得信赖"
---

## 我们是谁

正文……
```

{% note info 页面与文章的区别 %}
- **页面**（`source/about/index.md`）：一次性内容，出现在导航里，如"关于我们""联系我们"；
- **文章**（`source/_posts/*.md`）：带日期与分类，自动进入新闻列表、归档、分类与标签页。
{% endnote %}

## 第 4 步：写一篇新闻

```bash
hexo new post "机构荣获年度优秀服务奖"
```

```markdown
---
title: 机构荣获年度优秀服务奖
date: 2026-10-11 10:00:00
categories: [机构新闻]
tags: [荣誉]
cover: /images/thumb-1.svg
excerpt: 一句话摘要，用于列表卡片。
---

正文内容……
```

文章会自动出现在三处：首页「新闻动态」板块（取最新 3 条）、`/news/` 列表页、`/archives/` 归档页。

## 第 5 步：本地预览

```bash
hexo clean && hexo server
```

打开 `http://localhost:4000` 检查这几处：

- [ ] 首屏横幅的徽标 / 标题 / 按钮是否符合预期
- [ ] 导航各项是否能点到对应页面
- [ ] 首页「新闻动态」是否出现了刚写的文章
- [ ] 页脚的版权、备案号是否需要填写
- [ ] 手机宽度下抽屉菜单是否正常

## 第 6 步：补全与上线

到这一步站点已经能用了。按需继续：

| 想做的事 | 去哪儿 |
| --- | --- |
| 换一套政务 / 校园风格 | [预设布局](/docs/xongyi/preset/) |
| 调整首页板块顺序、增删板块 | [首页板块](/docs/xongyi/sections/) |
| 配地图、表单、微信二维码 | [联系与地图](/docs/xongyi/config-contact/) |
| 填备案号、页脚栏目 | [页脚与备案](/docs/xongyi/config-footer/) |
| 部署到公网 | [一键部署](/docs/xongyi/deploy/) |

{% note success 一分钟验收清单 %}
`hexo clean && hexo generate` 无报错 → `public/index.html` 存在 → 首页板块齐全 → 导航无 404 → 部署后带 `url` / `root` 的正确性检查（见[部署](/docs/xongyi/deploy/)）。
{% endnote %}

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/sections/, 编排首页板块, layers, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/deploy/, 部署到公网, arrow-up-right, outline %}
{% endcol %}
{% endrow %}
