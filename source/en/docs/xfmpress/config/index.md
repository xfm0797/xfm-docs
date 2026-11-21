---
mode: docs

title: Configuration
date: 2026-11-10 22:46:00
updated: 2026-11-21 20:30:00
description: xfmpress configuration reference — the lookup order for config files, deep-merge rules, and the defaults for site, directories, theme, build behaviour, pagination, indexes, dev server and plugin sections.
keywords: [xfmpress, configuration, xfm.config.mjs, site config, pagination, indexes, workers, server]
order: 104
---

# Configuration

[Chinese version](/docs/xfmpress/config/) · **English**

The config is a plain JavaScript object — export it and it applies. **Every field has a default**, so the smallest working config is an empty object: an empty `xfm.config.mjs` still builds a site.

## Which file is read

Tried in order; the first hit wins:

| # | File | Notes |
| --- | --- | --- |
| 1 | `xfm.config.mjs` | Recommended, ESM, `process.env` works |
| 2 | `xfm.config.js` | Module format follows `package.json` `type` |
| 3 | `xfm.config.cjs` | Forces CommonJS |
| 4 | `xfm.config.json` | Pure data, no expressions |
| 5 | `config.js` | The early name, kept for compatibility |
| 6 | `xfm` field in `package.json` | Used when there is no standalone file |

`xfm info` tells you which one was read.

These six forms matter beyond loading: `xfm create` deciding "this directory is already a site" and `xfm dev` deciding which files to watch both use the same check (`hasConfig()`). A site configured through `.js` / `.cjs` / `.json` is therefore never overwritten as an empty directory, and editing `xfm.config.cjs` triggers a hot reload — both fixed in v0.4.9.

## Merge rules

Your config is **deep-merged** with the defaults, so you only write what you care about:

- Objects merge key by key;
- **Arrays are replaced wholesale**, not concatenated — once you write `nav`, write all of it;
- Keys whose value is `undefined` are ignored and do not override a default.

`site.base` is normalised: leading `/`, trailing `/`, no doubled slashes. Writing `'blog'` is corrected to `'/blog/'`.

## site

```js
export default {
  site: {
    title: 'XFM Notes',
    description: 'Notes on static sites and the front end',
    url: 'https://example.com',
    lang: 'en',
    author: 'XFM',
    base: '/',
    assets: '/assets/',
    nav: [
      { title: 'Home', url: '/' },
      { title: 'Archive', url: '/archives/' },
    ],
  },
};
```

| Field | Default | Meaning |
| --- | --- | --- |
| `title` | `'My XFM Site'` | Site name in `<title>`, footer, brand slot |
| `description` | `''` | Site description; fallback for list pages |
| `url` | none | Site root, **required for absolute sitemap / feed links** |
| `lang` | `'zh-CN'` | `<html lang>` |
| `author` | `''` | Author name, used by themes and plugins |
| `base` | `'/'` | Sub-path deployment, e.g. `'/xfm/'` on a Pages project site |
| `assets` | `'/assets/'` | URL prefix for theme assets |
| `nav` | `[]` | Nav items, each `{ title, url }`; multi-language sites may add `translations` for per-language labels |
| `languages` | none | For multi-language sites, the enabled language list, e.g. `['zh-CN', 'en']`; omit it and the site is single-language |

Keys you add under `site` reach the template context untouched — `site.copyright` is available in templates as-is.

## Directories and theme

| Field | Default | Meaning |
| --- | --- | --- |
| `contentDir` | `'content'` | Markdown source directory |
| `outDir` | `'dist'` | Output directory |
| `publicDir` | `'public'` | Files copied verbatim to the output root |
| `theme` | `'themes/default'` | Theme name (`default` / `docs`) or path |
| `plugins` | `[]` | Explicit plugins: short names resolve to `xfm-plugin-<name>`, paths point at local files |
| `defaults.layout` | `'page.html'` | Layout used when a page has no `layout` |

`theme` accepts three forms: a built-in name (`'default'`, `'docs'`), a relative path (`'themes/my-theme'`), or an absolute path. Relative paths resolve against the site root.

## Build behaviour

| Field | Default | Meaning |
| --- | --- | --- |
| `buildDrafts` | `false` | Include `draft: true` pages in production builds |
| `workerThreshold` | `40` | Page count at which the worker pool is enabled |
| `workers` | `0` | Concurrency; `0` means automatic |
| `markdown.highlight` | `true` | Syntax highlighting in code blocks |

`workerThreshold` exists for a practical reason: starting a worker and cloning the context costs 30–60 ms each, so on a small site threads are slower. 40 pages is where the crossover sits; a small docs site stays on the main thread, and that is expected.

`workers: 0` auto-calibrates: "at most 4 cores, and at least 300 KB of source per worker", whichever is smaller. Pass a number to decide yourself (capped at 32).

## Pagination

```js
pagination: { enabled: true, perPage: 9, url: '/page/' },
```

| Field | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Turn off and the home page lists everything |
| `perPage` | `9` | Items per page |
| `url` | `'/page/'` | Prefix for page 2 onward, producing `/page/2/`, `/page/3/` |

Pagination produces **real static pages**, not client-side paging — each has its own HTML, canonical and title, which is what search engines want. Templates simply loop over `pagination.posts` without knowing which page they are on.

## Global data files

```js
dataDir: 'data', // default
```

`.json` / `.yaml` / `.yml` / `.js` / `.mjs` files under `data/` load on every build and merge into `site.data`, visible to templates and plugins:

```text
data/authors.json      → site.data.authors
data/team/members.yml  → site.data.team.members   # subdirectory = nested object
```

Three rules worth remembering:

