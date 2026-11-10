---
mode: docs

title: 构建与部署
date: 2026-11-10 22:10:00
updated: 2026-11-10 22:10:00
description: xfmpress 的构建产物与增量缓存机制、site.base 子路径部署、GitHub Pages / Netlify / Vercel / Nginx 的配置方式，以及上线前的检查清单与常见 404 排查。
keywords: [xfmpress, 构建, 增量缓存, 部署, GitHub Pages, Netlify, Nginx, base, CI]
order: 29
---

# 构建与部署

`xfm build` 产出的是**纯静态文件**：没有 Node 运行时、没有服务端渲染、没有需要守护的进程。这类产物的好处是托管成本极低 —— CDN、对象存储、GitHub Pages 都能直接接。

## 产物结构

```text
dist/
├── index.html
├── about/index.html
├── posts/hello/index.html
├── page/2/index.html          # 列表分页
├── tags/Node.js/index.html    # 标签聚合页
├── categories/工程/index.html
├── series/静态站点生成器/index.html
├── categories/index.html      # 分类索引（主题提供布局时）
├── archives/index.html        # 按年归档（同上）
├── assets/                    # 主题资源
│   ├── style.css
│   └── ux.js
├── sitemap.xml                # 以下由插件产出
├── robots.txt
├── feed.xml
└── search.json
```

页面是**目录 + `index.html`** 的形式，因此 URL 都是干净的 `/<path>/`，不需要服务器改写成 `.html`。

三类「非内容页」值得区分：

| 类型 | 来源 | 是否进文章列表 |
| --- | --- | --- |
| 聚合页 | 每个标签 / 分类 / 系列各一页 | 否 |
| 分页页 | `/page/2/`、`/page/3/` | 否 |
| 索引页 | 分类索引与归档 | 否 |

它们都不会出现在 `prev` / `next` 链条里，也不进 RSS —— 否则「上一页」会指向一个归档页。

## 增量缓存

缓存放在站点根的 `.xfm/cache.json`，每页一条 `{ hash, html, bodyHtml }`。

一页的哈希由六部分拼成：

```text
layout | 主题指纹 | 配置指纹 | 源文件原文 | 列表摘要 | 相关文章列表
```

| 组成 | 为什么在里面 |
| --- | --- |
| 源文件原文 | 正文改了就得重渲 |
| 主题指纹 | `layouts/` 与 `partials/` 任何改动让全站失效 |
| 配置指纹 | 站点标题、导航、`defaults`、markdown 选项改动同理 |
| 布局名 | 换布局当然要重渲 |
| 列表摘要 | 首页正文没变，但文章增删要让它重排 |
| 相关文章列表 | 别的文章改了标签，本页推荐也要跟着变 |

后两项是容易漏掉的坑：早期版本的增量构建就出现过「新增文章后首页还是旧列表」「改标签后推荐位留旧值」。把它们掺进哈希之后问题消失。

缓存只影响**渲染**，不影响写盘 —— 命中缓存的页面仍然会写出文件（从缓存里取 HTML），所以 `dist/` 永远是完整的。

```bash
xfm build          # 生产构建，默认走增量
xfm build --dev    # 开发模式下也启用增量（配合 dev 反复构建时有用）
xfm clean          # 删 dist 与 .xfm，彻底重来
```

CI 里把 `.xfm/` 缓存起来能显著缩短构建时间；但注意主题一改，全站缓存必然失效，这是设计使然，不是 bug。

## 子路径部署

站点部署在 `https://example.com/blog/` 这种子路径下时，把 `site.base` 设成 `'/blog/'`：

```js
export default {
  site: { base: '/blog/', url: 'https://example.com' },
};
```

前缀由引擎在**渲染出口统一补一次**，覆盖三类来源：

- 模板里的 `href="/about/"`；
- Markdown 里写的 `[链接](/about/)`；
- 你自己手写的原始 HTML。

`site.base` 还会作用到 sitemap / RSS 的地址与 `search.json` 里的链接。`xfm dev` 同样按前缀访问 —— 本地预览时地址是 `http://127.0.0.1:4173/blog/`，这样「本地正常、线上 404」这类问题在开发阶段就能暴露。

内部一律使用不带 base 的「裸 URL」，落盘路径与缓存键都不受 base 影响，所以改 base 不会让缓存整体失效。

## GitHub Pages

项目页（`https://<user>.github.io/<repo>/`）是子路径，用环境变量在 CI 里注入即可：

