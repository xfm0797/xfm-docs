---
title: 文档迁入 /docs/xfm/ 并完善订阅、编辑与评论
date: 2026-10-11 20:00:00
updated: 2026-10-11 22:00:00
categories: [更新日志]
tags: [Hexo, 文档, 评论, RSS]
description: xfm 文档整体迁入 /docs/xfm/，新增文档中心页；同时启用 RSS、编辑此页链接与 Waline 评论，并修复选项卡点击无响应的问题。
---

这一轮做了两件事：**把 xfm 文档收进主题子目录**，以及**补齐站点的订阅、编辑、评论能力**。

<!-- more -->

## 一、文档迁入 /docs/xfm/

为了让「主题 → 页面」的层级在 URL 上也能体现：

- `source/docs/` 下 **27 篇** xfm 文档全部迁入 `source/docs/xfm/`；
- 原 `/docs/` 落地页改为 `/docs/xfm/index.md`；
- **新建 `/docs/index.md` 作为文档中心**，分别链接到两个主题分区；
- 侧栏 `_data/docs.yml` 重构为**两个顶层主题分组**，共 36 条链接。

文档内 `/docs/<slug>` → `/docs/xfm/<slug>` 全量改写（含代码示例与按钮标签的参数），但 **FAQ 里「部署到子目录 `root: /docs/`」这类通用示例予以保留**。

## 二、修复选项卡「点击无响应」

复现确认：主题 `core.js` **完全没有** `tabs` 标签的切换逻辑 —— 标签只产出 `.xfm-tab-btn` / `.xfm-tab-panel` 的 DOM，CSS 也齐全，但没有 JS 去切换 `is-active`，所以点「git clone」等选项卡毫无反应。

**站点层修复**（不改主题）：新增 `source/js/xfm-tabs.js`（事件委托切换 + 左右方向键），经 `theme_config.custom.js` 引入。用 jsdom 载入构建产物**模拟真实点击**验证通过。

## 三、启用订阅（RSS）

安装 `hexo-generator-feed`（v4）并新增 `feed` 配置（`atom.xml`），同时开启 `vendors.rss_navbar`。结果：导航栏出现 RSS 图标，`<head>` 输出 `<link rel="alternate">`，产出 `/atom.xml`。

## 四、启用编辑此页

```yaml
docs:
  edit_link: true
  edit_base: https://github.com/xfm0797/xfm-docs/edit/main/source/
```

最终地址 = `edit_base` + 页面源文件路径，例如 `…/edit/main/source/docs/xfm/install/index.md`。

## 五、启用 Waline 评论

```yaml
comments:
  enable: true
  type: waline
  waline:
    serverURL: https://waline.xfm.qzz.io
```

{% note danger 又一个主题 bug：键名对不上 %}
主题 `comment.ejs` 把配置**原样透传**给 `core.js` 的 `Waline.init()`，而 `@waline/client` **v2 的必填项是驼峰 `serverURL`**，主题自带的 `server_url` 对 v2 无效。因此站点改用 `waline.serverURL`。

服务端已验证可达：`GET /` → 200，`/api/comment` 正常返回数据。
{% endnote %}

## 六、社交邮箱

`social.email: mailto:xfm@xfm.qzz.io`（连同 `github`、`rss` 一起展示）。

## 校验

- 站内 `/docs/` 链接 **0 失效**，旧路径残留 0；37 篇文档无孤儿；搜索与 sitemap 各 37 条。
- 构建 **76 files，0 error**。

{% note info 两点主题层面的根因 %}
「选项卡不切换」与「Waline 键名」两个问题的根源都在主题 `hexo-theme-xfm`。目前只在站点层做了规避。若在主题仓库修一次（`core.js` 补 tab 逻辑、键名映射 `server_url → serverURL`），其它使用该主题的站点也能受益。
{% endnote %}
