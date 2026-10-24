---
title: 文档中心
date: 2026-10-11 09:00:00
updated: 2026-10-24 15:40:00
description: XFM 开源官方文档中心 —— 收录 hexo-theme-xfm 与 hexo-theme-xongyi 两套 Hexo 主题的完整技术文档，以及 TypeScript、Rust 官方文档中文整理版。
keywords: [XFM, Hexo 主题, 文档, hexo-theme-xfm, hexo-theme-xongyi, TypeScript, Rust]
order: 0
mode: docs
---

# 文档中心

这里收录 [XFM](https://github.com/xfm0797) 开源的两套 Hexo 主题的官方技术文档，以及官方技术文档的中文整理教程。各分区彼此独立：

{% row %}
{% col %}
{% note success %}
**[hexo-theme-xfm](/docs/xfm/)**

高端大气的三模式主题：一套代码同时覆盖博客（blog）/ 笔记（notes）/ 文档（docs）三种形态，自适应式响应，内置富标签插件。

→ [进入 xfm 主题文档](/docs/xfm/)
{% endnote %}
{% endcol %}
{% col %}
{% note info %}
**[hexo-theme-xongyi](/docs/xongyi/)**

面向机构官网的通用主题：企业 / 政务 / 教育三套预设，12 个首页板块，配置即可上线。

→ [进入 xongyi 主题文档](/docs/xongyi/)
{% endnote %}
{% endcol %}
{% col %}
{% note tip %}
**[TypeScript 手册](/docs/ts/)**

TypeScript 官方 Handbook 的中文整理版：从基础类型一路读到泛型、类与模块，示例与原文档保持一致。

→ [进入 TypeScript 教程](/docs/ts/)
{% endnote %}
{% endcol %}
{% col %}
{% note warning %}
**[Rust 手册](/docs/rust/)**

Rust 官方教程 The Book 的中文整理版：从所有权与借用读到泛型、trait 与生命周期，示例与编译器报错保持原样。

→ [进入 Rust 教程](/docs/rust/)
{% endnote %}
{% endcol %}
{% endrow %}

## 一、hexo-theme-xfm

面向**长期写作**的三模式主题。文档位于 `/docs/xfm/`，按下面的目录组织：

{% row %}
{% col %}
- [快速开始](/docs/xfm/intro/) —— 简介、安装、上手
- [配置参考](/docs/xfm/config/) —— 外观、导航、首页、侧栏
- [三种模式](/docs/xfm/mode-blog/) —— blog / notes / docs
{% endcol %}
{% col %}
- [自适应式响应](/docs/xfm/adaptive/) —— 三档而非响应式
- [标签插件](/docs/xfm/tags/) —— note / tabs / mermaid …
- [扩展能力](/docs/xfm/search/) —— 搜索、评论、SEO
{% endcol %}
{% col %}
- [定制与进阶](/docs/xfm/customize/) —— 注入、front-matter、API
- [帮助](/docs/xfm/faq/) —— 常见问题与故障排查
{% endcol %}
{% endrow %}

## 二、hexo-theme-xongyi

面向**机构官网**的通用主题。文档位于 `/docs/xongyi/`：

{% row %}
{% col %}
- [主题简介](/docs/xongyi/) —— 定位与能力
- [安装部署](/docs/xongyi/install/) —— 快速接入
- [预设布局](/docs/xongyi/preset/) —— 企业 / 政务 / 教育
{% endcol %}
{% col %}
- [首页板块](/docs/xongyi/sections/) —— 12 个可组合板块
- [配置项详解](/docs/xongyi/config/) —— 逐项说明
- [写新闻与内容](/docs/xongyi/writing/) —— 内容规范
{% endcol %}
{% col %}
- [一键部署](/docs/xongyi/deploy/) —— 发布上线
- [常见问题](/docs/xongyi/faq/) —— 疑难排查
{% endcol %}
{% endrow %}

## 三、教程 · TypeScript

官方文档的中文整理，位于 `/docs/ts/`。按官方 Handbook 的推荐顺序编排：

{% row %}
{% col %}
- [手册导读](/docs/ts/) —— 为什么需要 TypeScript
- [基础](/docs/ts/basic-types/) —— 静态类型检查与类型注解
- [日常类型](/docs/ts/everyday-types/) —— 最常用的类型
- [类型收窄](/docs/ts/narrowing/) —— 控制流分析
{% endcol %}
{% col %}
- [函数](/docs/ts/functions/) —— 签名、重载、this
- [对象类型](/docs/ts/object-types/) —— 修饰符与索引签名
- [从类型创建类型](/docs/ts/types-from-types/) —— 类型操作符
{% endcol %}
{% col %}
- [泛型](/docs/ts/generics/) —— 类型参数与约束
- [类](/docs/ts/classes/) —— 继承与可见性
- [模块](/docs/ts/modules/) —— ES Modules
{% endcol %}
{% endrow %}

## 四、教程 · Rust

官方教程《The Rust Programming Language》的中文整理，位于 `/docs/rust/`。按学习曲线编排，重点铺平所有权这条最陡的坡：

{% row %}
{% col %}
- [手册导读](/docs/rust/) —— Rust 是什么、环境搭建与 Cargo
- [通用概念](/docs/rust/common-concepts/) —— 变量、类型、函数、控制流
- [所有权](/docs/rust/ownership/) —— 移动、借用、切片
- [结构体](/docs/rust/structs/) —— 定义、实例与方法
- [枚举与模式匹配](/docs/rust/enums/) —— match、Option、穷尽性
{% endcol %}
{% col %}
- [模块系统](/docs/rust/modules/) —— 包、crate 与可见性
- [常用集合](/docs/rust/collections/) —— Vec、String、HashMap
- [错误处理](/docs/rust/error-handling/) —— panic!、Result 与 ?
- [泛型、Trait 与生命周期](/docs/rust/generics/) —— 抽象三支点
- [闭包与迭代器](/docs/rust/closures-iterators/) —— 惰性求值与零成本抽象
{% endcol %}
{% endrow %}

## 阅读方式

左侧文档树由站点根目录的 `source/_data/docs.yml` 驱动，每个分区一个顶层分组（主题 / 教程），其下按章节递归展开。文档页支持「上一章 / 下一页」翻页与右侧页内目录，底部提供「编辑此页」入口。

{% fold 站点本身用了哪套主题？ %}
本站由 **hexo-theme-xfm** 的 `docs` 模式驱动，采用「目录 + `index.md`」的 pretty URL 形式，文档页在 front-matter 中声明 `mode: docs` 以覆盖站点默认的 blog 形态。
{% endfold %}

{% button /docs/xfm/, 开始阅读 xfm 文档, arrow-right, fill %}

> 文档仍在持续完善。若发现错误或有建议，欢迎通过页面底部的「编辑此页」提交修改。
