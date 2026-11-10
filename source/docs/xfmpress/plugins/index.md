---
mode: docs

title: 插件
date: 2026-11-10 22:05:00
updated: 2026-11-10 22:05:00
description: xfmpress 插件系统：六类钩子的语义与执行时机、自动发现与加载顺序、15 个官方插件的能力与配置、front-matter 页面级开关，以及如何自己写一个插件。
keywords: [xfmpress, 插件, hooks, extendContext, transformHtml, afterCollect, afterBuild, xfm-plugin]
order: 28
---

# 插件

**内核不带任何插件。** `npm i -g xfmpress` 只装生成器与两套主题，其余能力全按需安装 —— 和 Hexo 的思路一致：站点里装了什么，就有什么。

## 加载规则

四条来源，按顺序合并：

| 来源 | 写法 | 说明 |
| --- | --- | --- |
| 自动发现 | 站点 `package.json` 的 `dependencies` / `devDependencies` 里任何 `xfm-plugin-*` | 装了即生效，不用改配置 |
| 短名 | `plugins: ['rss']` | 解析成 `xfm-plugin-rss`，可固定加载顺序 |
| 路径 | `plugins: ['./plugins/my.js']` | 站点内的本地插件 |
| 内联 | `plugins: [{ name, ...hooks }]` | 配置里直接写对象 |

```bash
npm i -D xfm-plugin-sitemap xfm-plugin-rss xfm-plugin-search
```

装完**重启** `xfm dev` —— 插件在启动时解析，热更新不会重新扫描 `node_modules`。

解析顺序上，站点本地文件优先于 `node_modules`；`node_modules` 里先找站点自己的，再找 CLI 安装位置（全局安装时插件常常跟 CLI 装在同一个前缀下）。

声明了却没装，会直接报错并给出对应的 `npm i` 命令 —— 不会静默跳过。0.4.2 之前的 `'xfm:rss'` 写法已经被移除，遇到时会提示改成独立包。

## 钩子

| 钩子 | 参数 | 返回值处理 | 时机 |
| --- | --- | --- | --- |
| `extendContext(ctx)` | 站点上下文 | 替换上下文 | 页面收集后，渲染前 |
| `markdown(raw, page)` | 当前 Markdown 源、页对象 | 替换源码 | 单页解析时 |
| `transformHtml(html, ctx)` | 当前 HTML、上下文 | 替换 HTML | 单页渲染后、写盘前 |
| `afterCollect(site)` | 站点实例 | 忽略 | 全部页面（含聚合/分页）就位后 |
| `afterBuild(site)` | 站点实例 | 返回的 `[{ path, contents }]` 被汇总写出 | 全部页面渲染完毕 |
| `configureServer(server)` | 开发服务器 | 忽略 | `xfm dev` 启动时 |
| `finish(site)` | 站点实例 | 忽略 | 构建/开发结束 |

同一个钩子有多个插件注册时，按加载顺序**串行**执行，前一个的返回值作为后一个的输入。支持 `async`，返回 Promise 会等待。

## 钩子与并行的关系

这里有一条隐含的取舍，值得单独说：**注册了 `markdown` 钩子的站点不启用 worker 池**。

原因是 `markdown` 钩子跑在单页解析阶段，而 worker 只做「Markdown → HTML → 模板」这一段；把带钩子的渲染塞进子线程，钩子就得在主线程与线程之间来回序列化，比省下的时间更贵。所以引擎检测到 `markdown` 钩子时直接退回主线程串行渲染。

`transformHtml` 不受这个限制：worker 先渲染出 HTML，主线程再统一补跑一遍这个钩子。这也是 SEO 注入、HTML 压缩这类「改产物」的插件能在并行构建里正常工作的原因。

`afterCollect` 放在 worker 之前，是为了让相关文章这类跨页计算仍然只算一次 —— 如果放到单页钩子里，1000 页就要算 1000 次全站相似度。

## 官方插件

十五个包，全部零依赖，各自独立发布、独立有 README。

**站点产物** —— 给爬虫和客户端读的文件：

| 包名 | 产物 | 主要配置 |
| --- | --- | --- |
| `xfm-plugin-sitemap` | `sitemap.xml`、`robots.txt` | 无；配了 `site.url` 才输出绝对 `<loc>` |
| `xfm-plugin-rss` | `feed.xml`（RSS 2.0，正文全文） | `site.rss.limit` |
| `xfm-plugin-feed-json` | `feed.json`（JSON Feed 1.1） | `feedJson.path`、`feedJson.limit` |
| `xfm-plugin-llms` | `llms.txt`、`llms-full.txt` | `llms.full`、`llms.maxItems` |
| `xfm-plugin-search` | `search.json` + Ctrl / ⌘ + K 面板 | `search.path`、`search.maxChars` |
| `xfm-plugin-pwa` | `manifest.webmanifest`、`sw.js`、`offline.html`、`icon.svg` | `pwa.themeColor`、`pwa.icons` |
| `xfm-plugin-redirect` | 每个旧地址一个跳转页 | `redirects`、front-matter `redirect_from` |
| `xfm-plugin-reading-stats` | `stats.json`、`site.stats` | — |

