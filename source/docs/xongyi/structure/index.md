---
title: 目录结构与运行时
mode: docs
layout: page
order: 52
description: Xongyi 的目录结构、各模板与静态资源的职责、页面渲染链路与 URL 规则。
keywords: [目录结构, 模板, 运行时, 渲染流程, URL]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 目录结构与运行时

本页面向想深入理解的读者：主题由哪些文件构成、一次页面渲染经过了什么、URL 是怎么来的。

## 目录结构

```text
hexo-theme-xongyi/
├── _config.yml                    # 主题配置（全部中文注释）
├── layout/
│   ├── layout.ejs                 # HTML 骨架：head / header / main / footer
│   ├── index.ejs                  # 首页：遍历 sections 渲染板块
│   ├── page.ejs                   # 独立页面（about / products / contact）
│   ├── post.ejs                   # 文章详情
│   ├── news.ejs                   # 新闻列表（由 layout: news 触发）
│   ├── archive.ejs                # 归档
│   ├── category.ejs / tag.ejs     # 分类 / 标签
│   └── _partial/
│       ├── head.ejs               # meta / OG / JSON-LD / 样式引入
│       ├── header.ejs             # 顶部导航 + 暗色按钮 + 移动端菜单按钮
│       ├── footer.ejs             # 页脚（简介 / 栏目 / 版权 / 备案）
│       ├── scripts.ejs            # 脚本与统计代码
│       ├── post-grid.ejs          # 文章卡片网格
│       ├── pagination.ejs         # 分页
│       ├── contact-info.ejs       # 联系方式展示
│       ├── contact-form.ejs       # 联系表单
│       └── section-*.ejs          # 13 个首页板块
├── scripts/
│   └── icons.js                   # icon() helper：52 个 Feather 线性图标
├── source/
│   ├── css/style.css              # 全部样式（令牌 + 三套预设 + 暗色）
│   ├── js/main.js                 # 交互脚本
│   └── images/                    # logo / favicon / hero / about / 缩略图 / 头像
├── languages/                     # zh-CN.yml / en.yml 文案包
├── examples/                      # 政务 / 教育两套完整预设示例
├── docs/                          # 预览图与部署按钮素材
└── package.json / LICENSE
```

## 各部分职责

| 部分 | 职责 | 何时需要动 |
| --- | --- | --- |
| `_config.yml` | 全部可配置内容 | 做站必动 |
| `layout/*.ejs` | 页面骨架与板块拼装 | 一般不动（改结构才 fork） |
| `layout/_partial/section-*.ejs` | 单个首页板块的 HTML | 一般不动 |
| `scripts/icons.js` | 图标名 → SVG 路径 | 新增图标时 |
| `source/css/style.css` | 全部样式与令牌 | 通过注入覆写，不直接改 |
| `source/js/main.js` | 暗色模式、返回顶部、滚动淡入、数字动画、移动菜单 | 一般不动 |
| `languages/*.yml` | 界面文案（"阅读全文""上一页"等） | 需要英文站或改文案时 |

## 一次首页渲染

```text
hexo generate
   │
   ├─ 读取站点 _config.yml + _config.hexo-theme-xongyi.yml（深合并主题默认值）
   │        └─ 合并结果 → theme.*
   │
   ├─ 渲染 layout.ejs
   │     ├─ _partial/head.ejs     → meta / OG / JSON-LD / style.css
   │     ├─ _partial/header.ejs   → brand + menu + nav_button + 暗色按钮
   │     ├─ body ← index.ejs      → 遍历 theme.sections
   │     │            └─ 每个板块名 → _partial/section-<name>.ejs
   │     │                              └─ 读取 theme.<name> 节点数据
   │     ├─ _partial/footer.ejs   → footer + social + 备案号
   │     └─ _partial/scripts.ejs  → main.js + 统计代码
   │
   └─ 输出 public/index.html
```

## 一次页面渲染（about / contact）

```text
page 类型（source/about/index.md）
   └─ page.ejs
        ├─ page-hero：page.title + page.subtitle
        └─ page-content：page.content（Markdown 渲染结果）

post 类型（source/_posts/*.md）
   └─ post.ejs
        ├─ 元信息：date / categories
        ├─ 正文
        ├─ 标签
        └─ 上下篇导航（page.prev / page.next）
```

## URL 规则

| 内容 | 源文件 | 产物 URL |
| --- | --- | --- |
| 首页 | — | `/` |
| 独立页面 | `source/about/index.md` | `/about/` |
| 新闻列表 | `source/news/index.md`（`layout: news`） | `/news/` |
| 文章 | `source/_posts/2026-10-01-x.md` | 由站点 `permalink` 决定，默认 `/:year/:month/:day/:title/` |
| 归档 | — | `/archives/` |
| 分类 | — | `/categories/<slug>/` |
| 标签 | — | `/tags/<slug>/` |

{% note warning 页面必须用「目录 / index.md」 %}
Hexo 对 `source/about.md` 会生成 `about.html`（地址 `/about.html`），而导航里通常写的是 `/about/` —— 两者不匹配会 404。统一用 `source/about/index.md`。
{% endnote %}

## 生成器依赖

首页、归档、分类、标签四类页面由 Hexo 的**生成器插件**产出，Hexo 7 核心不含它们：

```bash
npm i hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag
```

| 页面 | 依赖 |
| --- | --- |
| `/`（首页分页） | `hexo-generator-index` |
| `/archives/` | `hexo-generator-archive` |
| `/categories/` | `hexo-generator-category` |
| `/tags/` | `hexo-generator-tag` |

## 国际化

界面文案抽离在 `languages/`，站点 `_config.yml` 的 `language` 决定取用哪一份：

```yaml
language: "zh-CN"    # 或 en
```

需要改"阅读全文"这类固定文案时，覆盖站点下的同名语言文件即可（站点优先级高于主题）。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/deploy/, 一键部署, arrow-up-right, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/faq/, 常见问题, info, outline %}
{% endcol %}
{% endrow %}
