---
mode: docs

title: Changelog
date: 2026-11-10 23:00:00
updated: 2026-11-15 22:00:00
description: Every xfmpress release from v0.1.0 to v0.4.13 — the main line of each version, breaking changes, upgrade notes, and the versioning rule that makes it all unusual.
keywords: [xfmpress, changelog, releases, upgrade, v0.4.13, breaking changes]
order: 111
---

# Changelog

[Chinese version](/docs/xfmpress/changelog/) · **English**

xfmpress went from v0.1.0 on 2026-11-02 to v0.4.13 — nineteen releases in two weeks. This page tracks the main line of each one, so you can judge whether to upgrade and what to watch for.

## Versioning rule

There is one difference from the usual convention:

```text
0.4.0 → 0.4.1 → … → 0.4.99 → 0.5.0
```

**The patch digit rolls from 0 to 99 before the minor bumps.** Features therefore land inside `0.4.x` releases, and `0.5.0` means "one round of work finished", not "breaking change". Decide from the notes below, not from the number.

## At a glance

| Version | Date | Main line |
| --- | --- | --- |
| 0.4.13 | 11-15 | Repeat builds skip unchanged files: write phase 5.3 s → 0.9 s |
| 0.4.12 | 11-15 | Indented code blocks inside list items; paragraph leading spaces |
| 0.4.11 | 11-15 | Loose lists: a blank line no longer splits a list in two |
| 0.4.10 | 11-15 | Block content in list items, footnote indentation, link definitions |
| 0.4.9 | 11-15 | Eight CLI and dev-server cases that silently produced wrong results |
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

## v0.4.13

**Repeat builds no longer rewrite unchanged files.** On a 1,000-page site the write phase drops from 5.3 s to 0.9 s, with the cold build unchanged. Both wastes were found by counting filesystem calls:

| Waste | Before | After |
| --- | --- | --- |
| Stale-output cleanup | Tried `rmdir` on every directory in `dist` on every build — 1,000 failing calls, ~3.3 s sequentially on NTFS | Only runs when something was actually deleted, and only over the ancestors of those files (deepest first, in parallel); no deletions means no `rmdir` at all |
| Page writes | Flushed every page to disk (~1.5 s) and `mkdir`'d their directories (~1.1 s) even when the bytes were identical | Compares per file (size, then content) and skips a match; a skipped file needs no directory either |

Assets use the same idea with a make-style rule: leave the file alone when the size matches and the destination is not older than the source, so large images are never read. The premise behind the first saving: a directory cannot become empty on its own — only because a file inside it was deleted.

Alongside:

- `xfm build` gains a line reading `未变化 N 个文件（内容一致，未重写）` (unchanged files, content identical, not rewritten);
- `bench/bench.js` reports cold (`dist` removed) and repeat builds separately instead of mixing them into one median.

## v0.4.12

**Indented (four-space) code blocks now behave the same inside list items as outside**, and the last "only fenced code works here" limitation is gone.

- **`-     code` (five spaces after the marker) used to render as plain text.** The item regex swallowed every space after the marker, losing the extra indentation that makes the first line a code block. Per CommonMark, 1–4 spaces after the marker are padding while 5 or more means one space of padding and the rest belongs to the content — the item now starts with a code block, and following lines indented four past the content column join it.
- **Leading spaces leaked into paragraphs.** A paragraph line starting with 1–3 spaces kept them (`<p>  code</p>`), which also showed up after a list item's content indent was stripped. Up to three leading spaces count as indentation and are dropped.

Indented code blocks after a blank line inside an item, inside blockquotes, `:::` containers and footnotes already worked; those paths are unchanged.

## v0.4.11

**Loose lists: a blank line no longer ends a list.** All of it lives in `lib/engine/markdown.js`.

- **A blank line between items split one list into two `<ul>`s.** `- a`, blank line, `- b` produced two separate lists, breaking `ol` numbering, nesting and any CSS that styles `li + li`. Items separated by blank lines now stay in one list.
- **Content after a blank line inside an item fell out of the list.** `- first paragraph`, blank line, indented second paragraph rendered the second paragraph outside the `li` and at the wrong indent. It now belongs to the item and is handled by the block parser — a follow-up paragraph, a sub-list, a fenced code block or a quote all nest correctly.

The rendered shape follows CommonMark's tight/loose rule: if any item is separated from its neighbour by a blank line, or contains one, every paragraph in that list is wrapped in `<p>`. Tight lists are untouched (`<li>a</li>`), and an item with block content keeps the `<p>` it already had. Blank lines after a list still end it, and lazy continuation is still not allowed after a blank line.

