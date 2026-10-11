---
mode: docs

title: 评论系统
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 配置 giscus、utterances、waline、twikoo、disqus 等 8 种评论系统，并了解懒加载与主题跟随。
keywords: [评论, giscus, utterances, waline, twikoo, disqus, valine]
order: 51
---

# 评论系统

## 总配置

```yaml
comments:
  enable: false
  type: giscus
  # 是否懒加载（滚动到评论区再注入，推荐开启）
  lazyload: true
  # 自定义评论区的标题
  title: 评论
  # 是否在计数回调中预留空间，避免跳动
  preserve_height: false
```

| 配置项 | 说明 |
| --- | --- |
| `enable` | 总开关。关闭后即使填了参数也不渲染 |
| `type` | 当前启用哪一套，取值见下表 |
| `lazyload` | 开启后，滚动到评论区附近才注入脚本 |
| `title` | 评论区上方的标题文案 |
| `preserve_height` | 是否预留高度，避免评论加载完成后页面跳动 |

`type` 可选：`giscus` / `utterances` / `waline` / `twikoo` / `disqus` / `disqusjs` / `changyan` / `valine`

## 单篇关闭评论

三种粒度：

{% row %}
{% col 4 %}
**站点级**

```yaml
comments:
  enable: false
```
{% endcol %}
{% col 4 %}
**文章 / 页面级**

```yaml
---
title: 内部草稿
comments: false
---
```
{% endcol %}
{% col 4 %}
**档位级**

```yaml
adaptive:
  tiers:
    mobile:
      disable: [comments]
```
{% endcol %}
{% endrow %}

## 懒加载机制

`lazyload: true` 时，评论脚本**不会**在页面加载时执行。主题用 `IntersectionObserver` 监听评论区元素，当它进入视口附近（`rootMargin: 260px`）时才注入对应 SDK。

这带来三个好处：

- 首屏更快，评论脚本不参与关键路径
- 不使用的访客完全不加载评论 SDK
- 多个评论 SDK 之间不会互相干扰

{% note tip 建议保持开启 %}
评论 SDK 普遍是几百 KB 的外部脚本。除非你的站点极度依赖评论的 SEO 收录，否则 `lazyload: true` 是更合理的选择。
{% endnote %}

## giscus

基于 **GitHub Discussions**，无后端、无数据库，配置最简单。

```yaml
comments:
  enable: true
  type: giscus
  lazyload: true
  giscus:
    repo: user/repo
    repo_id:
    category: Announcements
    category_id:
    mapping: pathname
    strict: 0
    reactions_enabled: 1
    emit_metadata: 0
    input_position: bottom
    theme: preferred_color_scheme
    lang: zh-CN
    loading: lazy
```

### 获取 repo_id 与 category_id

