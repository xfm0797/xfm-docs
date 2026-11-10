---
mode: docs

title: Template syntax
date: 2026-11-10 22:50:00
updated: 2026-11-10 22:50:00
description: Complete xfmpress template reference — output and escaping, the six filters, if/for/set control flow, include and extend/block inheritance, expression rules, and the site/page/content/headings context.
keywords: [xfmpress, template, template syntax, Nunjucks, extend, block, include, filters, context]
order: 106
---

# Template syntax

[Chinese version](/docs/xfmpress/templates/) · **English**

The syntax is close to Nunjucks / Liquid, so if you have written a Hexo theme most of it transfers directly. The implementation differs: templates are **compiled into JS functions once at build time**, and rendering is pure string concatenation — no interpreter loop, no AST walk.

## Syntax at a glance

| Syntax | Purpose |
| --- | --- |
| `{% raw %}{{ expr }}{% endraw %}` | Output, HTML-escaped by default |
| `{% raw %}{{ expr }}{% endraw %}` with the `safe` filter | Output without escaping |
| `{% raw %}{% if %} … {% elif %} … {% else %} … {% endif %}{% endraw %}` | Conditionals |
| `{% raw %}{% for x in list %} … {% endfor %}{% endraw %}` | Loops |
| `{% raw %}{% set x = expr %}{% endraw %}` | Assignment |
| `{% raw %}{% include "partials/toc.html" %}{% endraw %}` | Pull in a partial |
| `{% raw %}{% extend "base.html" %} + {% block main %} … {% endblock %}{% endraw %}` | Inheritance and overrides |
| `{% raw %}{% raw %} … {% endraw %}{% endraw %}` | Verbatim output, not parsed |
| `{% raw %}{# comment #}{% endraw %}` | Comment, absent from the output |

## Output and escaping

```html
<h1>{{ page.title }}</h1>
<div class="prose">{{ content | safe }}</div>
```

`{% raw %}{{ }}{% endraw %}` escapes `& < > " '` by default, so ordinary fields need no ceremony. Body HTML **must** use `| safe` — otherwise the whole article turns into a pile of literal tags.

Undefined variables **do not throw**; they render as an empty string. That rule runs through the whole engine: `{% raw %}{{ site.author }}{% endraw %}` is quietly empty when `author` is unset and never breaks a build. Property access behaves the same way — at compile time the dot is rewritten into an **optional chain**, so `{% raw %}{{ page.data.prev.title }}{% endraw %}` yields `undefined` instead of `TypeError` when `prev` is missing.

## Filters

| Filter | Effect |
| --- | --- |
| `safe` | Turn off HTML escaping; required for body HTML |
| `length` | Length: array items / object keys / string characters |
| `upper` | Upper case |
| `lower` | Lower case |
| `trim` | Trim surrounding whitespace |
| `json` | Serialise to a JSON string |
| `default` | Fallback for empty values |

Filters chain with the pipe, left to right:

```html
{{ page.title | trim | upper }}
{{ item.date | default("undated") }}
{{ content | safe }}
```

A misspelled filter **fails at compile time** and lists what is available — it does not silently output nothing. That is deliberate: `| saft` silently escaping an entire page is harder to debug than a failed build.

## Conditionals

```html
{% if page.url == '/' %}
  <h1>{{ site.title }}</h1>
{% elif page.description %}
  <h1>{{ page.title }}</h1>
  <p class="lead">{{ page.description }}</p>
{% else %}
  <h1>{{ page.title }}</h1>
{% endif %}
```

Expressions support `and` / `or` / `not` (translated to `&&` / `||` / `!` at compile time), comparisons, member access and indexing, and ordinary JavaScript arithmetic. Ternary expressions are written with plain JS syntax.

## Loops

```html
<ul>
{% for post in site.posts %}
  <li><a href="{{ post.url }}">{{ post.title }}</a>
    <span>{{ post.date }}</span>
  </li>
{% endfor %}
</ul>
```

The `loop` object inside a loop:

| Property | Meaning |
| --- | --- |
| `loop.index` | Current index, 1-based |
| `loop.index0` | Current index, 0-based |
| `loop.first` | Is this the first item |
| `loop.last` | Is this the last item |
| `loop.length` | Total items |
| `loop.revindex` | Reverse index |

Empty lists can be handled with `else`:

```html
{% for post in site.posts %}
  <a href="{{ post.url }}">{{ post.title }}</a>
{% else %}
  <p>No posts yet.</p>
{% endfor %}
```

Iteration is lenient: `null` / `undefined` count as empty arrays, strings iterate by character, and **plain objects iterate as `{ key, value }` entries** — so you can loop an object without converting it first.

