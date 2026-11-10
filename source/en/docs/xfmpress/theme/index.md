---
mode: docs

title: Theme development
date: 2026-11-10 22:52:00
updated: 2026-11-10 22:52:00
description: How to build an xfmpress theme — directory responsibilities, the required and optional layouts, theme.config.js, the asset pipeline, how default and docs differ, and a minimal theme written from scratch.
keywords: [xfmpress, theme development, layouts, partials, assets, theme.config.js, base.html, layouts]
order: 107
---

# Theme development

[Chinese version](/docs/xfmpress/theme/) · **English**

A theme is just files. No bundler, no registration step: point at a directory and the build reads layouts and copies assets by convention.

## Directory layout

```text
themes/my-theme/
├── theme.config.js     # optional: theme-level config
├── layouts/            # page skeletons
│   ├── base.html
│   ├── index.html
│   ├── post.html
│   └── page.html
├── partials/           # reusable fragments
│   └── toc.html
└── assets/             # static files, copied to site.assets
    ├── style.css
    └── ux.js
```

Three directories, three jobs:

| Directory | Purpose | Required |
| --- | --- | --- |
| `layouts/` | Page skeletons, selected by `page.layout` | At least `base.html` |
| `partials/` | Fragments pulled in by `include`, never rendered alone | Optional |
| `assets/` | CSS / JS / fonts / images, copied verbatim | Optional |

## Layout list

The engine picks a layout by page type. A missing layout means that kind of page is simply not generated — no error, but a hole in the site:

| Layout | Selected when | Required |
| --- | --- | --- |
| `base.html` | Never rendered directly; extended by others | Yes |
| `post.html` | Pages with a `date` (when `defaults.layout` points at it) | Recommended |
| `page.html` | Fallback for `defaults.layout`, and for files without `title` | Recommended |
| `index.html` | The home page (`/`) and paginated pages | Recommended |
| `taxonomy.html` | Tag / category / series pages | Optional |
| `categories.html` | Category index (`/categories/`) | Optional |
| `archives.html` | Yearly archive (`/archives/`) | Optional |

Selection order: front-matter `layout` → `defaults.layout` → `page.html`. The home page always uses `index.html`, taxonomy pages always use `taxonomy.html`.

`categories.html` and `archives.html` are driven by the engine's `indexes` config: the theme must provide the layout **and** the config must have `enabled: true`.

## theme.config.js

Optional; exports an object or a function receiving the `site` instance:

```js
module.exports = {
  name: 'my-theme',
  // theme defaults, read in templates as site.theme.* if the theme wants them
  options: { wide: false },
};
```

```js
module.exports = (site) => ({
  name: 'my-theme',
  options: { wide: (site.config.site.title || '').length > 12 },
});
```

Omitting the file changes nothing — most themes never need it.

## Template resolution

`include` and `extend` try paths in a fixed order:

1. `layouts/<name>`
2. `partials/<name>`
3. `<theme>/<name>`

So `include "toc.html"` finds `partials/toc.html` without the full path. When nothing matches, the error names the theme path — never a silent empty string.

## Inheritance and overrides

A child layout declares its parent with `extend` and overrides regions by block name:

```html
<!-- layouts/post.html -->
{% extend "base.html" %}

{% block main %}
<article class="post">
  <h1>{{ page.title }}</h1>
  <div class="prose">{{ content | safe }}</div>
</article>
{% endblock %}
```

The parent leaves override points behind:

```html
<head>
  <title>{% block title %}{{ page.title }} · {{ site.title }}{% endblock %}</title>
  {% block head %}{% endblock %}
</head>
<body>
  <main>{% block main %}{{ content | safe }}{% endblock %}</main>
</body>
```

A block's default content is whatever the parent wrote, so leaving `{% raw %}{% block head %}{% endblock %}{% endraw %}` empty is the usual way to give children a place for extra `<meta>` tags.

## Asset pipeline

Files under `assets/` are copied, relative path intact, to `site.assets` (default `/assets/`):

