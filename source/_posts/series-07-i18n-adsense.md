---
title: 从零造一个 Hexo 主题（七）：运行期多语言切换与 AdSense 接入
date: 2026-10-15 15:00:00
updated: 2026-10-15 15:00:00
categories: [主题开发]
tags: [Hexo, i18n, AdSense, 主题开发]
description: 不做多份构建也能切换界面语言：构建期注入扁平字典、运行期反查替换、白名单容器与占位符重渲染；以及 AdSense 的统一判定、延迟填充与路径排除。含 vsprintf 与路径比对两个真实坑。
---

v1.2.0 有两个需求：**导航栏加中英切换（要真能用，不能是装饰）**，以及**接入 Google AdSense**。前者逼我回答一个架构问题：静态站怎么做语言切换？

<!-- more -->

## 一、三条路，选最「反直觉」的那条

| 方案 | 做法 | 评价 |
| --- | --- | --- |
| 多份构建 | 每种语言编译一份站点，靠 URL 前缀区分 | 最正统，但要改部署流程，用户配置成本高 |
| 全量 JS 渲染 | 界面文案全由 JS 注入 | 首屏空白 + SEO 受损，否决 |
| **构建期注入 + 运行期反查** | 字典内联进页面，切换时用 JS 反查替换 | 首屏是构建好的中文，切换只是 DOM 替换 |

我选了第三条。核心思路：**服务端只构建一次（默认是写作语言），前端拿到「全部语言的字典」，切换时把界面文案从 A 语言「翻译」成 B 语言。**

## 二、构建期：把语言包拍平注入

`languages/*.yml` 是嵌套结构，先拍平成点号键：

```yaml
# languages/zh-CN.yml
common:
  copy: 复制
  back_to_top: 回到顶部
search:
  result_count: 找到 {count} 条结果
```

```js
// 拍平 → { "common.copy": "复制", "search.result_count": "找到 {count} 条结果" }
window.__XFM_LANG__ = { current: 'zh-CN', tables: { 'zh-CN': {...}, en: {...} } };
```

## 三、定档：避免中英文案闪烁

跟自适应档位同一套模式——`lang-boot.ejs` 在 `<head>` 首段**同步执行**，顺序是 `?__lang=` > `localStorage`：

```html
<html lang="zh-CN" data-lang="zh-CN" data-lang-build="zh-CN">
```

{% note danger 又是执行时机 %}
异步加载字典再替换，用户会看到「先是中文、跳一下变英文」。凡是影响首屏呈现的状态，**都要在 `<head>` 里同步定档**。
{% endnote %}

## 四、运行期：反查替换怎么做

关键难点：**页面上只有「当前语言的文本」，没有语言键**。要切换，必须先建立「当前文案 → 目标文案」的映射。

```js
// 从「当前语言文本」反查键，再取目标语言的值
function buildConverter(from, to) {
  const rules = [];
  Object.keys(TABLES[from]).forEach((key) => {
    const src = TABLES[from][key];
    const dst = TABLES[to][key];
    if (src && dst && src !== dst) rules.push(compileRule(src, dst));
  });
  return rules;
}
```

### 带占位符的文案要特殊处理

`找到 {count} 条结果` 在运行时是 `找到 12 条结果`。直接做字符串相等匹配必然失败，所以要把模板编译成**带捕获组的正则**：

```js
var PLACEHOLDER_SPLIT = /(%[sd]|\{[a-zA-Z0-9_]+\})/g;

function compileRule(src, dst) {
  var parts = String(src).split(PLACEHOLDER_SPLIT).filter(Boolean);
  var re = parts.map(function (p) {
    return PLACEHOLDER_SPLIT.test(p) ? '(.*?)' : escapeRe(p);   // 占位符 → 捕获组
  }).join('');
  return { re: new RegExp('^' + re + '$'), dst: dst };
}
// 匹配到的捕获值按顺序回填进目标模板的占位符
```

### 只替换白名单容器

