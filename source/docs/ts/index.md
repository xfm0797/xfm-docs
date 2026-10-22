---
mode: docs

title: TypeScript 手册
date: 2026-10-22 23:25:00
updated: 2026-10-22 23:25:00
description: TypeScript 官方手册中文整理版导读：TypeScript 是什么、静态类型检查的意义、手册的组织方式与阅读路径，以及本站已翻译的章节索引。
keywords: [TypeScript, 手册, 静态类型检查, tsc, 类型系统, 中文文档]
order: 1
---

# TypeScript 手册

这是一份面向日常开发者的 TypeScript 中文手册，内容整理自 [TypeScript 官方文档](https://www.typescriptlang.org/docs/handbook/intro.html)，按本站文档形态重新组织：章节顺序与官方 Handbook 一致，示例代码与结论保持与原文一致，讲解按中文表达习惯重写。

## 为什么需要 TypeScript

JavaScript 进入编程社区二十多年后，已经是应用最广泛的跨平台语言之一。它最初只是给网页加一点交互的小脚本语言，如今已成长为各类规模前后端应用的首选。然而，程序的规模、范围与复杂度指数级增长的同时，JavaScript **表达代码单元之间关系的能力**并没有同步增长；再加上它颇为特殊的运行时语义，语言能力与程序复杂度之间的错位，让大规模 JavaScript 开发变得难以管理。

程序员最常写出的错误可以概括为**类型错误**：在期望某种值的地方用了另一种值。原因可能是笔误、对库 API 理解不足、对运行时行为做了错误假设等等。

TypeScript 的目标就是成为 JavaScript 程序的**静态类型检查器**——一个在代码运行**之前**（静态）运行、确保程序类型正确的工具（typechecked）。

> 如果你没有 JavaScript 基础、想以 TypeScript 作为第一门语言，建议先读 JavaScript 入门材料；有其他语言经验的话，通过本手册可以很快上手 JavaScript 语法。

## 手册如何组织

官方手册分为两部分：

**Handbook（手册）** —— 面向日常开发者，从上到下顺序阅读即可。每一章都力求让你扎实理解相关概念。它不是完整的语言规范，而是覆盖全部语言特性与行为的**综合指南**。读完整个手册后，读者应当能够：

- 读懂并理解常用的 TypeScript 语法与模式；
- 解释重要编译选项的作用；
- 在多数情况下正确预测类型系统的行为。

为清晰与简洁起见，手册不会穷举边界情况与细枝末节；某些概念的细节可以在参考（Reference）章节找到。

**Reference（参考）** —— 位于手册之后，用于更深入地理解 TypeScript 某一具体部分。它可以顺序读，但各节之间并不追求连贯性，每节都聚焦单个概念的深入解释。

### 手册不做什么

手册也力求「几小时内能读完」，因此有意略去一些主题：

- 不完整介绍 JavaScript 的核心基础（函数、类、闭包等），必要时给出延伸阅读链接；
- 不替代语言规范：某些情况会跳过边界行为与形式化描述，改以高层次、易懂的解释呈现，精确描述在参考页中；
- 基本不涉及 TypeScript 与其他工具的集成（webpack、rollup、parcel、react、babel、vue、angular 等），这些属于手册范围之外。

## 上手准备

先准备一个可运行的 TypeScript 环境：安装 Node.js 后，用 npm 全局安装编译器。

```bash
npm install -g typescript
tsc --version
```

新建一个 `hello.ts`：

```ts
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Brendan", new Date());
```

用 `tsc hello.ts` 编译，会在同目录生成 `hello.js`。也可以开启 `--watch` 在保存时自动编译：

```bash
tsc --watch hello.ts
```

也可以不做类型标注直接写 JavaScript——把文件后缀改成 `.ts` 就能获得类型检查与编辑器补全：

```ts
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Brendan");
```

此时编译器会提示：`greet` 期望 2 个参数，但只传了 1 个。这正是静态类型检查在起作用——**在你运行代码之前**就把错误暴露出来。

## 本站章节目录

按建议顺序阅读：

{% row %}
{% col %}
- [基础](/docs/ts/basic-types/) —— 静态类型检查、类型注解、类型擦除
- [日常类型](/docs/ts/everyday-types/) —— string / number / 联合 / 接口 / 字面量
- [类型收窄](/docs/ts/narrowing/) —— typeof、类型谓词、可辨识联合
- [函数](/docs/ts/functions/) —— 签名、泛型函数、重载、this
- [对象类型](/docs/ts/object-types/) —— 修饰符、索引签名、交叉类型、元组
{% endcol %}
{% col %}
- [从类型创建类型](/docs/ts/types-from-types/) —— keyof / typeof / 条件 / 映射 / 模板字面量
- [泛型](/docs/ts/generics/) —— 类型参数、约束、泛型类、型变
- [类](/docs/ts/classes/) —— 继承、可见性、抽象类、this 类型
- [模块](/docs/ts/modules/) —— ES Modules、import type、CommonJS
{% endcol %}
{% endrow %}

## 版本与说明

- 内容以 TypeScript 官方 Handbook（`handbook/2/*` 系列）为底本整理，示例中的诊断码、错误文案按当前编译器版本表述。
- 章节内的「规则」提示保留官方原文的强调语气，方便快速回顾。
- 若与最新官方文档存在差异，以 [typescriptlang.org](https://www.typescriptlang.org/docs/handbook/intro.html) 为准；也欢迎通过页面底部的「编辑此页」提交修正。

{% button /docs/ts/basic-types/, 从「基础」开始阅读, arrow-right, fill %}
