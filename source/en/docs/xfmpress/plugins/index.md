---
mode: docs

title: Plugins
date: 2026-11-10 22:54:00
updated: 2026-11-10 22:54:00
description: The xfmpress plugin system — what each of the six hooks does and when it runs, auto-discovery and resolution order, all fifteen official plugins, per-page front-matter switches, and how to write your own.
keywords: [xfmpress, plugins, hooks, extendContext, transformHtml, afterCollect, afterBuild, xfm-plugin]
order: 108
---

# Plugins

[Chinese version](/docs/xfmpress/plugins/) · **English**

**The core ships no plugins.** `npm i -g xfmpress` installs the generator and the two themes; everything else is opt-in — the same idea as Hexo: what you install into the site is what you get.

## Loading rules

Four sources, merged in order:

| Source | How | Notes |
| --- | --- | --- |
| Auto-discovery | Any `xfm-plugin-*` in the site's `package.json` `dependencies` / `devDependencies` | Install and it loads, no config change |
| Short name | `plugins: ['rss']` | Resolves to `xfm-plugin-rss`; also pins load order |
| Path | `plugins: ['./plugins/my.js']` | A plugin local to the site |
| Inline | `plugins: [{ name, ...hooks }]` | An object written straight into the config |

```bash
npm i -D xfm-plugin-sitemap xfm-plugin-rss xfm-plugin-search
```

**Restart** `xfm dev` after installing — plugins are resolved at startup; hot reload does not rescan `node_modules`.

Site-local files win over `node_modules`, and inside `node_modules` the site's own copy is preferred over the CLI's install location (with a global install, plugins usually sit in the same prefix as the CLI).

Declaring a plugin that is not installed is a hard error with the exact `npm i` command — never a silent skip. The pre-0.4.2 `'xfm:rss'` form is gone; encountering it produces a message pointing at the standalone package.

## Hooks

| Hook | Arguments | Return value | When |
| --- | --- | --- | --- |
| `extendContext(ctx)` | Site context | Replaces the context | After pages are collected, before rendering |
| `markdown(raw, page)` | Current Markdown source, page object | Replaces the source | While a single page is parsed |
| `transformHtml(html, ctx)` | Current HTML, context | Replaces the HTML | After a page renders, before it is written |
| `afterCollect(site)` | Site instance | Ignored | Once every page (including taxonomy and pagination) exists |
| `afterBuild(site)` | Site instance | Returned `[{ path, contents }]` are written out | When all pages have rendered |
| `configureServer(server)` | Dev server | Ignored | When `xfm dev` starts |
| `finish(site)` | Site instance | Ignored | When a build or dev session ends |

When several plugins register the same hook they run **serially** in load order, each receiving the previous return value. `async` is supported — a returned promise is awaited.

## Hooks and parallelism

There is one implicit trade-off worth calling out: **a site that registers a `markdown` hook does not use the worker pool.**

The reason is that `markdown` runs during single-page parsing, while workers only cover "Markdown → HTML → template". Pushing hook-bearing rendering into a thread means serialising the hook back and forth, which costs more than the parallelism saves. So the engine falls back to serial rendering on the main thread.

`transformHtml` is not affected: workers render the HTML first, then the main thread runs the hook once per page. That is why "modify the output" plugins — SEO injection, HTML minification — still work in parallel builds.

`afterCollect` runs before the workers so that cross-page work such as related posts is computed once — inside a per-page hook, 1000 pages would mean 1000 full-site similarity passes.

## Official plugins

Fifteen packages, all zero-dependency, each published and documented separately.

**Site output** — files for crawlers and clients:

| Package | Emits | Main config |
| --- | --- | --- |
| `xfm-plugin-sitemap` | `sitemap.xml`, `robots.txt` | None; absolute `<loc>` needs `site.url` |
| `xfm-plugin-rss` | `feed.xml` (RSS 2.0, full text) | `site.rss.limit` |
| `xfm-plugin-feed-json` | `feed.json` (JSON Feed 1.1) | `feedJson.path`, `feedJson.limit` |
| `xfm-plugin-llms` | `llms.txt`, `llms-full.txt` | `llms.full`, `llms.maxItems` |
| `xfm-plugin-search` | `search.json` plus the Ctrl / ⌘ + K panel | `search.path`, `search.maxChars` |
| `xfm-plugin-pwa` | `manifest.webmanifest`, `sw.js`, `offline.html`, `icon.svg` | `pwa.themeColor`, `pwa.icons` |
| `xfm-plugin-redirect` | One redirect page per old address | `redirects`, front-matter `redirect_from` |
| `xfm-plugin-reading-stats` | `stats.json`, `site.stats` | — |