```js
var SCOPES = [
  '.site-header', '.drawer', '.site-nav', '.search-modal', '.site-footer',
  '.pagination', '.toc-column', '.widget-column', '.hero-panel', '.page-head',
  '.post-view-meta', '.post-tags-block', '.post-related', '.post-share',
  '.post-copyright', '.post-nav', '.doc-page-foot', '.comments-area', ...
];
```

{% note warning 正文本体永不参与替换 %}
`.xfm-content`（文章正文）被排除在外。原因很朴素：**文章是用某种语言写的内容，不是界面**。把中文文章"翻译"成英文界面语言是错的——实测英文界面下 6 条中文标题保持原文，这是正确行为。

同理要处理的还有属性：`placeholder` / `title` / `aria-label` / `alt` / `data-tip`。
{% endnote %}

## 五、两个真实坑

### 坑 1：语言键里的 `%s` 会变成 "undefined"

```ejs
<!-- ❌ 渲染出「共 undefined 篇文章」 -->
<%= __('archive.total').replace('%s', count) %>

<!-- ✅ 正确写法：占位符由 __() 内部处理 -->
<%= __('archive.total', count) %>
```

根因：Hexo 的 `__()` **内部总是调用 `vsprintf`**，不传参数时 `%s` 会被直接替换成字符串 `undefined`。所以「取出来再 replace」这条路永远是错的。

{% note tip 规则 %}
凡是交给后端的语言键，用 `%s` / `%d` 并写成 `__('key', value)`；凡是交给前端 JS 的键，用 `{count}` 占位符由 JS 自己填充。**两套占位符不要混用。**
{% endnote %}

### 坑 2：exclude_pages 永远匹配不上

配置里写 `/about/`，代码里比对的 `page.path` 是 `about/index.html`——没有前导斜杠、还带 `index.html`（第二篇坑 7 的翻版）。

解决：两侧都归一化再比对，用第二篇那个 `normPath()`。

## 六、AdSense：判定集中在一个 helper

广告位散落在 index / post / page / sidebar 四处，判定逻辑如果各写一遍必然不一致。所以做 `xfm_ads()` 统一判定：

```ejs
<% const AD = xfm_ads('post_top', page); %>
<% if (AD.show) { %>
  <%- partial('_partials/ads', { slot: AD }) %>
<% } %>
```

判定条件集中处理：是否启用、有没有填 slot id、当前页是否被 `exclude_pages` 排除、列表页是否到了插入间隔。

三个要点：

1. **`auto_ads: false` 时仍然要加载 `adsbygoogle.js`**（只是不带 `?client=` 参数），否则手动 `<ins>` 广告位永远不会被填充。
2. **延迟填充**：用 `IntersectionObserver` 在广告位进入视口前才 push，减少无谓请求。
3. **`sidebar` 广告位只在 blog 模式存在**——这不是缺陷，是布局决定的：`notes` / `docs` 的侧栏是导航树（`hasSideNav`），不是挂件栏（第四篇讲过这个区分）。

{% note warning 模板里的 EJS 注释会致命 %}
在 `ads.ejs` 的注释里写了 `<%- partial(...) %>`，结果报错 `Could not find matching close tag`（第六篇坑 2）。**EJS 注释里的标签照样会被解析。**
{% endnote %}

## 七、伏笔：一个差点让全站链接失效的写法

实现语言切换时，我在 `i18n.js` 里写了这样一段点击委托：

```js
var langBtn = target.closest('[data-lang]');
if (langBtn) { e.preventDefault(); /* 切换语言 */ }
```

看起来没问题——直到启用语言切换后，**全站所有链接都点不动了**。原因留到下一篇（收官篇）讲，它是这个系列里我最想记住的一个教训。

## 系列导航

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[标签插件与内容过滤器](/2026/10/15/series-06-tag-plugins/) · 下一篇：[从可用到可靠：缺陷治理与发布工程化](/2026/10/15/series-08-hardening-release/)
{% endnote %}
