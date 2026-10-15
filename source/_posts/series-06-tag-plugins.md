---
title: 从零造一个 Hexo 主题（六）：标签插件与内容过滤器——零依赖实现 Markdown 增强
date: 2026-10-15 14:00:00
updated: 2026-10-15 14:00:00
categories: [主题开发]
tags: [Hexo, EJS, Markdown, 主题开发]
description: 手写 14 个 Markdown 标签插件与一套正文后处理过滤器：跨标签收集状态、渲染顺序陷阱、未知标签报错、EJS 注释里的致命写法，以及没有 cheerio 时如何安全地改 HTML。
---

写主题时有个很现实的问题：**提示块、选项卡、时间轴这些「好看的排版」，官方 Markdown 都不支持**。常见做法是装一堆 `hexo-tag-*` 插件，但那违背了「零第三方依赖」的初衷——而且每装一个，就多一份「升级后不兼容」的风险。

于是我把它们全写进了主题的 `scripts/tags/index.js`，一共 14 个标签。这一篇讲实现思路和几个必须知道的坑。

<!-- more -->

## 一、标签清单与注册方式

```js
const register = (name, fn, options) =>
  hexo.extend.tag.register(name, fn, options || {});
```

| 标签 | 别名 | 用途 |
| --- | --- | --- |
| `note` | info / success / warning / danger / tip / quote | 提示块 |
| `fold` | `collapse` | 折叠面板 |
| `tabs` / `tab` | — | 选项卡 |
| `timeline` / `event` | — | 时间轴 |
| `row` / `col` | — | 栅格 |
| `button` | `btn` | 按钮 |
| `label` | `badge` | 徽标 |
| `icon` | `fa` | SVG 图标（自带雪碧图） |
| `mermaid` | — | 流程图 |
| `linkcard` | — | 链接卡片 |

参数解析统一走一个函数，同时支持逗号和空格分隔：

```js
function toList(args) {
  const raw = Array.isArray(args) ? args.join(' ') : String(args);
  return raw.split(/\s*,\s*|\s+/)
    .map(s => s.replace(/^["']|["']$/g, '').trim())
    .filter(Boolean);
}
```

## 二、跨标签收集：父子标签怎么协同

`tabs` / `tab` 这类父子标签有个麻烦：Hexo 是**先解析子标签再解析父标签**的，子标签执行时拿不到父标签的上下文。

解法是在模块作用域放一个数组收集子项，父标签渲染时一次性取走：

```js
const tabStore = [];

register('tab', function (args, content) {
  const list = toList(args);
  const active = list.some(s => /^(active|on|true|1|default)$/i.test(s));
  const title = list.filter(s => !/^(active|on|true|1|default)$/i.test(s));
  tabStore.push({ title: title.join(' ') || 'Tab', active, html: md(content) });
  return '';                       // 子标签不输出内容
}, { ends: true });

register('tabs', function () {
  const items = tabStore.splice(0, tabStore.length);   // 取走并清空
  const activeIndex = Math.max(0, items.findIndex(i => i.active));
  return '<div class="xfm-tabs" data-active="' + activeIndex + '">' + ... + '</div>';
}, { ends: true });
```

{% note danger 一定要 splice 而不是 slice %}
`splice(0, len)` 会同时清空数组。如果只读取不清空，**下一篇文档的 tab 会串到这一篇里**——这是多页面渲染时最容易出现的脏状态 bug。凡是跨标签共享的数组，取用时必须清空。
{% endnote %}

## 三、内容渲染的降级链

标签内容可能是 Markdown，也可能是现成 HTML。判断逻辑：

```js
function md(content) {
  const text = String(content == null ? '' : content);
  if (!text.trim()) return '';
  // 已经是 HTML 块级元素 → 原样返回
  if (/^\s*<(p|div|ul|ol|li|pre|h[1-6]|figure|blockquote|table|img|...)\b/i.test(text)) {
    return text;
  }
  try {
    const out = hexo.render.renderSync({ text, engine: 'markdown' });
    if (out) return out;
  } catch (e) { /* 没装 Markdown 渲染器时降级 */ }
  return '<p>' + text.replace(/\n/g, '<br>') + '</p>';
}
```

三档降级保证了：**即使站点没装 `hexo-renderer-marked`，标签也不会炸**，最坏情况只是换行退化成 `<br>`。

## 四、内容过滤器：没有 cheerio 怎么改 HTML

