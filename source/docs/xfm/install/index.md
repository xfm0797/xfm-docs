---
mode: docs

title: 安装与部署
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 安装 XFM 主题、补齐依赖、切换模式并部署到静态托管。
keywords: [Hexo 安装, 主题安装, 依赖, 部署]
order: 2
---

# 安装与部署

## 环境要求

| 项目 | 要求 |
| --- | --- |
| Node.js | `>= 16.0.0`（`package.json` 中已声明） |
| Hexo | 6 / 7 / 8 均可，Recommended 8.x |
| 渲染器 | `hexo-renderer-marked` + `hexo-renderer-ejs` |

## 安装主题

{% tabs %}
<!-- tab npm 安装（推荐） -->
```bash
npm i hexo-theme-xfm
```

安装后主题位于 `node_modules/hexo-theme-xfm`，复制或软链到站点 `themes/xfm`：

```bash
cp -r node_modules/hexo-theme-xfm themes/xfm
# 或建立软链，便于随 npm 升级
ln -s ../node_modules/hexo-theme-xfm themes/xfm
```
<!-- endtab -->
<!-- tab git clone -->
```bash
git clone https://github.com/xfm0797/hexo-theme-xfm.git themes/xfm
```

跟随仓库最新提交，升级时 `git pull` 即可。
<!-- endtab -->
{% endtabs %}

## 启用主题

编辑**站点根目录**的 `_config.yml`，把 `theme` 指向主题文件夹名：

```yaml
theme: xfm
```

{% note warning 命名必须与目录一致 %}
主题目录名必须是 `xfm`（或与 `theme:` 的值完全一致）。若你放到了 `themes/xfm-theme`，则 `theme: xfm-theme`。
{% endnote %}

## 安装依赖

Hexo 8 起核心不再内置渲染器与部分生成器，请在**站点根目录**安装：

```bash
npm i hexo-renderer-marked hexo-renderer-ejs \
      hexo-generator-index hexo-generator-archive \
      hexo-generator-category hexo-generator-tag
```

`hexo init` 生成的站点通常已自带上述依赖，可先运行 `npm ls` 确认。

### 按需增强

| 功能 | 依赖 | 说明 |
| --- | --- | --- |
| RSS 订阅 | `npm i hexo-generator-feed` | 不装则导航栏 RSS 图标指向的 `/atom.xml` 为空 |
| KaTeX / MathJax | 无需安装 | 主题按 `vendors.math` 从 CDN 加载 |
| Mermaid | 无需安装 | 主题按 `vendors.mermaid` 从 CDN 加载 |
| 搜索 | **无需安装** | 主题内置 `search.json` 生成器 |

{% note danger 必须保留 package.json 中的 hexo 字段 %}
站点根目录的 `package.json` 需要包含 `"hexo": { "version": "..." }` 字段，Hexo 才会加载外部插件。这也是主题内置的 404 / sitemap / 搜索索引等生成器能否工作的前提。
{% endnote %}

## 切换模式

在主题 `_config.yml` 顶部切换全局形态：

```yaml
mode: docs   # blog / notes / docs
```

单篇文章可以覆盖它，实现同站混排：

```yaml
---
title: 某篇文档
mode: docs
---
```

## 需要的独立页面

部分页面类型需要在 `source/` 下新建对应 Markdown，并在 front-matter 声明 `type`：

```bash
hexo new page tags         # front-matter 加 type: tags
hexo new page categories   # front-matter 加 type: categories
hexo new page links        # front-matter 加 type: links
hexo new page archives     # 无需额外 type
```

以标签页为例，生成的 `source/tags/index.md` 应为：

```yaml
---
title: 标签
type: tags
---
```

## 本地预览

```bash
hexo clean
hexo g
hexo s
```

打开 `http://localhost:4000`。若样式未生效，先确认 `hexo clean` 已执行——主题升级后旧的渲染缓存会干扰。

## 部署

主题本身不限制托管方式，静态产物在 `public/`，交给任意静态托管即可。

{% tabs %}
<!-- tab GitHub Pages -->
```bash
npm i hexo-deployer-git
```

站点 `_config.yml`：

```yaml
deploy:
  type: git
  repo: git@github.com:<user>/<user>.github.io.git
  branch: main
```

```bash
hexo clean && hexo g && hexo d
```
<!-- endtab -->
<!-- tab 容器 / Nginx -->
```bash
hexo clean && hexo g
# 把 public/ 内容发布到 Web 根目录
rsync -avz --delete public/ user@host:/var/www/blog/
```

Nginx 只需把 `root` 指向该目录。注意主题使用 pretty URL（目录 + `index.html`），确保 `index.html` 为默认索引文件。
<!-- endtab -->
{% endtabs %}

{% note tip 部署前检查 %}
`_config.yml` 的 `url` 必须填成站点最终访问地址。`canonical`、OG 图、`sitemap.xml` 都依赖它，填错会导致搜索引擎收录异常。
{% endnote %}
