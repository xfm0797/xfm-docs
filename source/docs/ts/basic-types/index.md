---
mode: docs

title: 基础
date: 2026-10-19 23:10:00
updated: 2026-10-19 23:10:00
description: TypeScript 官方手册《The Basics》中文翻译：静态类型检查、类型注解、类型擦除、降级与严格性。
keywords: [TypeScript, 基础, 静态类型检查, tsc, 类型注解, 严格模式]
order: 2
---

# 基础

欢迎来到手册的第一页。如果这是你第一次接触 TypeScript，你可能想从某个“[入门](https://www.typescriptlang.org/docs/handbook/intro.html#get-started)”指南开始。

JavaScript 中的每一个值都有一组可以通过运行不同操作观察到的行为。这听起来很抽象，但作为一个快速示例，考虑我们可能对名为 `message` 的变量执行的一些操作。

```js
// Accessing the property 'toLowerCase'
// on 'message' and then calling it
message.toLowerCase();
// Calling 'message'
message();
```

如果我们拆解一下，第一行可运行代码访问了一个名为 `toLowerCase` 的属性然后调用它。第二行尝试直接调用 `message`。

但假设我们不知道 `message` 的值——这很常见——我们就无法可靠地说出运行这些代码会得到什么结果。每个操作的行为完全取决于我们一开始拥有什么值。

- `message` 可调用吗？
- 它上面是否有名为 `toLowerCase` 的属性？
- 如果有，`toLowerCase` 可调用吗？
- 如果这两个值都可调用，它们返回什么？

这些问题的答案通常是我们写 JavaScript 时记在脑子里的东西，而且我们得希望自己把所有细节都搞对了。

假设 `message` 是按以下方式定义的。

```js
const message = "Hello World!";
```

正如你所能猜到的，如果我们尝试运行 `message.toLowerCase()`，我们会得到同样的字符串，只是小写形式。

那第二行代码呢？如果你熟悉 JavaScript，你会知道它会抛出异常失败：

```txt
TypeError: message is not a function
```

如果我们能避免此类错误就太好了。

当我们运行代码时，JavaScript 运行时选择做什么的方式是通过弄清楚值的*类型*——它有什么样的行为和能力。这正是那个 `TypeError` 所暗示的部分——它表示字符串 `"Hello World!"` 不能被当作函数调用。

对于某些值，比如原始类型 `string` 和 `number`，我们可以在运行时使用 `typeof` 运算符识别它们的类型。但对于其他东西比如函数，没有相应的运行时机制来识别它们的类型。例如，考虑这个函数：

```js
function fn(x) {
  return x.flip();
}
```

我们可以通过阅读代码*观察*到，这个函数只有在传入一个带有可调用 `flip` 属性的对象时才能工作，但 JavaScript 并没有以某种我们可以在代码运行时检查的方式暴露这些信息。在纯 JavaScript 中，要判断 `fn` 对特定值做什么的唯一方法是调用它并看会发生什么。这种行为使得在代码运行前很难预测它会做什么，这意味着你在写代码时更难知道代码会做什么。

由此可见，*类型*是描述哪些值可以传给 `fn` 以及哪些会导致崩溃的概念。JavaScript 只真正提供*动态*类型——运行代码看会发生什么。

另一种选择是使用*静态*类型系统在代码运行*之前*预测它应该做什么。

## 静态类型检查

回想一下我们之前试图将 `string` 作为函数调用时得到的 `TypeError`。*大多数人*不喜欢在运行代码时遇到任何错误——那些被视为 bug！当我们写新代码时，我们尽力避免引入新 bug。

如果我们只加一点代码，保存文件，重新运行代码，并立即看到错误，我们也许能快速定位问题；但情况并非总是如此。我们可能对功能的测试不够彻底，因此可能永远不会实际遇到可能抛出的潜在错误！或者如果我们足够幸运目睹了错误，我们可能做了大型重构并添加了很多不同的代码，被迫去深挖。

理想情况下，我们可以有一个工具在代码运行*之前*帮我们发现这些 bug。这正是像 TypeScript 这样的静态类型检查器所做的。*静态类型系统*描述了我们运行程序时值将具有的形状和行为。像 TypeScript 这样的类型检查器利用这些信息告诉我们何时可能偏离正轨。

```ts
const message = "hello!";

message();
```

> 报错信息：此表达式不可调用。类型 'String' 没有调用签名。（诊断码 2349）

使用 TypeScript 运行上述最后一个示例会在我们实际运行代码之前就给出错误消息。

## 非异常失败

到目前为止，我们一直在讨论某些事情，比如运行时错误——JavaScript 运行时告诉我们它认为某些东西无意义的情况。这些情况的产生是因为 [ECMAScript 规范](https://tc39.github.io/ecma262/) 对语言遇到意外情况时应该如何表现有明确的指示。

例如，规范说尝试调用不可调用的东西应该抛出错误。也许这听起来像“显而易见的行为”，但你可以想象访问对象上不存在的属性也应该抛出错误。然而，JavaScript 给了我们不同的行为并返回 `undefined` 值：

```js
const user = {
  name: "Daniel",
  age: 26,
};
user.location; // returns undefined
```

归根结底，静态类型系统必须决定哪些代码应在其系统中被标记为错误，即使它是不会立即抛出错误的“有效”JavaScript。在 TypeScript 中，以下代码会产生关于 `location` 未定义的错误：

```ts
const user = {
  name: "Daniel",
  age: 26,
};

user.location;
```

> 报错信息：属性 'location' 不存在于类型 '{ name: string; age: number; }' 上。（诊断码 2339）

虽然有时这意味在你能表达的东西上有取舍，但其意图是捕获程序中的真正 bug。而 TypeScript 捕获*大量*真正的 bug。

例如：拼写错误，

```ts
const announcement = "Hello World!";

// How quickly can you spot the typos?
announcement.toLocaleLowercase();
announcement.toLocalLowerCase();

// We probably meant to write this...
announcement.toLocaleLowerCase();
```

未调用的函数，

```ts
function flipCoin() {
  // Meant to be Math.random()
  return Math.random < 0.5;
}
```

> 报错信息：运算符 '<' 不能应用于类型 '() => number' 和 'number'。（诊断码 2365）

或基本逻辑错误。

```ts
const value = Math.random() < 0.5 ? "a" : "b";
if (value !== "a") {
  // ...
} else if (value === "b") {
  // Oops, unreachable
}
```

> 报错信息：此比较看似无意，因为类型 '"a"' 和 '"b"' 没有重叠。（诊断码 2367）

## 用于工具的类型

TypeScript 可以在我们代码出错时捕获 bug。这很棒，但 TypeScript *也*能首先防止我们犯那些错误。

类型检查器拥有信息来检查诸如我们是否正在访问变量和其他属性的正确属性。一旦有了这些信息，它还可以开始*建议*你可能想使用的属性。

这意味着 TypeScript 也可被用于编辑代码，核心类型检查器可以在你于编辑器中输入时提供错误消息和代码补全。这正是人们谈论 TypeScript 中的工具支持时经常提到的部分。

```ts
import express from "express";
const app = express();

app.get("/", function (req, res) {
  res.sen
});

app.listen(3000);
```

TypeScript 认真对待工具支持，这超越了输入时的补全和错误。支持 TypeScript 的编辑器可以提供“快速修复”来自动修正错误、重构以轻松重新组织代码，以及有用的导航功能，例如跳转到变量定义或查找给定变量的所有引用。所有这些都构建在类型检查器之上，并且完全跨平台，因此[你喜欢的编辑器很可能已有 TypeScript 支持](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support)。

## `tsc`，TypeScript 编译器

我们一直在讨论类型检查，但还没用过我们的类型*检查器*。让我们认识一下新朋友 `tsc`，TypeScript 编译器。首先我们需要通过 npm 获取它。

```sh
npm install -g typescript
```

> 这会全局安装 TypeScript 编译器 `tsc`。如果你更愿意从本地 `node_modules` 包运行 `tsc`，可以使用 `npx` 或类似工具。

现在让我们移动到一个空文件夹，尝试编写第一个 TypeScript 程序：`hello.ts`：

```ts
// Greets the world.
console.log("Hello world!");
```

注意这里没有任何装饰；这个“hello world”程序看起来和你在 JavaScript 中写的“hello world”程序一模一样。现在让我们通过运行 `typescript` 包为我们安装的 `tsc` 命令来类型检查它。

```sh
tsc hello.ts
```

瞧！

等等，“瞧”到底是什么？我们运行了 `tsc` 却什么也没发生！嗯，没有类型错误，所以控制台没有任何输出，因为没什么可报告的。

但再检查一下——我们反而得到了一些*文件*输出。如果我们查看当前目录，会看到 `hello.ts` 旁边有一个 `hello.js` 文件。那是 `hello.ts` 文件经过 `tsc` *编译*或*转换*为纯 JavaScript 文件后的输出。如果我们检查内容，会看到 TypeScript 处理 `.ts` 文件后吐出的东西：

```js
// Greets the world.
console.log("Hello world!");
```

在这种情况下，TypeScript 没什么可转换的，所以它看起来和我们写的一样。编译器试图发出干净的、可读的、像人写的代码。虽然这并不总是那么容易，但 TypeScript 缩进一致，注意代码跨行的情况，并尽量保留注释。

如果我们*确实*引入了一个类型检查错误会怎样？让我们重写 `hello.ts`：

```ts
// This is an industrial-grade general-purpose greeter function:
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date}!`);
}

