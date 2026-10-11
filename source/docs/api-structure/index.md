---
mode: docs

title: 运行时 API 与目录结构
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 主题的前端运行时 API、可复用的辅助函数，以及完整的目录结构说明。
keywords: [API, 运行时, 辅助函数, 目录结构, 源码]
order: 62
---

# 运行时 API 与目录结构

## 前端运行时

主题在 `layout/_partials/scripts.ejs` 中把配置注入到 `window.XFM`，随后依次加载 `adaptive.js`、`core.js`、`toc.js`、`search.js`。因此**任何在 `custom.js` 里执行的代码，都可以直接访问 `window.XFM`**。

### 配置对象

```js
window.XFM = {
  root: '/',                    // 站点根路径（子目录部署时非 "/"）
  mode: 'docs',                 // 当前站点形态
  lang: 'zh-CN',
  scheme: 'auto',

  search: {
    enable: true,
    path: '/search.json',
    max: 20,
    preview: 100,
    showDate: true
  },

  reading: {
    progress: true,
    smooth: true,
    autoHideNav: true,
    stickyNav: true,
    animation: true
  },

  features: {
    lightbox: true,
    copyCode: true,
    foldCode: false,
    toc: true
  },

  adaptive: {
    enable: true,
    strategy: 'adaptive',
    default_tier: 'desktop',
    remember: true,
    tiers: { mobile: {…}, tablet: {…}, desktop: {…} }
  },

  i18n: { … }
}
```

### 自适应 API

```js
// 当前档位："mobile" / "tablet" / "desktop"
XFM.adaptive.tier()

// 档位判断
XFM.adaptive.is('mobile')          // boolean
XFM.adaptive.isTouch()             // boolean

// 手动切档（remember 为 true 时写入 localStorage）
XFM.adaptive.setTier('desktop')

// 清除手动档位，回到自动探测
XFM.adaptive.clearTier()

// 取当前档的形态
XFM.adaptive.variant('sidebar')    // "sticky" / "inline" / "offcanvas" / "hide"
XFM.adaptive.variant('toc')        // "sticky" / "panel" / "hide"
XFM.adaptive.variant('nav')        // "bar" / "drawer"
XFM.adaptive.variant('layout')     // "single" / "two-column" / "three-column"

// 完整快照
XFM.adaptive.snapshot()
// {
//   tier: "desktop",
//   input: "pointer",
//   dpr: 2,
//   orientation: "landscape",
//   width: 1440,
//   variant: { layout, nav, sidebar, toc, fluid, density, min_width, max_width }
// }

// 监听跨档
XFM.adaptive.onTierChange(function (tier, prev) {
  console.log('档位变化：', prev, '->', tier);
});
```

### 事件

主题在 `document` 上派发两类自定义事件：

| 事件 | 触发时机 | `detail` |
| --- | --- | --- |
| `xfm:tierchange` | 档位发生跳变 | `{ tier, prev }` |
| `xfm:schemechange` | 深浅色方案切换 | `{ scheme }` |

```js
document.addEventListener('xfm:tierchange', function (e) {
  console.log(e.detail.prev, '->', e.detail.tier);
});

document.addEventListener('xfm:schemechange', function (e) {
  console.log('当前方案：', e.detail.scheme);  // "auto" / "light" / "dark"
});
```

{% note info 主题自己怎么用这两个事件 %}
- `core.js` 监听 `xfm:tierchange`，在跨档时**复位抽屉**（非手机档关闭侧栏抽屉）与**收起目录面板**
- `core.js` 监听 `xfm:schemechange`，通过 `postMessage` 通知 giscus 切换主题色
- `scripts.ejs` 内联脚本监听 `xfm:schemechange`，重新初始化 Mermaid
{% endnote %}

### 搜索 API

```js
window.__xfmSearch.open()      // 打开搜索面板
window.__xfmSearch.close()     // 关闭
window.__xfmSearch.toggle()    // 切换
```

## 构建期辅助函数

主题在 `scripts/helpers/index.js` 中注册了一批 EJS 可用的辅助函数。如果你要写自定义模板，可以直接调用：

| 函数 | 用途 |
| --- | --- |
| `xfm_adaptive()` | **归一化后的**自适应配置（模板与样式生成器共用的唯一真相源） |
| `xfm_breakpoints()` | 由 `adaptive` 反算的旧版六档断点（向后兼容） |
| `xfm_icon(name, cls)` | 输出一个 sprite 图标 `<svg>` |
| `xfm_cover(post)` | 按 `banner → cover → 正文首图 → 默认图` 取封面 |
| `xfm_excerpt(post, len)` | 按 `index.excerpt` 策略生成摘要 |
| `xfm_wordcount(content)` | 字数（中日韩按字符，拉丁按单词） |
| `xfm_reading(content)` | 阅读时长（分钟，至少 1） |
| `xfm_toc(content, cls)` | 由正文标题生成嵌套目录树 |
| `xfm_docs_nav()` | 文档模式侧边栏（读 `_data/docs.yml` 或自动生成） |
| `xfm_notes_nav()` | 笔记模式侧边栏（按分类 / 日期分组） |
| `xfm_related(post, n)` | 相关文章（标签 +2、分类 +3 打分） |
| `xfm_total_words()` | 全站总字数 |
| `xfm_number(num)` | 数字格式化（`1.2k` / `3.4w`） |
| `xfm_active(path)` | 导航当前项高亮判定 |
| `xfm_config(path, dft)` | 按点号路径读配置 |
| `xfm_enabled(path, dft)` | 配置项是否为真（排除 `none` / `false`） |

