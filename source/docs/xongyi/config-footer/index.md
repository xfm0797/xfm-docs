---
title: 页脚与备案
mode: docs
layout: page
order: 33
description: footer 节点配置：页脚简介、栏目、版权、ICP 备案号、公安备案号与社交链接。
keywords: [footer, 页脚, 备案号, ICP, 公安备案, social]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 页脚与备案

页脚是官网"合规信息"的落点：简介、栏目、版权、备案号，都在 `footer` 节点下。

```yaml
footer:
  about: "专注于数字化服务的科技公司，为政府机构、企业与学校提供高质量的软件产品与解决方案。"
  columns:
    - title: "快速导航"
      items:
        - { name: "首页", url: "/" }
        - { name: "关于我们", url: "/about/" }
        - { name: "新闻动态", url: "/news/" }
    - title: "服务支持"
      items:
        - { name: "产品服务", url: "/products/" }
        - { name: "联系我们", url: "/contact/" }
        - { name: "归档", url: "/archives/" }
  copyright: "© 2026 Xongyi · 保留所有权利"
  icp: ""                        # ICP 备案号，如 京ICP备00000000号
  icp_url: "https://beian.miit.gov.cn/"
  police: ""                     # 公安备案号（选填）
  police_url: ""
  show_powered: true             # 显示 "Powered by Hexo · Theme Xongyi"
```

| 字段 | 说明 |
| --- | --- |
| `about` | 页脚左侧的机构简介，1–3 句为宜 |
| `columns` | 栏目数组，每项含 `title` 与 `items[]`，通常放 2–3 栏 |
| `copyright` | 版权行 |
| `icp` / `icp_url` | ICP 备案号与其跳转地址（工信部） |
| `police` / `police_url` | 公安备案号与其跳转地址 |
| `show_powered` | 是否显示 "Powered by Hexo · Theme Xongyi" |

## 备案号配置（国内站点必读）

{% tabs %}
{% tab ICP 备案 active %}
网站完成 ICP 备案后，把备案号填入 `footer.icp`，并保持 `icp_url` 指向工信部备案系统：

```yaml
footer:
  icp: "浙ICP备2026000000号-1"
  icp_url: "https://beian.miit.gov.cn/"
```

渲染后备案号可点击跳转，符合常规的海关要求。

{% note info %}
备案号必须与**实际备案主体**一致。同一主体多域名时，注意后缀编号（`-1`、`-2`）要对应到正确的域名。
{% endnote %}
{% endtab %}
{% tab 公安备案 %}
公安联网备案完成后，把编号与查询地址填入：

```yaml
footer:
  police: "浙公网安备 33010602000000号"
  police_url: "https://www.beian.gov.cn/"
```

选填字段，没有可留空。
{% endtab %}
{% endtabs %}

## social 社交链接

社交入口在 `social` 节点（**顶层**，不在 `footer` 里）：

```yaml
social:
  - { icon: "mail", url: "mailto:hello@example.com" }
  - { icon: "send", url: "https://t.me/xfm520" }
  - { icon: "globe", url: "https://www.lovou.pw" }
```

可用图标：`mail` / `send` / `github` / `globe` / `message-circle` / `link`。

## 一个完整的页脚

```yaml
footer:
  about: "XX 科技有限公司成立于 2016 年，专注为政府、企业与学校提供数字化解决方案。"
  columns:
    - title: "关于我们"
      items:
        - { name: "机构简介", url: "/about/" }
        - { name: "新闻动态", url: "/news/" }
    - title: "产品服务"
      items:
        - { name: "解决方案", url: "/products/" }
        - { name: "联系我们", url: "/contact/" }
    - title: "快速链接"
      items:
        - { name: "归档", url: "/archives/" }
        - { name: "分类", url: "/categories/" }
  copyright: "© 2026 XX 科技有限公司 · 保留所有权利"
  icp: "浙ICP备2026000000号-1"
  icp_url: "https://beian.miit.gov.cn/"
  police: "浙公网安备 33010602000000号"
  police_url: "https://www.beian.gov.cn/"
  show_powered: false

social:
  - { icon: "mail", url: "mailto:hello@myorg.com" }
  - { icon: "globe", url: "https://www.myorg.com" }
```

{% note tip 栏目数量 %}
页脚栏目建议 **2–3 栏**：一栏给主站导航、一栏给服务/支持、一栏给合规与辅助入口。栏太多在小屏会变成很长的堆叠。
{% endnote %}

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/config-features/, 功能与统计, target, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/deploy/, 一键部署, arrow-up-right, outline %}
{% endcol %}
{% endrow %}
