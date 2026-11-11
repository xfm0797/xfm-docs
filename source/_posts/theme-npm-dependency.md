---
title: 主题不再走 git submodule：改成 npm 依赖后，克隆少一步
date: 2026-11-11 22:25:00
updated: 2026-11-11 22:25:00
categories: [更新日志]
tags: [Hexo, 主题, npm, 工程化]
mode: notes
description: 本站把主题的引入方式从 git submodule 换成 npm 依赖：克隆不用再带 --recurse-submodules，构建机也不用有主题仓库的拉取权限。记录为什么换、Hexo 8 的目录回退机制，以及三个容易踩的点。
---

站点从建站起就用 `git submodule` 引主题，理由很实在：主题源码在独立仓库，站点不该再存一份。这套做法跑了两个月，昨天还是换掉了。

换完最直观的差别是这句话——克隆**不用再带 `--recurse-submodules`**。

<!-- more -->

## 一、两个方案其实都在锁版本

先把话说清楚：submodule 和 npm 依赖解决的是同一个问题，只是锁的东西不一样。

| 维度 | git submodule | npm 依赖 |
| --- | --- | --- |
| 锁什么 | 上游某次提交（gitlink） | 某个已发布的版本号 |
| 克隆 | 要带 `--recurse-submodules`，漏了就构建报错 | `npm install` 一步 |
| 构建机权限 | 需要能拉主题仓库（私有仓库还得配 key） | 只需能访问 npm registry |
| 升级方式 | `submodule update --remote` 再提交 gitlink | 改版本号 + `npm install` |
| 能否指向未发布提交 | 能，任意 commit 都行 | 不能，必须是已发布版本 |
| 版本可见性 | 得看 gitlink 才知道 | `package.json` 里直接写着 |

最后两行是 submodule 的真正优势，也是我一直没换的原因：主题在开发期经常想「先指到某个提交试一下」，npm 得等发版。但开发期结束、进入稳定维护之后，这个优势就没用了——反而每次克隆、每台构建机都要为它付成本。

## 二、Hexo 8 原生支持 node_modules 里的主题

真正让我下决心的是翻了一眼 Hexo 源码，主题目录的解析比想象中宽松（`node_modules/hexo/dist/hexo/load_config.js`）：

```js
const themeDirFromThemes = join(baseDir, 'themes', theme);
const themeDirFromNodeModules = join(ctx.plugin_dir, 'hexo-theme-' + theme);
// themeDirFromThemes 优先，找不到才回退 node_modules
if (await exists(themeDirFromThemes)) {
  ctx.theme_dir = themeDirFromThemes;
} else if (await exists(themeDirFromNodeModules)) {
  ctx.theme_dir = themeDirFromNodeModules;
}
```

两条规则值得记住：

1. **`themes/<name>` 优先**。目录存在就用它，不会去 node_modules 找。
2. **回退时自动补前缀 `hexo-theme-`**。配置里写 `theme: xfm`，找的是 `node_modules/hexo-theme-xfm`。

本站刚好对得上：主题包名就是 `hexo-theme-xfm`。所以 `_config.yml` 的 `theme: xfm` **一行都不用改**，删掉 `themes/xfm` 就会自动走 npm 版。

实跑确认了一下加载路径：

```text
theme      : xfm
theme_dir  : E:\my-work\hexo-theme-xfm-site\node_modules\hexo-theme-xfm\
脚本目录   : E:\my-work\hexo-theme-xfm-site\node_modules\hexo-theme-xfm\scripts\
```

主题的 `scripts/`（生成器与 helper）也一起从那里加载，和放在 `themes/` 下没有区别。

## 三、动手只有四步

```bash
# 1. 备份（submodule 一拆，文件就没了）
cp -r themes/xfm /tmp/xfm-theme-backup

# 2. 拆掉 submodule 登记
git submodule deinit -f themes/xfm
git rm -f --cached themes/xfm
rm -rf themes/xfm .gitmodules .git/modules/themes

# 3. 装成依赖，锁精确版本
npm install hexo-theme-xfm@1.4.1 --save-exact

# 4. 必须全量重建
npx hexo clean && npx hexo generate
```

第 3 步用了 `--save-exact`，`package.json` 里写的是 `"hexo-theme-xfm": "1.4.1"` 而不是 `^1.4.1`。理由和锁 submodule 一样：站点要的是可复现，不是「自动拿最新」。

## 四、三个容易踩的点

**① 不要再手动建 `themes/xfm` 目录。** 因为它优先级更高，一旦存在就把 npm 版盖掉了。症状很迷惑：明明改了版本号、也跑了 `npm install`，构建出来还是旧主题。真要为某个提交临时改主题，就把目录建回来，但记得它不是版本管理的一部分。

**② 换完必须 `hexo clean`。** Hexo 有增量构建，`public/` 里已经生成的页面不会因为主题换位置就重渲。少了这一步，你会得到一份「一半新一半旧」的产物，而且很难看出哪里不对。

**③ 确认 `node_modules` 在忽略名单里。** 本站 `.gitignore` 早就排除了它，所以换完仓库反而更小了——少了一个 gitlink，也少了一套主题文件。

顺便验证了依赖树没被搅动：主题零运行依赖，`package.json` 里为规避 Node 22 的 `ERR_REQUIRE_ESM` 而写的 `overrides`（`strip-ansi@6.0.1`、`ansi-regex@5.0.1`）依然生效，`npm ls` 输出的还是 6.x。

## 五、为什么没选「主题文件直接进仓库」

第三条路是 vendored：把主题文件拷进 `themes/xfm` 并纳入版本管理。它比 submodule 和 npm 都省心——克隆即用，不依赖网络也不依赖 registry。

但它有两个代价：一是仓库多出近 80 个文件，`git log` 里主题更新会和站点内容混在一起；二是升级变成手工活，得整个目录覆盖一遍，还容易漏删已经废弃的文件。既然 npm 那边每次都按时发版，就没必要背这个。

{% note tip %}
顺带一条通用判断：**外部依赖只在「开发期」需要指向任意提交，在「使用期」只需要指向版本。** 一旦某个依赖进入稳定使用，submodule 的灵活性就从优势变成了每台机器都要付的税。
{% endnote %}

## 六、换完的代价

公平起见也说缺点：现在构建依赖 npm registry 可用。registry 挂掉或公司网络拦了 npm，本地和 CI 都构建不了；submodule 只要有 git 权限就行。

另外，`git ls-files` 里已经看不到主题的轨迹了。想知道「当前跑的是哪版主题」，得去看 `package.json`——这其实比翻 gitlink 方便，只是习惯要换一下。

{% note info 验证结果 %}
- 按平台同款命令构建：`node --no-experimental-require-module node_modules/hexo/bin/hexo generate`
- 结果 **288 文件、exit 0**，与换之前一致
- 抽查：首页 `mode-blog has-sidebar sidebar-right`、文档页 `mode-docs no-sidebar has-inline-toc`、7 个 CSS 与 `/js/lang-data.js` 等资源齐全
{% endnote %}

上一篇文章写的是主题 v1.4.1 的更新内容，这一篇写的是本站怎么拿到它。两件事凑在一起，主题这条线算是彻底交给 npm 了。
