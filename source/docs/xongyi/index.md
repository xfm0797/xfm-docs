---
title: 主题简介
mode: docs
layout: page
order: 9
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

**hexo-theme-xongyi** 是一款面向机构官网场景的 Hexo 通用主题，内置**企业 / 政务 / 教育**三套预设布局与 12 个可自由排序的首页板块，60+ 项配置全部集中在 `_config.yml`，无需修改代码即可完成整站搭建。

> 演示站：[hexo-theme-xongyi-demo](https://github.com/xfm0797/hexo-theme-xongyi-demo) —— 完整 Hexo 站点，含全部页面、示例文章与五大平台一键部署配置。

## 特性一览

- 🏢 **三套预设布局**：`enterprise`（商务蓝）/ `government`（政务红）/ `education`（学院青），一行配置切换
- 🧩 **12 个首页板块**：横幅、快捷入口、数据统计、核心业务、关于我们、产品案例、新闻动态、团队、合作伙伴、风采图库、行动条、联系我们，支持启用 / 关闭 / 自由排序，另有「关于我们 + 联系我们」左右合排版
- ⚙️ **60+ 配置项**：品牌、导航、页脚、备案号、社交链接、SEO、统计代码、联系表单、地图嵌入，全部配置化
- 🌙 **暗色模式**：跟随记忆的明暗切换，三套预设各自适配
- 📱 **完全响应式**：桌面 / 平板 / 手机抽屉菜单，移动端体验完整
- 🚀 **轻量高性能**：零框架依赖（原生 JS + 单 CSS 文件）
- 🔍 **SEO 友好**：Open Graph / Twitter Card / JSON-LD 结构化数据、canonical 全覆盖
- 🌐 **国际化**：内置 zh-CN / en 文案包
- 📰 **新闻系统**：文章即动态，自动生成新闻列表、归档、分类、标签页
- ♿ **无障碍**：跳转链接、aria 标签、`prefers-reduced-motion` 支持

## 三套预设

| 预设 | 基调 | 典型场景 |
| --- | --- | --- |
| `enterprise` | 商务蓝 | 企业官网（默认） |
| `government` | 中国红 | 政府 / 政务门户 |
| `education` | 学院青 | 学校 / 教育机构 |

## 目录结构

仓库根目录即主题本体，可直接放进站点 `themes/` 目录：

```
hexo-theme-xongyi/
├── _config.yml                    # ★ 主题配置（带中文注释，日常只需改这个文件）
├── layout/                        # EJS 布局
│   ├── layout.ejs                 # HTML 骨架
│   ├── index.ejs                  # 首页（按 sections 渲染板块）
│   ├── page.ejs / post.ejs        # 页面 / 文章
│   ├── news.ejs / archive.ejs     # 新闻列表 / 归档
│   ├── category.ejs / tag.ejs     # 分类 / 标签
│   └── _partial/                  # 头部、页脚、脚本与 13 个首页板块
├── scripts/icons.js               # 图标 helper（30+ Feather 线性图标）
├── source/
│   ├── css/style.css              # 全部样式（CSS 变量 + 三套预设 + 暗色）
│   ├── js/main.js                 # 交互脚本
│   └── images/                    # logo / favicon / 插图 / 缩略图
├── languages/                     # zh-CN / en 文案包
├── examples/                      # 政务 / 教育两套完整预设示例
├── docs/                          # 预览图与部署按钮素材
├── package.json
└── LICENSE
```

{% note info 命名规范 %}
目录名遵循 Hexo 官方主题命名规范 **`hexo-theme-<name>`**：主题的 `_config.yml`、`layout/`、`source/`、`scripts/`、`languages/` 全部独立收纳在该文件夹内，可直接复制到任意 Hexo 站点的 `themes/` 目录下使用。
{% endnote %}
