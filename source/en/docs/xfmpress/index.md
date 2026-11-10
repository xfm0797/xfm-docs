---
mode: docs

title: xfmpress Manual
date: 2026-11-10 22:40:00
updated: 2026-11-10 22:40:00
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
| Full cold build | **≈4.4–5.5 s** (~180–230 pages/s) |
| Render stage with a warm cache | **1 ms** (1001 pages) |
| Render stage with 4 workers | **≈0.5 s** (1000 pages) |
| Single-page rebuild in `xfm dev` | **2–7 ms** |
| Runtime footprint | Static HTML + CSS, zero JavaScript required |

Per-stage numbers for 1000 pages. Note that writing files dominates — that is the filesystem's cost, not the generator's:

| Stage | Time | What makes it fast |
| --- | --- | --- |
| Scan and parse | ~690 ms | Parallel directory walk, parallel reads, source text read once |
| Hashing | ~15 ms | Reuses the text already in memory, no second IO |
| Render | ~510 ms | Worker pool, context serialized once |
| Write | ~3800 ms | One `mkdir` per directory, two-phase parallel writes |

On Windows / NTFS the write stage is the bottleneck: 1000 small files cost more than parsing and rendering combined. In other words, the next speed-up has to come from producing fewer files, not from a faster generator.

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
- **Writing**: on top of GFM — `::: tip` callouts, reference links, footnotes, Setext headings, indented code blocks, task lists with lazy continuation.
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
| [Changelog](/en/docs/xfmpress/changelog/) | v0.1.0 → v0.4.8, fourteen releases | Deciding to upgrade |

{% note info About the version %}
This manual documents **xfmpress v0.4.8** (2026-11-10). The versioning rule is unusual: the patch digit rolls from `0.4.0` to `0.4.99` and only then bumps to `0.5.0`. Features therefore land in `0.4.x` releases — read the changelog rather than the version number.
{% endnote %}
