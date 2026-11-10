---
mode: docs

title: Command line
date: 2026-11-10 22:44:00
updated: 2026-11-10 22:44:00
description: Complete xfmpress CLI reference — create, dev, build, new, clean and info with every option, the post / page / draft layouts and scaffolds, aliases, and how to read each line of build output.
keywords: [xfmpress, xfm command, CLI, create, dev, build, new, page, draft, scaffolds, clean, info, aliases]
order: 103
---

# Command line

[Chinese version](/docs/xfmpress/cli/) · **English**

Every command is `xfm <command> [directory] [options]`. The directory defaults to the current working directory — inside a site root, `xfm build` is enough.

```bash
xfm --help        # all commands and options
xfm --version     # version number only
```

## Commands at a glance

| Command | Purpose | Common options |
| --- | --- | --- |
| `xfm create [dir]` | Scaffold a site | `--template=blog` or `--template=docs`, `--title=` |
| `xfm dev [dir]` | Dev server with SSE hot reload | `--port=` |
| `xfm build [dir]` | Production build | `--dev` |
| `xfm new [layout] <title>` | New post, page or draft | `--layout=`, `--dir=`, `--slug=`, `--draft`, `--force` |
| `xfm clean [dir]` | Remove output and incremental cache | — |
| `xfm info [dir]` | Print the resolved configuration | — |

## Aliases

To keep the Hexo muscle memory working, the most natural gestures do what you expect instead of dumping help text:

| Alias | Equivalent |
| --- | --- |
| `init` | `create` |
| `generate` / `gen` | `build` |
| `serve` / `server` / `preview` | `dev` |

Mistype a command and the CLI guesses by prefix and edit distance — "did you mean `xfm build`?" — instead of failing silently.

## create

```bash
xfm create my-blog                        # blog template
xfm create my-docs --template=docs        # docs template
xfm create my-docs --template=docs --title="My knowledge base"
xfm create .                              # current directory (existing files kept)
```

The two templates:

| `--template` | Look | Good for |
| --- | --- | --- |
| `blog` (default) | List home page, article page, right-hand TOC | Personal blogs, technical notes |
| `docs` | Left grouped sidebar, prose column | Product docs, knowledge bases |

The scaffold never overwrites existing files, so re-running it inside a half-finished directory is safe. When it finishes it lists the plugins you are still missing and the exact `npm i` command.

Besides the site skeleton, `xfm create` also writes three content templates under `scaffolds/` (`post.md`, `page.md`, `draft.md`) — those are what `xfm new` reads.

## dev

```bash
xfm dev
xfm dev --port=5000
xfm dev examples/blog
```

Three things happen on start:

1. An in-memory build (nothing written to disk), usually a few hundred milliseconds;
2. An HTTP server on `http://127.0.0.1:4173/`;
3. Watchers on `content/`, `themes/`, `plugins/` and the config file, pushing changes over SSE — the page **reloads while keeping scroll position**.

The granularity is worth knowing: editing Markdown rebuilds only the affected pages; editing CSS swaps the stylesheet without a reload; editing templates or config recomputes everything. A single page rebuild measures **2–7 ms**.

`server.host` / `server.open` are honoured too — `open: true` launches a browser after start.

## build

```bash
xfm build
xfm build --dev        # enable the incremental cache in dev mode as well
```

`--dev` does not mean "build a dev version" — it means "let the incremental cache work in this mode too". Output is environment-agnostic; only a few plugins (`giscus`, `analytics`) decide whether to inject third-party scripts based on `mode`.

A typical run:

```console
$ xfm build

  ⚡ xfm build  /home/me/my-blog

  ✓ Pages      17
  ✓ Plugins    sitemap, rss, search, seo, related, minify
  ✓ Extra      sitemap.xml, robots.txt, feed.xml, search.json, llms.txt, llms-full.txt
  ✓ Assets     6
  ✓ Output     dist (412.18 KB)
  ✓ Workers    4
  ✓ Cached     12 pages

  214 ms  (79 pages/s)
```

Line by line:

| Line | Meaning |
| --- | --- |
| Pages | Content pages + taxonomy pages (tag / category / series) + pagination + index pages |
| Plugins | Plugins that actually loaded; when empty you get an install hint |
| Extra | Non-page files written by plugins, folded after six |
| Assets | Files copied from the theme's `assets/` and the site's `public/` |
| Workers | Present only when the page count crosses `workerThreshold` and no plugin blocks the pool |
| Cached | Pages skipped this run; only appears on a cache hit |

