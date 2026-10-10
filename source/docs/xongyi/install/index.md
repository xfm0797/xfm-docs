---
title: 安装部署
mode: docs
layout: page
order: 10
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

## 方式一：Git 安装（推荐）

在 Hexo 站点根目录执行：

```bash
git clone https://github.com/xfm0797/hexo-theme-xongyi.git themes/hexo-theme-xongyi
```

## 方式二：下载解压

从 [Releases](https://github.com/xfm0797/hexo-theme-xongyi/releases) 或仓库 `Code → Download ZIP` 下载后，解压到站点的 `themes/hexo-theme-xongyi/` 目录。

{% note warning 解压位置 %}
仓库根目录即主题本体，解压后请确认 `themes/hexo-theme-xongyi/_config.yml`、`layout/`、`source/` 直接位于该目录下（不要多套一层目录）。
{% endnote %}

## 方式三：作为 submodule 引入

```bash
git submodule add https://github.com/xfm0797/hexo-theme-xongyi.git themes/hexo-theme-xongyi
```

## 启用主题

编辑站点根目录 `_config.yml`：

```yaml
theme: hexo-theme-xongyi
```

然后 `hexo clean && hexo server` 即可预览。

## 兼容性

| 项目 | 要求 |
| --- | --- |
| Hexo | 7.x（推荐） |
| Node.js | >= 18 |
| 渲染器 | `hexo-renderer-ejs`（必需）、`hexo-renderer-marked`（或其它 Markdown 渲染器） |
| 生成器 | 新闻 / 归档 / 分类 / 标签页需要 `hexo-generator-index`、`hexo-generator-archive`、`hexo-generator-category`、`hexo-generator-tag` |

{% note warning 生成器依赖 %}
Hexo 7 核心**不自带**上述四个生成器，`hexo init` 的默认站点已包含；若你的站点缺首页或归档，请补装。
{% endnote %}

## 懒得配置？直接用演示站

[hexo-theme-xongyi-demo](https://github.com/xfm0797/hexo-theme-xongyi-demo) 是配好一切的完整站点（主题以 submodule 引入 + 演示内容 + 部署配置），Fork 后一键部署即可。

演示站仓库内置 `.github/workflows/pages.yml`（GitHub Pages）、`vercel.json`、`netlify.toml`、`wrangler.toml`、`edgeone.json`（腾讯 EdgeOne Pages），导入即用。
