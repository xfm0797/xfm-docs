---
mode: docs

title: Build and deploy
date: 2026-11-10 22:56:00
updated: 2026-11-10 22:56:00
description: xfmpress output structure and incremental caching, sub-path deployment with site.base, configuration for GitHub Pages / Netlify / Vercel / Nginx / object storage, and a pre-flight checklist.
keywords: [xfmpress, build, incremental cache, deploy, GitHub Pages, Netlify, Nginx, base, CI]
order: 109
---

# Build and deploy

[Chinese version](/docs/xfmpress/deploy/) · **English**

`xfm build` produces **plain static files**: no Node runtime, no server-side rendering, no process to babysit. That makes hosting cheap — a CDN, an object store, GitHub Pages all work as-is.

## Output structure

```text
dist/
├── index.html
├── about/index.html
├── posts/hello/index.html
├── page/2/index.html          # pagination
├── tags/Node.js/index.html    # tag page
├── categories/Engineering/index.html
├── series/Static site generators/index.html
├── categories/index.html      # category index (when the theme has the layout)
├── archives/index.html        # yearly archive (same)
├── assets/                    # theme assets
│   ├── style.css
│   └── ux.js
├── sitemap.xml                # from here on: plugin output
├── robots.txt
├── feed.xml
└── search.json
```

Pages are **directory + `index.html`**, so every URL is a clean `/<path>/` — no server rewrite to `.html` needed.

Three kinds of non-content pages are worth telling apart:

| Kind | Source | In the post list |
| --- | --- | --- |
| Taxonomy page | One per tag / category / series | No |
| Pagination page | `/page/2/`, `/page/3/` | No |
| Index page | Category index and archive | No |

None of them join the `prev` / `next` chain or the feed — otherwise "previous page" would land on an archive listing.

## Incremental cache

The cache lives at `.xfm/cache.json` in the site root, one `{ hash, html, bodyHtml }` entry per page.

A page's hash combines six parts:

```text
layout | theme fingerprint | config fingerprint | source text | list summary | related posts
```

| Part | Why it is in there |
| --- | --- |
| Source text | Editing the body must re-render |
| Theme fingerprint | Any change under `layouts/` or `partials/` invalidates everything |
| Config fingerprint | Site title, nav, `defaults`, markdown options — same |
| Layout name | Switching layouts obviously re-renders |
| List summary | The home page body does not change when posts are added, but its list does |
| Related posts | Editing another post's tags changes this page's recommendations |

The last two are the easy misses: early incremental builds served a stale home list after adding a post, and stale recommendations after retagging. Folding them into the hash made both disappear.

Caching only affects **rendering**, not writing: a cache hit still writes its file (taking the HTML from the cache), so `dist/` is always complete.

```bash
xfm build          # production build, incremental by default
xfm build --dev    # incremental in dev mode too (useful with repeated builds)
xfm clean          # delete dist and .xfm, start over
```

Caching `.xfm/` in CI shortens builds noticeably; note that touching the theme invalidates the whole cache by design, not by bug.

## Sub-path deployment

When the site lives at `https://example.com/blog/`, set `site.base` to `'/blog/'`:

```js
export default {
  site: { base: '/blog/', url: 'https://example.com' },
};
```

The prefix is applied **once, at the render exit**, covering three sources:

- `href="/about/"` in a template;
- `[link](/about/)` in Markdown;
- raw HTML you wrote by hand.

`site.base` also reaches sitemap / feed URLs and the links inside `search.json`. `xfm dev` serves the same prefix — the local URL becomes `http://127.0.0.1:4173/blog/`, so "works locally, 404 in production" surfaces during development.

Internally everything uses bare URLs without the base; disk paths and cache keys ignore it, so changing `base` does not invalidate the cache.

## GitHub Pages

