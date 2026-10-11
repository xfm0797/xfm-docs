---
mode: docs

title: 自定义样式与注入
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 通过 custom 配置与设计令牌覆盖主题样式，注入自定义 HTML、CSS 与 JS。
keywords: [自定义, 覆盖样式, CSS 变量, 注入, custom]
order: 60
---

# 自定义样式与注入

## 注入配置

```yaml
custom:
  # 注入 <head> 的自定义 HTML
  head: ""
  # 注入 </body> 前的自定义 HTML
  body_end: ""
  # 自定义 CSS 文件列表（相对 /css/ 目录）
  css: []
  # 自定义 JS 文件列表（相对 /js/ 目录）
  js: []
  # 是否在每篇文章底部注入自定义 HTML
  post_footer: ""
```

| 配置项 | 注入位置 | 时机 |
| --- | --- | --- |
| `head` | `<head>` 内，所有主题 CSS 之后 | 页面解析阶段 |
| `body_end` | `</body>` 之前 | 页面解析末尾 |
| `css` | `<head>` 内的 `<link rel="stylesheet">` | 页面解析阶段 |
| `js` | `</body>` 之前的 `<script src>` | 页面解析末尾 |
| `post_footer` | 每篇文章正文之后、评论区之前 | 模板渲染阶段 |

### 加载顺序

```text
<head>
  ├── 主题 CSS（variables / base / layout / components / post / plugins / adaptive）
  ├── 档位样式（构建期按 adaptive 配置生成）
  ├── 自定义字体（appearance.font_family）
  ├── custom.css[]          ← 你的自定义样式，在主题之后，可安全覆盖
  ├── KaTeX CSS（若启用）
  └── custom.head           ← 任意 HTML

<body>
  ├── ... 页面内容 ...
  ├── 主题 JS（adaptive / core / toc / search）
  ├── 第三方脚本（数学 / Mermaid / 统计）
  ├── custom.js[]           ← 你的自定义脚本
  └── custom.body_end       ← 任意 HTML
```

因为自定义 CSS 排在主题之后，**同优先级的规则会覆盖主题**，不需要 `!important`。

## 自定义 CSS

### 第 1 步：创建文件

把样式文件放到站点 `source/css/custom.css`。

### 第 2 步：在配置里登记

```yaml
custom:
  css: [custom]
```

无需写 `.css` 后缀，也无需写路径前缀——主题会拼接为 `/css/custom.css`。

可以登记多个：

```yaml
custom:
  css: [custom, print-override]
```

### 第 3 步：重新生成

```bash
hexo clean && hexo g
```

### 常见定制示例

```css
/* 缩小正文最大宽度，让长文更易读 */
.post-content {
  max-width: 720px;
}

/* 首页卡片圆角单独调整 */
.post-card {
  border-radius: 8px;
}

/* 导航栏降低高度 */
:root {
  --xfm-nav-h: 56px;
}

/* 隐藏首页 Hero 的头像 */
.hero-avatar {
  display: none;
}
```

## 优先用设计令牌

覆盖样式之前，**先检查主题是否已经提供了令牌**。改令牌比写覆盖规则更稳——它不会在主题升级后失效。

主题在 `<head>` 内联输出了这几个核心令牌：

```css
:root {
  --xfm-primary: #4f6bed;      /* appearance.primary */
  --xfm-nav-h: 64px;           /* navbar.height */
  --xfm-radius: 14px;          /* appearance.radius 派生 */
  --xfm-radius-sm: 8px;        /* radius × 0.6 */
  --xfm-radius-lg: 21px;       /* radius × 1.5 */
}
```

在自定义 CSS 里直接改写即可：

```css
:root {
  --xfm-primary: #0ea5e9;
  --xfm-radius: 4px;
}
```

{% note tip 哪些配置项本来就等价于改令牌 %}
下面这些配置**本质上就是**写令牌，能用配置就别写 CSS：

| 你想改 | 配置项 | 等价令牌 |
| --- | --- | --- |
| 主色 | `appearance.primary` | `--xfm-primary` |
| 导航高度 | `navbar.height` | `--xfm-nav-h` |
| 圆角 | `appearance.radius` | `--xfm-radius` 三兄弟 |
{% endnote %}

## 自定义 JS

### 方式一：文件注入

放到站点 `source/js/custom.js`，然后：

```yaml
custom:
  js: [custom]
```

### 方式二：内联片段

```yaml
custom:
  body_end: |
    <script>
      console.log('XFM 已加载');
    </script>
```

### 可用运行时 API

自定义脚本执行时，主题的运行时已就绪（`custom.js` 在 `core.js` 等之后加载），可以直接使用：

