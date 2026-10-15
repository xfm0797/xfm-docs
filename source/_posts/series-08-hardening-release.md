---
title: 从零造一个 Hexo 主题（八）：从可用到可靠——缺陷治理、移动端血案与发布工程化
date: 2026-10-15 16:00:00
updated: 2026-10-15 16:00:00
categories: [主题开发]
tags: [Hexo, 工程化, npm, 主题开发]
description: 收官篇：站点补丁如何回迁进主题、配置读取顺序的真实 bug、移动端菜单被压缩成 0 宽与全站链接点不动的血案、commit 拆分法、验证体系与 npm 发布流程。
---

前面七篇都在「加功能」。这一篇讲怎么把主题**从「能跑」变成「敢发布」**：缺陷怎么治理、移动端那两次诡异故障的真实根因、以及一套让我不再怕发版的工程化流程。

<!-- more -->

## 一、原则：站点层的规避动作要回迁进主题

主题给自己站点用的过程中，我为了绕开问题写了不少站点层补丁（覆盖模板、注入 CSS/JS）。这些补丁是**非常好的缺陷信号**：

> 用户不得不改你的主题才能用——那多半是主题的问题。

于是有了这条原则：**站点层补丁若对应主题缺陷，就把修复做进主题、删掉站点补丁；只有平台环境差异（如部署机 Node 版本）才留在站点层。**

v1.1.0 一次性修掉 9 项，主题层把站点补丁全部退役。判定时的分类表：

| 现象 | 判定 | 处理 |
| --- | --- | --- |
| 文档侧栏全展开、箭头无点击 | 真缺陷 | 修主题 |
| `{% tabs %}` 点了没反应 | 真缺陷 | 修主题（core.js 补切换逻辑） |
| 分页在第 1 页缺 Prev 导致页码偏移 | 真缺陷 | 修主题 |
| 菜单新增项被排到末尾 | **Hexo 深合并行为**，非缺陷 | 主题加 `menu_order` 规避 |
| Waline 的 `server_url` 不生效 | 真缺陷（v2 只认驼峰 `serverURL`） | 修主题（键名归一） |
| Hexo 8 依赖 ESM-only 包报错 | **环境问题**，非主题缺陷 | 只补文档 |

{% note tip 分类比修复本身更重要 %}
动手前先判定「这是谁的锅」，能避免把环境问题写进主题（污染所有用户），也能避免把主题缺陷留在站点层（每个站点重复踩）。
{% endnote %}

## 二、一个隐蔽的配置 bug：主题自己的配置读不到

排查时发现 `getConfig()` 只读了站点根配置 `hexo.config`：

```js
// ❌ 主题 _config.yml 里的 notes.* / docs.* / post.* 全部失效
const cfg = hexo.config;

// ✅ 正确顺序：theme.config（已含站点 theme_config 覆盖）优先，站点根兜底
const cfg = (hexo.theme && hexo.theme.config) || {};
```

后果是：**用户按文档在主题配置里写的参数毫无效果**，而模板里直读 `theme.xxx` 的部分又正常——表现极其错乱。

顺带挖出两个相关问题：

1. **死配置**：`notes.collapsed`、`docs.expanded` 声明了却没接线，写了不生效；
2. **下标取值错误**：`post.toc_depth` 用 `[0]`/`[1]` 取层级，遇到默认的 `[2,3,4]` 会被误判成「2 到 3 级」，正确做法是取 min/max。

{% note warning 教训 %}
配置项要么别写进文档，写了就必须接线。**「声明了但没实现」的配置比没有这个配置更糟**——用户会以为自己写错了。
{% endnote %}

## 三、移动端血案一：菜单按钮被压缩成 0 宽

**现象**：手机端导航栏左侧的菜单按钮**看不见也点不着**。

**排查**：用 CDP 真机口径（iPhone UA + 390×844 + 触摸模拟）测，`elementFromPoint` 在按钮位置命中不到它自身。

**根因**：`.header-inner` 是一个 flex 行，品牌区（logo + 标题）和右侧工具区都不收缩，于是**唯一可收缩的 `.nav-toggle` 被溢出量压成了 0 宽度**：