greet("Brendan");
```

如果我们再次运行 `tsc hello.ts`，注意命令行上会出现错误！

```txt
Expected 2 arguments, but got 1.
```

TypeScript 告诉我们忘记给 `greet` 函数传参，这是理所当然的。到目前为止我们只写了标准 JavaScript，但类型检查仍能发现代码中的问题。谢了 TypeScript！

## 有错误时仍输出

从上一个例子你可能没注意到的一件事是，我们的 `hello.js` 文件又改变了。如果我们打开那个文件，会看到内容基本上和输入文件一样。考虑到 `tsc` 报告了代码错误，这也许有点令人惊讶，但这是基于 TypeScript 的核心价值观之一：很多时候，*你*比 TypeScript 更清楚。

重申一下之前说的，类型检查代码限制了你可以运行的程序种类，因此在类型检查器认为可接受的事物上存在权衡。大多数时候这没问题，但有些场景这些检查会碍事。例如，想象一下你把 JavaScript 代码迁移到 TypeScript 并引入了类型检查错误。最终你会腾出手来为类型检查器清理代码，但最初的 JavaScript 代码已经能工作了！为什么将其转换为 TypeScript 就应该阻止你运行它？

所以 TypeScript 不会挡你的路。当然，随着时间推移，你可能想对错误更防御一些，让 TypeScript 表现得更严格。那样的话，你可以使用 [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError) 编译器选项。尝试修改你的 `hello.ts` 文件并用该标志运行 `tsc`：

```sh
tsc --noEmitOnError hello.ts
```

你会注意到 `hello.js` 从未被更新。

## 显式类型

到目前为止，我们还没告诉 TypeScript `person` 或 `date` 是什么。让我们编辑代码告诉 TypeScript `person` 是 `string`，`date` 应该是 `Date` 对象。我们还会在 `date` 上使用 `toDateString()` 方法。

```ts
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
```

我们做的是在 `person` 和 `date` 上添加*类型注解*，描述 `greet` 可以接受什么类型的值。你可以将该签名解读为“`greet` 接受一个 `string` 类型的 `person`，以及一个 `Date` 类型的 `date`”。

有了这个，TypeScript 可以告诉我们其他 `greet` 可能被错误调用的例子。例如……

```ts
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", Date());
```

> 报错信息：类型 'string' 的参数不能赋给类型 'Date' 的参数。（诊断码 2345）

嗯？TypeScript 在我们的第二个参数上报了错，但为什么？

可能令人惊讶的是，在 JavaScript 中调用 `Date()` 返回的是 `string`。另一方面，用 `new Date()` 构造 `Date` 实际给了我们期望的东西。

无论如何，我们可以快速修复错误：

```ts
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", new Date());
```

记住，我们不总是需要写显式类型注解。在很多情况下，即使我们省略，TypeScript 也能*推断*（或“弄清楚”）类型。

```ts
let msg = "hello there!";
```

即使我们没告诉 TypeScript `msg` 的类型是 `string`，它也能弄明白。这是个特性，而且当类型系统最终会推断出相同类型时，最好不要添加注解。

> 注意：前一个代码示例中的消息气泡是你将鼠标悬停在单词上时代编辑器会显示的内容。

## 被擦除的类型

让我们看看用 `tsc` 编译上面的 `greet` 函数输出 JavaScript 时会发生什么：

```ts
"use strict";
function greet(person, date) {
    console.log("Hello ".concat(person, ", today is ").concat(date.toDateString(), "!"));
}
greet("Maddison", new Date());
```

注意这里两件事：

1. 我们的 `person` 和 `date` 参数不再有类型注解。
2. 我们的“模板字符串”——使用反引号（`` ` `` 字符）的字符串——被转换为带拼接的普通字符串。