```text
themes/my-theme/assets/style.css      →  dist/assets/style.css
themes/my-theme/assets/ux.js          →  dist/assets/ux.js
themes/my-theme/assets/fonts/a.woff2  →  dist/assets/fonts/a.woff2
```

Build URLs from `site.assets` so switching themes or changing the prefix never touches templates:

```html
<link rel="stylesheet" href="{{ site.assets }}style.css">
<script src="{{ site.assets }}ux.js" defer></script>
```

Files in the site's `public/` take a different route: straight to the output root — for `favicon.ico`, `robots.txt`, anything that needs a fixed path.

## Links and sub-paths

Root-absolute paths are safe to write:

```html
<a href="/about/">About</a>
<img src="/assets/logo.svg" alt="">
```

`site.base` is prefixed **once, at the render exit**, covering templates, Markdown and hand-written HTML. So a theme should not build its own `site.base + 'about/'` prefix — doing so double-prefixes.

Absolute URLs (feeds, canonical) are the plugins' job; they use `site.helpers.absoluteUrl` and themes stay out of it.

## The two built-in themes

| | `default` | `docs` |
| --- | --- | --- |
| Shape | Blog: home list, article page, right-hand TOC | Docs: left grouped sidebar, prose column |
| Layouts | base / index / post / page / taxonomy / **archives** / **categories** | base / index / post / page / taxonomy |
| Sidebar | None (widget-style info) | Driven by `site.navGroups`, grouped by `group`, sorted by `weight` |
| Extras | Light/dark toggle, copy buttons, image zoom, reading progress | Search panel, TOC highlighting, mobile drawer |
| Good for | Personal blogs, technical notes | Product docs, knowledge bases |

Note that the `docs` theme has **no** `archives.html` or `categories.html` — so a docs site never generates `/archives/` or `/categories/`. Add the layouts if you want them; `enabled` already defaults to `true`.

## A minimal theme from scratch

Four files are enough:

```text
themes/mini/
├── layouts/base.html
├── layouts/index.html
├── layouts/post.html
└── assets/style.css
```

`layouts/base.html`:

```html
<!DOCTYPE html>
<html lang="{{ site.lang }}">
<head>
  <meta charset="utf-8">
  <title>{{ page.title | default(site.title) }}</title>
  <link rel="stylesheet" href="{{ site.assets }}style.css">
</head>
<body>
  <header><a href="/">{{ site.title }}</a></header>
  <main>{% block main %}{{ content | safe }}{% endblock %}</main>
</body>
</html>
```

`layouts/index.html`:

```html
{% extend "base.html" %}
{% block main %}
<h1>{{ site.title }}</h1>
<ul>
{% for post in site.posts %}
  <li><a href="{{ post.url }}">{{ post.title }}</a> <time>{{ post.date }}</time></li>
{% else %}
  <li>No posts yet.</li>
{% endfor %}
</ul>
{% endblock %}
```

`layouts/post.html`:

```html
{% extend "base.html" %}
{% block main %}
<article>
  <h1>{{ page.title }}</h1>
  <div class="prose">{{ content | safe }}</div>
</article>
{% endblock %}
```

Point the config at it:

```js
export default { theme: 'themes/mini' };
```

`xfm dev` renders with the new theme immediately, and template edits apply on save — templates are cached by mtime and recompiled when they change.

## Debugging notes

**Template errors name the file**
Syntax errors carry the template path and the reason, for example `partials/toc.html: unknown filter "safee" (available: safe, length, …)`. Follow the hint.

**A block override did nothing**
Check that the parent actually has a block with that name. When it does not, the child's content is **appended to the end of the page** rather than replacing anything — a stray chunk of HTML at the bottom almost always means a block name typo.

**Styles apply but content did not change**
Content comes from `page` / `site`, not from the template. Check whether front-matter `layout` points at a different layout.

**Keep heavy work out of templates**
Templates are string concatenation; arithmetic inside a `for` runs N times. Cross-page data belongs in an `afterCollect` hook writing into `page.data` — that runs once, single-threaded, before rendering.