```js
// 档位
XFM.adaptive.tier()                 // "desktop"
XFM.adaptive.is('mobile')
XFM.adaptive.setTier('tablet')
XFM.adaptive.onTierChange((tier, prev) => {
  console.log(prev, '->', tier);
});

// 搜索
XFM.searchPath                      // 索引地址
window.__xfmSearch.open()
window.__xfmSearch.close()

// 配置
XFM.root                            // 站点根路径，如 "/"
XFM.mode                            // 当前站点形态
XFM.reading                         // 阅读体验相关开关
```

### 示例：加一个"切换桌面版"按钮

```js
// source/js/custom.js
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.createElement('button');
  btn.textContent = '桌面版';
  btn.className = 'floating-btn';
  btn.style.cssText = 'position:fixed;right:16px;bottom:96px;z-index:60';
  btn.addEventListener('click', function () {
    XFM.adaptive.setTier('desktop');
  });
  document.body.appendChild(btn);
});
```

{% note warning 自定义 JS 不会被压缩合并 %}
`custom.js` 里的每个文件都会生成独立的 `<script src>` 标签，按数组顺序加载。**不要依赖跨文件的变量声明顺序**，或者干脆合并成一个文件。
{% endnote %}

## 注入 HTML

### head

```yaml
custom:
  head: '<meta name="baidu-site-verification" content="xxxx">'
```

在 `<head>` 末尾注入。适合放：
- 额外的 `<meta>`
- 站外字体预连接 `<link rel="preconnect">`
- 第三方验证脚本

### body_end

```yaml
custom:
  body_end: |
    <script src="https://cdn.example.com/widget.js" defer></script>
```

在 `</body>` 前注入，**在所有主题脚本之后**。

### post_footer

```yaml
custom:
  post_footer: |
    <div class="my-callout">
      欢迎关注我的公众号。
    </div>
```

**只作用于文章页**，位置在正文之后、分享与版权卡之前。

| | `body_end` | `post_footer` |
| --- | --- | --- |
| 作用范围 | 全站每个页面 | 仅文章页 |
| 注入位置 | `</body>` 前 | 正文之后 |
| 典型用途 | 全局脚本 | 文章末尾的固定说明 |

## 完整的定制流程

{% timeline %}
{% event 先查配置 / 第 1 步 / info %}
翻一遍[配置总览](/docs/xfm/config/)，确认目标效果是否已有配置项。有就用配置。
{% endevent %}
{% event 再查令牌 / 第 2 步 / info %}
需要调视觉时，看是否能用 `--xfm-*` 令牌表达。能用就用令牌。
{% endevent %}
{% event 最后写覆盖 / 第 3 步 / warning %}
前两步都不满足，才写自定义 CSS。规则保持最小化，附上注释说明用途。
{% endevent %}
{% event 验证与回归 / 第 4 步 / success %}
三档都看一遍（`?__tier=mobile` / `tablet` / `desktop`），深浅色都切一遍，确认没有破坏现有布局。
{% endevent %}
{% endtimeline %}

{% note danger 不要改主题目录内的文件 %}
直接在 `themes/xfm/source/css/` 里改样式，主题升级时会被整目录覆盖。**所有定制都应通过 `custom` 配置或站点级文件完成。**
{% endnote %}

## 排查

{% tabs %}
<!-- tab 自定义 CSS 没生效 -->
1. 确认文件放在**站点**的 `source/css/`，不是主题的
2. 确认 `custom.css: [custom]` 已登记（不是字符串，是数组）
3. 执行过 `hexo clean`
4. 浏览器强制刷新（`Ctrl/Cmd + Shift + R`）或开发者工具里勾选"禁用缓存"
5. 检查选择器优先级——主题有些规则带 `[data-tier]` 前缀，优先级较高
<!-- endtab -->
<!-- tab 自定义 JS 报错 XFM is not defined -->
说明脚本执行时主题运行时还没到位。两种解法：

```js
// 解法 1：等 DOM 就绪
document.addEventListener('DOMContentLoaded', function () {
  if (!window.XFM) return;
  // 你的逻辑
});
```

```js
// 解法 2：轮询等待（更稳妥）
(function wait() {
  if (!window.XFM) return setTimeout(wait, 50);
  // 你的逻辑
})();
```
<!-- endtab -->
<!-- tab 覆盖规则要加 !important 吗 -->
通常不需要。自定义 CSS 在主题之后加载，同优先级即覆盖。**若确实需要**，说明你的选择器优先级低于主题（例如主题用了 `html[data-tier="mobile"] .xxx`），此时更好的做法是**提升你的选择器具体度**：

```css
/* 而不是 */
.hero-panel { display: none !important; }

/* 应该 */
html[data-tier="mobile"] .hero-panel { display: none; }
```
<!-- endtab -->
{% endtabs %}
