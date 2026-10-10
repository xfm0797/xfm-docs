---
title: 配置项详解
mode: docs
layout: page
order: 13
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

主题配置位于 `themes/hexo-theme-xongyi/_config.yml`，所有可调项都带中文注释。以下按模块速查。

## 常用配置速查

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

## 品牌与导航

```yaml
brand:
  name: "Xongyi"                 # logo 为空时显示
  slogan: "专业 · 可靠 · 值得信赖"
  logo: "/images/logo.svg"       # 建议高度 40px；留空仅显示文字
  favicon: "/images/favicon.svg"

menu:
  - { name: "首页", url: "/" }
  - { name: "关于我们", url: "/about/" }
  - { name: "产品服务", url: "/products/" }
  - { name: "新闻动态", url: "/news/" }
  - { name: "联系我们", url: "/contact/" }

nav_button:                      # 不填 name 则不显示
  name: "立即咨询"
  url: "/contact/"
```

## 页脚

```yaml
footer:
  about: "专注于数字化服务的科技公司……"
  columns:
    - title: "快速导航"
      items:
        - { name: "首页", url: "/" }
    - title: "服务支持"
      items:
        - { name: "产品服务", url: "/products/" }
  copyright: "© 2026 Xongyi · 保留所有权利"
  icp: ""                        # ICP 备案号，如 京ICP备00000000号
  icp_url: "https://beian.miit.gov.cn/"
  police: ""                     # 公安备案号（选填）
  police_url: ""
  show_powered: true             # 显示 "Powered by Hexo · Theme Xongyi"
```

## 联系我们与表单

```yaml
contact:
  title: "联系我们"
  address: "XX 省 XX 市科技产业园创新大厦 12 层"
  phone: "400-000-0000"
  email: "hello@example.com"
  hours: "工作日 9:00 - 18:00"
  wechat: ""                     # 微信二维码图片地址，留空不显示
  form_action: ""                # 表单提交地址（如 Formspree），留空不渲染表单
  map: ""                        # 地图 iframe 嵌入地址，留空不显示
```

## 功能开关

```yaml
features:
  dark_mode: true                # 暗色模式切换按钮
  back_to_top: true              # 返回顶部按钮
  reveal: true                   # 滚动进入视口淡入动画
  sticky_header: true            # 顶部导航吸顶
  stats_animation: true          # 数字滚动动画
```

## 社交链接

可用图标：`mail / send / github / globe / message-circle / link`

```yaml
social:
  - { icon: "mail", url: "mailto:hello@example.com" }
  - { icon: "send", url: "https://t.me/xfm520" }
  - { icon: "globe", url: "https://www.lovou.pw" }
```

## SEO 与统计

```yaml
seo:
  description: ""                # 留空时回退到站点配置的 description
  keywords: ""                   # 留空时回退到站点配置的 keywords
  jsonld: true                   # 输出 Organization 结构化数据

analytics:
  google: ""                     # 如 G-XXXXXXXXXX
  cloudflare: ""                 # Cloudflare Web Analytics Beacon Token
```

## 图标速查

在 `services` / `quicklinks` / `social` 等配置中通过 `icon: 名称` 使用（Feather 风格线性图标）：

```
rocket monitor cloud shield shield-check chart code settings search
users user phone mail map-pin clock calendar star award target zap
file-text download globe book book-open graduation building briefcase
heart message-circle send github link external menu x moon sun image
tag folder layers home info trending-up check check-circle arrow-right
```
