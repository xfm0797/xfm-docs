---
title: 一键部署
mode: docs
layout: page
order: 60
description: 把 Xongyi 站点部署到 GitHub Pages / Vercel / Netlify / Cloudflare Pages / 腾讯 EdgeOne Pages。
keywords: [部署, GitHub Pages, Vercel, Netlify, Cloudflare, EdgeOne]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 一键部署

Xongyi 是纯静态站点，任何静态托管都能部署。官方演示站内置了五大平台的配置，导入即用。

## 支持的平台

| 平台 | 配置文件 | 说明 | 适合 |
| --- | --- | --- | --- |
| GitHub Pages | `.github/workflows/pages.yml` | 推送到 `main` 自动构建发布 | 开源项目、个人站 |
| Vercel | `vercel.json` | 一键克隆部署 | 海外访问、预览环境 |
| Netlify | `netlify.toml` | 一键克隆部署 | 海外访问、表单服务 |
| Cloudflare Pages | `wrangler.toml` | Pages 部署 | 全球 CDN、免费额度大 |
| 腾讯 EdgeOne Pages | `edgeone.json` | 国内加速 | 国内访问速度 |

## 用演示站一键部署

[hexo-theme-xongyi-demo](https://github.com/xfm0797/hexo-theme-xongyi-demo) 是配好一切的完整站点，Fork 后可直接一键部署：

{% row %}
{% col 4 %}
**Netlify**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/xfm0797/hexo-theme-xongyi-demo)
{% endcol %}
{% col 4 %}
**Vercel**

[部署到 Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fxfm0797%2Fhexo-theme-xongyi-demo)
{% endcol %}
{% col 4 %}
**Cloudflare**

[部署到 Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/xfm0797/hexo-theme-xongyi-demo)
{% endcol %}
{% endrow %}

## 各平台配置要点

{% tabs %}
{% tab GitHub Pages active %}
演示站内置 `.github/workflows/pages.yml`，推送到 `main` 即自动构建到 Pages。

```yaml
# 关键片段
- uses: actions/checkout@v4
  with:
    submodules: recursive        # 主题是 submodule，必须递归拉取

- uses: actions/configure-pages@v5
  id: pages

- run: |
    URL="${PAGES_URL%/}"
    ROOT="${PAGES_BASE%/}/"
    printf 'url: "%s"\nroot: "%s"\n' "$URL" "$ROOT" > _config.pages.generated.yml
    npx hexo generate --config _config.yml,_config.pages.generated.yml
```

{% note warning 首次使用必须先开 Pages %}
仓库 `Settings → Pages` 里把 **Source** 设为 **GitHub Actions**，否则 `configure-pages` 会报 `Get Pages site failed ... Not Found`。
{% endnote %}

{% note tip 它自动处理了子路径 %}
工作流把真实的 `url` / `root` 写进 `_config.pages.generated.yml`，因此项目站点（`/repo-name/` 子路径）也能正确生成链接，无需手改。
{% endnote %}
{% endtab %}
{% tab Vercel %}
```json
{
  "framework": "hexo",
  "installCommand": "npm install",
  "buildCommand": "npx hexo generate",
  "outputDirectory": "public",
  "cleanUrls": true
}
```
{% endtab %}
{% tab Netlify %}
```toml
[build]
  command = "npx hexo generate"
  publish = "public"

[build.environment]
  NODE_VERSION = "20"
```
{% endtab %}
{% tab Cloudflare Pages %}
```toml
name = "xongyi-demo"
compatibility_date = "2026-01-01"
pages_build_output_dir = "public"
```

或在 Cloudflare Dashboard 创建 Pages 项目并连接仓库，构建命令填 `npx hexo generate`、输出目录填 `public`。
{% endtab %}
{% tab 腾讯 EdgeOne Pages %}
```json
{
  "buildCommand": "npx hexo generate",
  "installCommand": "npm install",
  "outputDirectory": "public",
  "nodeVersion": "22.11.0"
}
```
{% endtab %}
{% endtabs %}

## 手动部署

任何静态托管都适用的三步：

```bash
npm install
hexo clean && hexo generate
# 把生成的 public/ 目录整体上传 / 发布
```

| 平台 | 构建命令 | 输出目录 | Node |
| --- | --- | --- | --- |
| Vercel / Netlify / Cloudflare / EdgeOne | `hexo generate` | `public` | 18 / 20 |
| GitHub Pages | `hexo generate` | `public`（由 Action 发布） | 20 |

## 部署前必做：核对 url 与 root

这是**最容易出错**的一步：

```yaml
# 站点 _config.yml
url: "https://www.example.com"
root: "/"
```

| 场景 | `url` | `root` |
| --- | --- | --- |
| 独立域名 | `https://www.example.com` | `/` |
| GitHub Pages 项目站点 | `https://user.github.io/repo` | `/repo/` |
| 子目录部署（如 `example.com/org/`） | `https://example.com/org` | `/org/` |

{% note warning 写错的后果 %}
`root` 写错会导致 CSS / JS / 图片 404（页面裸奔），`url` 写错会导致 sitemap 与 OG 链接指向错误域名。
{% endnote %}

## 部署检查清单

- [ ] `hexo clean && hexo generate` 本地无报错，`public/index.html` 存在
- [ ] `url` / `root` 与目标地址一致
- [ ] 首页所有板块正常（板块数据来自 `_config.yml`，构建时已固化）
- [ ] 导航各链接可点且不 404
- [ ] 图片、`logo`、`favicon` 全部加载
- [ ] 暗色模式切换正常
- [ ] 移动端抽屉菜单可展开
- [ ] 已填 `footer.icp` / `footer.police`（国内站点）
- [ ] 表单（`contact.form_action`）能收到提交
- [ ] 若有子模块主题，CI 里用了 `submodules: recursive`

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/faq/, 常见问题, info, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/troubleshooting/, 故障排查, warning, outline %}
{% endcol %}
{% endrow %}
