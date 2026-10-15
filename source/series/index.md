---
title: 系列文章 · 从零造一个 Hexo 主题
layout: page
date: 2026-10-15 09:00:00
updated: 2026-10-15 16:00:00
description: hexo-theme-xfm 开发全过程的 8 篇系列文章总入口：架构、踩坑、设计令牌、形态分发、自适应响应、标签插件、国际化与发布工程化。
comments: false
---

这是 **hexo-theme-xfm** 的开发过程系列，记录这套主题从首次提交（`efc52bd`）到 v1.3.0 的完整路径：设计决策、真实代码，以及调试到怀疑人生的那些坑。

{% note tip 一句话 %}
一套代码、一套令牌、一份配置，长出 blog / notes / docs 三种形态，全站零第三方运行时依赖。
{% endnote %}

## 全系列篇目

| # | 篇目 | 你会拿到什么 |
| --- | --- | --- |
| 一 | [为什么再造轮子与三模式架构](/2026/10/15/series-01-why-and-architecture/) | 需求定位、三模式的本质差异、目录分层、三条设计原则 |
| 二 | [Hexo 8 主题开发的九个坑](/2026/10/15/series-02-hexo8-pitfalls/) | 插件不加载、脚本不回调、配置读不到、EJS 的 TDZ、`page.path` 形态、没有 cheerio |
| 三 | [设计令牌体系](/2026/10/15/series-03-design-tokens/) | 三层令牌、品牌色 RGB 派生、深色只换变量、z-index 集中管理 |
| 四 | [三模式外壳的形态分发](/2026/10/15/series-04-mode-shell/) | mode 优先级、挂件栏 vs 导航树、空态守卫、body class 抽查法 |
| 五 | [从响应式到自适应式响应](/2026/10/15/series-05-adaptive/) | 为什么删掉宽度 `@media`、四级定档链、档位样式生成器、旧配置兼容 |
| 六 | [标签插件与内容过滤器](/2026/10/15/series-06-tag-plugins/) | 14 个标签的实现、跨标签状态收集、占位保护 + 正则 |
| 七 | [运行期多语言切换与 AdSense](/2026/10/15/series-07-i18n-adsense/) | 反查替换、白名单容器、占位符重渲染、广告位统一判定 |
| 八 | [从可用到可靠](/2026/10/15/series-08-hardening-release/) | 缺陷回迁、两个移动端血案、commit 拆分、验证体系、npm 发布 |

## 建议的阅读顺序

{% timeline %}
{% event 先建立整体图景 / 第一、四篇 / primary %}
先读「为什么造」和「形态如何分发」，理解三模式不是三套皮肤，而是三种信息结构。
{% endevent %}
{% event 再补地基 / 第二、三篇 / info %}
踩坑清单和设计令牌是后面所有实现的前提。写过 Hexo 插件的人可以跳过第二篇的前半部分。
{% endevent %}
{% event 然后攻难点 / 第五、六、七篇 / success %}
自适应档位、标签插件、国际化，这三块是主题里最复杂的部分，各自独立，可挑感兴趣的读。
{% endevent %}
{% event 最后看工程化 / 第八篇 / warning %}
缺陷治理与发布流程。如果你也要长期维护一个开源项目，这篇的方法论比代码更有价值。
{% endevent %}
{% endtimeline %}

## 适合谁

- **想写自己的 Hexo 主题**：第二、四篇能帮你少踩一半的坑；
- **想改主题但不想 fork**：第四篇讲 `theme_config` 覆盖与深合并行为；
- **关心前端架构**：第三、五篇的令牌分层和档位驱动是通用的；
- **维护开源项目**：第八篇的回迁原则、commit 拆分与发布流程可直接照搬。

## 相关资源

{% row %}
{% col 6 %}
**源码**

[hexo-theme-xfm · GitHub](https://github.com/xfm0797/hexo-theme-xfm)
{% endcol %}
{% col 6 %}
**官方文档**

[安装](/docs/xfm/install/) · [配置参考](/docs/xfm/config/) · [常见问题](/docs/xfm/faq/)
{% endcol %}
{% endrow %}

{% note info 版本对应 %}
本系列基于 **v1.3.0** 撰写。主题仍在迭代，若某处与你装到的版本不一致，以 [主题仓库](https://github.com/xfm0797/hexo-theme-xfm) 的 CHANGELOG 为准。
{% endnote %}

## 姐妹系列

{% note tip 另一套主题 %}
[从零造一个机构官网主题（xongyi）](/series/xongyi/) —— 面向企业 / 政务 / 教育官网，8 篇讲三套预设、首页板块编排、配置产品化与五平台部署。

两套主题的差异对比见 [那一系列的收官篇](/2026/10/15/series-xongyi-08-from-theme-to-product/)。
{% endnote %}
