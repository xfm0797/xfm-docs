---
title: 从零造一个机构官网主题（七）：部署工程化——五个平台一键部署
date: 2026-10-15 23:00:00
updated: 2026-10-15 23:00:00
categories: [主题开发]
tags: [Hexo, 部署, CI, 主题开发]
description: 一份站点配五套平台配置：GitHub Pages Actions、Cloudflare、EdgeOne、Vercel、Netlify 的字段对照与差异，以及三个「本地能跑、平台上 404」的坑。
---

机构官网的客户不会用命令行。所以「部署」必须做到：**推到 GitHub 就上线，或者导入仓库点一下就上线**。

这一篇把五个平台的配置摊开对比，并讲三个只在平台上才会暴露的坑——它们本地全都是好的。

<!-- more -->

## 一、五份配置对照

| 平台 | 配置文件 | 构建命令 | 输出目录 | Node 版本 |
| --- | --- | --- | --- | --- |
| GitHub Pages | `.github/workflows/pages.yml` | `npx hexo generate` | `public` | 工作流里指定 |
| Cloudflare Pages | `wrangler.toml` | 控制台填 `npx hexo generate` | `pages_build_output_dir` | 控制台选 |
| EdgeOne Pages | `edgeone.json` | `npm run build` | `outputDirectory` | `nodeVersion` |
| Vercel | `vercel.json` | `buildCommand` | `outputDirectory` | 自动 |
| Netlify | `netlify.toml` | `command` | `publish` | `NODE_VERSION` 环境变量 |

```json
// vercel.json
{
  "framework": "hexo",
  "installCommand": "npm install",
  "buildCommand": "npx hexo generate",
  "outputDirectory": "public",
  "cleanUrls": true
}
```

```toml
# netlify.toml
[build]
  command = "npx hexo generate"
  publish = "public"

[build.environment]
  NODE_VERSION = "20"
```

```toml
# wrangler.toml
name = "xongyi-demo"
compatibility_date = "2026-01-01"
pages_build_output_dir = "public"
```

{% note info 为什么统一用 `npx hexo generate` %}
`npx` 会优先用项目本地的 `node_modules/.bin/hexo`，避免全局没装 hexo 时失败。

顺带一个冷知识：**hexo 的可执行文件是 `node_modules/hexo/bin/hexo`，没有 `.js` 后缀**——直接按路径调用时写成 `bin/hexo.js` 会报找不到文件。
{% endnote %}

## 二、坑 1：GitHub Pages 必须先切 Actions 源

工作流第一次跑就会失败，报：

```text
Get Pages site failed ... Not Found
```

**不是工作流的错。** 必须先去仓库 `Settings → Pages` 把 Source 从 "Deploy from a branch" 改成 **"GitHub Actions"**，否则 `configure-pages` 拿不到 Pages 站点。

工作流里这三行权限也是必需的：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

{% note warning 这是个「文档里写不进去」的坑 %}
因为它是**仓库设置**而不是配置文件，没法随代码分发。只能在 README 里用加粗提醒——而客户恰恰最容易跳过 README 的这部分。

我在演示站的 README 顶部就写了这条。
{% endnote %}

## 三、坑 2：EdgeOne 只跑 `npm run build`

这是我在另一个站点上真实踩到的：EdgeOne Pages 的构建流程**固定执行 `npm run build`**，即使 `edgeone.json` 里写了 `buildCommand` 也不一定生效。

所以 `package.json` 里**必须有 build 脚本**：

```json
{
  "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "server": "hexo server"
  }
}
```

{% note danger "Missing script: build" 是平台专属故障 %}
本地 `npx hexo generate` 跑得好好的，推上去就构建失败。**凡是换环境才出现的故障，先比对两边的「入口命令」是否一致。**
{% endnote %}

## 四、坑 3：构建机 Node 版本与 ESM 依赖

各平台预装的 Node 版本是固定的一组（比如 EdgeOne 只有 14/16/18/20/22.11）。而 **Node 22.11 不支持 `require(ESM)`**（该能力需要 ≥22.12 或 ≥20.19）。

Hexo 8 依赖 `strip-ansi@7`（纯 ESM），在老 Node 上会抛：

```text
Error [ERR_REQUIRE_ESM]: require() of ES Module ...
```

解法是锁降级版本：

```json
{
  "overrides": {
    "strip-ansi": "6.0.1",
    "ansi-regex": "5.0.1"
  }
}
```

本地想复现平台的报错，加一个参数即可：

```bash
node --no-experimental-require-module node_modules/hexo/bin/hexo generate
```

{% note tip 换依赖后必做 %}
升级 Hexo 或新增依赖后，用上面那条命令跑一遍。**「我这儿能构建」从来不等于「平台上能构建」。**
{% endnote %}

## 五、部署按钮：让客户一键导入

README 里放「Deploy to Netlify」这类按钮，客户点一下就能把仓库导入平台。三个细节：

1. **尺寸统一**：官方按钮是 `179 × 32`，圆角 `rx=6`，自己画的 SVG 要对齐，否则一排按钮高低不齐；
2. **URL 要带仓库参数**：`https://app.netlify.com/start/deploy?repository=https://github.com/xfm0797/hexo-theme-xongyi-demo`；
3. **指向演示站仓库而不是主题仓库**——客户导入主题仓库只会得到一个主题，不是能跑的站点。

## 六、我的检查清单

新站点接平台时按顺序过一遍：

1. `package.json` 有 `build` 脚本（EdgeOne 必需）；
2. 依赖里含 `hexo-generator-index/archive/category/tag`（Hexo 核心不带）；
3. 输出目录是 `public`；
4. 构建命令能在本地同 Node 版本下跑通；
5. 部署后抽查 `/archives/`、`/categories/`、`/tags/` 是否 404（生成器缺失的典型症状）。

## 系列导航

{% note tip 系列导航 %}
[xongyi 系列总入口](/series/xongyi/) · 上一篇：[零依赖前端](/2026/10/15/series-xongyi-06-vanilla-frontend/) · 下一篇：[从主题到产品](/2026/10/15/series-xongyi-08-from-theme-to-product/)
{% endnote %}
