---
title: 常见问题
mode: docs
layout: page
order: 70
description: 关于 Xongyi 主题的常见疑问：板块显示、依赖、表单、备案、升级与兼容性。
keywords: [FAQ, 常见问题, 板块, 表单, 备案, 升级]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 常见问题

## 首页与板块

{% fold 首页某个板块没有显示？ %}
两个常见原因：

1. **没写进 `sections`**：板块必须在 `sections` 数组中才会渲染；
2. **板块名拼写不符**：名字要与 `layout/_partial/section-<name>.ejs` 一致（注意 `quicklinks` 的 s）。

`about-contact` 是合并板块，同样需要显式出现在 `sections` 中。
{% endfold %}

{% fold 怎么隐藏一个板块？ %}
从 `sections` 数组中删除对应那一行即可，**不需要**删除其配置节点 —— 保留节点便于日后恢复。详见[板块总览](/docs/xongyi/sections/)。
{% endfold %}

{% fold 想让某个板块排在首页最前面？ %}
调整 `sections` 数组中的位置即可，数组顺序就是页面顺序。
{% endfold %}

{% fold 首页板块的数据从哪来？ %}
除 `news` 板块动态读取最新文章外，其余板块内容全部来自 `_config.yml`（或站点覆盖文件），改配置即可更新，不需要动模板。
{% endfold %}

## 依赖与构建

{% fold 首页 / 归档页不生成？ %}
补装生成器 —— Hexo 7 核心不自带：

```bash
npm i hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag
```
{% endfold %}

{% fold 报错找不到 ejs 渲染器？ %}
主题的模板是 EJS，必须安装 `hexo-renderer-ejs`：

```bash
npm i hexo-renderer-ejs
```
{% endfold %}

{% fold 改了配置但页面没变化？ %}
Hexo 有缓存，改完 YAML 请重新构建：

```bash
hexo clean && hexo generate
```
{% endfold %}

## 内容与页面

{% fold 页面点击 404？ %}
多半是把页面写成了 `source/about.md`。请改为 `source/about/index.md`，这样才会生成 `/about/`（与导航里的写法一致）。详见[页面与 Front-matter](/docs/xongyi/front-matter/)。
{% endfold %}

{% fold 新闻列表是空的？ %}
检查两点：`source/news/index.md` 的 front-matter 里写了 `layout: news`；以及 `source/_posts/` 下确实有文章。
{% endfold %}

{% fold 文章封面不显示？ %}
确认 `cover` 路径正确（如 `/images/thumb-1.svg`），且图片确实存在于站点 `source/images/`（或其它会被复制到 `public/` 的目录）。
{% endfold %}

## 联系与合规

{% fold 联系表单提交到哪里？ %}
主题不收集数据，而是把表单提交到你指定的服务。在 `contact.form_action` 填入服务端点即可，例如：

```yaml
contact:
  form_action: "https://formspree.io/f/xxxxxxx"
```

留空则**不渲染表单**。详见[联系与地图](/docs/xongyi/config-contact/)。
{% endfold %}

{% fold 地图怎么嵌入？ %}
把地图服务商提供的 iframe **嵌入地址**填入 `contact.map`（填 URL，不是整段 `<iframe>` 标签），留空则不显示地图区域。
{% endfold %}

{% fold 如何修改备案号？ %}
在 `footer.icp` 填 ICP 备案号、`footer.police` 填公安备案号，并可通过 `icp_url` / `police_url` 指定跳转地址。详见[页脚与备案](/docs/xongyi/config-footer/)。
{% endfold %}

## 预设与定制

{% fold 换预设后颜色没变？ %}
确认改的是**生效的**配置 —— 站点覆盖文件 `_config.hexo-theme-xongyi.yml` 优先于主题 `_config.yml`；然后重新 `hexo clean && hexo generate`。
{% endfold %}

{% fold 升级主题会覆盖我的自定义吗？ %}
只要自定义都写在站点根目录的 `_config.hexo-theme-xongyi.yml` 中，`git pull` / `git submodule update` 升级主题时就不会丢失。
{% endfold %}

{% fold 想改主色但不想换预设？ %}
预设与主色是两件事。保持 `preset` 不变，通过注入覆写 CSS 令牌 `--primary` 即可，详见[自定义样式与模板](/docs/xongyi/customize/)。
{% endfold %}

{% fold 可以给某个板块单独调样式吗？ %}
可以。板块容器带有对应的类名，用注入的自定义 CSS 精确覆盖即可；但优先尝试用现有配置项（标题、副标题、条目），改动成本更低。
{% endfold %}

## 兼容性

{% fold 支持哪些浏览器？ %}
Chrome / Edge / Firefox / Safari 最近两个大版本。主题使用了 CSS 变量与 `IntersectionObserver`，旧浏览器会优雅降级（失去动画，不影响阅读）。主题也遵循系统的 `prefers-reduced-motion` 设置。
{% endfold %}

{% fold 支持 Hexo 6 或更早版本吗？ %}
推荐 Hexo 7.x。更早版本可能因生成器与 API 差异出现异常，建议升级 Hexo。
{% endfold %}

{% fold 能同时装 hexo-theme-xfm 和 Xongyi 吗？ %}
可以。两套主题都是独立的 `themes/<name>/` 目录，站点用 `theme: <name>` 选择其一。切换主题后请 `hexo clean` 再构建。
{% endfold %}

## 还有问题？

{% row %}
{% col 6 %}
{% button /docs/xongyi/troubleshooting/, 故障排查, warning, fill %}
{% endcol %}
{% col 6 %}
{% button https://github.com/xfm0797/hexo-theme-xongyi/issues, 提交 Issue, github, outline %}
{% endcol %}
{% endrow %}
