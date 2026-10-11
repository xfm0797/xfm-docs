---
title: 三套预设
mode: docs
layout: page
order: 10
description: Xongyi 内置的 enterprise / government / education 三套预设布局：差异、切换方式与各自适配的场景。
keywords: [预设, preset, 企业版, 政务版, 教育版]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 三套预设

`preset` 是主题配置的**第一项**，也是整站视觉的总开关：

```yaml
preset: enterprise   # 企业（默认，商务蓝）
preset: government   # 政务（中国红）
preset: education    # 教育（学院青）
```

## 三套预设对照

| 预设 | 基调 | 典型场景 | 默认板块倾向 |
| --- | --- | --- | --- |
| `enterprise` | 商务蓝 | 企业官网、科技公司 | 首屏 → 数据 → 业务 → 产品 → 新闻 → 团队 → 行动条 |
| `government` | 中国红 | 政府门户、政务服务中心 | 首屏 → **快捷办事入口** → 数据 → 重点领域 → 通知公告 → 合排收尾 |
| `education` | 学院青 | 学校、教育机构 | 首屏 → **常用服务** → 数据 → 教育教学 → 校园动态 → **名师风采** + **校园图库** |

{% note info 预设不只是配色 %}
换预设会同时改变**配色基调**、**默认板块组合**与**文案语气**。但预设只提供"默认值"——任何一项都能在配置里单独覆盖，所以三套预设可以互相取用（例如企业版式 + 学校配色）。
{% endnote %}

## 预设做了什么

```text
preset: government
      │
      ├─ 1. 注入配色令牌 → source/css/style.css 中的 CSS 变量（主色/辅色/中性色）
      ├─ 2. 影响默认段落基调（浅色/深色区块交替节奏）
      └─ 3. 视作起始模板，供 examples/ 示例给出贴合场景的完整文案
```

技术实现上，预设通过给 `<html>` 或 `body` 打上 `preset-*` 标记，由 `style.css` 里三组 CSS 变量分别接手；暗色模式下每组预设都有对应的深色适配，不需要你额外调色。

## 切换预设

{% tabs %}
{% tab 站点级覆盖（推荐） active %}
站点根目录 `_config.hexo-theme-xongyi.yml`：

```yaml
preset: government
```

改完重新构建：

```bash
hexo clean && hexo generate
```
{% endtab %}
{% tab 主题配置 %}
直接改 `themes/hexo-theme-xongyi/_config.yml` 的 `preset` 字段。

{% note warning %}
这种方式在 `git pull` 升级主题时会被覆盖，仅建议在临时试验 / 本地预览时使用。
{% endnote %}
{% endtab %}
{% endtabs %}

## 常见组合

| 你的需求 | 建议 |
| --- | --- |
| 科技公司 / 咨询公司 | `enterprise`，主色调成品牌色即可 |
| 政府门户 / 政务服务中心 | `government`，重点补 `quicklinks`（办事入口）与备案号 |
| 中小学 / 高校 | `education`，重点配 `team`（名师）与 `gallery`（校园风貌） |
| 想要企业版式但配色偏红 | `preset: enterprise` + 自定义主色令牌 |

## 完整整站示例

主题 `examples/` 目录提供两套**完整**预设配置，直接覆盖即可获得一套可用的政务 / 校园官网：

| 文件 | 说明 | 内容 |
| --- | --- | --- |
| [`examples/config.government.yml`](https://github.com/xfm0797/hexo-theme-xongyi/blob/main/examples/config.government.yml) | 政务版（XX 市政务服务网） | 品牌、导航、办事入口、重点领域、数据、联系方式、页脚 |
| [`examples/config.education.yml`](https://github.com/xfm0797/hexo-theme-xongyi/blob/main/examples/config.education.yml) | 教育版（XX 实验中学） | 校训、常用服务、办学数据、教育教学、名师、图库 |

详见[预设示例](/docs/xongyi/preset-examples/)。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/preset-examples/, 预设示例, file-doc, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/sections/, 首页板块, layers, outline %}
{% endcol %}
{% endrow %}