```yaml

name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Resolve base and url
        run: |
          repo="${{ github.event.repository.name }}"
          owner="${{ github.repository_owner }}"
          if [ "$repo" = "$owner.github.io" ]; then
            echo "SITE_BASE=/" >> "$GITHUB_ENV"
            echo "SITE_URL=https://$owner.github.io" >> "$GITHUB_ENV"
          else
            echo "SITE_BASE=/$repo/" >> "$GITHUB_ENV"
            echo "SITE_URL=https://$owner.github.io/$repo" >> "$GITHUB_ENV"
          fi

      - run: npm ci
      - run: npx xfm build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4

```

首次使用时在仓库 **Settings → Pages → Build and deployment → Source** 里选一次 **GitHub Actions**。

注意 `concurrency` 写的是 `cancel-in-progress: false`：Pages 同一时间只允许一个部署，取消进行中的会留下半截产物，所以排队而不是打断。

用户根站（`<user>.github.io` 仓库）的 base 是 `/`，上面的脚本已经区分了这两种情况。

## Netlify / Vercel

构建命令 `npx xfm build`，发布目录 `dist`。两者默认部署在域名根路径，`site.base` 保持 `'/'` 即可。

Netlify 的 `netlify.toml`：

```toml
[build]
  command = "npx xfm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

Vercel 在项目设置里填同样的命令与输出目录，或者写 `vercel.json`：

```json
{
  "buildCommand": "npx xfm build",
  "outputDirectory": "dist"
}
```

两者都自带 CDN 与 HTTPS，不需要额外配置缓存头 —— 带哈希的文件名只有 `assets/` 下的资源，如果你在意，可以给 `assets/*` 加长缓存、给 `*.html` 加 `no-cache`。

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/my-site/dist;

    # 目录 URL 优先找 index.html
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # 资源长缓存（文件名不变的话改成 no-cache）
    location /assets/ {
        expires 7d;
        add_header Cache-Control "public";
    }

    error_page 404 /404.html;
}
```

关键在 `try_files`：页面是目录形式，`/about/` 要能命中 `about/index.html`。少了这条会得到一堆 404。

## 对象存储

把 `dist/` 整个上传即可。唯一要注意的还是目录索引：S3 / OSS / COS 这类服务需要显式开启「静态网站托管」并指定索引文档为 `index.html`，否则 `/about/` 会返回 `403` 或 `404`。

上传时建议分两批：

1. `assets/`（文件名带哈希或变动少）→ 长缓存；
2. `*.html`、`*.xml`、`*.json` → 短缓存或 `no-cache`。

## 上线检查清单

| 检查项 | 命令或方法 |
| --- | --- |
| `site.url` 已配 | 否则 sitemap 里是相对 `<loc>`，爬虫不认 |
| 首页标题正确 | 打开 `/` 看 `<title>` |
| 子路径正确 | 部署在子路径时，`/blog/` 与 `/blog/about/` 都能开 |
| 资源 200 | 打开开发者工具看 `assets/style.css` |
| sitemap 数量对 | `grep -c "<loc>" dist/sitemap.xml` |
| 未发布草稿不漏 | `xfm build` 后搜草稿标题 |
| 死链为零 | 装 `deadlinks` 并设 `strict: true` |
| 404 页存在 | 访问一个不存在的地址看是否命中自定义页 |

## 常见问题

**页面能开，但样式全丢**
十有八九是 `site.base` 与部署路径不一致。子路径部署时 `base` 必须带前后斜杠，例如 `'/blog/'` 而不是 `'blog'`（引擎会纠正，但别依赖纠正）。

**刷新子页面 404，首页正常**
静态服务器的目录索引没配好。Nginx 看 `try_files`，对象存储看「静态网站托管」的索引文档设置。

**改了模板但产物没变**
`xfm dev` 有模板缓存（按 mtime 失效），正常情况下保存即生效；若确实不动，`xfm clean` 后重建。生产构建则检查 `.xfm/cache.json` 是否被 CI 从上一个提交缓存下来又没随模板变更失效 —— 主题指纹会处理这件事，除非缓存目录被错误地跨分支复用。

**构建很慢，几乎全在写盘**
千页规模的产物在 Windows / NTFS 上写盘就是瓶颈，这不是生成器能优化的部分。放到 Linux 上构建，或者减少产物体积（关掉 `minify` 之外的插件、合并页面）。

**目录 URL 访问时中文路径 404**
产物落盘时会把百分号编码还原成真实目录名，所以服务器拿到的是 UTF-8 路径。若反向代理或对象存储对编码处理不同，优先在 `site.url` 之外检查服务器端的 URL 解码设置。
