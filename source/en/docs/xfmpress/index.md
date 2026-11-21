---
mode: docs

title: xfmpress Manual
date: 2026-11-10 22:40:00
updated: 2026-11-21 20:30:00
description: Official documentation for xfmpress — a zero-dependency Node.js static site generator with multi-threaded rendering, Nunjucks-style templates, pluggable themes and plugins. Positioning, benchmarks and a three-minute start.
keywords: [xfmpress, xfm, static site generator, SSG, Node.js, zero dependency, Markdown, blog, docs]
order: 101
---

# xfmpress Manual

[Chinese version](/docs/xfmpress/) · **English**

xfmpress is a **static site generator** that runs on Node.js: it compresses Markdown into plain HTML. There is no database and no runtime framework — the output can go straight to Nginx, an object store, or any static host.

It is built and maintained by the author of this site. The repository is [xfm0797/xfm](https://github.com/xfm0797/xfm), the npm package is `xfmpress`, and the command is `xfm`.

## In one sentence

**Zero runtime dependencies, multi-threaded rendering, templates compiled at build time.** Installing it does not pull in a `node_modules` forest; building does not interpret templates or construct an AST. What you get is HTML, CSS and JS — nothing else.

How it compares on the usual axes:

| Dimension | What xfmpress does |
| --- | --- |
| Dependencies | **0** runtime dependencies in the core (`dependencies` is empty) |
| Templates | Nunjucks-style syntax, compiled into JS functions at build time |
| Rendering | A worker pool kicks in automatically from 40 pages up |
| Incremental | Source hash + theme fingerprint; unchanged pages reuse cached HTML |
| Plugins | Shipped separately — install `xfm-plugin-*` and it is picked up |
| Themes | Built-in `default` (blog) and `docs` (sidebar docs), or write your own |

## Where the name comes from

The package is `xfmpress` and the command is `xfm`, sharing the brand prefix with `hexo-theme-xfm`. Early on the project was called `bolt`, but `bolt` and `bolt-ssg` were taken on npm, and `xmssg` plus `xfm` were both rejected by npm's "too similar to an existing name" check (colliding with `xss`, and with short names such as `xo`, `xml`, `htm`). Since 0.1.0 it has been `xfmpress`.

## Performance

Measured on a 4-core Windows machine, Node 22, 1000 Chinese documents (~5 MB of HTML). Reproduce with `npm run bench`:

| Metric | Value |
| --- | --- |
| Full cold build (empty `dist`) | **≈5–6.5 s** (~160–200 pages/s) |
| Repeat build (output mostly unchanged) | **≈2.8–2.9 s** (~340 pages/s) |
| Render stage with a warm cache | **1 ms** (1001 pages) |
| Render stage with 4 workers | **≈0.5 s** (1000 pages) |
| Single-page rebuild in `xfm dev` | **2–7 ms** |
| Runtime footprint | Static HTML + CSS, zero JavaScript required |

Per-stage numbers for 1000 pages. Writing files is still the largest block, but it is bounded by filesystem metadata rather than by the generator — and a repeat build only writes what actually changed:

| Stage | Time | What makes it fast |
| --- | --- | --- |
| Scan and parse | ~690 ms | Parallel directory walk, parallel reads, source text read once |
| Hashing | ~15 ms | Reuses the text already in memory, no second IO |
| Render | ~510 ms | Worker pool, context serialized once |
| Write (cold) | ~2600 ms | `mkdir` only for files that need writing, two-phase parallel writes |
| Write (repeat build) | ~900 ms | Identical files are neither rewritten nor re-`mkdir`ed; no sweep when nothing was deleted |

On Windows / NTFS, 1000 `mkdir` calls cost ~1.1 s and flushing 1000 pages ~1.5 s. The next speed-up has to come from writing less, not from a faster generator — which is exactly what v0.4.13 does: an identical file is neither rewritten nor given a new directory (`stat` plus one read is ~0.8 s, under a third of the cost).

## Three-minute start

```bash
npm i -g xfmpress      # Node >= 18
xfm create my-blog     # site in 30 seconds, blog template
cd my-blog
xfm dev                # http://127.0.0.1:4173, refresh on save
xfm build              # output in dist/
```

For a documentation site, switch the template:

```bash
xfm create my-docs --template=docs --title="My knowledge base"
```

The generated tree is deliberately plain — you can read all of it at a glance:

```text
my-blog/
├── xfm.config.mjs      # site config, every field has a default
├── content/            # all Markdown sources
│   ├── index.md
│   ├── about.md
│   └── posts/
│       └── hello-world.md
├── scaffolds/          # templates used by xfm new (post / page / draft)
├── plugins/            # site-local plugins
├── public/             # copied verbatim to the output root
└── README.md
```

## What it can do

- **Content**: YAML front-matter, three layouts for posts / pages / drafts, `scaffolds/` for custom starter content, tag / category / series pages, automatic prev / next, `weight` ordering, relative `.md` links rewritten for you.
- **Data and structure**: global data files under `data/` (`site.data`), custom collections (independent sections with real static pagination), multi-language (`translationKey` pairing + injected hreflang).
- **Writing**: on top of GFM — `::: tip` callouts, reference links, footnotes, Setext headings, indented code blocks (inside and outside list items), loose lists, task lists with lazy continuation.
- **Themes**: `{% raw %}{% extend %}{% endraw %}` inheritance, `{% raw %}{% block %}{% endraw %}` overrides, `{% raw %}{% include %}{% endraw %}` partials, light/dark driven by CSS variables.
- **Plugins**: six hooks covering context injection, Markdown, HTML, cross-page computation, extra output and the dev server. Fifteen official plugins, each published on its own.
- **Search**: the `search` plugin emits `search.json`; the built-in themes ship a Ctrl / ⌘ + K panel that filters client-side with no dependencies.
- **SEO and AI-friendly**: canonical, Open Graph, Twitter Card, JSON-LD, plus `llms.txt` and `llms-full.txt`.
- **Deployment**: `site.base` supports sub-paths (GitHub Pages project sites); the dev server serves the same prefix.

## Documentation map

| Chapter | Contents | Read it when |
| --- | --- | --- |
| [Install and upgrade](/en/docs/xfmpress/install/) | Three install methods, permission fixes, upgrades | First time |
| [Command line](/en/docs/xfmpress/cli/) | Every option of `create` / `dev` / `build` / `new` / `clean` / `info` | Daily use |
| [Configuration](/en/docs/xfmpress/config/) | Config lookup order and every default | Tuning behaviour |
| [Content and Markdown](/en/docs/xfmpress/content/) | front-matter, directory rules, URLs, extensions | Writing |
| [Template syntax](/en/docs/xfmpress/templates/) | Variables, filters, control flow, inheritance, context | Editing a theme |
| [Theme development](/en/docs/xfmpress/theme/) | Directory layout, layout/partials duties, asset pipeline | Building a theme |
| [Plugins](/en/docs/xfmpress/plugins/) | Hook semantics, auto-loading, 15 official plugins | Extending |
| [Build and deploy](/en/docs/xfmpress/deploy/) | Incremental cache, sub-paths, Pages / Netlify / Nginx | Shipping |
| [Architecture](/en/docs/xfmpress/architecture/) | Pipeline, worker pool, cache keys, reading benchmarks | Understanding internals |
| [Changelog](/en/docs/xfmpress/changelog/) | v0.1.0 → v0.4.14, twenty releases | Deciding to upgrade |

{% note info About the version %}
This manual documents **xfmpress v0.4.14** (2026-11-21). The versioning rule is unusual: the patch digit rolls from `0.4.0` to `0.4.99` and only then bumps to `0.5.0`. Features therefore land in `0.4.x` releases — read the changelog rather than the version number.
{% endnote %}