A project site (`https://<user>.github.io/<repo>/`) is a sub-path; inject it from the workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Resolve base and url
        run: |
          repo="${{ github.event.repository.name }}"
          owner="${{ github.repository_owner }}"
          if [ "$repo" = "$owner.github.io" ]; then
            echo "SITE_BASE=/" >> "$GITHUB_ENV"
            echo "SITE_URL=https://$owner.github.io" >> "$GITHUB_ENV"
          else
            echo "SITE_BASE=/$repo/" >> "$GITHUB_ENV"
            echo "SITE_URL=https://$owner.github.io/$repo" >> "$GITHUB_ENV"
          fi

      - run: npm ci
      - run: npx xfm build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

On first use, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

Note `cancel-in-progress: false`: Pages allows one deployment at a time, and cancelling a running one leaves half a deployment behind — so queue instead of interrupt.

A user site (the `<user>.github.io` repository) uses base `/`; the script above already distinguishes the two.

## Netlify and Vercel

Build command `npx xfm build`, publish directory `dist`. Both deploy at the domain root by default, so `site.base` stays `'/'`.

Netlify's `netlify.toml`:

```toml
[build]
  command = "npx xfm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

Vercel takes the same two values in project settings, or a `vercel.json`:

```json
{
  "buildCommand": "npx xfm build",
  "outputDirectory": "dist"
}
```

Both bring a CDN and HTTPS, so no cache headers are required. Hashed file names only exist under `assets/`; if you care, give `assets/*` a long TTL and `*.html` a `no-cache`.

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/my-site/dist;

    # directory URLs resolve to index.html
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # long cache for assets (use no-cache if names never change)
    location /assets/ {
        expires 7d;
        add_header Cache-Control "public";
    }

    error_page 404 /404.html;
}
```

The important line is `try_files`: pages are directories, so `/about/` has to reach `about/index.html`. Without it you get a pile of 404s.

## Object storage

Upload `dist/` as a whole. The one thing to watch is directory indexing: S3 / OSS / COS need "static website hosting" enabled with `index.html` as the index document, otherwise `/about/` returns `403` or `404`.

Upload in two batches:

1. `assets/` (hashed or rarely changing) → long cache;
2. `*.html`, `*.xml`, `*.json` → short cache or `no-cache`.

## Pre-flight checklist

| Check | How |
| --- | --- |
| `site.url` is set | Otherwise the sitemap has relative `<loc>` and crawlers ignore it |
| Home page title is right | Open `/` and look at `<title>` |
| Sub-path works | Under a sub-path, both `/blog/` and `/blog/about/` open |
| Assets return 200 | DevTools network tab, `assets/style.css` |
| Sitemap count is right | `grep -c "<loc>" dist/sitemap.xml` |
| No drafts leaked | Search the built output for draft titles |
| Zero dead links | Install `deadlinks` with `strict: true` |
| 404 page exists | Visit a made-up URL and see the custom page |

## Troubleshooting

**Pages load but all styling is gone**
Almost always `site.base` disagreeing with the deployment path. Under a sub-path, `base` needs both slashes: `'/blog/'`, not `'blog'` (the engine corrects it, but do not rely on that).

**Home page fine, refreshing a sub-page 404s**
The static server's directory indexing is misconfigured. On Nginx look at `try_files`; on object storage at the index-document setting.

**Template edited, output unchanged**
`xfm dev` caches templates by mtime and normally recompiles on save; if it really does not, `xfm clean` and rebuild. For production builds, check whether CI restored `.xfm/cache.json` from a previous commit without invalidating it on template changes — the theme fingerprint handles that unless the cache is reused across branches.

**Builds are slow and dominated by writes**
At a thousand pages, writing is the bottleneck on Windows / NTFS and no generator can optimise it away. Build on Linux, or produce less output.

**Non-ASCII paths 404 on directory URLs**
Percent-encoded names are decoded when written to disk, so the server sees UTF-8 paths. If a reverse proxy or object store handles encoding differently, check its URL-decoding settings before blaming `site.url`.
