---
mode: docs

title: Changelog
date: 2026-11-10 23:00:00
updated: 2026-11-10 23:00:00
description: Every xfmpress release from v0.1.0 to v0.4.8 — the main line of each version, breaking changes, upgrade notes, and the versioning rule that makes it all unusual.
keywords: [xfmpress, changelog, releases, upgrade, v0.4.8, breaking changes]
order: 111
---

# Changelog

[Chinese version](/docs/xfmpress/changelog/) · **English**

xfmpress went from v0.1.0 on 2026-11-02 to v0.4.8 — fourteen releases in a bit over a week. This page tracks the main line of each one, so you can judge whether to upgrade and what to watch for.

## Versioning rule

There is one difference from the usual convention:

```text
0.4.0 → 0.4.1 → … → 0.4.99 → 0.5.0
```

**The patch digit rolls from 0 to 99 before the minor bumps.** Features therefore land inside `0.4.x` releases, and `0.5.0` means "one round of work finished", not "breaking change". Decide from the notes below, not from the number.

## At a glance

| Version | Date | Main line |
| --- | --- | --- |
| 0.4.8 | 11-10 | `xfm new` gains post / page / draft and scaffolds |
| 0.4.7 | 11-10 | The manual goes live; README corrections |
| 0.4.6 | 11-09 | Plugins grow to fifteen; dev server fixes for plugin output |
| 0.4.5 | 11-09 | Scaffold output polish |
| 0.4.4 | 11-09 | `create` stops overwriting `package.json` |
| 0.4.3 | 11-09 | Build output shows plugins and extra files |
| 0.4.2 | 11-09 | **Plugins split into packages** (breaking) |
| 0.4.1 | 11-09 | Five new plugins plus the `afterCollect` hook |
| 0.4.0 | 11-09 | Search, pagination, reading experience |
| 0.3.0 | 11-04 | Taxonomy pages, index pages, theme redesign |
| 0.2.1 | 11-04 | Command aliases and suggestions |
| 0.2.0 | 11-04 | Markdown gaps closed |
| 0.1.1 | 11-03 | Docs and naming fixes |
| 0.1.0 | 11-02 | First release |

## v0.4.8

**`xfm new` becomes a complete content command**, with the shape of `hexo new [layout] <title>`:

| Command | Result |
| --- | --- |
| `xfm new "Title"` / `xfm new post "Title"` | `content/posts/<slug>.md`, a post (unchanged) |
| `xfm new page about` | `content/about.md`, served at `/about/` |
| `xfm new draft "Half an idea"` | `content/posts/<slug>.md` with `draft: true` |
| `xfm new page about --dir=pages` | Elsewhere → `content/pages/about.md` |

The page layout writes both `layout: page.html` and `type: page`: its own URL, eligible for `site.nav`, but out of the post list, feeds, related posts and the search index. Previously those fields had to be written by hand, and forgetting one turned a page into a post.

**`scaffolds/`** — starter content now comes from `scaffolds/<layout>.md` in the site root, with `{% raw %}{{ title }}{% endraw %}` / `{% raw %}{{ date }}{% endraw %}` / `{% raw %}{{ layout }}{% endraw %}` placeholders, mirroring Hexo. `xfm create` writes the three defaults for editing; a site without the directory falls back to the built-ins. Missing `title` / `date` / `layout` / `type: page` / `draft` keys in a custom scaffold are filled in.

Everything else:

- Output names the layout and the resulting URL (`[page] → /about/`), states which scaffold was used, and suggests the right command when the first word looks like a misspelled layout;
- Multi-word titles stay whole: `xfm new My First Post` creates "My First Post" instead of keeping only the first word; a single argument is always a title (`xfm new page` is a post named "page", matching Hexo);
- The starter body no longer repeats an `# H1` that the theme already renders from `page.title`.

## v0.4.7