## new

The shape matches `hexo new [layout] <title>`: when the first positional argument is a layout you can omit `--layout`, and for a plain post you write nothing extra.

```bash
xfm new "My first post"                 # post → content/posts/my-first-post.md
xfm new post "Hello, World!"            # explicit layout, same result
xfm new page about                      # page → content/about.md, served at /about/
xfm new draft "Half an idea"            # draft → content/posts/half-an-idea.md, draft: true
xfm new page about --dir=pages          # elsewhere → content/pages/about.md
xfm new "Deploy notes" --slug=deploy    # pick the file name yourself
xfm new --layout=page page              # when the title itself is "page"
xfm new "Same title" --force            # overwrite an existing file
```

The three layouts:

| Layout | Lands in | front-matter written | Meaning |
| --- | --- | --- | --- |
| `post` (default) | `content/posts/<slug>.md` | `layout: post.html` | A post: home list, feeds, search, prev/next |
| `page` | `content/<slug>.md` | `layout: page.html`, `type: page` | A fixed page: own URL, never in a list |
| `draft` | `content/posts/<slug>.md` | `layout: post.html`, `draft: true` | Draft: skipped by `xfm build`, previewed by `xfm dev` |

`page` only became a first-class command in 0.4.8. Before that, "About" or "Links" pages had to be placed in the `content/` root by hand with a `type: page` you had to remember — miss it and the page quietly became a post in the list and the feed. Now the layout does both.

Behaviour details:

- **A layout only applies when the first word is a known layout *and* a second argument exists**: `xfm new page` is a post titled "page" (matching Hexo), while `xfm new page about` is a page. Use `--layout=` to force it.
- **Multi-word titles stay whole**: `xfm new My First Post` creates "My First Post" instead of truncating after the first word.
- **A misspelled layout gets a suggestion**: `xfm new apge about` says there is no layout named `apge`, treats the input as a title, and points at `xfm new page <title>`.
- **slug generation**: lowercased, non-alphanumerics collapsed into `-`, leading and trailing dashes trimmed; a title with no usable characters falls back to `post`.
- **Duplicate names do not fail**: `-2`, `-3` are appended; use `--force` to overwrite.
- **Titles are escaped**: characters such as `:` and `#` are wrapped in double quotes when written into front-matter.

The generated file looks like this (the starter body no longer repeats an `# H1`, since the theme renders it from `page.title`):

```markdown
---
title: "My first post"
date: 2026-11-10 22:44:00
description: ""
tags: []
layout: post.html
---

Start writing…
```

The command prints the layout and the resulting URL so you can confirm where it landed:

```console
$ xfm new page about
✓ created content/about.md  [page] → /about/
  template: scaffolds/page.md
  Pages stay out of the post list, feeds and related posts; to show it in nav, add it to site.nav in xfm.config.mjs.
```

### Customising starter content with scaffolds

The initial content comes from `scaffolds/<layout>.md` in the site root — the same idea as Hexo's `scaffolds/` — with three placeholders:

| Placeholder | Replaced with |
| --- | --- |
| `{% raw %}{{ title }}{% endraw %}` | The title |
| `{% raw %}{{ date }}{% endraw %}` | Current time, local timezone |
| `{% raw %}{{ layout }}{% endraw %}` | Target layout file, e.g. `post.html` |

`xfm create` writes `scaffolds/post.md`, `scaffolds/page.md` and `scaffolds/draft.md`, and edits take effect immediately — no restart, since `xfm new` is a separate process that reads the file each time. A site without the directory falls back to the built-in templates, so nothing has to be migrated.

Missing keys in a custom scaffold are filled in automatically (`title`, `date`, `layout`, `type: page`, `draft`). Otherwise a template containing only a title could produce a page that publishes like a post, or a draft that goes live.

## clean

```bash
xfm clean
# ✓ removed dist
# ✓ removed .xfm
```

Two things disappear: `outDir` (default `dist/`) and the incremental cache directory `.xfm/`. When something "changed but still renders the old page", `clean` is the fastest way to rule the cache out.

## info

```bash
xfm info
```

Read-only: no build, nothing written. The "Config" line tells you which file was actually read — if it says defaults, the site has no config file and everything comes from built-ins.

## Exit codes

| Situation | Code |
| --- | --- |
| Success | `0` |
| Unknown command / option | `1` |
| Build or render error | `1` |

Usable directly in CI: errors the engine raises itself (a declared plugin that is not installed, say) print a one-line fix instead of a screenful of stack trace.
