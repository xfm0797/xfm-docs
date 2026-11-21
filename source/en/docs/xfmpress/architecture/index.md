---
mode: docs

title: Architecture and performance
date: 2026-11-10 22:58:00
updated: 2026-11-21 20:30:00
description: How xfmpress works inside — the four build stages, a linear Markdown engine, templates compiled at build time, worker-pool calibration and load balancing, the incremental cache key, and how to read the benchmarks.
keywords: [xfmpress, architecture, performance, pipeline, worker pool, incremental cache, Markdown engine, benchmarks]
order: 110
---

# Architecture and performance

[Chinese version](/docs/xfmpress/architecture/) · **English**

This chapter is about *why it is fast* and where the cost of that speed lands. If you only want to use the tool, the previous nine chapters are enough; if you want to change the core or judge whether a bottleneck can be optimised, this is the evidence.

## Four stages

A build runs in four stages, and the timing report uses the same split:

| Stage | What happens | 1000 pages |
| --- | --- | --- |
| Scan and parse | Parallel directory walk, parallel reads, front-matter parsing | ~690 ms |
| Hash | Compute each page's cache key | ~15 ms |
| Render | Markdown → HTML → template (parallelisable) | ~510 ms |
| Write (cold) | Create directories, write files | ~2600 ms |
| Write (repeat) | Compare content, write only what changed | ~900 ms |

Writing is still the largest block: 1000 `mkdir` calls cost ~1.1 s and flushing 1000 pages ~1.5 s, bounded by filesystem metadata operations, especially on Windows / NTFS. **The only ways to speed it up are writing less or building elsewhere** — a faster renderer would change nothing.

Scan + hash + render add up to under 1.3 s — that is the generator's own overhead. The rest of the time lives in the filesystem, which is why v0.4.13 optimises for writing less rather than writing faster.

## The Markdown engine: no AST

The usual design is "parse to an AST → transform → serialise", general but with a walk at every layer. xfm chooses a **linear scan**: block level advances line by line, inline level uses single-pass regexes, and HTML strings come out directly.

The cost is limited extensibility (you cannot insert arbitrary node types); the gain is two full traversals and a heap of object allocations avoided. The supported block elements cover technical writing: headings, paragraphs, lists, quotes, tables, fenced code, rules, task lists, footnotes, callouts.

A few implementation details worth knowing:

- **Inline handled in one pass**: bold, italic, code, links and strikethrough are recognised in a single scan, avoiding the nesting bugs that repeated `replace` calls cause.
- **Anchors come for free**: generating a heading `id` also collects `{ level, text, id }` into `headings`, so the right-hand outline never re-parses the HTML. Non-Latin headings get readable anchors, and duplicates are numbered.
- **Excerpts are separate**: the summary and reading time list pages need are produced during the scan with lightweight regexes rather than a full parse — so list pages never wait on rendering.
- **Highlighting is built in**: language aliases are normalised, unknown languages degrade to escaped text, and no third-party highlighter is involved.

## Templates: compiled into functions

Templates are not interpreted per render. The first use compiles one into a JS function; afterwards it is string concatenation.

```text
template source → lexer (output / statement / comment tags) → function body → new Function
```

Variable lookup wraps the body in `with(scope)` plus a `Proxy` `has` trap: names present in scope resolve there, JS built-ins (`Math`, `JSON`, `console`) fall back to the real scope, and undefined names yield `undefined` instead of a `ReferenceError`.

This solves a practical problem: `{% raw %}{{ page.data.prev.title }}{% endraw %}` must not crash a build when there is no previous page. The mechanism is not try/catch (which costs at runtime) but a compile-time rewrite of member access into **optional chains** — `page?.data?.prev?.title` — native syntax, zero overhead.

Compiled output is cached per template path and recompiled only when the source changes; dev-mode template edits take effect immediately thanks to an mtime comparison.

## The worker pool

Workers start once the page count reaches `workerThreshold` (default 40), with one more condition: **no `markdown` hook is registered**.

How concurrency is chosen:

```text
explicit workers →  min(tasks, workers, 32)
otherwise        →  min(tasks, min(cores, 4), ceil(total source bytes / 300KB))
```

The two constraints address two kinds of waste:

- **Cores capped at 4**: starting a worker and cloning the context costs 30–60 ms each, so eight threads on an eight-core machine spend the parallel win on startup;
- **At least 300 KB of source per thread**: below that, threads are slower than the main thread.

Load balancing is "greedy bin packing by size": tasks are sorted by source length descending and dropped into whichever bucket currently holds the least. That tracks real cost far better than splitting by page count — a 3000-line document and a 50-line note differ by orders of magnitude.

Only necessary data crosses thread boundaries: the site context is serialised once, templates are precompiled during `init`, and each task carries only the fields its render needs. Results come back as `{ key, html, bodyHtml }`.

## One implementation, two threads

An early version reimplemented "parse front-matter → render Markdown → assemble context" inside the worker, and the two copies drifted: the same source produced different output below and above 40 pages.

