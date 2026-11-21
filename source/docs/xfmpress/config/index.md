---
mode: docs

title: 配置
date: 2026-11-10 21:45:00
updated: 2026-11-21 20:30:00
description: xfmpress 配置参考：配置文件的查找顺序与优先级，site、content、theme、pagination、indexes 以及各插件配置字段的默认值与含义。
keywords: [xfmpress, 配置, xfm.config.mjs, 站点配置, pagination, indexes, workers, server]
order: 24
---

# 配置

**中文** · [English version](/en/docs/xfmpress/config/)

配置就是一个普通 JavaScript 对象，导出即生效。**所有字段都有默认值**，所以最小可用的配置是空对象 —— 一个空的 `xfm.config.mjs` 也能构建出一个站点。

## 配置文件查找

按顺序找，命中第一个就停：

| 顺序 | 文件名 | 说明 |
| --- | --- | --- |
| 1 | `xfm.config.mjs` | 推荐，ESM，支持 `process.env` |
| 2 | `xfm.config.js` | 视 `package.json` 的 `type` 决定模块格式 |
| 3 | `xfm.config.cjs` | 强制 CommonJS |
| 4 | `xfm.config.json` | 纯数据，不能写表达式 |
| 5 | `config.js` | 早期版本的名字，兼容保留 |
| 6 | `package.json` 的 `xfm` 字段 | 没有独立配置文件时使用 |

`xfm info` 会直接告诉你最终读的是哪个文件。

这六种形式不只影响加载：`xfm create` 判断「目录已是站点」、`xfm dev` 决定监听哪些文件，用的都是同一套判定（`hasConfig()`）。因此用 `.js` / `.cjs` / `.json` 配置的站点不会被当成空目录覆盖，改 `xfm.config.cjs` 也能触发热重载 —— 这两点都是 v0.4.9 补上的。

## 合并规则

用户配置与默认值做**深合并**，你只写关心的那几项：

- 对象逐键递归合并；
- **数组是整体替换**，不是拼接 —— 写 `nav` 就得写全量；
- 值为 `undefined` 的键会被忽略，不会覆盖默认值。

`site.base` 会被规范化：始终以 `/` 开头、以 `/` 结尾、无重复斜杠。写 `'blog'` 也会被纠正成 `'/blog/'`。

## site

```js
export default {
  site: {
    title: 'XFM Notes',
    description: '关于静态站点与前端的笔记',
    url: 'https://example.com',
    lang: 'zh-CN',
    author: 'XFM',
    base: '/',
    assets: '/assets/',
    nav: [
      { title: '首页', url: '/' },
      { title: '归档', url: '/archives/' },
    ],
  },
};
```

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `title` | `'My XFM Site'` | 站点名，出现在 `<title>`、页脚、品牌位 |
| `description` | `''` | 站点描述，首页与列表页的 `description` 兜底 |
| `url` | 无 | 站点根地址，**sitemap / RSS 输出绝对链接时必须配** |
| `lang` | `'zh-CN'` | `<html lang>` |
| `author` | `''` | 作者名，供插件与主题使用 |
| `base` | `'/'` | 部署子路径，如 GitHub Pages 项目页 `'/xfm/'` |
| `assets` | `'/assets/'` | 主题资源在站点里的访问前缀 |
| `nav` | `[]` | 导航项数组，每项 `{ title, url }`；多语站可加 `translations` 按语言取标签 |
| `languages` | 无 | 多语言站声明启用语言列表，如 `['zh-CN', 'en']`；不声明即单语站 |

`site` 下没有列出的键也会原样进入模板上下文 —— 例如 `site.copyright` 可以直接在模板里用。

## 目录与主题

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `contentDir` | `'content'` | Markdown 源目录 |
| `outDir` | `'dist'` | 产物目录 |
| `publicDir` | `'public'` | 原样拷贝到产物根目录的静态文件目录 |
| `theme` | `'themes/default'` | 主题名（`default` / `docs`）或路径 |
| `plugins` | `[]` | 显式声明插件：短名解析成 `xfm-plugin-<name>`，路径指向本地文件 |
| `defaults.layout` | `'page.html'` | 没有 `layout` 字段时的兜底布局 |

