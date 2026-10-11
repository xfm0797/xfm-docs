---
title: 自定义样式与模板
mode: docs
layout: page
order: 51
description: 在不修改主题的前提下定制 Xongyi：覆写 CSS 变量、注入自定义样式与脚本、扩展图标与模板。
keywords: [自定义, CSS 变量, injector, 注入, 主题定制]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 自定义样式与模板

Xongyi 的设计目标是"配置优先"，但真实项目总有配置覆盖不到的地方。本页给出**不修改主题**的定制路径，保证升级主题时不丢改动。

{% note warning Xongyi 没有内置的 custom.css / custom.js 钩子 %}
与部分主题不同，Xongyi 的 `head.ejs` / `scripts.ejs` 没有提供 `custom.css` / `custom.js` 配置项。定制请走 Hexo 官方的 **Injector API**（本页方案），或直接 fork 主题。
{% endnote %}

## 方案一：覆写设计令牌（最省事）

主题全站视觉建立在一组 CSS 变量上，改写变量是最安全、最不侵入的定制方式。

在站点根目录新建 `scripts/xongyi-inject.js`：

```javascript
/* 站点级注入：自定义样式与脚本（不改主题） */
hexo.extend.injector.register('head_end', `
  <style>
    /* 覆写品牌主色 —— 直接影响按钮、链接、强调文字、CTA 条 */
    :root {
      --primary: #0f766e;
      --primary-strong: #115e59;
      --primary-soft: #ecfdf5;
      --accent: #14b8a6;
      --radius: 10px;          /* 全站圆角 */
      --container: 1240px;     /* 内容最大宽度 */
    }
    /* 暗色模式单独给一套 */
    :root[data-theme="dark"] {
      --primary: #2dd4bf;
      --primary-strong: #5eead4;
      --primary-soft: rgba(45, 212, 191, .14);
    }
    /* 只想改某一套预设时可加选择器限定 */
    body.preset-government { --primary: #b81c22; }
  </style>
`);
```

常用令牌：

| 变量 | 作用 |
| --- | --- |
| `--primary` / `--primary-strong` / `--primary-soft` | 主色与其中性变体 |
| `--primary-contrast` | 主色块上的文字色 |
| `--accent` | 辅助强调色 |
| `--bg` / `--bg-tint` / `--surface` | 背景、浅色带、卡片面 |
| `--text` / `--text-secondary` / `--muted` / `--border` | 文字与描边 |
| `--radius` / `--radius-sm` / `--radius-lg` | 三档圆角 |
| `--container` | 内容最大宽度 |
| `--header-h` | 顶部导航高度 |

{% note tip 为什么改令牌比改样式稳 %}
页面里几乎所有颜色都通过变量引用，改一处即全站生效；而且主题升级时变量名比具体的类名稳定得多。
{% endnote %}

## 方案二：追加自己的 CSS 文件

想要更长的样式表时，把样式放在站点 `source/css/` 下，再用 Injector 引入：

```text
站点根/
├── scripts/xongyi-inject.js       # 注入代码
└── source/css/xongyi-custom.css   # 你的样式
```

```javascript
// scripts/xongyi-inject.js
hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/xongyi-custom.css">');
```

{% note info 站点文件优先级更高 %}
站点 `source/` 与主题 `source/` 会合并输出，**站点侧同名文件优先**。因此你甚至可以放一个 `source/css/style.css` 来整体覆盖主题样式 —— 但不推荐（升级会失去主题的样式修复），建议只新增文件。
{% endnote %}

## 方案三：注入自定义脚本

```javascript
// scripts/xongyi-inject.js
hexo.extend.injector.register('body_end', `
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      // 例如：统计移动端菜单展开次数
      var t = document.getElementById('nav-toggle');
      if (t) t.addEventListener('click', function () { /* ... */ });
    });
  </script>
`);
```

可用的注入点（Hexo Injector API）：`head_begin` / `head_end` / `body_begin` / `body_end`，可传 `'default'` 或页面类型（如 `'post'`、`'page'`）来限定范围。

{% note warning 脚本里不要写 ES 模块语法 %}
注入内容会被原样写进 HTML。主题自身使用原生 ES5 风格脚本以兼容旧浏览器，建议保持一致；若需模块，用 `type="module"` 并自行处理兼容性。
{% endnote %}

## 方案四：改模板 / 图标（需要 fork）

若必须改动 `layout/` 或 `scripts/icons.js`（例如新增图标、调整板块 HTML 结构），Injector 帮不上忙，此时应：

1. **Fork 主题仓库**到自己账号，改为引用你的 fork；
2. 或把主题复制到站点 `themes/` 下改名（如 `themes/xongyi-mine`），并放弃 `git pull` 升级、改为手动比对合并。

{% note warning 不要直接改主题目录里的文件 %}
在 `themes/hexo-theme-xongyi/` 内直接修改，会在下次升级时被覆盖或产生冲突。要么走 Injector，要么 fork。
{% endnote %}

## 定制检查清单

- [ ] 生成的是站点 `scripts/` 下的脚本（会被 Hexo 自动加载），不是主题的
- [ ] 样式优先改 CSS 变量，其次新增 CSS 文件并保持选择器足够具体
- [ ] 暗色模式单独验证（`:root[data-theme="dark"]`）
- [ ] 三套预设（`body.preset-*`）都过一遍
- [ ] `hexo clean && hexo generate` 后确认注入内容出现在 `public/*.html`

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/structure/, 目录结构与运行时, layers, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/icons/, 图标速查, star, outline %}
{% endcol %}
{% endrow %}
