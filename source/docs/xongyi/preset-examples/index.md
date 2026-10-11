---
title: 预设示例
mode: docs
layout: page
order: 11
description: 主题 examples/ 目录的两套完整预设示例：政务版与教育版，可直接作为建站起点。
keywords: [示例, examples, 政务示例, 教育示例]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 预设示例

主题仓库的 `examples/` 目录提供两套**完整**预设配置。它们不是片段，而是可以直接落地的整站文案与结构——这是最快的起步方式。

| 文件 | 预设 | 场景 |
| --- | --- | --- |
| [`examples/config.government.yml`](https://github.com/xfm0797/hexo-theme-xongyi/blob/main/examples/config.government.yml) | `government` | XX 市政务服务网 |
| [`examples/config.education.yml`](https://github.com/xfm0797/hexo-theme-xongyi/blob/main/examples/config.education.yml) | `education` | XX 实验中学 |

## 怎么用

{% tabs %}
{% tab 作为起点（推荐） active %}
把示例内容拷进站点覆盖文件，再按实际情况替换文案即可：

```bash
cp themes/hexo-theme-xongyi/examples/config.government.yml \
   _config.hexo-theme-xongyi.yml
hexo clean && hexo generate
```

{% note tip %}
示例文件是一份**完整配置**，直接当覆盖文件用没问题；这之后你只维护 `_config.hexo-theme-xongyi.yml` 一个文件。
{% endnote %}
{% endtab %}
{% tab 只抄需要的段落 %}
更轻量的做法：只在覆盖文件里写你真正要改的键，其余沿用主题默认。例如只想借政务版的导航与办事入口：

```yaml
preset: government

menu:
  - { name: "首页", url: "/" }
  - { name: "政务公开", url: "/about/" }
  - { name: "办事服务", url: "/products/" }
  - { name: "通知公告", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }

quicklinks:
  title: "办事服务"
  subtitle: "高频事项快速办理"
  items:
    - { icon: "file-text", name: "证照办理", url: "/contact/" }
    - { icon: "search", name: "进度查询", url: "/contact/" }
    - { icon: "download", name: "表格下载", url: "/about/" }
    - { icon: "message-circle", name: "意见反馈", url: "/contact/" }
```
{% endtab %}
{% endtabs %}

## 政务版要点

| 配置 | 示例值 |
| --- | --- |
| `brand.name` | `XX市政务服务网` |
| `brand.slogan` | `为民服务 · 便捷高效` |
| `hero.badge` | `XX市人民政府` |
| `hero.title` | `政务服务<br><em>一站直达</em>` |
| `quicklinks` | 证照办理 / 进度查询 / 表格下载 / 意见反馈 |
| `stats` | 网上可办事项 1200 项、群众满意率 98.5%、年办件量 300 万+ |
| `services` | 企业开办、不动产登记、社保医保、教育入学、公共安全、政策解读 |
| `sections` | `hero → quicklinks → stats → services → news → cta → about-contact` |

## 教育版要点

| 配置 | 示例值 |
| --- | --- |
| `brand.name` | `XX实验中学` |
| `brand.slogan` | `厚德博学 · 笃行致远` |
| `hero.badge` | `省示范性普通高级中学` |
| `hero.title` | `立德树人<br><em>成就未来</em>` |
| `quicklinks` | 招生信息 / 课程资源 / 校历查询 / 家校沟通 |
| `stats` | 建校时间 1962 年、重点本科率 86%、教职工 220 人 |
| `services` | 课程体系、名师队伍、科研兴校、阳光德育、社团活动 |
| `sections` | `hero → quicklinks → stats → services → news → team → gallery → cta → about-contact` |

{% note info 对比着看更快 %}
把两份示例并排打开，注意 `sections` 数组与 `services.items` 的差异——这正是"预设 = 配色 + 板块组合 + 文案基调"的具体体现。
{% endnote %}

## 用演示站直接上线

[hexo-theme-xongyi-demo](https://github.com/xfm0797/hexo-theme-xongyi-demo) 是把示例配置落成真实站点的完整仓库（含页面、示例文章与部署配置），Fork 后一键部署即可。详见[一键部署](/docs/xongyi/deploy/)。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/sections/, 首页板块详解, layers, fill %}
{% endcol %}
{% col 6 %}
{% button https://github.com/xfm0797/hexo-theme-xongyi-demo, 查看演示站, external, outline %}
{% endcol %}
{% endrow %}