```css
/* 修复 */
.nav-toggle { flex: 0 0 auto; }              /* 按钮永不收缩 */
.brand { flex: 0 1 auto; min-width: 34px; }  /* 品牌区改为可收缩 */
.brand-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

{% note danger flex 布局的默认行为要牢记 %}
flex 子项默认 `flex-shrink: 1`。当一个容器里所有子项都能收缩时，**谁被压扁取决于内容，而不是你的意图**。凡是「绝对不能被压缩」的交互元素（按钮、图标），显式写 `flex: none` 或 `flex: 0 0 auto`。
{% endnote %}

## 四、移动端血案二：全站链接点不动（P0）

这是整个开发过程中最值得记住的一个 bug。

**现象**：启用语言切换后，手机上抽屉展开，点里面的链接**毫无反应**；但点遮罩能正常关闭抽屉。

**关键线索**：JS 事件处理器正常生效（遮罩能关），只有 `<a>` 的默认跳转失效。

**根因**：上一篇末尾那段代码——

```js
document.addEventListener('click', function (e) {
  var langBtn = e.target.closest('[data-lang]');
  if (langBtn) { e.preventDefault(); /* 切换语言 */ }
});
```

`<html>` 元素上也有 `data-lang`（当前语言状态）。`closest()` 会沿祖先链一路爬到 `<html>` 并命中，于是**页面上任意一次点击都会被判定为「点了语言选项」并被 `preventDefault()`**——全站链接失效。

```js
// 修复：语言选项改用专属属性，与 <html> 的状态属性彻底解耦
var langBtn = e.target.closest('[data-lang-option]');
```

{% note danger 通用红线 %}
**document 级 click 委托里，`closest()` 的选择器绝不能是可能挂在 `<html>` / `<body>` 上的裸属性。**

这类命名冲突不会报错、不会告警，只在某个功能开启时才发作。规避办法是给交互标记加专属后缀：`data-lang-option` 而不是 `data-lang`。
{% endnote %}

## 五、commit 拆分：让每个提交都能构建

两个特性同时改了 `helpers/index.js`、`_config.yml`、`head.ejs` 等共享文件，hunk 交织，没法靠 `git add -p` 拆干净。我的做法：

1. 把共享文件备份到仓库外；
2. 手工裁成「仅特性 A」的中间态（特性 B 的文件 `git checkout --` 回 HEAD）；
3. **验证中间态能构建**（这一步救过我一次：忘了回退父模板，导致 `partial` 调用未注册的 helper 直接 ReferenceError）；
4. 提交 A → 从备份恢复全部文件 → 提交 B。

{% note warning 铁律 %}
**引用了新 partial / 新 helper 的父模板，必须和这个 partial / helper 本身放在同一个 commit**，否则中间态构建必然失败。
{% endnote %}

## 六、验证体系：不要相信退出码

| 层 | 手段 | 关键点 |
| --- | --- | --- |
| 构建 | 场景脚本批量构建 | 判成功用 `[ -s public/index.html ]`，**退出码恒为 0** |
| 静态 | Node 脚本读产物做断言 | 属性断言只取 `<html ...>` 开标签（内联脚本源码是假阳性大户） |
| 运行 | 无头 Chrome + CDP | 真实点击、UA 模拟、`elementsFromPoint` 查层叠 |

三个让我吃过亏的脚本细节：

1. **`rm -rf` 会静默失败**：目录里有文件被残留进程占用时，删除整体中止且返回非 0，脚本继续跑就读到上一轮的旧产物 → **得到假结果**。修复：`clean_out()` 显式校验目录真被删掉，失败直接 `exit 1`。
2. **清理必须验证结果**——上面这条的通用教训：**任何「清理」步骤都要断言它真的成功了**，否则污染会伪装成被测对象的缺陷。
3. **`pkill -f` 会匹配到自身包装进程而挂住**：用 PID 精确 kill。

## 七、发布：SemVer 与 npm

版本规则：新功能升 MINOR，仅修 Bug 升 PATCH。v1.3.0 因为含 `feat(floating)` 取 MINOR，**不是 1.2.1**。

流程：

```bash
# 1. 升版本 → 2. 构建验证 → 3. 发布
npm publish
# 4. 直查 registry（绕开本机代理，见下）
curl --noproxy '*' https://registry.npmjs.org/hexo-theme-xfm
# 5. 打附注标签并推送
git tag -a v1.3.0 -m "v1.3.0" && git push origin main --tags
# 6. 下载 tarball 抽查关键文件是否在包内
```

{% note warning registry 会被代理缓存骗到 %}
本机有 `https_proxy` 时，`npm view` 会命中 Cloudflare 缓存（响应头 `CF-Cache-Status: HIT`），发布后长时间查不到新版本，**其实版本早已上线**。

用 `curl --noproxy '*' https://registry.npmjs.org/<pkg>` 直查才是准的。npm 本身也有 1–3 分钟的处理延迟，所以脚本要轮询而不是查一次就判定失败。
{% endnote %}

发布后**一定要下载 tarball 抽查**：`files` 白名单漏掉某个目录时，`npm publish` 不会报错，用户装到的就是个残包。

## 八、回头看：这套方法能迁移吗

能。八篇下来真正沉淀的不是某个 Hexo API，而是几条通用做法：

1. **形态差异配置化**，让升级不产生合并冲突；
2. **模板只做分支，计算下沉到 helper**；
3. **先定档再出布局**，把状态写进 `<html>` 属性，CSS 只读属性；
4. **站点层补丁是缺陷信号**，定期回迁；
5. **验证要断言产物而非退出码**，清理步骤必须自检；
6. **每个 commit 都能独立构建**。

如果只能带走一条，我选第 5 条——**「看起来成功」比「失败」危险得多**，因为失败会拦住你，而假成功会让你把错误发布出去。

## 系列导航

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[运行期多语言切换与 AdSense](/2026/10/15/series-07-i18n-adsense/) · 回到第一篇：[为什么再造轮子](/2026/10/15/series-01-why-and-architecture/)
{% endnote %}
