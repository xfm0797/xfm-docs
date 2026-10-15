---
title: 从零造一个机构官网主题（六）：零依赖前端——暗色、图标、表单与动效
date: 2026-10-15 22:00:00
updated: 2026-10-15 22:00:00
categories: [主题开发]
tags: [JavaScript, CSS, 主题开发, 官网]
description: 120 行 JS 撑起官网全部交互：防闪烁的暗色模式、内联 SVG 图标 helper、无后端的联系表单、IntersectionObserver 滚动动效与数字滚动，以及无障碍兜底。
---

机构官网的技术栈越简单越好——客户可能三年后才想起改一次，那时框架早就变了。所以整套前端是：**一个 610 行的 CSS + 一个 120 行的 JS，零依赖。**

这一篇讲这 120 行 JS 里做了什么，以及几个「不用框架也能做得漂亮」的做法。

<!-- more -->

## 一、暗色模式：关键在防闪烁

存储用 `localStorage`，状态写在 `<html data-theme>` 上，CSS 用 `:root[data-theme="dark"]` 覆盖变量。

**重点是这段必须放在 `<head>` 里同步执行**：

```html
<script>
  try { t = localStorage.getItem('xongyi-theme') || 'light'; } catch (e) {}
  document.documentElement.setAttribute('data-theme', t);
</script>
```

```js
// main.js：切换
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  try { localStorage.setItem('xongyi-theme', t); } catch (e) {}
}
```

{% note danger 为什么不能等 DOMContentLoaded %}
放在 body 末尾或等 DOM ready，浏览器会**先按亮色渲染一帧再切到暗色**——用户看到一次白闪。

凡是影响首屏外观的状态（主题、语言、设备档位），都要在 `<head>` 里同步定档。这条规则我在 xfm 主题里也用（那个是 `data-tier` 档位）。
{% endnote %}

`try/catch` 包住 `localStorage` 是必须的：隐私模式下访问它会抛异常，不包住整个脚本就挂了。

## 二、图标：48 个内联 SVG 的 helper

不用图标字体、不用 CDN，图标是一张 JS 里的字符串表：

```js
// scripts/icons.js
const ICONS = {
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 ..."/>',
  // …共 48 个
};

hexo.extend.helper.register('icon', function (name, cls) {
  const body = ICONS[name] || ICONS['link'];      // 未知图标兜底成 link
  return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'width="1em" height="1em" aria-hidden="true">' + body + '</svg>';
});
```

模板里就这么用：

```ejs
<a href="/contact/"><%= __('contact_us') %><%- icon('arrow-right') %></a>
```

{% note info 为什么这里用内联、xfm 用 sprite %}
两个主题选了不同方案，原因是**使用量不同**：

| | xongyi | xfm |
| --- | --- | --- |
| 图标数量 | 48 个，页面用量少 | 更多，且同一页面重复出现 |
| 方案 | helper 内联输出 | `<use xlink:href>` 引用雪碧图 |
| 优势 | 实现简单、无额外请求 | 重复图标不重复输出 SVG 节点 |

**选型的依据是「同一页面里同一个图标出现几次」**，不是哪个方案更「高级」。
{% endnote %}

`stroke="currentColor"` 让图标自动跟随文字颜色，预设切换时图标颜色不用管——这是零成本适配三套预设的关键。

## 三、联系表单：无后端也能收留言

静态站没有后端，表单的 `action` 做成配置项：

```ejs
<%# 留言表单（配置 contact.form_action 后生效） %>
<form class="contact-form reveal" action="<%- theme.contact.form_action %>" method="POST">
  <div class="form-row">
    <label for="cf-name"><%= __('your_name') %></label>
    <input id="cf-name" type="text" name="name" required>
  </div>
  ...
  <button class="btn btn--primary" type="submit"><%= __('send') %><%- icon('send') %></button>
</form>
```

```yaml
contact:
  form_action: "https://formspree.io/f/xxxxxxx"   # 换成自己的收件端点
```

{% note tip 三种无后端方案 %}
1. **第三方表单服务**（Formspree / Getform）：最省事，配一个 URL；
2. **邮件链接**：`mailto:` 兜底，零配置但体验差；
3. **企业微信/飞书机器人 webhook**：需要少量 JS 配合，适合国内客户。

**主题只负责渲染表单，不绑定任何服务商**——把 `action` 做成配置，客户换服务商不用改代码。
{% endnote %}

## 四、动效：两个 IntersectionObserver

### 滚动淡入

```js
var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);       // 只触发一次，避免来回滚动反复动画
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
```

### 数字滚动（数据统计板块）

```js
function animateCounter(el) {
  var target = parseFloat(el.getAttribute('data-count')) || 0;
  var duration = 1600;
  function step(ts) {
    var p = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic：先快后慢
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(decimals);   // 收尾对齐终值
  }
  requestAnimationFrame(step);
}
```

{% note warning 两个必须做的兜底 %}
1. **不支持 IntersectionObserver 时直接全部显示**：
   ```js
   } else { reveals.forEach(function (el) { el.classList.add('in'); }); }
   ```
   否则老浏览器上页面是**一片空白**——这是致命的，因为元素初始状态是 `opacity: 0`。

2. **`prefers-reduced-motion` 要在 CSS 里响应**：
   ```css
   @media (prefers-reduced-motion: reduce) {
     .reveal { opacity: 1; transform: none; transition: none; }
   }
   ```
   有前庭功能障碍的用户会被动画影响，这是无障碍的硬要求。
{% endnote %}

## 五、其余交互：都很朴素

```js
// 顶栏滚动加阴影
header.classList.toggle('is-scrolled', window.scrollY > 8);

// 返回顶部按钮，滚过 480px 才出现
backTop.classList.toggle('is-visible', window.scrollY > 480);

// 移动端菜单：点链接后自动收起
siteNav.addEventListener('click', function (e) {
  if (e.target.closest('a')) {
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});
```

滚动监听统一加 `{ passive: true }`，否则移动端滚动会被阻塞。

无障碍的三件小事，成本极低但常被忽略：

```ejs
<a class="skip-link" href="#main"><%= __('skip_to_content') %></a>   <!-- 跳转链接 -->
<button id="back-to-top" aria-label="<%= __('back_to_top') %>" title="...">
<svg aria-hidden="true">                                              <!-- 装饰性图标对读屏隐藏 -->
```

{% note danger 一个真实的踩坑组合 %}
`.reveal` 的初始状态是透明的，导致**全页截图时下半页全空白**。截图脚本必须先给所有 `.reveal` 加 `.in`、把 `.stat__number` 填成终值，才能截到完整页面。

这类「初始状态不可见」的设计，会同时影响：SEO 快照、截图工具、打印、以及禁用 JS 的用户。
{% endnote %}

## 系列导航

{% note tip 系列导航 %}
[xongyi 系列总入口](/series/xongyi/) · 上一篇：[内容建模](/2026/10/15/series-xongyi-05-content-modeling/) · 下一篇：[部署工程化](/2026/10/15/series-xongyi-07-deploy-engineering/)
{% endnote %}
