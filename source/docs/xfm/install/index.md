---
title: 安装部署
mode: docs
layout: page
order: 2
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

## 拉取主题

在 Hexo 站点根目录执行：

```bash
git clone https://github.com/xfm0797/hexo-theme-xfm.git themes/xfm
```

## 启用主题

编辑站点根目录 `_config.yml`：

```yaml
theme: xfm
```

然后 `hexo clean && hexo server` 即可预览。

## 依赖

Hexo 8 起，核心不再内置渲染器与部分生成器，请在**站点**中安装（`hexo init` 的默认站点通常已自带）：

```bash
npm i hexo-renderer-marked hexo-renderer-ejs \
      hexo-generator-index hexo-generator-archive \
      hexo-generator-category hexo-generator-tag
```

按需增强（可选）：

| 功能 | 依赖 |
| --- | --- |
| RSS | `npm i hexo-generator-feed` |
| KaTeX / MathJax | 无需安装，主题按配置从 CDN 加载 |
| Mermaid | 无需安装，主题按配置从 CDN 加载 |

{% note warning 关键前提 %}
站点根目录的 `package.json` 必须包含 `"hexo": { "version": "..." }` 字段，Hexo 才会加载外部插件——这也是 404 / sitemap 等内置生成器能否工作的前提。
{% endnote %}

## 需要的独立页面

以下页面需要自行创建：

```bash
hexo new page tags         # front-matter 加 type: tags
hexo new page categories   # front-matter 加 type: categories
hexo new page links        # front-matter 加 type: links
hexo new page archives     # 无需额外 type
```

## 目录结构

```
themes/xfm
├── _config.yml              # 主题配置（唯一入口，全部中文注释）
├── languages/               # default / zh-CN / en
├── layout/                  # EJS 模板
│   ├── layout.ejs           # 三模式外壳分发
│   ├── index / post / page / archive / category / tag / 404
│   └── _partials/           # head / header / footer / sidebar / toc /
│                            # search / comment / widgets / notes / docs…
├── preview/                 # 各模式预览图
├── scripts/
│   ├── filters/content.js    # 代码块工具条、标题锚点、表格容器、外链、懒加载
│   ├── generators/           # search.json、sitemap.xml、robots.txt、404
│   ├── helpers/index.js      # 封面、摘要、字数、目录树、笔记/文档导航、计数
│   └── tags/index.js         # 全部标签插件
└── source/
    ├── css/                 # variables · base · layout · components · post · plugins · adaptive
    ├── js/                  # adaptive · core · toc · search
    └── images/              # avatar / favicon / 默认封面（SVG，零外链）
```

{% note info 站点级覆盖 %}
推荐不要在主题目录里直接改配置。可在站点 `_config.yml` 的 `theme_config` 下写同名键覆盖，主题升级时不会丢失自定义内容。
{% endnote %}
