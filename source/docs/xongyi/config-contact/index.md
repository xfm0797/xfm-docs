---
title: 联系与地图
mode: docs
layout: page
order: 32
description: contact 节点配置：地址、电话、邮箱、服务时间、微信二维码、联系表单与地图嵌入。
keywords: [contact, 联系方式, 表单, Formspree, 地图]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 联系与地图

`contact` 节点同时服务于两处：首页的 `contact` / `about-contact` 板块，以及 `/contact/` 页面的联系方式展示。

```yaml
contact:
  title: "联系我们"
  subtitle: "随时欢迎您的咨询与合作"
  address: "XX 省 XX 市科技产业园创新大厦 12 层"
  phone: "400-000-0000"
  email: "hello@example.com"
  hours: "工作日 9:00 - 18:00"
  wechat: ""                     # 微信二维码图片地址，留空不显示
  form_action: ""                # 表单提交地址，留空则不渲染表单
  map: ""                        # 地图 iframe 嵌入地址，留空不显示
```

| 字段 | 说明 | 留空时 |
| --- | --- | --- |
| `title` / `subtitle` | 板块标题与副标题 | 使用主题默认文案 |
| `address` | 地址 | 该行不显示 |
| `phone` | 电话 | 该行不显示 |
| `email` | 邮箱（自动变成 `mailto:` 链接） | 该行不显示 |
| `hours` | 服务时间 | 该行不显示 |
| `wechat` | 微信二维码图片地址 | 不显示二维码 |
| `form_action` | 表单服务端点 | **不渲染表单** |
| `map` | 地图 iframe 地址 | **不渲染地图** |

{% note tip 留空即隐藏 %}
除 `title` / `subtitle` 外，其余字段**留空即不渲染**对应区域 —— 不需要的模块不用刻意去关，空着就好。
{% endnote %}

## 联系表单

主题提供的是"结构 + 提交地址"分离的设计：它不收集数据，而是把表单提交到**你指定的服务**。

```yaml
contact:
  form_action: "https://formspree.io/f/xxxxxxx"
```

推荐的表单服务：

| 服务 | 说明 | 免费额度 |
| --- | --- | --- |
| [Formspree](https://formspree.io/) | 最省事，填 URL 即用 | 有免费档 |
| [Getform](https://getform.io/) | 支持文件上传 | 有免费档 |
| 自建接口 | 提交到你自己的后端 / Serverless 函数 | 取决于托管 |

表单字段由主题内置（姓名 / 邮箱 / 需求描述），文案来自语言包：

```yaml
# languages/zh-CN.yml 中的相关键
your_name: 您的姓名
your_email: 您的邮箱
your_message: 请描述您的需求
send: 发送
```

{% note warning 留空 = 没有表单 %}
`form_action` 为空时表单**完全不渲染**（避免提交后无处可去）。这是默认行为，不是 bug。
{% endnote %}

## 地图嵌入

`map` 接收的是地图服务商提供的 **iframe 嵌入地址**，主题会把它放进响应式的容器里：

```yaml
contact:
  map: "https://map.example.com/embed?center=116.40,39.90&zoom=16"
```

{% note info 国内地图服务 %}
高德、百度、腾讯地图都提供"分享 → 嵌入到网页"的 iframe 地址。注意把地图服务商给的**完整 iframe 地址**（`src` 里的那个 URL）填进来，而不是整段 `<iframe>` 标签。
{% endnote %}

## 完整示例

```yaml
contact:
  title: "联系我们"
  subtitle: "随时欢迎您的咨询与合作"
  address: "浙江省杭州市西湖区文三路 100 号 12 层"
  phone: "0571-8888-8888"
  email: "hello@myorg.com"
  hours: "工作日 9:00 - 18:00"
  wechat: "/images/wechat-qr.png"
  form_action: "https://formspree.io/f/abcdwxyz"
  map: "https://map.example.com/embed?center=120.12,30.28&zoom=15"
```

## 相关板块

`contact` 板块可以单独出现在首页，也可以和「关于我们」左右合排：

```yaml
sections:
  - hero
  - services
  - about-contact   # 关于我们 + 联系我们 左右合排
```

详见[板块配置详解](/docs/xongyi/sections-config/)。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/config-footer/, 页脚与备案, settings, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/config-features/, 功能与统计, target, outline %}
{% endcol %}
{% endrow %}