关于第二点稍后再详述，但现在让我们关注第一点。类型注解不是 JavaScript（严谨说是 ECMAScript）的一部分，所以实际上没有任何浏览器或其他运行时能直接运行未修改的 TypeScript。这正是 TypeScript 首先需要编译器的原因——它需要某种方式剥离或转换任何 TypeScript 特定代码，以便你能运行它。大多数 TypeScript 特定代码会被擦除，同样地，这里的类型注解被完全擦除了。

> **记住**：类型注解永远不会改变程序的运行时行为。

## 降级

与上述的另一个不同点是我们的模板字符串被从

```js
`Hello ${person}, today is ${date.toDateString()}!`;
```

重写为

```js
"Hello ".concat(person, ", today is ").concat(date.toDateString(), "!");
```

为什么会发生这个？

模板字符串是名为 ECMAScript 2015（又名 ECMAScript 6、ES2015、ES6 等——*别问*）的 ECMAScript 版本中的特性。TypeScript 能够将代码从较新版本的 ECMAScript 重写到较旧的版本，例如 ECMAScript 3 或 ECMAScript 5（又名 ES5）。这种从较新或“更高”版本的 ECMAScript 移动到较旧或“更低”版本的过程有时被称为*降级*（downleveling）。

默认情况下 TypeScript 以 ES5（一个极老的 ECMAScript 版本）为目标。我们本可以使用 [`target`](https://www.typescriptlang.org/tsconfig#target) 选项选择稍新一点的版本。使用 `--target es2015` 运行会将 TypeScript 的目标改为 ECMAScript 2015，意味着代码应该能在任何支持 ECMAScript 2015 的地方运行。所以运行 `tsc --target es2015 hello.ts` 会得到以下输出：

```js
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", new Date());
```

> 虽然默认目标是 ES5，但当前绝大多数浏览器支持 ES2015。因此，除非与某些古老浏览器的兼容性很重要，大多数开发者可以安全地将 ES2015 或更高版本指定为目标。

## 严格性

不同的用户带着对类型检查器不同的期待来到 TypeScript。有些人想要更宽松的 opt-in 体验，只帮助验证程序的某些部分，同时仍有不错的工具支持。这是 TypeScript 的默认体验，类型可选，推断采用最宽松的类型，且不检查潜在的 `null`/`undefined` 值。就像 `tsc` 在错误面前仍输出一样，这些默认值是为了不挡你的路。如果你在迁移现有的 JavaScript，这可能是可取的第一步。

相反，很多用户希望 TypeScript 尽可能立刻验证，这就是语言也提供严格性设置的原因。这些严格性设置将静态类型检查从开关（代码要么被检查要么不被检查）变成了类似拨盘的东西。你把拨盘调得越高，TypeScript 为你检查得越多。这可能需要一点额外工作，但一般来说长远看是值得的，并且能实现更彻底的检查和更准确的工具支持。可能的话，新代码库应始终开启这些严格性检查。

TypeScript 有几个可以开启或关闭的类型检查严格性标志，除非另有说明，我们所有示例都将在全部启用的状态下编写。CLI 中的 [`strict`](https://www.typescriptlang.org/tsconfig#strict) 标志，或 [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) 中的 `"strict": true` 会同时打开它们，但我们可以单独选择退出。你最应该知道的两个是 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 和 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)。

## `noImplicitAny`

回想一下，在某些地方，TypeScript 不尝试为我们推断类型，而是回退到最宽松的类型：`any`。这不是发生的最糟的事——毕竟，回退到 `any` 本来就是纯 JavaScript 的体验。

然而，使用 `any` 往往违背了使用 TypeScript 的初衷。程序类型越多，你得到的验证和工具支持就越多，意味着编码时遇到的 bug 更少。开启 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 标志会对任何类型被隐式推断为 `any` 的变量发出错误。

## `strictNullChecks`

默认情况下，像 `null` 和 `undefined` 这样的值可以赋给任何其他类型。这能让写某些代码更容易，但忘记处理 `null` 和 `undefined` 是世界上无数 bug 的根源——有人称之为[十亿美元错误](https://www.youtube.com/watch?v=ybrQvs4x0Ps)！[`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 标志让处理 `null` 和 `undefined` 更明确，并*免去*我们担心是否*忘记*处理 `null` 和 `undefined` 的烦恼。