- **Plain data only**: every value goes through one JSON serialise/parse round-trip — functions and cycles are dropped, which is what makes the payload safe for workers;
- **`.js` / `.mjs` load via `import()`** and use the module's `default` export (or the module itself when there is none); the path carries a timestamp so the file re-executes on every build;
- **Changing any data file invalidates every page's cache** — a template may reference `site.data` on any page, so there is no way to narrow the blast radius.

A single file that fails to load (bad JSON, for example) is skipped; the build continues.

## Custom collections

```js
collections: {
  projects: { dir: 'projects', perPage: 9, layout: 'collection.html' },
},
```

Groups everything under `content/<dir>/` into an independent section, separate from the default post stream:

| Field | Default | Meaning |
| --- | --- | --- |
| `dir` | the collection name | Subdirectory relative to `contentDir` |
| `url` | `/<name>/` | List-page address, producing real static pagination at `/<name>/page/2/` |
| `layout` | `collection.html` | List-page layout; both built-in themes provide one |
| `perPage` | inherits `pagination.perPage` | Items per page; `0` disables pagination |
| `title` / `description` | the collection name | List-page title and description |
| `posts` | `false` | `true` also puts the items into the default post stream `site.posts` |

Collection items stay out of the default post stream, RSS / JSON Feed and the prev / next chain (the feed plugins filter on `data.rss: false`, which respects an explicit `rss` in front-matter). Templates read `site.collections.<name>` as `{ name, url, count, items }`. `content/<dir>/index.md` is left for a hand-written list page — if it collides with the generated page, the user's page wins. Ordering matches the home stream: `weight` → date descending → URL.

## Multi-language

```js
site: { lang: 'zh-CN', languages: ['zh-CN', 'en'] },
```

- **Without `languages`** (or with a single entry): a single-language site — `<html lang>` uses `site.lang` and every translation-related step is skipped, at zero cost;
- **With several entries**: a page's `lang` front-matter drives its `<html lang>` and the SEO plugin's `og:locale`; pages sharing a `translationKey` become each other's translations — `page.translations` is `[{ lang, url, title }]`, and `xfm-plugin-seo` injects `hreflang` plus `x-default` (taken from the default-language version) and `og:locale:alternate`.

Nav items can carry `translations`, resolved against the current page's language:

```js
nav: [
  { title: '关于', url: '/about/', translations: { en: { title: 'About', url: '/en/about/' } } },
],
```

Both built-in themes ship a `lang-switcher.html` partial for hooking a language switcher into a layout.

## Index pages

```js
indexes: {
  categories: { enabled: true, url: '/categories/' },
  archives: { enabled: true, url: '/archives/' },
},
```

| Field | Default | Meaning |
| --- | --- | --- |
| `categories.enabled` | `true` | Generate the category index |
| `categories.url` | `'/categories/'` | Its URL |
| `archives.enabled` | `true` | Generate the yearly archive |
| `archives.url` | `'/archives/'` | Its URL |

Both require the **theme to provide the layout** (`categories.html` / `archives.html`). A custom theme without those layouts simply does not generate the pages — no error, just one fewer kind of page.

## Dev server

| Field | Default | Meaning |
| --- | --- | --- |
| `server.port` | `4173` | Port; `--port` overrides per run |
| `server.host` | `'127.0.0.1'` | Bind address; `0.0.0.0` exposes it on the LAN |
| `server.open` | `false` | Open a browser after start |

## Plugin sections

These only take effect when the matching plugin is installed; otherwise they are harmless dead config:

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

| Section | Field | Default | Effect |
| --- | --- | --- | --- |
| `search` | `path` | `'search.json'` | Where the search index is written |
| `search` | `maxChars` | `1500` | Body characters per entry |
| `seo` | `image` | `''` | Default share image, root-absolute or full URL |
| `seo` | `twitter` | `''` | Twitter handle, e.g. `@handle` |
| `seo` | `jsonLd` | `true` | Emit JSON-LD |
| `related` | `limit` | `3` | How many recommendations |
| `related` | `minScore` | `2` | Minimum score; below it nothing is recommended |
| `minify` | `enabled` | `true` | Master switch; never runs in dev |
| `minify` | `aggressive` | `false` | Fold newlines between tags (may affect inline spacing) |
| `llms` | `full` | `true` | Also emit `llms-full.txt` |
| `llms` | `maxItems` | `0` | Entry cap, `0` means unlimited |
| `feedJson` | `limit` | `20` | Items in the JSON feed |

## Environment variables

The config is an ESM module, so it can read the environment — the least fussy approach in CI:

```js
export default {
  site: {
    title: 'XFM Notes',
    base: process.env.SITE_BASE || '/',
    url: process.env.SITE_URL || '',
  },
};
```

Locally you set nothing and get root-relative links; in GitHub Actions you inject `SITE_BASE=/repo/` and `SITE_URL=https://user.github.io/repo` and the output carries the right prefix and absolute URLs. One config, two environments, no second copy to maintain.

## A complete example

```js
export default {
  site: {
    title: 'XFM Notes',
    description: 'Notes on static sites, performance and the front end.',
    lang: 'en',
    author: 'XFM',
    base: process.env.SITE_BASE || '/',
    url: process.env.SITE_URL || '',
    nav: [
      { title: 'Home', url: '/' },
      { title: 'Categories', url: '/categories/' },
      { title: 'Archive', url: '/archives/' },
      { title: 'About', url: '/about/' },
    ],
  },
  theme: 'themes/default',
  plugins: ['sitemap', 'rss', 'search', 'seo', 'related', 'llms', 'minify'],
  defaults: { layout: 'post.html' },
  pagination: { perPage: 9 },
  server: { port: 4173 },
};
```

No restart needed after editing: `xfm dev` watches the config file, reloads it and rebuilds on save.
