---
mode: docs

title: Content and Markdown
date: 2026-11-10 22:48:00
updated: 2026-11-10 22:48:00
description: How xfmpress organises content — content directory to URL mapping, every front-matter field, posts versus pages versus drafts, scaffolds, Markdown extensions, relative link resolution and excerpt generation.
keywords: [xfmpress, Markdown, front-matter, page, type page, scaffolds, draft, URL, callouts, footnotes, relative links]
order: 105
---

# Content and Markdown

[Chinese version](/docs/xfmpress/content/) · **English**

Everything lives under `content/`, with four accepted extensions: `.md`, `.markdown`, `.html`, `.htm`. There is no required directory layout — but directories decide URLs, so the conventions are worth spelling out.

## Directories and URLs

| Source | URL | Output |
| --- | --- | --- |
| `content/index.md` | `/` | `dist/index.html` |
| `content/about.md` | `/about/` | `dist/about/index.html` |
| `content/about/index.md` | `/about/` | `dist/about/index.html` |
| `content/posts/hello.md` | `/posts/hello/` | `dist/posts/hello/index.html` |
| `content/notes/2026/a.md` | `/notes/2026/a/` | `dist/notes/2026/a/index.html` |
| `content/raw.html` | `/raw.html` | `dist/raw.html` |

In three rules: **`index` collapses into the directory itself; the extension is dropped and a trailing slash added; `.html` is left alone** (so the link matches the file).

To pin an address, say so in front-matter:

```yaml
---
title: About
url: /about-me/
---
```

`url`, `permalink` and `slug` are all accepted and normalised (leading slash, trailing slash where needed).

Non-ASCII paths work too: `content/notes/getting-started.md` becomes `/notes/getting-started/`, and percent-encoded directory names are decoded on the way to disk — static servers decode the URL before looking for a file, so a literal `%E7%AC%94%E8%AE%B0` directory would 404.

## front-matter

YAML between two `---` lines. Every field is optional:

```markdown
---
title: Post title
date: 2026-11-10 09:00:00
updated: 2026-11-10 12:30:00
description: Summary used by lists and feeds
tags: [Node.js, performance]
category: Engineering
series: Static site generators
layout: post.html
weight: 10
draft: false
toc: true
---
```

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string | Title; falls back to the file name |
| `date` | date | Publish date, used by feeds and sorting |
| `published` | date | Alias of `date` |
| `updated` | date | Last update, becomes sitemap `lastmod` |
| `description` | string | Summary, beats the automatic excerpt |
| `summary` | string | Alias of `description` |
| `tags` | array or CSV | Tags; `[a, b]` and `a, b` both work |
| `category` | string | Category, single value |
| `series` | string | Series, single value |
| `layout` | string | Layout file, defaults to `defaults.layout` |
| `weight` | number | Sort weight, lower first |
| `order` | number | Alias of `weight` |
| `draft` | bool | `true` skips production builds |
| `toc` | bool | `false` disables the table of contents for this page |
| `type` | string | `page` keeps it out of lists, feeds and prev/next |
| `url` / `permalink` / `slug` | string | Set the address by hand |
| `group` / `section` | string | Sidebar group name for the `docs` theme |

`type: page` is the useful one: an "About" or "Links" page marked this way disappears from the home list, the feeds and the `prev` / `next` chain.

## Posts, pages and drafts

Content has three roles, and the difference is two or three front-matter fields:

| Role | Create with | Key fields | Behaviour |
| --- | --- | --- | --- |
| Post | `xfm new "Title"` | `layout: post.html` | In the home list, feeds, search, prev/next, related posts |
| Page | `xfm new page about` | `layout: page.html` + `type: page` | Own URL `/about/`, in no list or feed |
| Draft | `xfm new draft "Title"` | `draft: true` | Rendered by `xfm dev`, skipped by `xfm build` |

Pages and posts share the same layout machinery; the only difference is **whether they join the aggregates**. `site.posts` excludes everything with `type: page`, and `sitemap` / `rss` / `search` / `related` skip them too. So to get a page into the navigation, add it to `site.nav` yourself:

```js
site: {
  nav: [
    { title: 'Home', url: '/' },
    { title: 'About', url: '/about/' },
  ],
}
```

## Scaffolds

The starter content produced by `xfm new` is not hard-coded — it comes from `scaffolds/<layout>.md` in the site root, mirroring Hexo's `scaffolds/`:

```text
scaffolds/
├── post.md      # xfm new "Title"  / xfm new post "Title"
├── page.md      # xfm new page Title
└── draft.md     # xfm new draft Title
```

Three placeholders are available:

| Placeholder | Replaced with |
| --- | --- |
| `{% raw %}{{ title }}{% endraw %}` | The title |
| `{% raw %}{{ date }}{% endraw %}` | Current time, local timezone |
| `{% raw %}{{ layout }}{% endraw %}` | Layout file name, e.g. `post.html` |

Edits apply on the next `xfm new` (it is a separate process and reads the file each time). A site without `scaffolds/` uses the built-in templates, so old sites need no migration; `xfm create` writes the three defaults for new ones.