`theme` 的取值有三种写法：内置名 `'default'` / `'docs'`、相对路径 `'themes/my-theme'`、绝对路径。相对路径基于站点根目录解析。

## 构建行为

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `buildDrafts` | `false` | 生产构建是否包含 `draft: true` 的文章 |
| `workerThreshold` | `40` | 页面数达到该值才启用 worker 池 |
| `workers` | `0` | 并发数，`0` 表示自动 |
| `markdown.highlight` | `true` | 代码块语法高亮 |

`workerThreshold` 存在的原因很实在：worker 的启动与上下文克隆要 30–60 ms 一个，小站点起线程反而更慢。40 页是实测的平衡点附近，很小的文档站会一直走主线程，这是预期行为。

`workers: 0` 表示自动标定，规则是「核数上限 4，且每个 worker 至少承担 300 KB 源码」—— 两者取小。想压测自己做决定就显式填数字（上限 32）。

## 列表分页

```js
pagination: { enabled: true, perPage: 9, url: '/page/' },
```

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `enabled` | `true` | 关掉则首页无限长 |
| `perPage` | `9` | 每页条数 |
| `url` | `'/page/'` | 第 2 页起的路径前缀，生成 `/page/2/`、`/page/3/` |

分页是**真实静态页**，不是 JS 分页 —— 每一页都有自己的 HTML、canonical 与标题，对 SEO 友好。模板里统一遍历 `pagination.posts`，不需要判断自己是第几页。

## 全局数据文件

```js
dataDir: 'data', // 默认值
```

`data/` 下的 `.json` / `.yaml` / `.yml` / `.js` / `.mjs` 会在每次构建时加载，合并为模板与插件可用的 `site.data`：

```text
data/authors.json      → site.data.authors
data/team/members.yml  → site.data.team.members   # 子目录即子对象
```

三条规则值得记住：

- **只留纯数据**：加载后统一做一次 JSON 序列化再读回 —— 函数、循环引用会被丢弃，这是把值安全传给 worker 的前提；
- **`.js` / `.mjs` 用 `import()` 加载**，取模块的 `default` 导出（没有 default 就取模块本身），路径带时间戳参数所以每次构建都会重新执行；
- **改任何数据文件，全部页面的缓存失效** —— 模板可能在任何页面引用 `site.data`，无法精确判断哪些页受影响，索性全量重渲染。

加载失败（JSON 语法错等）的单个文件会被跳过，不中断构建。

## 自定义集合

```js
collections: {
  projects: { dir: 'projects', perPage: 9, layout: 'collection.html' },
},
```

把 `content/<dir>/` 下的内容归成一个独立分区，与默认文章流互不干扰：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `dir` | 集合名 | 相对 `contentDir` 的子目录 |
| `url` | `/<集合名>/` | 列表页地址，生成真实的静态分页 `/<集合名>/page/2/` |
| `layout` | `collection.html` | 列表页布局，两套内置主题都提供 |
| `perPage` | 继承 `pagination.perPage` | 每页条数，`0` 表示不分页 |
| `title` / `description` | 集合名 | 列表页的标题与描述 |
| `posts` | `false` | `true` 时条目同时进入默认文章流 `site.posts` |

集合条目**不进**默认文章流、RSS / JSON Feed 与 prev / next 链条（feed 插件靠 `data.rss: false` 过滤，front-matter 显式写了 `rss` 的尊重用户选择）。模板里通过 `site.collections.<name>` 拿 `{ name, url, count, items }`。`content/<dir>/index.md` 留给用户手写列表页 —— 与生成页 URL 撞车时用户页优先。排序与首页一致：`weight` → 日期倒序 → URL。

## 多语言

```js
site: { lang: 'zh-CN', languages: ['zh-CN', 'en'] },
```

- **不声明 `languages`**（或只写一项）：单语站，`<html lang>` 用 `site.lang`，翻译相关的处理整段跳过，零开销；
- **声明多项后**：页面 front-matter 的 `lang` 驱动该页的 `<html lang>` 与 SEO 插件的 `og:locale`；相同 `translationKey` 的页面互为翻译 —— 模板里 `page.translations` 是 `[{ lang, url, title }]`，`xfm-plugin-seo` 自动注入 `hreflang` 与 `x-default`（取默认语言版本）、`og:locale:alternate`。

