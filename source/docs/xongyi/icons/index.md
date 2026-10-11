---
title: 图标速查
mode: docs
layout: page
order: 50
description: Xongyi 内置的 52 个 Feather 风格线性图标名称，用于 services / quicklinks / social 等配置的 icon 字段。
keywords: [图标, icon, Feather, 速查]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 图标速查

Xongyi 内置 **52 个** Feather 风格线性图标（24×24 描边，跟随文字颜色）。在 `services` / `quicklinks` / `social` 等配置里通过 `icon: 名称` 引用：

```yaml
services:
  items:
    - { icon: "monitor", title: "软件开发", desc: "……", url: "/products/" }
```

## 全部图标

{% tabs %}
{% tab 业务与通用 active %}
| 名称 | 名称 | 名称 | 名称 |
| --- | --- | --- | --- |
| `rocket` | `monitor` | `smartphone` | `code` |
| `cloud` | `shield` | `shield-check` | `settings` |
| `chart` | `trending-up` | `target` | `zap` |
| `search` | `layers` | `briefcase` | `building` |
| `home` | `globe` | `link` | `external` |
{% endtab %}
{% tab 人与机构 %}
| 名称 | 名称 | 名称 | 名称 |
| --- | --- | --- | --- |
| `users` | `user` | `star` | `award` |
| `graduation` | `book` | `book-open` | `heart` |
| `briefcase` | `building` | `home` | `info` |
{% endtab %}
{% tab 联系与内容 %}
| 名称 | 名称 | 名称 | 名称 |
| --- | --- | --- | --- |
| `mail` | `phone` | `map-pin` | `send` |
| `message-circle` | `github` | `link` | `external` |
| `file-text` | `download` | `image` | `tag` |
| `folder` | `calendar` | `clock` | `globe` |
{% endtab %}
{% tab 界面与方向 %}
| 名称 | 名称 | 名称 | 名称 |
| --- | --- | --- | --- |
| `menu` | `x` | `check` | `check-circle` |
| `arrow-right` | `arrow-left` | `chevron-up` | `chevron-down` |
| `moon` | `sun` | `info` | `star` |
{% endtab %}
{% endtabs %}

{% note info 完整名称清单 %}
```
arrow-right  arrow-left   check        check-circle  chevron-up    chevron-down
clock        calendar     chart        cloud         code          monitor
smartphone   mail         map-pin      phone         users         user
shield       shield-check star         award         zap           target
rocket       settings     search       file-text     download      globe
book-open    book         graduation   building      briefcase     heart
message-circle send       github       link          external      menu
x            moon         sun          image         tag           folder
layers       home         info         trending-up
```
{% endnote %}

## 怎么选图标

| 想表达 | 推荐图标 |
| --- | --- |
| 技术 / 开发 | `code` `monitor` `settings` `layers` |
| 云与安全 | `cloud` `shield` `shield-check` |
| 数据 / 增长 | `chart` `trending-up` `target` |
| 服务 / 效率 | `zap` `rocket` `check-circle` |
| 政府 / 机构 | `building` `home` `file-text` `info` |
| 教育 | `graduation` `book` `book-open` `award` |
| 团队 | `users` `user` `heart` |
| 联系 | `mail` `phone` `map-pin` `message-circle` `send` |
| 下载 / 资料 | `download` `file-text` `folder` |

## 找不到合适的图标？

三个办法：

1. **换用相近语义**：例如"培训"没有专属图标，用 `users` 或 `book-open` 都能看懂。
2. **用通用图标**：`star` / `zap` / `layers` / `target` 是百搭款。
3. **自定义扩展**：图标定义在主题的 `scripts/icons.js`（一个名称 → SVG 路径的映射表），可自行追加。

{% note warning 不存在的图标名会怎样 %}
`icon` 填了未定义的名称时，该处会**渲染为空**（不报错）。如果某个图标"没显示"，先来这一页核对拼写。
{% endnote %}

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/sections-config/, 板块配置详解, layers, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/customize/, 自定义样式与模板, code, outline %}
{% endcol %}
{% endrow %}
