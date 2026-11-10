---
mode: docs

title: Install and upgrade
date: 2026-11-10 22:42:00
updated: 2026-11-10 22:42:00
description: Three ways to install xfmpress (global, npx, project dependency), environment requirements, fixing permission errors and missing commands, upgrading, uninstalling, and troubleshooting.
keywords: [xfmpress, install, npm install, npx, EACCES, Node version, upgrade, uninstall]
order: 102
---

# Install and upgrade

[Chinese version](/docs/xfmpress/install/) · **English**

xfm has **zero runtime dependencies**: nothing third-party is downloaded, so there is no dependency tree to conflict and no chain of transitive advisories in `npm audit`. Installation is a single download.

## Requirements

| Item | Requirement | Check |
| --- | --- | --- |
| Node.js | **18 or newer** (22 LTS recommended) | `node -v` |
| npm | Ships with Node, 9+ recommended | `npm -v` |

```console
$ node -v
v22.11.0
$ npm -v
10.9.0
```

On an older Node, npm fails with `EBADENGINE` and refuses to install. Switch with [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm):

```bash
nvm install 22 && nvm use 22
```

## Three ways to install

### Option A: global install

Closest to the Hexo habit — install once, run `xfm` anywhere:

```bash
npm install -g xfmpress
xfm --help          # the ⚡ xfm v0.4.8 banner means success
```

### Option B: run without installing

For a quick look, or a one-off build in CI:

```bash
npx xfmpress --help
npx xfmpress create my-blog --template=blog
```

`npx` downloads into a temporary cache and runs from there, leaving no global command behind. The trade-off is a possible network round-trip before each run.

### Option C: project dependency

The right choice for teams and CI — pin the version in `package.json` so everyone gets an identical generator:

```bash
mkdir my-blog && cd my-blog
npm init -y
npm i -D xfmpress
```

Then add scripts:

```json
{
  "scripts": {
    "dev": "xfm dev",
    "build": "xfm build",
    "new": "xfm new",
    "clean": "xfm clean"
  }
}
```

Use `npm run dev` / `npm run build` from then on; `npx xfmpress info` still works for one-offs.

{% note warning One limitation of option C %}
You cannot scaffold a site with option C inside an **empty directory** — there is no `node_modules` yet, so `xfm create` is not available. Scaffold with option A or B first, then `npm i -D xfmpress` inside the site to switch to a local dependency.
{% endnote %}

## Fixing permission errors

With a system-installed Node on macOS / Linux, `npm i -g` often fails with `EACCES: permission denied`. **Do not use `sudo`** — it leaves global packages owned by root, which makes later upgrades and removals worse. Two proper fixes:

```bash
# Fix 1: move the global prefix into your home directory
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc   # ~/.bashrc for bash
source ~/.zshrc

# Fix 2: manage Node with nvm / fnm
# their global packages already live in your home directory
```

## Verifying the install

```bash
xfm --version     # 0.4.8
xfm --help        # every command and option
```

Run `xfm info` inside a site to see the resolved configuration — theme, content directory, output directory, loaded plugins, Node version and core count:

```console
$ xfm info

  ⚡ xfm info

  Site      XFM Notes
  Theme     themes/default
  Content   content
  Output    dist
  Config    xfm.config.mjs
  Plugins   sitemap, rss, search, seo, related, minify (auto)
  Node      v22.11.0  (8 cores)
```

Plugins marked "auto" were discovered in the site's `package.json`; the others are declared explicitly in the config.

## Upgrading

```bash
npm i -g xfmpress@latest     # global
npm i -D xfmpress@latest     # project
```

Clear the cache afterwards so old output and the new engine do not mix:

```bash
xfm clean && xfm build
```

The versioning rule is unusual: **the patch digit rolls from `0.4.0` to `0.4.99`, then bumps to `0.5.0`**. A minor bump therefore means "one round of work is finished", not "new features". Read `CHANGELOG.md` to decide whether to upgrade.

## Uninstalling

```bash
npm uninstall -g xfmpress     # global
npm uninstall xfmpress        # project
```

`dist/` and `.xfm/` are output and cache and can be deleted with the generator; `content/` and `xfm.config.mjs` are your assets and have nothing to do with it.

## Troubleshooting

**`xfm: command not found`**
The global npm bin directory is not on `PATH`. Run `npm config get prefix`, then add its `bin` subdirectory (`%APPDATA%\npm` on Windows) to `PATH`. With nvm, opening a new terminal usually fixes it.

**Windows says the command is not recognized**
Open a fresh Git Bash or PowerShell window first; if that fails, check that `%APPDATA%\npm` is in `Path`.

**`node -v` is below 18**
Upgrade Node, then reinstall: `npm i -g xfmpress --force`.

**A plugin is installed but the build ignores it**
Plugins are resolved at startup — restart `xfm dev` if it is running. Also confirm the plugin is installed in the **site** directory, not globally.

**`xfm new` created a post that never shows up**
Most likely `draft: true`. Set it to `false` or delete the line, then run `xfm build` again.

**A build error starting with `[xfm]`**
That is an error the engine raised deliberately, with a fix attached (a declared plugin that is not installed, for example). No stack trace — just follow the hint.