- Relative `.md` links were only rewritten on the main thread;
- Dates went through UTC in one place and string slicing in the other;
- `page.data.prev` / `next` existed only on the main thread;
- Reading time was always 0 in workers, so list pages never showed it.

The fix was to extract the pipeline into `render.js` and have both the main thread and workers call it — **the only difference left is the thread boundary**. Output is now byte-identical regardless of page count.

This is also why `transformHtml` runs on the main thread: workers handle Markdown and templates, and output-level post-processing (SEO injection, minification) happens once, after results return, instead of serialising plugins into threads.

## What the cache key contains

The key hashes six concatenated parts:

```text
layout | theme fingerprint | config fingerprint | source text | list summary | related posts
```

The theme fingerprint hashes every file under `layouts/` and `partials/`; the config fingerprint covers only render-affecting fields (`theme`, `site`, `defaults`, `markdown`, `collections`) plus two wholesale inputs: the **merged value of the `data/` files** (changing any data file invalidates every page's cache — templates may reference `site.data` anywhere) and the plugin fingerprint.

The last two parts were bug fixes: a home page whose body never changes still changes when posts are added, so list-like pages mix in a summary of the post list (url + title + date + excerpt); related posts are cross-page data written by plugins in `afterCollect`, and without them, retagging one post would leave stale recommendations elsewhere.

Caching skips rendering; writing still happens — a hit takes the HTML from the cache and writes it. The write phase, however, compares first: **a file that matches the existing output byte for byte is neither rewritten nor re-`mkdir`ed**, so `dist/` stays complete while the most expensive part of a repeat build disappears.

## Two premises behind the write phase

Before v0.4.13 a repeat build wrote as slowly as a cold one, because it did two unnecessary things. Both rest on one easily missed fact: **an empty directory cannot exist inside `dist/`**.

- **Where empty directories come from**: a directory only becomes empty because a file inside it was deleted. So stale-output cleanup (`pruneStale`) does not need to try `rmdir` on everything each time — it runs only when this build actually deleted a file, and only over the ancestors of those files (deepest first, **sequentially**). It used to be 1,000 failing `rmdir` calls, about 3 s on NTFS. Sequential is not a style choice: directory removal once ran under `Promise.all`, so a parent could be removed before its children and fail with `ENOTEMPTY` (the error is swallowed), leaving empty directories behind — fixed in v0.4.14; the race reproduced 5 times in 30 concurrent runs, and 0 times in 36 after the fix.
- **Identical files need no rewrite**: every build used to flush all pages (~1.5 s) and `mkdir` their directories (~1.1 s) regardless of whether the bytes changed. Output is now compared per file (size, then content) and skipped on a match; a skipped file needs no directory either. Assets use a different rule — leave it alone when the size matches and the destination is not older than the source — so large images are never read.

The comparison is not free: `stat` plus one read is ~0.8 s, still under a third of the rewrite cost, so the trade is clearly worth it.

## Reading the benchmarks

```bash
npm run bench
```

The output is per-stage, not a single score. Four things to keep in mind:

1. **Read cold and repeat builds separately.** `bench.js` already reports them as two entries: cold removes `dist/` first (≈5–6.5 s for 1000 pages), repeat leaves the output mostly unchanged (≈2.8–2.9 s). Mixing both into one median hides the write-phase gain and tells you nothing about real deploy time.
2. **The write share is environment-specific.** The same code might write in 800 ms on Linux + SSD and 2600 ms on Windows + NTFS — a cold build differs by more than 2×, while parse and render barely move.
3. **"1 ms" for a cache hit** means the render stage was skipped; the build still scans and writes. The write is no longer unavoidable in full, though: a repeat build skips most files because their content matches.
4. **More workers is not faster.** 2–4 is usually optimal in the bench; eight is slower, for the startup reasons above.

## Tests

```bash
npm test     # 164 cases, zero dependencies
```

Tests run real site builds and compare output fragments — covering Markdown edges (nested and loose lists, lazy continuation, block content inside list items, footnote back-links and indentation, link-definition placement), template compilation (undefined variables, optional chains, filter errors), URLs and base prefixes, cache invalidation conditions, repeat builds skipping writes, stale-output and empty-directory cleanup after deletions, CLI guards (non-site, BOM, scaffold conflicts, `--dir` escapes), plugin loading and hook order. No test framework is involved, so `node test/run.js` runs on any Node ≥ 18.

## Design trade-offs

| Choice | What it gives up |
| --- | --- |
| Zero runtime dependencies | Cannot reuse remark / unified ecosystem plugins |
| No AST | No arbitrary syntax extensions or structural transforms |
| Compiled templates | Template expressions are limited to JS syntax; no custom DSL |
| Plugins split out of the core | New users must install a handful of plugins for common features |
| Linear Markdown | Extreme edge cases (deeply nested quotes) may be less rigorous than mature implementations |

All of these point at one goal: **predictable build time and install size**. Choosing xfmpress means accepting that boundary.
