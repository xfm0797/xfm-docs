---
mode: docs

title: 常见问题
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 关于 XFM 主题的常见疑问：兼容性、模式选择、性能、与其它主题的差异。
keywords: [FAQ, 常见问题, 兼容性, 性能]
order: 70
---

# 常见问题

## 安装与兼容

{% tabs %}
<!-- tab 需要 Node.js 什么版本？ -->
`>= 16.0.0`。这是 `package.json` 的 `engines` 字段声明的下限。低于此版本会在安装或构建阶段报错。
<!-- endtab -->
<!-- tab 支持 Hexo 6 / 7 / 8 吗？ -->
支持。主题的脚本加载器（`scripts/*.js`）做了**自执行兼容处理**——Hexo 7/8 不会回调 `module.exports`，因此主题在脚本作用域内直接调用初始化函数，同时用 `hexo.__XFM_*` 标记防止重复注册。

需要注意 Hexo 8 起核心不再内置渲染器与部分生成器，需自行安装（见[安装与部署](/docs/install/#安装依赖)）。
<!-- endtab -->
<!-- tab 需要安装额外插件吗？ -->
**不需要。** 搜索索引、站点地图、robots.txt、404 页、内容增强全部由主题内置的生成器与过滤器提供。

唯一需要按需安装的是 `hexo-generator-feed`——只在你需要 RSS 订阅时。
<!-- endtab -->
<!-- tab 会和我已装的插件冲突吗？ -->
常见组合验证过：

| 插件 | 说明 |
| --- | --- |
| `hexo-generator-feed` | 无冲突，正常使用 |
| `hexo-generator-sitemap` | **建议卸载**，与主题内置的 sitemap 生成器会产出两份 |
| `hexo-generator-search` | **建议卸载**，索引格式与主题前端不一致 |
| `hexo-deployer-git` | 无冲突，部署用 |
<!-- endtab -->
{% endtabs %}

## 模式选择

{% note info 该选哪个模式？ %}
一句话判断：

- **主要是写文章、给人看** → `blog`
- **持续积累零散知识** → `notes`
- **结构稳定、面向使用者的手册** → `docs`

三者可以共存：站点选一个默认模式，个别内容用 front-matter 的 `mode` 覆盖。
{% endnote %}

{% tabs %}
<!-- tab blog 和 docs 能混用吗？ -->
可以。站点设 `mode: blog`，给文档页的 front-matter 加 `mode: docs`：

```yaml
---
title: 用户手册
mode: docs
---
```

这样这篇会以三栏文档布局呈现。**但要注意**：只要站内存在 `mode: docs` 的页面，就需要维护 `source/_data/docs.yml`，否则那些页面的左栏会退化为扁平列表。
<!-- endtab -->
<!-- tab notes 和 docs 的核心差别？ -->
| | notes | docs |
| --- | --- | --- |
| 树怎么来 | 按分类 / 日期**自动分组** | 手工在 `docs.yml` 定义 |
| 层级 | 两级 | 任意层级 |
| 上下篇 | 无 | 有（按树顺序） |

**内容会持续零散增加 → notes；结构需要精心编排 → docs。**
<!-- endtab -->
<!-- tab 能从其它主题迁移过来吗？ -->
大部分内容可以。注意两件事：

1. **标签插件语法不同**。其它主题的 `{% raw %}{% note %}{% endraw %}` 参数顺序可能不一样，需要对照[标签插件总览](/docs/tags/)调整。
2. **`_config.yml` 完全不同**。主题配置项是针对 XFM 设计的，不能直接复用旧主题的配置。
<!-- endtab -->
{% endtabs %}

## 性能

{% tabs %}
<!-- tab 主题有性能开销吗？ -->
主题的静态产物很轻：

| 资源 | 说明 |
| --- | --- |
| CSS | 7 个文件，按 `variables → base → layout → components → post → plugins → adaptive` 分层 |
| JS | 4 个文件（adaptive / core / toc / search），无框架、无 polyfill |
| 图标 | 内联 SVG sprite，**零外部请求** |
| 图片 | 内置资源全为 SVG |

**没有引入任何前端框架**，运行时全部是原生 JS。
<!-- endtab -->
<!-- tab 搜索索引会不会太大？ -->
索引体积由 `search.content_length` 决定（每条记录的正文保留前 N 字符）。参考量级：

- 100 篇中等长度文档，`content_length: 3000` → 约 300–600 KB
- 静态托管普遍开启 gzip，实际传输约 1/3
- 且搜索面板打开时才拉取，不参与首屏

需要更小就调低 `content_length`，或关闭 `index_content`。
<!-- endtab -->
<!-- tab 首屏会闪烁吗？ -->
**不会。** 档位探测脚本位于 `<head>` 最前，是内联同步脚本，在浏览器渲染 `<body>` 之前就已写入 `data-tier`。所以第一帧画出来就是正确档位。
<!-- endtab -->
<!-- tab Mermaid / 数学公式会拖慢页面吗？ -->
不会阻塞首屏。Mermaid 使用动态 `import()`，数学库使用 `defer` 加载。只有在页面上确实存在对应内容时才有意义——**如果你的站点完全不用公式或图表，建议直接关掉**：

```yaml
vendors:
  math: none
  mermaid: false
```
<!-- endtab -->
{% endtabs %}

## 定制

{% note warning 我改了配置但没生效 %}
按顺序排查：

1. `hexo clean` 执行了吗？——**`adaptive` 相关的样式是构建期生成的，必须清缓存**
2. 改的是**主题**的 `_config.yml` 还是**站点**的？站点 `theme_config` 优先级更高
3. YAML 语法对吗？——布尔值加了引号会被当成非空字符串（仍为真）
4. 颜色值加引号了吗？——`primary: "#4f6bed"`
{% endnote %}

{% tabs %}
<!-- tab 我应该改主题文件还是用 theme_config？ -->
| 场景 | 建议 |
| --- | --- |
| 单人维护、不常升级 | 直接改 `themes/xfm/_config.yml`，改动集中好找 |
| 跟随上游升级 | 用站点 `_config.yml` 的 `theme_config` 覆盖 |

**唯一绝对不要做的**：改 `themes/xfm/` 下的模板和 CSS 文件。升级时整个目录会被替换。
<!-- endtab -->
<!-- tab 想加一个全新的页面类型？ -->
Hexo 层面的做法：在站点 `layout/` 下放一个 EJS 文件，名字对应 `page.layout`。

```yaml
---
title: 我的自定义页
layout: my-page
---
```

然后在站点 `layout/my-page.ejs` 里写模板。Hexo 的模板查找顺序是**站点 `layout/` 优先于主题 `layout/`**，所以这不会污染主题目录。

模板里可以直接用主题的全部辅助函数（`xfm_icon()` 等）。
<!-- endtab -->
<!-- tab 想改导航栏的结构？ -->
优先考虑是否能用配置达成：

- 加菜单项 → `menu`
- 换图标 → `menu.<项>.icon`
- 隐藏标题 → `appearance.site_title: false`
- 隐藏整个导航 → `navbar.enable: false`
- 隐藏搜索 / RSS / 切换按钮 → 各自的开关

都不满足时，覆盖 `layout/_partials/header.ejs`（放在站点 `layout/_partials/` 下）。
<!-- endtab -->
{% endtabs %}

## 部署

{% tabs %}
<!-- tab 部署在子目录（如 /docs/）要改什么？ -->
站点 `_config.yml`：

```yaml
url: https://example.com/docs
root: /docs/
```

主题内部所有链接都走 Hexo 的 `url_for()`，会自动带上 `root` 前缀。**搜索索引与 sitemap 的 URL 也会自动适配**，不需要额外配置。

部署到子目录后务必本地验证一遍：`hexo clean && hexo g && hexo s --root /docs/`。
<!-- endtab -->
<!-- tab 为什么 sitemap 里没有我的文档？ -->
文档是**独立页面**（page），会被收录。若缺失，检查：

1. 站点 `url` 是否已配置？——**未配置 `url` 时生成器直接返回 null，不产出 sitemap**
2. 该页面是否有 `title`？
3. 是否被 `sitemap.exclude` 的规则命中？——匹配方式是**子串包含**
<!-- endtab -->
<!-- tab 更新后部分访客看到旧样式？ -->
静态托管 + 浏览器缓存。两种处理：

1. 每次发布时给 CSS/JS 加版本查询串（需要自定义模板，成本较高）
2. 配置托管平台的缓存策略，让 HTML 不缓存、带 hash 的资源长缓存

对多数文档站，**在发布后主动刷新一次 CDN 缓存**已经够用。
<!-- endtab -->
{% endtabs %}

## 还没解决？

到 [故障排查](/docs/troubleshooting/) 看看常见报错的具体处置方式，或在仓库提 issue：

{% button https://github.com/xfm0797/hexo-theme-xfm/issues, 提交 Issue, github, fill %}