{% note tip xfm_adaptive() 是唯一真相源 %}
档位边界、每档形态、组件开关的**归一化**只在这里做一次：boot 探测脚本、样式生成器、模板共用同一份结果。这就是为什么改配置后必须 `hexo clean`——样式是构建期按这份结果生成的。
{% endnote %}

## 目录结构

```text
themes/xfm
├── _config.yml              # 主题配置（唯一入口，全部中文注释）
├── languages/               # default / zh-CN / en
├── layout/                  # EJS 模板
│   ├── layout.ejs           # 三模式外壳分发（栏数 / 导航 / 目录形态在这里决定）
│   ├── index.ejs            # 首页（Hero + 卡片流 + 分页）
│   ├── post.ejs             # 文章页
│   ├── page.ejs             # 页面（含 docs 模式的上下篇与最后更新）
│   ├── archive / category / tag / 404
│   └── _partials/
│       ├── head.ejs             # <head>：meta、OG、CSS、令牌注入
│       ├── header.ejs           # 导航栏 + 移动端抽屉
│       ├── footer.ejs
│       ├── sidebar.ejs          # blog 挂件栏
│       ├── breadcrumb.ejs
│       ├── pagination.ejs
│       ├── search.ejs           # 搜索面板
│       ├── comment.ejs
│       ├── social.ejs           # 社交图标（侧栏 + 抽屉共用）
│       ├── sprite.ejs           # 内置 SVG 图标库（<symbol> 定义）
│       ├── scripts.ejs          # 运行时配置注入 + JS 加载
│       ├── adaptive-boot.ejs    # 首屏同步定档脚本
│       ├── adaptive-style.ejs   # 按配置生成三档样式
│       ├── docs/nav.ejs         # 文档树
│       ├── notes/nav.ejs        # 笔记树
│       ├── post/                # card / meta / copyright / reward / share / related / nav-posts
│       ├── taxonomy/            # tags / categories / links
│       └── widgets/             # profile / recent-posts / categories / tagcloud / archive-list / toc
├── preview/                 # README 用的模式预览图
├── scripts/                 # Hexo 扩展
│   ├── filters/content.js   # 代码块工具条、标题锚点、表格容器、外链、懒加载、任务列表
│   ├── generators/
│   │   ├── search.js        # 生成 search.json
│   │   ├── sitemap.js       # 生成 sitemap.xml（可选 robots.txt）
│   │   └── 404.js           # 生成 404.html
│   ├── helpers/index.js     # 全部 EJS 辅助函数
│   └── tags/index.js        # 全部标签插件
└── source/
    ├── css/                 # variables · base · layout · components · post · plugins · adaptive
    ├── js/                  # adaptive · core · toc · search
    └── images/              # avatar / favicon / 默认封面（SVG，零外链）
```

### 关键文件职责

| 文件 | 职责 |
| --- | --- |
| `_config.yml` | **唯一配置入口**。改这里，不要改模板 |
| `layout/layout.ejs` | 三模式分发：决定当前页面是单栏 / 双栏 / 三栏，导航用 `bar` 还是 `drawer`，目录在右栏还是面板 |
| `layout/_partials/adaptive-boot.ejs` | 首屏同步定档，写入 `data-tier`，**渲染前完成，无闪烁** |
| `layout/_partials/adaptive-style.ejs` | 构建期按 `adaptive` 配置生成 `html[data-tier="…"]` 规则 |
| `scripts/helpers/index.js` | `xfm_adaptive()` 的归一化逻辑，是全站档位行为的唯一真相源 |
| `scripts/filters/content.js` | 正文渲染后的增强流水线 |
| `source/js/core.js` | 深浅色、抽屉、滚动、代码块、灯箱、评论、分享的运行时 |

## 主题的扩展点

主题设计了六个干净的扩展点，**都指向站点级文件，不侵入主题目录**：

{% row %}
{% col 6 %}
**数据**

- `source/_data/docs.yml` — 文档树
- `source/_data/<其它>.yml` — 配合 `docs.data_file` 切换多份文档树
{% endcol %}
{% col 6 %}
**资源**

- `source/css/custom.css` — 自定义样式
- `source/js/custom.js` — 自定义脚本
{% endcol %}
{% endrow %}

{% row %}
{% col 6 %}
**配置**

- 站点 `_config.yml` 的 `theme_config` — 覆盖主题配置
- `custom.head` / `custom.body_end` / `custom.post_footer` — 注入 HTML
{% endcol %}
{% col 6 %}
**模板（进阶）**

- 在站点 `layout/` 下放置同名 EJS 即可覆盖主题模板
- 例如 `layout/page.ejs` 会优先于主题的同名文件
{% endcol %}
{% endrow %}

{% note warning 模板覆盖是最后手段 %}
Hexo 的模板查找顺序是"站点 `layout/` → 主题 `layout/`"。覆盖模板能实现任意定制，但**主题升级时你需要手动合并改动**。优先用配置、令牌、`custom` 注入这三条路径。
{% endnote %}

## 升级流程

```bash
# 1. 备份你的定制文件（都在站点目录，通常不需要额外操作）
#    source/_data/docs.yml
#    source/css/custom.css
#    source/js/custom.js

# 2. 升级主题
cd themes/xfm && git pull          # git 安装
# 或
npm update hexo-theme-xfm && cp -r node_modules/hexo-theme-xfm/* themes/xfm/

# 3. 对照新版 _config.yml 补齐新增配置项
diff themes/xfm/_config.yml 你备份的旧版

# 4. 重新生成
hexo clean && hexo g && hexo s
```

{% note tip 用 theme_config 升级最省事 %}
如果你的定制全部写在站点 `_config.yml` 的 `theme_config` 里，`themes/xfm` 就是一个纯粹的、未修改的上游副本，`git pull` 永远不会冲突。
{% endnote %}
