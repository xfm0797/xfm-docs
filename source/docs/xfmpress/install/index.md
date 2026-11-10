---
mode: docs

title: 安装与升级
date: 2026-11-10 21:35:00
updated: 2026-11-10 22:30:00
description: xfmpress 的三种安装方式（全局、npx 免安装、项目内依赖）、环境要求、权限报错与命令找不到的处理、升级与卸载，以及常见安装问题排查。
keywords: [xfmpress, 安装, npm install, npx, EACCES, Node 版本, 升级, 卸载]
order: 22
---

# 安装与升级

**中文** · [English version](/en/docs/xfmpress/install/)

xfm 是**零运行时依赖**的包：安装时不会拉取任何第三方代码，因此不会出现依赖树冲突，也不会在 `npm audit` 里报一串间接依赖的漏洞。整个安装过程只有一次下载。

## 环境要求

| 项目 | 要求 | 检查命令 |
| --- | --- | --- |
| Node.js | **18 或更高**（推荐 22 LTS） | `node -v` |
| npm | 随 Node 附带，建议 ≥ 9 | `npm -v` |

```console
$ node -v
v22.11.0
$ npm -v
10.9.0
```

版本过低时 npm 会报 `EBADENGINE` 并拒绝安装。用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 切换即可：

```bash
nvm install 22 && nvm use 22
```

## 三种安装方式

### 方式 A：全局安装

最接近 Hexo 的使用习惯，装一次，任何目录都能用 `xfm`：

```bash
npm install -g xfmpress
xfm --help          # 看到 ⚡ xfm v0.4.8 的横幅即成功
```

### 方式 B：免安装试用

只想先看看，或者 CI 里一次性构建：

```bash
npx xfmpress --help
npx xfmpress create my-blog --template=blog
```

`npx` 会下载到临时缓存后执行，不在系统里留下全局命令。缺点是每次执行前可能有一次版本检查的网络往返。

### 方式 C：项目内依赖

团队协作与 CI 的首选 —— 把版本写进 `package.json`，任何人 `npm install` 后拿到完全一致的生成器：

```bash
mkdir my-blog && cd my-blog
npm init -y
npm i -D xfmpress
```

再补上脚本：

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

之后用 `npm run dev` / `npm run build`；临时调用可以 `npx xfmpress info`。

{% note warning 方式 C 有个限制 %}
在**空目录**里没法用方式 C 建站 —— 那时还没有 `node_modules`，`xfm create` 还不存在。推荐先用方式 A 或 B 生成脚手架，再进目录 `npm i -D xfmpress` 转成本地依赖。
{% endnote %}

## 权限报错怎么办

macOS / Linux 上用系统 Node 时，`npm i -g` 常报 `EACCES: permission denied`。**不要用 `sudo`** —— 那会让全局包归属于 root，后续升级与卸载更容易卡住。两种正规解法：

```bash
# 解法 1：把全局前缀改到用户目录
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc   # bash 用户改成 ~/.bashrc
source ~/.zshrc

# 解法 2：用 nvm / fnm 管理 Node
# 这类工具的全局包天然落在用户目录，无需额外配置
```

## 验证安装

```bash
xfm --version     # 0.4.8
xfm --help        # 完整命令与选项
```

在站点目录里跑 `xfm info`，可以看到解析后的真实配置 —— 主题、内容目录、输出目录、加载的插件、Node 版本与核数：

```console
$ xfm info

  ⚡ xfm info

  站点      XFM Notes
  主题      themes/default
  内容目录  content
  输出目录  dist
  配置文件  xfm.config.mjs
  插件      sitemap, rss, search, seo, related, minify（自动）
  Node      v22.11.0  (8 核)
```

插件后面标「自动」的，是从站点 `package.json` 依赖里扫出来的；没标注的是在配置里显式声明的。

## 升级

```bash
npm i -g xfmpress@latest     # 全局
npm i -D xfmpress@latest     # 项目内
```

升级后建议顺手清一次缓存，避免旧产物与新引擎混在一起：

```bash
xfm clean && xfm build
```

版本号规则比较特别：**补丁位从 `0.4.0` 滚到 `0.4.99`，再升 `0.5.0`**。也就是说 minor 号代表「一轮功能迭代的结束」，而不是「有新功能」。判断能不能升，看 `CHANGELOG.md` 比看版本号更靠谱。

## 卸载

```bash
npm uninstall -g xfmpress     # 全局
npm uninstall xfmpress        # 项目内
```

站点目录里的 `dist/`、`.xfm/` 是产物与缓存，卸载生成器后可以一并删除；`content/` 与 `xfm.config.mjs` 是你的资产，与生成器无关。

## 常见问题

**`xfm: command not found`**
全局 npm 的 bin 目录不在 `PATH` 里。用 `npm config get prefix` 查出前缀，把其下的 `bin`（Windows 是 `%APPDATA%\npm`）加进 `PATH`。用 nvm 的话重开一个终端通常就能解决。

**Windows 提示「不是内部或外部命令」**
先在 Git Bash 或 PowerShell 里重开终端；仍不行就检查 `%APPDATA%\npm` 是否在 `Path` 中。

**`node -v` 低于 18**
升级 Node 后重装：`npm i -g xfmpress --force`。

**装了插件但构建时没生效**
插件在启动时解析，`xfm dev` 正在运行的话需要重启；同时确认插件装在了**站点目录**里，而不是全局。

**`xfm new` 建了文章，页面上却没有**
大概率是 `draft: true`。把它改成 `false` 或删掉该行，重新 `xfm build`。

**构建报 `[xfm]` 开头的错误**
这是引擎主动抛出的、带修复指引的错误（例如配置里声明了插件但没装）。这类错误不会打印调用栈，按提示操作即可。