**The official manual goes live**: [doc.lovou.pw/docs/xfmpress](https://doc.lovou.pw/docs/xfmpress/), ten chapters covering install, CLI, configuration, content, templates, themes, plugins, deployment and architecture. Both READMEs gained a `docs` badge and a documentation table, and the CLI / configuration / plugins / themes / deployment sections now link to the matching chapter.

Also fixed: the README test count was stale (111 → 118), the npm `homepage` and the scaffolded site README point at the manual, and the scaffold README lists all fifteen plugins instead of nine.

No engine changes — documentation and metadata only.

## v0.4.6

Six new plugins, taking the set from nine to fifteen, all still zero-dependency:

| Plugin | Capability |
| --- | --- |
| `analytics` | Umami / Plausible / GA / Baidu / custom snippet; `provider` accepts an array so a migration can run two at once |
| `giscus` | GitHub Discussions comments; the iframe follows the theme toggle via `postMessage` (no white flash in dark mode) |
| `redirect` | One redirect page per old address: `meta refresh` + `location.replace` + a visible link |
| `pwa` | Manifest, service worker (network-first for pages, cache-first for assets), offline page, generated `icon.svg` |
| `deadlinks` | Validates internal links against the real output; `strict: true` turns findings into a failed build |
| `image-size` | Reads PNG / JPEG / GIF / WebP / SVG headers and adds `width` / `height` to kill CLS |

Two dev-server bugs were fixed: plugin output only answered at its exact file path (`old/index.html` did not serve `/old/`), and directory URLs came back as `application/octet-stream` (so Chrome refused to install the manifest).

## v0.4.5

`xfm create` no longer prints a redundant `cd .` when scaffolding into the current directory, and plugins already present in `package.json` are listed rather than prompting another install.

## v0.4.4

`xfm create` merges into an existing `package.json` instead of replacing it. The bug it fixes was subtle: a site that installed plugins before scaffolding had its `xfm-plugin-*` dependencies wiped by the generated file, and the plugins silently stopped loading.

## v0.4.3

`xfm build` and `xfm dev` now print the plugins that actually loaded plus the files they emitted. Once plugins became separate packages, "installed but not picked up" had to be visible on the command line rather than buried in config.

## v0.4.2

{% note warning Breaking change %}
Plugins no longer ship with the core. `lib/plugins/` is gone; the nine plugins moved to `packages/` and are published individually as `xfm-plugin-*`.

An older site using `plugins: ['rss']` must add `npm i -D xfm-plugin-rss`. A missing plugin now **fails the build** with the exact install command instead of falling back to a bundled copy.
{% endnote %}

Related changes:

- `xfm create` produces a site with **zero plugins** and no longer writes a `plugins` key;
- Auto-discovery: any `xfm-plugin-*` (including `@scope/xfm-plugin-*`) in the site's `package.json` loads automatically;
- Resolution order is explicit: site-local file → site `node_modules` → the CLI's own `node_modules`, so globally installed plugins work too;
- New `site.helpers` (`absoluteUrl`, `withBase`, `normalizeBase`, `applyBase`, `plainText`, `markdownPlain`, `escapeHtml`) so plugins stop reaching into core directories;
- The repo became an npm workspace; `npm publish --workspaces` releases the whole set;
- The `xfm:<name>` prefix and the `lib/plugins/<name>.js` fallback were removed; the old form produces an error with migration guidance.

## v0.4.1

Five new plugins and one important hook:

- `seo` — per-page canonical, Open Graph, Twitter Card and JSON-LD (Article for posts, WebSite + SearchAction for the home page); hand-written canonical / `og:title` tags are respected;
- `related` — scored by tags (3), category (2) and series (3) before rendering, written into `page.data.related`;
- `llms` — `llms.txt` and `llms-full.txt` following the llmstxt.org convention;
- `feed-json` — JSON Feed 1.1;
- `minify` — production only, skipping `pre` / `code` / `textarea` / `script` / `style`.

The **`afterCollect` hook** runs once after every page is collected and before rendering, so cross-page data is computed without touching the worker pool. `transformHtml` also stopped disabling parallelism: workers render, then the hook runs once per page on the main thread.

Fixed: `xfm dev` never ran `afterBuild`, so plugin output (`search.json` and friends) 404'd locally.

## v0.4.0

Three things:

**Site search.** The `search` plugin compresses each content page into a `search.json` record (title / description / tags / first N characters), and both themes ship a Ctrl / ⌘ + K (or `/`) panel that lazy-loads the index and filters client-side. Home, taxonomy and pagination pages stay out of the index by default; a page can opt out with `search: false`.

**Pagination.** `pagination.perPage` cuts lists into real static pages at `/page/2/`, `/page/3/` with an ellipsis pager. Page 1 is the home page itself, and templates read the same `pagination` object everywhere. Pagination pages stay out of feeds, nav groups, prev/next and the search index.

**Reading experience.** Both themes share `ux.js`: copy buttons on code blocks, click-to-zoom images, a reading progress bar, external links opening in a new tab (with `noopener noreferrer`); images get `loading="lazy"` and `decoding="async"` by default.

The same release carried an architectural change: **`site.base` is applied by the engine itself**. The render exit prefixes root-absolute links from templates, Markdown and raw HTML, sitemap / feed / search use the same helper, and the dev server serves the prefix. The `scripts/pages-base.js` post-build patch was deleted and the Pages workflow switched to a `SITE_BASE` environment variable.

## v0.3.0

**Taxonomy pages.** Every tag / category / series finally has a real page (`/tags/<name>/` and so on), rendered by the theme's `taxonomy.html` in reverse chronological order. Before this, templates linked to them but no page existed — every tag was a 404.

**Index pages.** A new `indexes` config makes the engine generate `/categories/` (category cards with post counts) and `/archives/` (grouped by year). They require the theme to provide the layouts, so custom themes keep working.

**Default theme redesign.** Celadon palette, two-column cards on the home page, sticky widget column, pill-style nav highlighting, category labels on cards, breakpoints down to phone widths. The outline started highlighting as you scroll.

Three bugs were fixed at the same time: `.mjs` config hot reload used `Date.now()` as its cache buster, so two saves in the same millisecond read a stale module (replaced with a monotonic counter); percent-encoded URLs were written as literal `%E6%8F%92%E4%BB%B6` directories, which static servers could not find after decoding (paths are now decoded, URLs and sitemap stay encoded); and sitemap / feed emitted relative `<loc>` when `site.url` was unset.

## v0.2.1

Command aliases (`init` / `generate` / `gen` / `serve` / `server` / `preview`) and the "did you mean xfm build?" suggestion.

Two small fixes: prototype-chain keys such as `xfm constructor` were treated as commands (now `own property` only), and input like `xfm --port=4173` reported "unknown option" instead of dumping the whole command table.

## v0.2.0

The Markdown gaps closed: reference links and images, footnotes (each reference links back), Setext headings, four-space indented code blocks, backslash escapes, lazy list continuation, and ordered lists keeping their start number.

Three edges fixed along the way: heading anchors ignore inline markup (`## Use [xfm](/x) **now**` yields `use-xfm-now`, not `use-xfmx-now`); automatic excerpts strip link definitions and footnote markers; titles containing `:` or `#` are quoted when written into front-matter so YAML does not break.

`xfm new` no longer errors on a duplicate file name — it appends `-2`, `-3`.

## v0.1.1

Documentation engineering: the English README became the npm default with `README_CN.md` alongside it; docs were split into four paired groups; the dev port was unified at `4173` in docs and scaffolds (previously a mix of `4000` and `4321`); and the install command was corrected from `npm i -D xfm` to `npm i -g xfmpress`.

## v0.1.0

The first release already contained the full core design:

- Zero dependencies, one render pipeline shared by the main thread and workers;
- Multi-threaded rendering plus content-hash incremental builds;
- Nunjucks-style templates compiled to functions at build time, with optional-chain guards generated at compile time;
- Plugin hooks `markdown` / `transformHtml` / `extendContext` / `afterBuild` / `configureServer` / `finish`;
- Built-in `default` and `docs` themes plus the `xfm create` scaffold;
- A dev server with SSE live reload and config hot reload;
- The `new` / `build` / `dev` / `clean` commands.

## Upgrade advice

| Your version | What to do |
| --- | --- |
| Before 0.4.2 | Install the plugin packages first: `npm i -D xfm-plugin-sitemap xfm-plugin-rss …`, otherwise the build fails |
| 0.4.0 – 0.4.1 | Upgrade directly; `transformHtml` plugins no longer slow parallelism |
| 0.4.2 – 0.4.8 | Upgrade directly, no breaking changes |
| Any version | Run `xfm clean && xfm build` afterwards to rule out stale cache |

The full text lives in the repository's [`CHANGELOG.md`](https://github.com/xfm0797/xfm/blob/main/CHANGELOG.md), each entry following Keep a Changelog with Added / Changed / Fixed / Breaking sections.