Missing keys are filled in automatically: `title`, `date`, `layout`, `type: page`, `draft`. A template containing nothing but a heading still produces a page that behaves correctly — never a page published as a post, never a draft that slips out.

## Drafts

```yaml
---
title: Half written
draft: true
---
```

Production builds (`xfm build`) skip drafts; `xfm dev` renders them, so you can preview locally without leaking anything to the live site. To include drafts in a build, set `buildDrafts` to `true`.

`xfm new draft "Title"` writes the field for you (`xfm new "Title" --draft` is equivalent).

## Ordering and prev/next

Page ordering is fixed, in three tiers:

1. The home page (`/`) is always first;
2. The rest sort by `weight` ascending — documentation sites use this for chapter order;
3. Ties fall back to `date` descending.

`prev` / `next` follow the same order and only link posts together (home page, `type: page` and pages without a date are excluded). Templates read `page.data.prev.url` / `page.data.prev.title` directly.

## Markup

The body is standard Markdown with the usual GFM support. On top of that:

### Callouts

```markdown
::: tip Optional title
Five kinds: `tip` / `info` / `warning` / `danger` / `details`.
:::
```

The kind decides colour and icon; the title is optional. `details` is collapsible — good for long appendices.

### Code blocks

Fences accept a language tag and a title:

````markdown
```js app.js
const ok = true;
```
````

Language aliases are normalised, case-insensitively:

| Family | Accepted tags |
| --- | --- |
| JavaScript | `js` `javascript` `jsx` `ts` `tsx` |
| Back end | `java` `c` `cpp` `csharp` `go` `golang` `rust` `rs` `swift` `kotlin` `scala` `php` `python` `py` |
| Shell and config | `bash` `sh` `shell` `json` `yaml` `yml` |
| Markup and style | `html` `xml` `svg` `vue` `css` `scss` `markdown` `md` `text` |

An unknown language is not an error — it degrades to escaped monospace text. Meta information on the fence line (highlight ranges such as `{1,3-5}`) is ignored and does not affect the build.

### Reference links

```markdown
I have been tinkering with [static site generators][ssg] and reordered the [docs][docs].

[ssg]: https://example.com/ssg "Static site generators"
[docs]: https://example.com/docs
```

Definition lines never appear in the body. The shorthand `[ssg]` works too — when the link text is the identifier, the second pair of brackets can go.

### Footnotes

```markdown
Drop a marker in the text[^note] and the note appears at the end.

[^note]: Numbered by first reference; repeated references link back.
```

### Also supported

- **Setext headings**: `====` (level 1) or `----` (level 2) under a paragraph.
- **Indented code blocks**: four spaces or a tab (outside lists).
- **Escapes**: `\*not italic\*`, `` \`not code` ``.
- **Task lists**: `- [x] done` / `- [ ] todo`, with continuation lines and nesting.
- **List continuation**: indented and lazy (unindented) continuations join the same item; ordered lists keep their start number (`3.` emits `start="3"`).
- **Tables**: standard GFM tables with alignment markers.

### Heading anchors

Level 2 and 3 headings get an `id`, and non-Latin headings still produce readable anchors (duplicates get a numeric suffix). Headings are also collected into `page.toc`, which the theme uses to render the right-hand outline — so `toc: false` affects the outline, not the anchors.

## Relative links

Relative paths in Markdown are resolved against the source file's location and rewritten to site URLs:

```markdown
See [the previous post](./hello.md) and [the diagram](../../assets/diagram.png).
```

Rules:

- Links with a scheme, protocol-relative links, root-relative links (`/x`) and pure anchors (`#x`) are left alone;
- Everything else resolves from the current source directory, then maps to the target page's URL;
- A `.md` link pointing at a file that does not exist is left as written — a typo does not silently become some other path.

The upshot: move files around freely, and as long as the relative relationships hold, the links keep working.

## Static files

Anything under `public/` is **copied verbatim** to the output root — `favicon.ico`, `robots.txt`, self-hosted fonts, images:

```text
public/
├── favicon.ico     → dist/favicon.ico
└── img/logo.svg    → dist/img/logo.svg
```

Theme assets take a different route: they live in the theme's `assets/` and end up under `site.assets` (default `/assets/`).

## Excerpts and reading time

List pages need an excerpt and a reading time, both computed during the scan rather than at render time:

- **Excerpt**: front-matter `description` wins; otherwise the first 140 characters of the body, with an ellipsis. Code blocks, link targets, reference definitions and footnote definitions are stripped first — otherwise you would see `[home]: https://…` in the summary.
- **Reading time**: 350 characters per minute, minimum one minute.

Both are exposed as `page.excerpt` and `page.readTime`.

## Writing advice

- One topic per post, keywords in the title, and a full sentence in `description` (it feeds lists, feeds and search snippets).
- Chain a series with `series` and order it with `weight` — the `/series/<name>/` page then becomes a natural reading path.
- Split long posts with level 2 and 3 headings: the outline only collects those two levels.
