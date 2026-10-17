---
mode: docs

title: Hexo 主题设计指南
date: 2026-10-17 15:00:00
updated: 2026-10-17 15:00:00
description: 从目录契约、渲染管线、三类扩展点，到配置分层、形态分发、资产管理与版本交付，讲清一个 Hexo 主题是怎么被设计出来的。
keywords: [主题设计, Hexo, 架构, helper, tag, filter, 配置]
order: 64
---

# Hexo 主题设计指南

本文讲**设计决策**，不是 API 手册：一个主题由哪些部分组成、扩展点各解决什么问题、为什么这么切分。如果你想照着做一个自己的主题，或想判断某个改动该落在哪一层，看这篇。

## 一、主题的本质：目录即契约

Hexo 对主题的约定非常轻——`themes/<name>/` 下放这几个东西就构成主题：

```text
themes/xfm/
├── _config.yml        # 主题默认配置（站点可覆盖）
├── languages/         # zh-CN.yml、en.yml…国际化文案
├── layout/            # EJS 模板：唯一外壳 + 各类局部
│   ├── layout.ejs     # 全站 HTML 外壳（入口）
│   ├── index.ejs  post.ejs  page.ejs  archive.ejs …
│   └── _partials/     # head / nav / post/card / footer …
├── scripts/           # 构建期执行的 JS：helper / tag / filter
├── source/            # 会被原样复制到 /css /js /images 的静态资源
└── package.json  README.md  CHANGELOG.md
```

{% note info 这条契约决定了两件事 %}
**能覆盖的**：`layout/` 的视图、`_config.yml` 的配置、`source/` 的资源——站点都能覆盖。
**不能覆盖的**：`scripts/` 里注册的扩展（只能追加，不能替换同名）。
设计主题时要想清楚：这个能力用户有没有可能想改？想改的话它必须在可覆盖范围里。
{% endnote %}

## 二、渲染管线与三类扩展点

`scripts/` 下的 JS 在 **Hexo 加载阶段**执行，用来注册三类扩展。它们的区别是**介入时机不同**：

| 类型 | 注册方式 | 介入时机 | 解决什么问题 |
| --- | --- | --- | --- |
| **helper** | `hexo.extend.helper.register` | 模板渲染时被调用 | 模板里的函数：取值、格式化、生成片段 |
| **tag** | `hexo.extend.tag.register` | 正文解析时 | 文章正文里写的标签（如提示块、选项卡） |
| **filter** | `hexo.extend.filter.register` | 管线钩子（`before_generate` / `after_post_render`…） | 对数据或产物做后处理 |

### helper：模板的伸手可及之处

```js
hexo.extend.helper.register('xfm_icon', function (name, cls) {
  return '<svg class="xfm-icon ' + (cls || '') + '" aria-hidden="true">…</svg>';
});
```

模板里 `<%- xfm_icon('arrow-right') %>` 即可。**判断标准：这段逻辑会不会在多个模板里重复？** 会 → 提成 helper。

### tag：给作者的正文语法

```js
hexo.extend.tag.register('note', function (args, content) {
  const type = args[0] || 'info';
  return '<div class="xfm-note is-' + type + '">' + content + '</div>';
}, { ends: true });
```

成对标签要加 `{ ends: true }`。标签名一旦发布就是**对外 API**——改名会破坏所有用了它的文章，所以初期就要想清楚命名。

### filter：动数据而不是动模板

```js
hexo.extend.filter.register('after_post_render', function (data) {
  data.content = data.content.replace(/<img /g, '<img loading="lazy" ');
  return data;
});
```

{% note tip 优先用 filter 做"全站统一处理" %}
给所有图片加 `loading="lazy"`、给表格包滚动容器、抽取摘要……
这些**不该**在每个模板里写一遍，也不该让作者在文章里手写——交给 `after_post_render` 过滤器，一次生效、可关可换。
{% endnote %}

## 三、配置设计

配置是主题的**用户界面**，比模板更重要——用户 90% 的时间在改配置、改模板的时间不到 10%。

### 分层：一级键对应功能域

```yaml
mode: blog          # 全站形态
navbar: { … }       # 导航
sidebar: { … }      # 侧栏
post: { … }         # 文章页
docs: { … }         # 文档模式
custom: { … }       # 注入点
```

按**用户心智中的功能域**分组，而不是按实现分组。用户想改「文章页显示什么」就应该只翻 `post:` 一段。

### 站点覆盖：为什么主题配置不能被直接改

用户的站点配置里的 `theme_config` 会与主题自带 `_config.yml` **深合并**，站点优先：

```yaml
# 站点 _config.yml
theme_config:
  mode: blog
  floating:
    toc_modes: [docs, notes]
```

这样主题升级（哪怕是覆盖式更新）**不会丢用户配置**。这是必须遵守的约定：**主题自带配置永远只放默认值，用户改动写在站点侧。**

{% note warning 数组是替换，不是拼接 %}
深合并对数组的行为是**整体替换**。所以像友链、菜单这类数组，站点侧要写**完整列表**，
否则主题默认的几项会被顶掉。这个坑很隐蔽——不报错，只是"少了几条"。
{% endnote %}

### 向后兼容

- 新增键：给默认值，老配置照常工作；
- 废弃键：保留读取并做兼容映射，在 CHANGELOG 里写明，至少留一个大版本；
- 绝不复用已有键名表达新语义。

## 四、形态分发：一个外壳，多种形态

博客、笔记、文档三种内容的信息结构完全不同（要不要侧栏、侧栏是挂件还是导航树、有没有目录）。有两种做法：

