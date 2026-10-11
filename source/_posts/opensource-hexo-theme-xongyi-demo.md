---
title: hexo-theme-xongyi-demo：主题官方演示站
date: 2026-10-11 21:50:00
categories: [开源项目]
tags: [Hexo, 演示站, 部署]
description: hexo-theme-xongyi 的官方演示站，一个开箱即用的完整 Hexo 站点，内置五大平台一键部署配置。
---

**hexo-theme-xongyi-demo** 是 [hexo-theme-xongyi](/2026/10/11/opensource-hexo-theme-xongyi/) 主题的官方演示站：一个开箱即用的完整 Hexo 站点，含首页全部板块、关于 / 产品 / 新闻 / 联系页面与 4 篇示例文章。

<!-- more -->

## 你要主题还是要整站

- 只想把主题装进自己的 Hexo 站点 → 前往[主题仓库](/2026/10/11/opensource-hexo-theme-xongyi/)
- 想要「主题 + 站点」的完整用法参考 → 直接用本仓库

## 一键部署

仓库内已内置全部构建配置，Fork 或导入后选择任一平台即可部署：

| 平台 | 方式 |
| --- | --- |
| Netlify | Deploy 按钮一键拉取 |
| Vercel | 同上 |
| Cloudflare | 同上（Pages / Workers） |
| GitHub Pages | 自带 `pages.yml`，push 到 `main` 自动发布 |
| EdgeOne Pages | 根目录 `edgeone.json` 已配置构建参数 |

> 主题以 git submodule 引入，部署时需启用 **Recursive / Submodules** 克隆选项。

## 免配置的地址处理

`_config.yml` 里的 `url` / `root` 是占位值，**无需手工修改**：GitHub Pages 工作流会在构建前读取真实地址并生成覆盖配置，Fork 到自己账号或绑定自定义域名都能自动生效。

{% linkcard https://github.com/xfm0797/hexo-theme-xongyi-demo, hexo-theme-xongyi-demo 源码仓库, 主题官方演示站 · 五平台一键部署 %}
