---
title: 站点更名与主题引用方式调整
date: 2026-10-10 18:00:00
updated: 2026-10-11 22:00:00
categories: [更新日志]
tags: [Hexo, 主题, Git]
mode: notes
description: 站点改名为「XFM开源官方文档」，并把内嵌的主题源码改为以 git submodule 直接引用官方仓库。
---

两处调整：站点名称确定为 **「XFM开源官方文档」**；同时把主题的引入方式从「内嵌源码」改为「`git submodule` 引用官方仓库」，让仓库不再携带主题源码。

<!-- more -->

## 站点更名

站点名称由「XFM 主题文档」改为 **「XFM开源官方文档」**，同步更新了这些位置：

| 文件 | 变更 |
| --- | --- |
| `_config.yml` | `title` 改为新名称 |
| `README.md` | 站点说明同步 |
| `source/about/index.md` | 关于页站点称谓同步 |
| `source/docs/index.md` | 文档中心欢迎语同步 |

重构建后，`<title>` 与导航栏品牌名均已生效。

## 主题引用方式：内嵌 → submodule

站点使用 `hexo-theme-xfm`，该主题**源码托管在独立仓库** `https://github.com/xfm0797/hexo-theme-xfm`。因此本站不应再单独携带一份主题源码，改为以 **`git submodule`** 引用：

```bash
git rm -r themes/xfm
git submodule add https://github.com/xfm0797/hexo-theme-xfm.git themes/xfm
```

效果：仓库中的 `themes/xfm` 由 **72 个内嵌文件** 变为 **单个 gitlink**（模式 `160000`），锁定上游提交，构建时按 `.gitmodules` 检出。

{% note info 首次克隆请注意 %}
因为主题是 submodule，克隆时需带上子模块：

```bash
git clone --recurse-submodules https://github.com/xfm0797/xfm-docs.git
```

已克隆的仓库可补执行 `git submodule update --init --recursive`。
{% endnote %}

## 验证

- **仓库确实不再携带主题源码**：全新 `git clone` 后 `themes/xfm` 为空，执行 `git submodule update --init --recursive` 后检出主题（73 文件）。
- **docs 模式不受影响**：上游主题默认 `mode: blog`，但站点 `theme_config.mode: docs` 覆盖生效。
- 构建 **53 files，0 error**。

{% note tip 主题升级方式 %}
后续升级主题只需：

```bash
git submodule update --remote themes/xfm
```

然后提交新的 gitlink 即可。该主题未发布到 npm，因此只能走 submodule / clone 方式。
{% endnote %}