A loop variable referenced outside its loop is `undefined`, not a `ReferenceError`.

## Assignment

```html
{% set count = site.posts | length %}
<p>{{ count }} posts</p>
```

`set` writes into the template scope, so reassignment works and values set inside `if` / `for` can be read afterwards.

## include

```html
{% include "partials/toc.html" %}
```

Paths resolve in the order `layouts/` → `partials/` → theme root, so `include "toc.html"` also finds `partials/toc.html`. Partials share the caller's context and can include further partials (the same environment is reused recursively).

A missing template raises a clear error: `[xfm] template not found: xxx (theme: <path>)`.

## extend and block

A child template declares its parent and overrides regions by block name:

```html
{% extend "base.html" %}

{% block main %}
<article>
  <h1>{{ page.title }}</h1>
  <div class="prose">{{ content | safe }}</div>
</article>
{% endblock %}
```

The matching spot in `base.html`:

```html
<main>
  {% block main %}{{ content | safe }}{% endblock %}
</main>
```

Conventions worth remembering:

- Inheritance is **concatenation at build time** — `extend` chains are resolved up front, with no runtime cost;
- Only same-named blocks are replaced; everything else in the parent stays;
- If the parent has **no** block of that name, the child's content is appended at the end — a typo in a block name does not error, it just lands in the wrong place, so check the parent's block list first;
- Nested blocks and `super()` are not supported;
- Inheritance depth is capped at 10 levels.

## raw and comments

To emit template syntax verbatim, wrap it in a pair of tags — nothing between them is parsed:

| Position | Tag |
| --- | --- |
| Open | `{% raw %}{% raw %}{% endraw %}` |
| Close | `{% raw %}{% endraw %}{% endraw %}` |

Comments are hash-wrapped tags and never reach the output:

{% raw %}{# this is a comment, invisible in the output #}{% endraw %}

When you need to *show* template syntax — as on this page — `raw` is the only reliable tool; every template sample here uses it.

## Template context

Every render receives the same top-level keys:

| Key | Contents |
| --- | --- |
| `site` | Site config plus aggregate data (below) |
| `page` | Metadata for the current page |
| `content` | Body HTML |
| `headings` | Headings of this page, each `{ level, text, id }` |
| `pagination` | Pagination info, list pages only |

What `site` exposes:

| Key | Contents |
| --- | --- |
| `site.title` / `site.description` / `site.lang` / `site.author` | From the config; your own keys are visible too |
| `site.base` | Normalised sub-path |
| `site.assets` | Asset prefix, default `/assets/` |
| `site.nav` | Nav item array |
| `site.pages` | All content pages (no taxonomy or pagination pages) |
| `site.posts` | Posts (home page, `type: page` and undated pages excluded) |
| `site.tags` | Tag array, each `{ name, url, count? }` |
| `site.categories` | Category array, same shape |
| `site.series` | Series array, same shape |
| `site.navGroups` | Sidebar groups, each `{ title, items: [{ title, url }] }` |

What `page` exposes:

| Key | Contents |
| --- | --- |
| `page.url` / `page.title` / `page.description` | Basic metadata |
| `page.date` / `page.updated` | Pre-formatted date strings |
| `page.tags` / `page.category` / `page.series` | Taxonomy |
| `page.weight` / `page.layout` | Sort weight and layout name |
| `page.data` | Raw front-matter, including injected `prev` / `next` / `related` |
| `page.excerpt` / `page.readTime` | Summary and reading time in minutes |
| `page.toc` | Headings of this page |

`page.data` is the most useful layer: cross-page data written by plugins hangs off it (`related` recommendations, `prev` / `next`), ready to loop over.

## A complete layout

```html
<!DOCTYPE html>
<html lang="{{ site.lang }}">
<head>
  <meta charset="utf-8">
  <title>{{ page.title }} · {{ site.title }}</title>
  <meta name="description" content="{{ page.description | default(site.description) }}">
  <link rel="stylesheet" href="{{ site.assets }}style.css">
</head>
<body>
  <header>
    <a href="/">{{ site.title }}</a>
    <nav>{% for item in site.nav %}<a href="{{ item.url }}">{{ item.title }}</a>{% endfor %}</nav>
  </header>
  <main>{% block main %}{{ content | safe }}{% endblock %}</main>
</body>
</html>
```

Note that root-absolute paths such as `href="/"` are fine: `site.base` is prefixed **once, at the render exit**, covering templates, Markdown links and hand-written HTML alike. Templates never need to know whether the site is deployed at the root or under a sub-path.
