---
title: 从零造一个 Hexo 主题（二）：Hexo 8 主题开发的九个坑
date: 2026-10-15 10:00:00
updated: 2026-10-15 10:00:00
categories: [主题开发]
tags: [Hexo, EJS, 主题开发, 踩坑]
description: 第一次在 Hexo 8 上写主题踩到的九个坑：插件不加载、脚本不回调、配置读不到、EJS 报 TDZ、page.path 形态、YAML 百分号、没有 cheerio。每条都给了现象、根因和修法。
---

上一篇定了架构，这一篇是**动手第一天踩的坑**。它们有个共同特点：文档里几乎查不到，报错信息也常常误导，只能靠读 Hexo 源码定位。我把它们按「踩到时的困惑程度」排序，每条都给现象、根因和修法。

<!-- more -->

## 坑 1：主题脚本一个都没跑

**现象**：`scripts/` 下的 tag、filter、generator 全部静默失效，构建不报错。

**根因**：Hexo 加载外部插件前会检查站点根目录 `package.json` 里有没有 `hexo` 字段：

```js
// hexo/lib/hexo/load_plugins.js
if (!this.config || !this.env.init) return;   // 还有更前置的判断
const pkg = ... // 读取站点 package.json
if (!pkg.hexo || !pkg.hexo.version) return;   // 没有就整段 return
```

**修法**：站点 `package.json` 必须带：

```json
{
  "hexo": { "version": "8.1.2" }
}
```

{% note danger 判断标准 %}
只要你的主题有 `scripts/` 目录，就必须在 README 里写清楚这条。**这是主题作者最容易收到「你的主题没生效」反馈的原因。**
{% endnote %}

## 坑 2：渲染器和生成器要显式安装

**现象**：`hexo g` 报 `Template render error` 或页面根本不生成。

**根因**：Hexo 8 核心只内置 asset/page/post 三个生成器和 html/css/js/json/yaml 渲染器。`ejs`、`marked` 以及 index/archive/category/tag 生成器全都拆出去了。

```bash
npm i hexo-renderer-ejs hexo-renderer-marked \
      hexo-generator-index hexo-generator-archive \
      hexo-generator-category hexo-generator-tag
```

## 坑 3：`module.exports` 不再被回调（最隐蔽的一个）

**现象**：脚本文件确实被执行了，但 `module.exports = function (hexo) {...}` 里的注册代码从没跑过——**且不报任何错**。

**根因**：Hexo 7/8 的 `loadPlugin` 把脚本包成 IIFE 直接执行，**不会调用导出的函数**（老版本会）。

**修法**：脚本末尾自执行，并加幂等旗标防止重复注册：

```js
function __xfmBootstrap() {
  if (typeof hexo === 'undefined' || !hexo || !hexo.extend) return;
  if (hexo.__XFM_CONTENT_FILTER) return;   // 幂等
  hexo.__XFM_CONTENT_FILTER = true;
  module.exports(hexo);                    // 兼容老版本行为
}
__xfmBootstrap();
```

保留 `module.exports` 是为了向下兼容老 Hexo 的回调式加载，两套行为都能跑。

## 坑 4：partial 路径必须带 `_partials/`

**现象**：`Partial does not exist`。

**根因**：`partial()` 的路径是相对 `layout/` 目录的。根目录模板里写 `partial('comment')` 找不到，必须写：

```ejs
<%- partial('_partials/comment') %>
```

## 坑 5：`hexo.theme.config` 在注册时还是空的

**现象**：脚本顶部读配置，永远拿到 `undefined`；但同一个表达式在模板里却有值。

**根因**：脚本文件的执行时机早于主题配置挂载。正确做法是**惰性读**——在 generator / filter / helper 的回调内部再去取：

```js
// ❌ 脚本顶层就读，拿到空对象
const themeCfg = hexo.theme.config;

// ✅ 回调内部读
hexo.extend.filter.register('after_post_render', function (data) {
  const cfg = (hexo.theme && hexo.theme.config) || {};
  ...
});
```

这条还有个更深的衍生问题——**读谁的**、**什么顺序**，我在第八篇会展开，它后来变成一个真实的配置失效 bug。

## 坑 6：EJS 变量自引用触发 TDZ

**现象**：`Cannot access 'extraClass' before initialization`。

**根因**：EJS 会把模板里声明的 `const` 提升到同一作用域，于是这句是在「声明前访问自己」：

```ejs
<% const extraClass = extraClass || ''; %>   <!-- 💥 -->
```

**修法**：用 `typeof` 判空后换个名字：

```ejs
<% const cls = (typeof extraClass !== 'undefined' && extraClass) || ''; %>
```

## 坑 7：`page.path` 不是 URL

**现象**：侧栏高亮永远匹配不上；`exclude_pages` 配置不生效。

**根因**：pretty URL 下 `page.path` 形如 `docs/intro/index.html`——**没有前导斜杠，且带 `index.html`**。而你在配置里写的是 `/docs/intro/`。

**修法**：比对前两侧都归一化：

```js
function normPath(p) {
  return '/' + String(p || '')
    .replace(/^\/+/, '')
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '');
}
// normPath('docs/intro/index.html') === '/docs/intro/'
```

## 坑 8：YAML 值不能以 `%` 开头

**现象**：`_config.yml` 或语言文件解析失败。

```yaml
result_count: %s results found     # ❌ YAML 把 % 当指令
result_count: "%s results found"   # ✅
```

## 坑 9：Hexo 8 没有 cheerio 了

**现象**：`require('cheerio')` 失败；老主题的正文后处理过滤器直接崩。

**根因**：Hexo 8 移除了 cheerio 依赖。

**修法**：改用「占位保护 + 正则」。核心思路是**先把不该碰的片段（代码块）换成占位符，处理完再换回来**：

```js
const PLACEHOLDER = '\u0000XFMCODE';
const blocks = [];

// 1) 保护：把 <pre>...</pre> 挖出来
html = html.replace(/<pre[\s\S]*?<\/pre>/gi, (m) => {
  blocks.push(m);
  return PLACEHOLDER + (blocks.length - 1) + PLACEHOLDER;
});

// 2) 处理：此时可以放心用正则改标题 / 表格 / 链接
html = html.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (m, lv, inner) => {
  const id = slugify(stripTags(inner));
  return `<h${lv} id="${id}"><a class="anchor" href="#${id}"></a>${inner}</h${lv}>`;
});

// 3) 还原
html = html.replace(new RegExp(PLACEHOLDER + '(\\d+)' + PLACEHOLDER, 'g'),
  (m, i) => blocks[Number(i)]);
```

为什么必须保护：不加这一步，`<h2>` 的正则会命中代码块里字符串形式的 `<h2>` 示例，你的示例代码会被注入锚点。

{% note tip 复盘 %}
这九个坑里，**最贵的是第 3 条和第 5 条**，因为它们不报错、只是静默失效。给主题写脚本时养成两个习惯：
1. 脚本一律「自执行 + 幂等旗标」；
2. 配置一律「回调内惰性读」。
这两条能省掉未来一半的调试时间。
{% endnote %}

## 系列导航

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[为什么再造轮子与三模式架构](/2026/10/15/series-01-why-and-architecture/) · 下一篇：[设计令牌体系](/2026/10/15/series-03-design-tokens/)
{% endnote %}
