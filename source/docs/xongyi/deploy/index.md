---
title: 一键部署
mode: docs
layout: page
order: 15
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

Xongyi 官方演示站内置了五大平台的部署配置，导入即用。

## 支持的平台

| 平台 | 配置文件 | 说明 |
| --- | --- | --- |
| GitHub Pages | `.github/workflows/pages.yml` | 推送到 `main` 自动构建发布 |
| Vercel | `vercel.json` | 一键克隆部署 |
| Netlify | `netlify.toml` | 一键克隆部署 |
| Cloudflare Pages | `wrangler.toml` | Workers / Pages 部署 |
| 腾讯 EdgeOne Pages | `edgeone.json` | 国内加速 |

## 使用演示站一键部署

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

## 手动部署要点

以静态托管为例：

```bash
npm install
hexo clean && hexo generate
# 将生成的 public/ 目录上传 / 发布
```

| 平台 | 构建命令 | 输出目录 |
| --- | --- | --- |
| Vercel / Netlify / Cloudflare / EdgeOne | `hexo generate` | `public` |
| GitHub Pages | `hexo generate` | `public`（由 Action 发布） |

{% note tip 部署前检查 %}
确认站点 `_config.yml` 的 `url` 与 `root` 已按最终域名和发布路径设置，避免生成绝对链接出错。
{% endnote %}