导航项可以带 `translations`，按当前页语言解析标签与链接：

```js
nav: [
  { title: '关于', url: '/about/', translations: { en: { title: 'About', url: '/en/about/' } } },
],
```

两套内置主题都带 `lang-switcher.html` 片段，供语言切换器挂进布局。

## 索引页

```js
indexes: {
  categories: { enabled: true, url: '/categories/' },
  archives: { enabled: true, url: '/archives/' },
},
```

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `categories.enabled` | `true` | 是否生成分类索引页 |
| `categories.url` | `'/categories/'` | 分类索引页地址 |
| `archives.enabled` | `true` | 是否生成按年归档页 |
| `archives.url` | `'/archives/'` | 归档页地址 |

这两类页面的前提是**主题提供了对应布局**（`categories.html` / `archives.html`）。自定义主题没写布局时，即使 `enabled: true` 也不会生成，也不会报错 —— 缺什么就少一类页面。

## 开发服务器

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `server.port` | `4173` | 端口，`--port` 可临时覆盖 |
| `server.host` | `'127.0.0.1'` | 监听地址，改成 `0.0.0.0` 可供同网段访问 |
| `server.open` | `false` | 启动后自动打开浏览器 |

## 插件配置节

这些字段只有装了对应插件才生效，没装就是无害的死配置：

```js
export default {
  search:   { path: 'search.json', maxChars: 1500 },
  seo:      { image: '/og.png', twitter: '@handle', jsonLd: true },
  related:  { limit: 3, minScore: 2 },
  minify:   { enabled: true, aggressive: false },
  llms:     { path: 'llms.txt', full: true, fullPath: 'llms-full.txt', maxItems: 0 },
  feedJson: { path: 'feed.json', limit: 20 },
};
```

| 配置节 | 字段 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `search` | `path` | `'search.json'` | 搜索索引产物路径 |
| `search` | `maxChars` | `1500` | 每篇进索引的正文上限 |
| `seo` | `image` | `''` | 默认分享图，根绝对路径或完整 URL |
| `seo` | `twitter` | `''` | Twitter 站点账号，形如 `@handle` |
| `seo` | `jsonLd` | `true` | 是否输出 JSON-LD 结构化数据 |
| `related` | `limit` | `3` | 推荐条数 |
| `related` | `minScore` | `2` | 最低相关度，低于此值不推荐 |
| `minify` | `enabled` | `true` | 总开关，dev 模式始终不执行 |
| `minify` | `aggressive` | `false` | 折叠标签间换行，可能影响行内元素间距 |
| `llms` | `full` | `true` | 是否额外产出 `llms-full.txt` |
| `llms` | `maxItems` | `0` | 收录条数上限，`0` 表示不限 |
| `feedJson` | `limit` | `20` | JSON Feed 条数 |

## 环境变量与多环境

配置文件是 ESM 模块，可以读环境变量，这是 CI 里最省事的做法：

```js
export default {
  site: {
    title: 'XFM Notes',
    base: process.env.SITE_BASE || '/',
    url: process.env.SITE_URL || '',
  },
};
```

本地构建不设变量 → 根路径、相对链接；GitHub Actions 里注入 `SITE_BASE=/repo/` 与 `SITE_URL=https://user.github.io/repo` → 产物自带正确前缀与绝对地址。同一份配置覆盖两种环境，不必维护两份。

## 完整示例

```js
export default {
  site: {
    title: 'XFM Notes',
    description: '关于静态站点、性能与前端的笔记。',
    lang: 'zh-CN',
    author: 'XFM',
    base: process.env.SITE_BASE || '/',
    url: process.env.SITE_URL || '',
    nav: [
      { title: '首页', url: '/' },
      { title: '分类', url: '/categories/' },
      { title: '归档', url: '/archives/' },
      { title: '关于', url: '/about/' },
    ],
  },
  theme: 'themes/default',
  plugins: ['sitemap', 'rss', 'search', 'seo', 'related', 'llms', 'minify'],
  defaults: { layout: 'post.html' },
  pagination: { perPage: 9 },
  server: { port: 4173 },
};
```

改完配置不需要重启命令：`xfm dev` 会监听配置文件本身，保存后自动重新加载并重建。