**Page enhancements** — added into pages that already exist:

| Package | Effect | Main config |
| --- | --- | --- |
| `xfm-plugin-seo` | canonical, Open Graph, Twitter Card, JSON-LD | `seo.image`, `seo.twitter`, `seo.jsonLd` |
| `xfm-plugin-related` | Related posts → `page.data.related` | `related.limit`, `related.minScore` |
| `xfm-plugin-minify` | Smaller HTML (production only) | `minify.enabled`, `minify.aggressive` |
| `xfm-plugin-image-size` | Reads image headers to add `width` / `height` | `imageSize.publicDir`, `imageSize.lazy` |
| `xfm-plugin-deadlinks` | Lists internal links that point nowhere | `deadlinks.strict`, `deadlinks.ignore` |
| `xfm-plugin-giscus` | GitHub Discussions comments (giscus / utterances) | `comments.repo`, `comments.repoId` |
| `xfm-plugin-analytics` | Umami / Plausible / GA / Baidu / custom snippet | `analytics.provider` |

Behaviour worth knowing:

- `related` scores by shared tags (3), category (2) and series (3); anything below `minScore` is dropped. Results land in `page.data.related`, and both themes render a block when the key exists.
- `seo` does not duplicate a canonical or `og:*` tag you already wrote in the template.
- `minify` skips `<pre>`, `<code>`, `<textarea>`, `<script>` and `<style>`, and never runs in dev.
- `image-size` reads at most 64 KB of a local image header — no network, no decoding — so the browser can reserve space (CLS).
- `deadlinks` checks every internal `href` / `src` against the real output and never fetches external URLs; `strict: true` turns findings into a build failure, which suits CI.
- `giscus` and `analytics` load third-party scripts, so they only run in production builds by default; set `dev: true` to preview locally.
- `redirect` writes the `meta refresh` + `location.replace` + visible-link trio, with `noindex,follow` and a canonical pointing at the new URL.

## Per-page switches

Every plugin can be disabled from front-matter, page by page:

| front-matter | Effect |
| --- | --- |
| `sitemap: false` | Keep this page out of `sitemap.xml` |
| `rss: false` | Out of `feed.xml` and `feed.json` |
| `search: false` | Out of the search index |
| `llms: false` | Out of `llms.txt` |
| `related: false` / `related: [url, ...]` | Disable recommendations / provide an explicit list |
| `seo: false`, `noindex: true`, `image`, `canonical` | SEO plugin behaviour |
| `pwa: false` | Do not link the manifest on this page |
| `comments: false` | Hide the comment area |
| `analytics: false` | Do not count this page |
| `imageSize: false` | Do not add dimensions to `<img>` here |

Themes only check whether `site.search` and `page.data.related` exist, so removing those two plugins costs you a feature, never a build.

## Writing a plugin

A plugin is a module exporting `(site) => ({ name, ...hooks })`. Drop it in the site's `plugins/` directory and it loads:

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

`site.helpers` exists so plugins never reach into core internals:

| Helper | Effect |
| --- | --- |
| `plainText(html)` | Strip tags and collapse whitespace |
| `absoluteUrl(siteConfig, url)` | Absolute URL including `site.url` and `site.base` |
| `withBase(base, url)` | Prefix the sub-path only |
| `normalizeBase(base)` | Normalise a sub-path (slashes around it, no doubles) |

`site.documents[].html` in `afterBuild` is the **body HTML**, without the layout — the cheaper input for a full-text index or content analysis.

Publish to npm as `xfm-plugin-<name>` and any site that installs it picks it up with no config change.

## Compatibility contract

Plugins and themes are loosely coupled, meeting at exactly two points:

1. **`site.search`** — the `search` plugin puts the index URL into the site context; the theme decides whether to render a search button and where `data-index` points. Without the key, no search entry appears.
2. **`page.data.related`** — the `related` plugin writes the list; themes render it when present.

So "I installed a plugin and see nothing" usually means one of two things: the theme has no block for it (the `docs` theme does not render comments, for instance), or the theme does not reference the plugin's output path. Fix the theme for the first, read the plugin README for the second.