One boundary worth knowing: a blank line that belongs to an outer list (`- a` / indented `- b` / blank / `- d`) is handed back to the outer list instead of marking the inner one loose.

## v0.4.10

Three Markdown edge cases that had been sitting on the known-issues list, all in `lib/engine/markdown.js`:

- **Block content inside a list item is rendered as blocks.** `- 安装：` followed by an indented fence used to be flattened into one text run, and an indented `>` was escaped to `&gt;`. Items now collect content at the item's content indent and hand quotes, fenced code, `:::` containers and rules to the block parser, producing `<li><p>安装：</p><div class="code-block">…</div></li>`. `- 标题` plus an indented `---` keeps its Setext meaning instead of turning into a rule.
- **Footnote block content requires the canonical 4-space indent.** The old rule accepted 2 spaces and dedented up to 4, so a two-space nested list right after a footnote definition was swallowed into the note. Four spaces (or a tab) now mean block content; 1–3 spaces still mean "same paragraph, next line" (so existing prose does not break), and a following unindented paragraph stays a paragraph.
- **A link reference definition no longer interrupts a paragraph.** `collectDefinitions` used to pull every `[a]: /url` line out of the text, so one mid-paragraph definition split the paragraph in two and removed a line from it. Definitions are now collected only at paragraph start, which is also what CommonMark requires — a mid-paragraph `[a]: /url` stays literal text and does not register a reference.

The default and docs themes also stop list items with block children from gaining extra leading/trailing space from the child's `p` margin. Tests went from 128 to 131.

## v0.4.9

A review pass over the CLI and the dev server. All eight fixes below share one disease: **the tool happily produced the wrong result instead of complaining.**

- **`xfm new` outside a site now errors out.** In an empty directory it used to create `content/posts/<slug>.md` and then suggest "already publishable — just run `xfm build`", while the build itself failed on the missing theme. It now prints the path, points at `xfm create`, and creates nothing.
- **`xfm create` recognises every config form.** Only `xfm.config.mjs` was checked, so a site configured through `xfm.config.js` / `.cjs` / `.json`, or through an `"xfm"` field in `package.json`, was treated as an empty directory and overwritten (`content/index.md`, `content/about.md`, the starter post) without `--force`. The new `hasConfig()` backs both this check and the dev-server config watcher.
- **UTF-8 BOM no longer swallows front-matter.** Files saved as "UTF-8 with BOM" — the default of several Windows editors — lost the whole block: the title fell back to the file path and `date` / `layout` / `tags` vanished. The BOM is stripped before looking for `---`.
- **The layout wins over a contradicting scaffold.** A `scaffolds/draft.md` that still says `draft: false` or `layout: page.html` (usual when copied from another template) produced a *published* page while the CLI reported "won't appear in the build output". `layout`, `type` and `draft` are now forced from the requested layout, and the reverse case — a `post` scaffold with a leftover `draft: true` — is written back to `false`.
- **`--dir=` with backslashes.** `xfm new page about --dir=docs\sub` echoed `/docs\sub/about/` while the real URL was `/docs/sub/about/`. Paths are normalised before the summary, and `--dir` now refuses to climb out of the content directory.
- **Date-only front-matter is a local calendar day.** By spec `new Date('2026-11-10')` is UTC midnight, so everything west of UTC rendered those posts one day early. Date-only and `YYYY-MM-DD HH:mm` values are now constructed in local time explicitly; timestamped values keep their time.
- **Dev server under a sub-path (`site.base: '/blog/'`).** The live-reload event stream follows the base (`/blog/__xfm/events`), 404-page links carry the prefix, a half-closed browser connection can no longer abort a rebuild, and `xfm.config.cjs` / `config.js` are watched like the other config files instead of being silently ignored.
- **`xfm create` writes a `.gitignore`** (`node_modules/`, `dist/`, `.xfm/`, OS junk) so the first build no longer floods `git status`; an existing `.gitignore` is left untouched.

Tests went from 120 to 128, with new cases aimed at exactly the above: BOM, date parsing, scaffold/layout conflicts, `--dir` normalisation, the non-site guard, config detection, `.gitignore`.

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
| 0.4.2 – 0.4.13 | Upgrade directly, no breaking changes |
| Any version | Run `xfm clean && xfm build` afterwards to rule out stale cache |

The full text lives in the repository's [`CHANGELOG.md`](https://github.com/xfm0797/xfm/blob/main/CHANGELOG.md), each entry following Keep a Changelog with Added / Changed / Fixed / Breaking sections.