`scripts/filters/content.js` 在 `after_post_render` 阶段统一增强正文：代码块工具条、标题锚点、表格滚动容器、图片懒加载、外链新窗口、任务列表。

核心手法在第二篇提过——**占位保护 + 正则**。完整流程是：

```js
hexo.extend.filter.register('after_post_render', function (data) {
  let content = data.content;
  const blocks = [];

  // 1. 保护：挖出所有 <pre>
  content = content.replace(/<pre[\s\S]*?<\/pre>/gi, m => {
    blocks.push(m);
    return PLACEHOLDER + (blocks.length - 1) + PLACEHOLDER;
  });

  // 2. 安全处理：标题锚点
  content = content.replace(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (all, level, attrs, inner) => {
      const id = slugify(stripTags(inner));
      return `<h${level} id="${id}"${attrs}><a class="headline-anchor" href="#${id}"></a>${inner}</h${level}>`;
    });

  // 3. 表格包一层滚动容器（手机上宽表可横向滑）
  content = content.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi,
    t => '<div class="table-wrap">' + t + '</div>');

  // 4. 还原代码块（顺带加工具条）
  content = content.replace(new RegExp(PLACEHOLDER + '(\\d+)' + PLACEHOLDER, 'g'),
    (m, i) => decorateCode(blocks[Number(i)]));

  data.content = content;
  return data;
});
```

{% note tip 占位符为什么用 \u0000 %}
`\u0000` 是正文里几乎不可能出现的字符，避免与用户内容冲突。**选占位符的第一原则是「不可能自然出现在输入里」**，其次才是可读性。
{% endnote %}

## 五、三个必踩的坑

### 坑 1：未知标签会让整个构建失败

很多主题有 `tabs_end` 这个标签，本主题没有。照着旧习惯写上去，构建直接抛：

```text
Nunjucks Error: unknown block tag: tabs_end
```

{% note info 顺带一个必会技巧：raw %}
想在文章里**展示标签语法本身**（比如写主题文档），必须用 raw 标签包住，否则引擎会把它当真标签执行掉：

{% raw %}
```text
{% tabs %}
{% tab 标题一 %}内容{% endtab %}
{% tab 标题二 %}内容{% endtab %}
{% endtabs %}
```
{% endraw %}

上面这段示例之所以能原样显示，是因为它在源码里被 `raw` 标签包住了——**`raw` 开闭标签之间的内容不做任何解析，原样输出**。写教程类文章时这是刚需。
{% endnote %}

本主题的 `tabs` 就是上面这种成对写法，**没有** `tabs_end`。

### 坑 2：EJS 注释里不能写 EJS 标签

```ejs
<!-- ❌ 这样写会导致编译失败 -->
<%# 用法：<%- partial('_partials/head') %> %>
```

注释里的 `<% %>` 照样会被解析器识别，然后报 `Could not find matching close tag`。

### 坑 3：编译失败时退出码仍然是 0

这是最要命的一条：**EJS 编译失败时 `hexo generate` 的退出码是 0，只是写出了 0 字节的 HTML**。

所以 CI 或测试脚本里绝对不能只看退出码：

```bash
# ❌ 会漏过所有编译失败
hexo generate && echo "构建成功"

# ✅ 必须校验产物
hexo generate
[ -s public/index.html ] || { echo "构建失败：产物为空"; exit 1; }
```

{% note warning 这条坑了我很久 %}
我一度以为某个广告位没渲染是逻辑问题，实际上是模板编译失败输出了空文件，而脚本看退出码 0 就放行了。**凡是「看起来构建成功但内容不对」，先查产物字节数。**
{% endnote %}

## 六、为什么坚持自己做而不是装插件

算一笔账：14 个标签 + 1 个过滤器，约 400 行 JS，换来：

- 零依赖（不占 `node_modules`，不受插件停更影响）；
- 样式完全可控（不用去覆盖插件自带的 CSS）；
- 与主题令牌体系天然一致（插件不知道你的 `--c-primary-bg`）。

代价是维护责任转移到自己身上。对**长期维护的主题**来说这笔账划算；对一次性站点，装插件更快。**选择依据是维护周期，不是代码量。**

## 系列导航

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[从响应式到自适应式响应](/2026/10/15/series-05-adaptive/) · 下一篇：[运行期多语言切换与 AdSense](/2026/10/15/series-07-i18n-adsense/)
{% endnote %}