**页面增强** —— 往已生成的页面里补东西：

| 包名 | 作用 | 主要配置 |
| --- | --- | --- |
| `xfm-plugin-seo` | canonical、Open Graph、Twitter Card、JSON-LD | `seo.image`、`seo.twitter`、`seo.jsonLd` |
| `xfm-plugin-related` | 相关文章 → `page.data.related` | `related.limit`、`related.minScore` |
| `xfm-plugin-minify` | 更小的 HTML（仅生产构建） | `minify.enabled`、`minify.aggressive` |
| `xfm-plugin-image-size` | 读文件头给 `<img>` 补 `width` / `height` | `imageSize.publicDir`、`imageSize.lazy` |
| `xfm-plugin-deadlinks` | 列出指向空处的站内链接 | `deadlinks.strict`、`deadlinks.ignore` |
| `xfm-plugin-giscus` | GitHub Discussions 评论（giscus / utterances） | `comments.repo`、`comments.repoId` |
| `xfm-plugin-analytics` | Umami / Plausible / GA / 百度 / 自定义 | `analytics.provider` |

几个值得注意的行为：

- `related` 按标签（3 分）/ 分类（2 分）/ 系列（3 分）加权，低于 `minScore` 的不进推荐，结果写进 `page.data.related`；两套主题只要发现这个键就渲染推荐区块。
- `seo` 不重复注入模板里已手写的 canonical 与 `og:*`。
- `minify` 跳过 `<pre>`、`<code>`、`<textarea>`、`<script>`、`<style>`，dev 模式完全不执行。
- `image-size` 只读本地图片头部最多 64 KB，不发网络请求、不解码图像，让浏览器提前留位（改善 CLS）。
- `deadlinks` 拿所有站内 `href` / `src` 去对真实产物，外链一律不发请求；`strict: true` 时把问题升级成构建失败，适合 CI。
- `giscus` 与 `analytics` 会加载第三方脚本，因此默认只在生产构建生效，本地预览要把 `dev: true` 打开。
- `redirect` 写的是 `meta refresh` + `location.replace` + 可见链接三件套，并带 `noindex,follow` 与原地址 canonical。

## 页面级开关

插件都能被 front-matter 单独关掉，粒度到页：

| front-matter | 作用 |
| --- | --- |
| `sitemap: false` | 不进 `sitemap.xml` |
| `rss: false` | 不进 `feed.xml` 与 `feed.json` |
| `search: false` | 不进搜索索引 |
| `llms: false` | 不进 `llms.txt` |
| `related: false` / `related: [url, ...]` | 关闭推荐 / 手动指定推荐列表 |
| `seo: false`、`noindex: true`、`image`、`canonical` | SEO 插件行为 |
| `pwa: false` | 该页不注入 manifest 链接 |
| `comments: false` | 该页不显示评论区 |
| `analytics: false` | 该页不计入统计 |
| `imageSize: false` | 该页 `<img>` 不加宽高 |

主题只判断 `site.search` 与 `page.data.related` 是否存在，所以卸掉这两个插件只会少一块功能，不会让构建失败。

## 写一个插件

插件就是导出 `(site) => ({ name, ...hooks })` 的模块。放进站点的 `plugins/` 目录即自动加载：

```js
// plugins/reading-index.js
module.exports = (site) => {
  const { plainText, absoluteUrl } = site.helpers;
  return {
    name: 'reading-index',
    afterBuild(site) {
      const index = site.documents.map((d) => ({
        title: d.title,
        url: absoluteUrl(site.config.site, d.url),
        text: plainText(d.html).slice(0, 800),
      }));
      return [{ path: 'index.json', contents: JSON.stringify(index) }];
    },
  };
};
```

`site.helpers` 是给插件用的工具集，避免去 require 内核内部文件：

| 工具 | 作用 |
| --- | --- |
| `plainText(html)` | 去标签、折叠空白，得到纯文本 |
| `absoluteUrl(siteConfig, url)` | 拼出带 `site.url` 与 `site.base` 的绝对地址 |
| `withBase(base, url)` | 只补子路径前缀 |
| `normalizeBase(base)` | 规范化子路径（前后补斜杠、去重复斜杠） |

`afterBuild` 拿到的 `site.documents[].html` 是**正文 HTML**，不含布局 —— 想做全文索引或内容分析，用这个比解析整页更省事。

发布到 npm 时按 `xfm-plugin-<name>` 命名，站点装上就会被自动发现，不需要用户改配置。

## 兼容性约定

插件与主题之间没有强耦合，只通过两个约定交接：

1. **`site.search`**：`search` 插件把索引地址写进站点上下文，主题据此决定要不要渲染搜索按钮、`data-index` 指向哪里。没有这个键，主题不渲染搜索入口。
2. **`page.data.related`**：`related` 插件写入推荐列表，主题发现就渲染。

因此「装了插件却看不到效果」通常有两种原因：主题没实现对应区块（例如 `docs` 主题不渲染评论区），或者插件产物路径没被主题引用。前者改主题，后者看插件 README。