1. 打开 [giscus.app](https://giscus.app/)，在"仓库"一栏填入你的仓库（需公开且已安装 giscus App）
2. 页面下拉到"启用 giscus"生成的配置代码
3. 从中复制 `data-repo-id` 与 `data-category-id` 的值

{% note warning giscus 的前置条件 %}
仓库必须是**公开**的；必须已安装 **giscus GitHub App**；必须已在仓库中**创建 Discussions 分类**（如 `Announcements`）。三者缺一，评论区会空白且控制台报错。
{% endnote %}

### 主题跟随

`theme: preferred_color_scheme` 会让 giscus iframe 跟随访客的系统偏好。主题还额外监听了页面内的深浅色切换，通过 `postMessage` 通知 giscus 同步换色——所以点击导航栏的日/月图标时，评论区的配色会一起变。

## utterances

基于 **GitHub Issues**，比 giscus 更早的方案。

```yaml
comments:
  enable: true
  type: utterances
  utterances:
    repo: user/repo
    issue_term: pathname
    label: comment
    theme: github-light
    # 支持主题跟随: preferred-color-scheme
    dark_theme: github-dark
```

`issue_term` 决定用什么标识映射到 Issue：`pathname` / `url` / `title` / `og:title` 等。

主题会按当前深浅色自动在 `theme` 与 `dark_theme` 之间切换。

## waline

需要**自建服务端**（Vercel / 自有服务器均可），功能最完整。

```yaml
comments:
  enable: true
  type: waline
  waline:
    server_url:
    emoji:
      - https://cdn.jsdelivr.net/gh/walinejs/emojis/weibo
    lang: zh-CN
    visitor: true
    required_meta: [nick, mail]
    avatar: mp
    page_size: 10
```

| 配置项 | 说明 |
| --- | --- |
| `server_url` | 部署好的 Waline 服务地址，**必填** |
| `emoji` | 表情包 CDN 地址数组 |
| `visitor` | 是否统计阅读量 |
| `required_meta` | 必填字段，如 `[nick, mail]` |
| `page_size` | 每页评论数 |

## twikoo

需要**云函数部署**（腾讯云 / Vercel）。

```yaml
comments:
  enable: true
  type: twikoo
  twikoo:
    env_id:
    region:
    lang: zh-CN
    visitor: true
```

`env_id` 填部署后获得的云函数环境 ID。

## disqus

```yaml
comments:
  enable: true
  type: disqus
  disqus:
    shortname:
    apikey:
    lang: zh_CN
```

{% note warning 国内网络环境 %}
Disqus 的脚本域名在国内访问不稳定，访客可能看不到评论区。国内站点建议改用 waline / twikoo，或用下面的 disqusjs。
{% endnote %}

## disqusjs

Disqus 的**反代方案**：评论数据仍存在 Disqus，但通过第三方 API 代理读取，国内可访问。

```yaml
comments:
  enable: true
  type: disqusjs
  disqusjs:
    shortname:
    apikey:
    api: https://disqus.skk.moe/disqus/
```

`api` 是代理服务地址，一般保持默认。

## 畅言

搜狐的国内评论服务。

```yaml
comments:
  enable: true
  type: changyan
  changyan:
    appid:
    conf:
```

`appid` 与 `conf` **都必填**，缺任一项时评论区会显示"配置不完整"占位。

## valine

基于 **LeanCloud**，支持匿名评论。

```yaml
comments:
  enable: true
  type: valine
  valine:
    appid:
    appkey:
    placeholder: 说点什么吧…
    avatar: mp
    visitor: true
    lang: zh-CN
```

`appid` / `appkey` 来自 LeanCloud 应用的配置页。

## 方案对比

| 方案 | 后端 | 需登录 | 国内可用 | 配置复杂度 |
| --- | --- | --- | --- | --- |
| giscus | 无（GitHub Discussions） | 需 GitHub 账号 | 一般 | 低 |
| utterances | 无（GitHub Issues） | 需 GitHub 账号 | 一般 | 低 |
| waline | 自建 / Serverless | 可选 | 好 | 中 |
| twikoo | 云函数 | 可选 | 好 | 中 |
| disqus | 无 | 可选 | 差 | 低 |
| disqusjs | 无 + 反代 | 可选 | 中 | 中 |
| 畅言 | 无 | 可选 | 好 | 低 |
| valine | LeanCloud | 可选 | 好 | 中 |

{% row %}
{% col 6 %}
**选 giscus，如果你**

- 站点是技术向，读者有 GitHub 账号
- 完全不想维护后端
- 看重"评论即讨论"的形态
{% endcol %}
{% col 6 %}
**选 waline / twikoo，如果你**

- 面向国内普通读者
- 希望支持匿名评论
- 需要阅读量统计
{% endcol %}
{% endrow %}

## 排查

{% tabs %}
<!-- tab 评论区一直是"加载中" -->
1. 确认 `comments.enable: true`
2. 确认 `type` 对应的配置块**填齐了必填项**
3. 关闭 `lazyload` 后刷新，看控制台是否有脚本加载错误
4. 检查该文章是否设了 `comments: false`
5. 检查当前档位是否在 `disable` 里包含 `comments`
<!-- endtab -->
<!-- tab 界面显示"配置不完整" -->
这是主题在 SDK 初始化前的前置校验未通过。常见原因：

- giscus 缺 `repo` 或 `repo_id`
- waline 缺 `server_url`
- 畅言缺 `appid` / `conf`
- valine 缺 `appid` / `appkey`

补齐后 `hexo clean && hexo g`。
<!-- endtab -->
<!-- tab 文档站要不要开评论 -->
文档站通常**不建议**开评论区：

- 文档需要权威、稳定，评论区容易积累过时问题
- 更合适的做法是在页脚提供 issue 链接（用 `docs.edit_link` + `edit_base` 指向仓库 issues）

若确实需要反馈渠道，建议只在博客形态开启，文档页面用 front-matter 单独关掉。
<!-- endtab -->
{% endtabs %}
