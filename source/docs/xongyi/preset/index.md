---
title: 预设布局
mode: docs
layout: page
order: 11
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

主题内置三套预设布局，通过主题配置的第一项切换：

```yaml
preset: enterprise   # 企业（默认，商务蓝）
preset: government   # 政务（中国红）
preset: education    # 教育（学院青）
```

| 预设 | 基调 | 典型场景 |
| --- | --- | --- |
| `enterprise` | 商务蓝 | 企业官网、科技公司 |
| `government` | 中国红 | 政府门户、政务中心 |
| `education` | 学院青 | 学校、教育机构 |

预设之间不仅是配色差异，还各自搭配了更贴合场景的默认板块组合与文案基调。

## 完整整站示例

主题 `examples/` 目录提供两套完整预设示例，直接覆盖主题配置即可获得一套完整的政务 / 校园官网：

| 文件 | 说明 |
| --- | --- |
| [`examples/config.government.yml`](https://github.com/xfm0797/hexo-theme-xongyi/blob/main/examples/config.government.yml) | 政务版（XX 市政务服务网）完整配置 |
| [`examples/config.education.yml`](https://github.com/xfm0797/hexo-theme-xongyi/blob/main/examples/config.education.yml) | 教育版（XX 实验中学）完整配置 |

示例包含品牌、导航、板块文案、数据统计、联系方式、页脚等全套内容，可作为快速搭建的起点。

## 推荐做法：站点级覆盖

**不要**在主题目录里直接改配置。在站点根目录新建 `_config.hexo-theme-xongyi.yml`，只写要覆盖的键，Hexo 会与主题默认配置**深度合并**，这样 `git pull` 升级主题时不会丢失自定义内容：

```yaml
# 站点根目录 _config.hexo-theme-xongyi.yml
brand:
  name: "我的公司"
preset: government
```

{% note tip 深度合并 %}
覆盖文件只需写需要改动的键；未涉及的配置项自动沿用主题默认值，无需整份复制。
{% endnote %}
