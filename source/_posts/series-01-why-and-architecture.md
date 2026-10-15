---
title: 从零造一个 Hexo 主题（一）：为什么再造轮子，以及三模式架构
date: 2026-10-15 09:00:00
updated: 2026-10-15 09:00:00
categories: [主题开发]
tags: [Hexo, EJS, 主题开发, 架构]
description: hexo-theme-xfm 的第一篇：先讲清楚为什么要自己写主题，再用 blog / notes / docs 三模式架构回答「一套代码如何长出三种形态」。
---

市面上的 Hexo 主题并不少，但我还是从零写了一套。**不是因为现成的不好，而是因为我的三类内容根本不是同一种东西**：博客文章要的是卡片流和挂件栏，笔记要的是能连续翻阅的侧栏树，文档要的是三栏加翻页。用一套博客模板硬套这三种场景，总有一头别扭。

这个系列记录 `hexo-theme-xfm` 从 `efc52bd` 首次提交到 v1.3.0 的完整开发过程——包含设计决策、真实代码，以及那些让我调试到怀疑人生的坑。

<!-- more -->

## 一、先说清楚：我在不满什么

在动手之前，我把「现有主题让我难受的地方」列了出来，这成为后面所有设计的约束：

| 不满 | 具体表现 |
| --- | --- |
| 形态单一 | 一个主题只服务一种内容形态，博客主题写文档就得自己改模板 |
| 配置项散落 | 想改个间距，要同时翻 `_config.yml`、`source/css` 和某个 `.ejs` |
| 依赖重 | jQuery + 一堆 CDN 脚本，首屏为「可能用到的功能」付出确定性的代价 |
| 响应式只有宽度断点 | 手机和桌面共用一套 DOM，只是缩放，形态差异做不出来 |

{% note tip 一句话定位 %}
**一套代码、一套令牌、一份配置，长出 blog / notes / docs 三种形态，全站零第三方运行时依赖。**
{% endnote %}

## 二、三模式：不是三套皮肤，是三种信息结构

三个模式的差异不在配色，而在**读者怎么在里面移动**：

| 模式 | 读者行为 | 布局 | 侧栏是什么 |
| --- | --- | --- | --- |
| `blog` | 浏览、挑选、顺着标签跳 | 卡片流 + 右侧挂件栏 | 挂件（最新 / 分类 / 标签云 / 归档） |
| `notes` | 连续阅读、翻阅同一主题 | 左导航树 + 沉浸正文 + 右目录 | 笔记列表（按分类收录） |
| `docs` | 查、定位、按章节推进 | 左文档树 + 正文 + 右目录 + 上下篇翻页 | 文档树（由 YAML 定义） |

关键区分点：**`blog` 的右侧是「挂件栏」，`notes` / `docs` 的左侧是「导航树」**。它们在代码里是两个完全不同的概念，后面会看到 `hasSidebar` 和 `hasSideNav` 是两个独立变量——这个区分救了我很多次。

## 三、目录结构：按「谁来执行」分层

```text
hexo-theme-xfm/
├─ _config.yml            # 全部配置（743 行，全中文注释）
├─ languages/             # default.yml / zh-CN.yml / en.yml
├─ layout/
│  ├─ layout.ejs          # 唯一的外壳，负责形态分发
│  ├─ index / post / page / archive / category / tag / 404.ejs
│  └─ _partials/          # head / header / footer / sidebar / docs / notes / widgets ...
├─ scripts/
│  ├─ helpers/index.js    # 模板用的辅助函数（含档位、目录树、导航）
│  ├─ tags/index.js       # Markdown 标签插件
│  ├─ filters/content.js  # 正文后处理（代码块 / 锚点 / 外链…）
│  └─ generators/         # search.json / sitemap.xml / 404
└─ source/
   ├─ css/                # variables / base / layout / components / post / plugins / adaptive
   ├─ js/                 # core / toc / search / i18n / adaptive / ads
   └─ images/             # 三个 SVG（头像 / 默认封面 / favicon），零外链
```

{% note info 分层原则 %}
**模板只做分支，不做计算。** 任何需要「读配置 + 归一化 + 兜底」的逻辑都下沉到 `scripts/helpers`，模板里只写 `const A = xfm_adaptive()` 这样的调用。这条规矩让后来加自适应档位时，模板改动量小到可以忽略。
{% endnote %}

## 四、三条贯穿始终的设计原则

### 1. 形态差异一律做成配置开关

主题里不允许出现「为了某个站点需求而写的死代码」。想加形态差异，先问一句：这个差异值不值得进 `_config.yml`？

代价是配置文件越写越长（743 行），收益是**升级主题不用合并冲突**：站点所有定制都在 `theme_config` 里，主题文件一行没动。

### 2. 样式只消费语义变量

组件里不写 `#fff`，只写 `var(--c-surface)`；不写 `14px`，只写 `var(--fs-md)`。深浅色切换因此退化成「换一组变量值」，而不需要任何组件参与。

```css
/* ❌ 组件写死颜色 */
.post-card { background: #ffffff; color: #1b1f26; }

/* ✅ 只消费语义变量 */
.post-card { background: var(--c-surface); color: var(--c-text); }
```

### 3. 零第三方运行时依赖

搜索、目录、i18n、广告、档位探测全部自己写，总共 6 个 JS 文件。理由很实在：CDN 挂了站点就残废；而 Hexo 站点的功能需求其实非常有限，自己写反而更可控。

{% note warning 零依赖的代价 %}
没有 cheerio，正文 HTML 后处理就得自己用「占位保护 + 正则」实现（第六篇详述）；没有现成的 i18n 框架，多语言就得自己做反查替换（第七篇详述）。**零依赖不是省事，是把复杂度从「集成」转移到了「实现」。**
{% endnote %}

## 五、下一步

这一篇搭了架子，接下来七篇按开发真实顺序展开：

| 篇 | 主题 |
| --- | --- |
| 二 | Hexo 8 主题开发的九个坑（每个都能卡你半天） |
| 三 | 设计令牌：一套变量如何撑起深浅色与三模式 |
| 四 | 三模式外壳：`layout.ejs` 的形态分发 |
| 五 | 从响应式到自适应式响应：为什么我删掉了所有宽度 `@media` |
| 六 | 标签插件与内容过滤器：零依赖实现 Markdown 增强 |
| 七 | 运行期多语言切换与 AdSense 接入 |
| 八 | 从可用到可靠：缺陷治理、移动端血案与发布工程化 |

{% note tip 系列导航 %}
[系列总入口](/series/) · 下一篇：[Hexo 8 主题开发的九个坑](/2026/10/15/series-02-hexo8-pitfalls/)
{% endnote %}
