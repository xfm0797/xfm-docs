---
title: 从零造一个 Hexo 主题（四）：三模式外壳——一个 layout.ejs 如何分发三种形态
date: 2026-10-15 12:00:00
updated: 2026-10-15 12:00:00
categories: [主题开发]
tags: [Hexo, EJS, 架构, 主题开发]
description: 拆解 layout.ejs 的形态分发逻辑：mode 解析优先级、挂件栏与导航树为什么是两个概念、右侧目录的空态守卫、body class 的构成，以及一次「全站形态被改错」的事故复盘。
---

三模式听起来像三套模板，实际上只有**一个 `layout.ejs`**。所有形态差异都收敛成几个布尔变量，在文件顶部算完，剩下的模板只做「要不要渲染这块」的判断。

这一篇把这段不到 40 行的代码拆开讲——它是整个主题最需要谨慎改动的地方。

<!-- more -->

## 一、mode 的解析优先级

```ejs
const currentMode = page.mode || theme.mode || 'blog';
```

三个来源，优先级从高到低：

| 来源 | 作用范围 | 典型用法 |
| --- | --- | --- |
| `page.mode`（front-matter） | 单页 | 文档页写 `mode: docs`，在博客站里也能出三栏 |
| `theme.mode`（配置） | 全站默认 | `theme_config.mode: blog` |
| `'blog'` | 兜底 | 什么都不写就是博客 |

**这个优先级设计带来一个很强的能力**：同一个站点可以既有博客首页、又有文档页。本站（xfm-docs）就是这么跑的——全站默认 `blog`，而 `/docs/**` 的每个页面 front-matter 带 `mode: docs`，于是它们仍然渲染成三栏文档形态。

```yaml
# source/docs/xfm/install/index.md
---
title: 安装
mode: docs
layout: page
---
```

{% note info 为什么要让 page 覆盖 theme %}
反过来设计（站点级优先）会让「博客站里插一组文档」变得不可能。让**更具体的声明覆盖更宽泛的声明**，是这类配置的通用原则。
{% endnote %}

## 二、挂件栏和导航树是两个概念

新手最容易混淆的一点：`blog` 右侧的挂件栏，和 `notes` / `docs` 左侧的导航树，长得像但性质完全不同。

```ejs
const hasSidebar = currentMode === 'blog' && sidebarPos !== 'none' && page.sidebar !== false;
const hasSideNav  = currentMode === 'docs' || currentMode === 'notes';
```

| 变量 | 谁有 | 内容 | 交互 |
| --- | --- | --- | --- |
| `hasSidebar` | 仅 blog | 挂件：最新文章 / 分类 / 标签云 / 归档 | 静态展示 |
| `hasSideNav` | docs / notes | 文档树 / 笔记列表 | 可折叠、窄屏变抽屉、带当前项高亮 |

把它们合成一个变量是我早期的一个错误：结果给挂件栏加上了「当前项高亮」逻辑，给文档树加上了「挂件排序」配置，两边都别扭。**后来拆开，两边各自清爽。**

## 三、右侧目录必须做空态守卫

这是个真实 bug：无小标题的页面（友链页、关于页）会渲染出一个只有「目录」两个字的空面板。

修法不是判断「有没有开启目录」，而是**先把目录正文算出来，再看它是不是空的**：

```ejs
const tocBody = tocEnabled ? xfm_toc(page.content || '') : '';
const rightToc = tocEnabled
  && currentMode !== 'blog'
  && (currentMode === 'docs' ? theme.docs.toc !== false : theme.notes.toc !== false)
  && tocBody.trim() !== '';      // ← 关键：正文真的有标题才渲染
```

{% note danger 判别式要落在「结果」上 %}
很多空态 bug 的根源，是判别式落在「开关」而不是「结果」上。开关开着不代表有内容——**先算出内容，再用内容的有无决定要不要渲染容器**。
{% endnote %}

## 四、body class 是形态的唯一真相

```ejs
const bodyClass = [
  'mode-' + currentMode,
  hasSidebar ? 'has-sidebar sidebar-' + sidebarPos : 'no-sidebar',
  rightToc ? 'has-inline-toc' : '',
  hasSideNav ? 'side-nav-' + sideMode : '',
  hasSideNav && canDrawer ? 'side-nav-can-drawer' : '',
  __A.enable ? '' : 'adaptive-off',
  theme.appearance && theme.appearance.animation === false ? 'no-animation' : ''
].filter(Boolean).join(' ');
```

所有视觉差异都由这些 class 驱动，CSS 里不出现「判断模式」的逻辑：

```css
body.mode-blog  .site-body { grid-template-columns: minmax(0,1fr) var(--widget-w); }
body.mode-docs  .site-body { grid-template-columns: var(--nav-w) minmax(0,1fr) var(--toc-w); }
body.no-sidebar .widget-column { display: none; }
```

**好处是调试时一眼可查**：打开 DevTools 看 `<body class="...">`，形态对不对立刻知道。我把这条固化成了「形态抽查」——每次改完配置都先看一眼 body class。

## 五、一次事故：全站形态被改错两次

{% timeline %}
{% event theme_config.mode 被误改成 docs / 2026-10-12 / danger %}
后果：首页与博客文章退回三栏文档形态，挂件栏消失。构建**完全成功、零报错**，肉眼扫首页才发现不对。
{% endevent %}
{% event 同样的错误随提交推到远端 / 2026-10-13 / danger %}
再次改回 `blog`。两次事故后，我把「看 body class」加进了每次改 `_config.yml` 后的固定检查项。
{% endevent %}
{% endtimeline %}

复盘结论很简单：**配置型错误的危险之处在于构建不会失败**。Hexo 的 `generate` 不会因为 `mode: docs` 而报错，它只是安静地生成一堆你不想要的页面。

{% note warning 我的检查清单 %}
改完 `_config.yml` 之后：
1. `npm run build` 看有没有 ERROR；
2. 打开首页看 `<body class>` 是不是 `mode-blog has-sidebar sidebar-right`；
3. 打开一个文档页看是不是 `mode-docs side-nav-...`。

第 2、3 步花不了 10 秒，但能挡住这类「构建成功但形态错了」的事故。
{% endnote %}

## 六、站点侧怎么用：theme_config 覆盖

站点根目录的 `_config.yml` 里写 `theme_config` 就能覆盖主题自带 `_config.yml` 的同名键（含 `mode`），主题升级时配置不丢：

```yaml
theme_config:
  mode: blog
  docs:
    expanded: false      # 文档树默认收起、只展开当前分支
  notes:
    note_categories: [更新日志]
  floating:
    toc_modes: [docs, notes]
```

{% note tip 一个反直觉的行为 %}
`theme_config` 与主题默认配置是**深合并**，而合并后的键顺序是「主题在前、站点新增的追加到末尾」。所以你在 `theme_config.menu` 里新增一项，它会排到已有菜单（含「更多」）**后面**，而不是你写的位置。

主题为此提供了 `menu_order` 配置项来精确控制顺序——**这是典型的「站点层需求回迁进主题」的案例**，第八篇会讲这个回迁机制。
{% endnote %}

## 系列导航

{% note tip 系列导航 %}
[系列总入口](/series/) · 上一篇：[设计令牌体系](/2026/10/15/series-03-design-tokens/) · 下一篇：[从响应式到自适应式响应](/2026/10/15/series-05-adaptive/)
{% endnote %}