- **多套外壳**：各写一份 `layout-xxx.ejs`——重复度高，改一处要改三处；
- **单外壳 + 形态标记**（本主题的选择）：只有 `layout.ejs`，把形态算成 `data-*` 与 class，CSS 再分支。

```ejs
const currentMode = page.mode || theme.mode || 'blog';
// page.mode 单页覆盖 > theme.mode 全站默认 > 兜底 blog
```

{% note tip 优先级顺序要想清楚 %}
**单页 front-matter > 主题配置 > 硬编码兜底**。
这样"站点默认是博客，但某几页是文档"这种混合需求自然成立——本站就是这么做的：
`theme_config.mode: blog`，而每个文档页自带 `mode: docs`。
{% endnote %}

外壳只输出标记，具体呈现交给 CSS：

```css
.mode-blog  .site-body { grid-template-columns: minmax(0,1fr) var(--widget-w); }
.mode-docs  .site-body { grid-template-columns: var(--nav-w) minmax(0,1fr) var(--toc-w); }
```

## 五、资产管理

| 来源 | 输出位置 | 用途 |
| --- | --- | --- |
| `source/css/*.css` | `/css/*.css` | 主题样式 |
| `source/js/*.js` | `/js/*.js` | 运行时脚本 |
| `source/images/*` | `/images/*` | 图标、默认图 |
| 构建期生成（EJS 输出 `<style>`） | 内联进 `<head>` | 依赖配置的样式（如自适应档位） |
| CDN（`vendors.*` 配置） | 外链 | KaTeX、Mermaid 等重型依赖 |

**加载顺序即覆盖优先级**，这一点要写进文档并保证稳定：

```text
variables → base → layout → components → post → plugins → adaptive
→ 构建期档位样式 → 自定义字体 → custom.css[] → 第三方 CSS
```

用户自定义排在最后，所以**同优先级规则能直接覆盖主题，不需要 `!important`**。这条契约一旦被破坏（比如把 custom.css 挪到前面），所有用户的覆盖都会失效——属于破坏性变更。

## 六、国际化

```yaml
# languages/zh-CN.yml
archive:
  title: 归档
  total_posts: 共 %s 篇文章
```

模板里 `<%= __('archive.title') %>`,带参数的用 `<%= __('archive.total_posts', n) %>`。

设计要点：

1. **文案全走 key**，模板里不留硬编码中文；
2. 缺 key 时回落到默认语言，**不要渲染出空白**；
3. 运行期切换（本主题的 `i18n.js`）要限定作用域——`closest('[data-lang]')` 这类查找**必须限定容器**，否则会误命中 `<html data-lang>` 把整页语言改掉。

## 七、可定制性设计

一个主题好不好用，取决于它给用户留了几道门：

{% timeline %}
{% event 第一道门 配置 %}
90% 的需求（开关、文案、列数、顺序）应该在 `_config.yml` 里有对应键。
{% endevent %}
{% event 第二道门 样式注入 %}
`custom.css` / `custom.js` 排在主题之后加载，用户可安全覆盖；设计令牌用 CSS 变量暴露，而不是把颜色写死在组件里。
{% endevent %}
{% event 第三道门 视图覆盖 %}
站点可覆盖任意 partial（本主题支持 `overrides/` + `setView`）。代价是与主题版本耦合，应作为最后手段。
{% endevent %}
{% event 第四道门 不改主题也能分发 %}
站点层能解决的，别动主题。主题若是 submodule，改动会在升级时冲突。
{% endevent %}
{% endtimeline %}

{% note warning 站点补丁要有退役条件 %}
每一次「站点层绕过主题缺陷」的补丁，都应该在注释里写清**根因**与**上游修复后如何退役**，
否则补丁会无限累积，最后没人敢删。本站的这类补丁统一登记在补丁清单里。
{% endnote %}

## 八、性能与可靠性

- **构建期能做的别留到运行期**：档位样式、目录、侧栏数据都在构建时算好，首屏没有额外请求；
- **模板里避免重计算**：模板每页执行一次，循环里调 helper 更要谨慎；
- **第三方脚本按需加载**：只有页面真的用到 Mermaid 才注入它的 CDN；
- **防闪烁**：深色模式在 `<head>` 内联脚本里同步设置，避免先白后黑；
- **形态抽查固定为回归项**：每次改配置/模板后，检查关键页面的 `<body class>`，光看"构建成功"挡不住形态回退。

## 九、版本与交付

| 事项 | 做法 |
| --- | --- |
| 版本号 | SemVer：新功能 MINOR、修复 PATCH、破坏性变更 MAJOR |
| CHANGELOG | 每个版本写清「新增 / 修复 / 破坏性变更」，破坏性变更要写迁移方式 |
| 兼容性声明 | README 标注适配的 Hexo 版本与 Node 版本 |
| 示例站 | 一个跑着最新版的 demo 站，比截图有用 |
| 文档站 | 按功能域组织，配搜索；本站即实例 |

{% note tip 把"升级不丢配置"当成硬约束 %}
用户最怕的不是缺功能，是升级后站点坏掉。
只要坚持「主题只放默认值 + 站点通过 `theme_config` 覆盖」，升级就是拉新代码，零迁移成本。
{% endnote %}

---

**相关文档**：[EJS 模板语法与设计](/docs/xfm/ejs-template/) · [配置总览](/docs/xfm/config/) · [自定义样式与注入](/docs/xfm/customize/) · [运行时 API 与目录结构](/docs/xfm/api-structure/)
