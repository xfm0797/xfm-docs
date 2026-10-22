---
mode: docs

title: 模块（Modules）
date: 2026-10-22 22:40:00
updated: 2026-10-22 22:40:00
description: TypeScript 官方手册《Modules》中文整理：如何判定模块、ES Module 语法、import type、CommonJS 语法与互操作、模块解析与输出目标、namespace 的定位。
keywords: [TypeScript, 模块, ES Module, import, export, CommonJS, moduleResolution, namespace]
order: 10
---

# 模块（Modules）

JavaScript 处理代码模块化的方式有过很长一段演化史。TypeScript 从 2012 年诞生起就支持了其中很多格式，但随着时间推移，社区和 JavaScript 规范最终收敛到一种叫 **ES Modules**（也叫 ES6 模块）的格式——你可能更熟悉它的 `import` / `export` 语法。

ES Modules 于 2015 年加入 JavaScript 规范，到 2020 年已在绝大多数浏览器与 JavaScript 运行时中得到广泛支持。

本章聚焦于 ES Modules 及其前身、也是最流行的 CommonJS（`module.exports =`）语法；其他模块模式可以在参考文档的 Modules 部分查阅。

## JavaScript 如何判定一个模块

在 TypeScript 中（与 ECMAScript 2015 一致），**任何含有顶层 `import` 或 `export` 的文件都被视为模块**。

反过来，不含任何顶层 import / export 声明的文件会被当作**脚本**，其内容位于全局作用域（因而模块也能访问到）。

模块在自己的作用域内执行，而不是全局作用域。这意味着模块内声明的变量、函数、类等，除非用某种 export 形式显式导出，否则在模块外不可见；反过来，要使用其他模块导出的变量、函数、类、接口等，也必须用某种 import 形式导入。

## 非模块（Non-modules）

动手之前，先弄清楚 TypeScript 眼中的「模块」边界。JavaScript 规范规定：任何没有 `import` 声明、`export` 或顶层 `await` 的 JavaScript 文件都应被视为脚本而非模块。

在脚本文件中，变量和类型都声明在共享的全局作用域里；此时你要么用 `outFile` 编译选项把多个输入文件拼成一个输出文件，要么在 HTML 中用多个 `<script>` 标签按**正确顺序**加载它们。

如果某个文件当前没有任何 `import` / `export`，但你希望它被当作模块，加一行即可：

```ts
export {};
```

这会把文件变成「不导出任何东西」的模块。该语法与你的模块目标无关，总是有效。

## TypeScript 中的模块

用 TypeScript 写模块化代码时，主要考虑三件事：

- **语法**：用什么语法导入和导出？
- **模块解析**：模块名（或路径）与磁盘上的文件之间是什么关系？
- **模块输出目标**：编译出的 JavaScript 模块长什么样？

### ES Module 语法

一个文件可以用 `export default` 声明主导出：

```ts
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

然后这样导入：

```ts
import helloWorld from "./hello.js";
helloWorld();
```

除了默认导出，还可以省略 `default`，导出多个变量和函数：

```ts
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;

export class RandomNumberGenerator {}

export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
```

在另一个文件中用 `import` 使用它们：

```ts
import { pi, phi, absolute } from "./maths.js";

console.log(pi);
const absPhi = absolute(phi);
// absPhi: number
```

### 更多导入语法

可以用 `import { old as new }` 的形式重命名导入：

```ts
import { pi as π } from "./maths.js";

console.log(π);
// (alias) var π: number
```

也可以把上面的写法混在一条 `import` 里：

```ts
// @filename: maths.ts
export const pi = 3.14;
export default class RandomNumberGenerator {}

// @filename: app.ts
import RandomNumberGenerator, { pi as π } from "./maths.js";

RandomNumberGenerator;
// (alias) class RandomNumberGenerator

console.log(π);
// (alias) const π: 3.14
```

用 `* as name` 可以把所有导出对象收进一个命名空间：

```ts
// @filename: app.ts
import * as math from "./maths.js";

console.log(math.pi);
const positivePhi = math.absolute(math.phi);
```

也可以用 `import "./file"` 只导入文件、不引入任何变量：

```ts
// @filename: app.ts
import "./maths.js";

console.log("3.14");
```

这种情况下 `import` 本身什么也不做，但 `maths.ts` 里的代码全都被执行了，可能触发影响其他对象的副作用。

#### TypeScript 特有的 ES Module 语法

类型也能用与 JavaScript 值相同的语法导入导出：

```ts
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };

export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}

// @filename: app.ts
import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

TypeScript 扩展了 `import` 语法，提供两个用于「仅导入类型」的概念：

**`import type`** —— 只能导入类型的 import 语句：

```ts
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";

// @filename: valid.ts
import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;

// @filename: app.ts
import type { createCatName } from "./animal.js";
const name = createCatName();
// 报错：'createCatName' 是用 'import type' 导入的，不能当作值使用
```

**内联 `type` 导入** —— TypeScript 4.5 起，可以给单个导入加 `type` 前缀，表示被导入的引用是个类型：

```ts
// @filename: app.ts
import { createCatName, type Cat, type Dog } from "./animal.js";

export type Animals = Cat | Dog;
const name = createCatName();
```

这两者合起来，让 Babel、swc、esbuild 这类非 TypeScript 转译器能明确知道哪些导入可以安全删除。

#### 带 CommonJS 行为的 ES Module 语法

TypeScript 提供了与 CommonJS / AMD 的 `require` 一一对应的 ES Module 语法。多数情况下用 ES Module 导入和那些环境的 `require` 等价，但这种写法能保证你的 TypeScript 源码与 CommonJS 输出严格一对一：

```ts
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

## CommonJS 语法

CommonJS 是 npm 上大多数模块采用的格式。即便你写的是上面的 ES Modules 语法，简单了解 CommonJS 的工作方式也能让你排查问题更轻松。

### 导出

通过给全局的 `module` 对象设置 `exports` 属性来导出标识符：

```ts
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
```

然后这些文件可以用 `require` 语句导入：

```ts
const maths = require("./maths");
maths.pi; // any
```

或者用 JavaScript 的解构语法简化一下：

```ts
const { squareTwo } = require("./maths");
squareTwo; // any
```

### CommonJS 与 ES Modules 的互操作

在「默认导入」与「模块命名空间对象导入」的区分上，CommonJS 与 ES Modules 存在不匹配。TypeScript 提供了 `esModuleInterop` 编译选项来减少两套约束之间的摩擦。

## TypeScript 的模块解析选项

**模块解析**是指：从 `import` 或 `require` 语句里的字符串出发，判定它指向磁盘上的哪个文件。

TypeScript 内置两种解析策略：**Classic** 和 **Node**。Classic 是 `module` 选项不为 `commonjs` 时的默认值，主要为向后兼容而保留；Node 策略复刻了 Node.js 在 CommonJS 模式下的行为，并额外检查 `.ts` 与 `.d.ts`。

影响模块策略的 TSConfig 选项有：`moduleResolution`、`baseUrl`、`paths`、`rootDirs`。完整细节请参阅 Module Resolution 参考页。

## TypeScript 的模块输出选项

有两个选项影响输出的 JavaScript：

- **`target`**：决定哪些 JS 特性被降级（转换为可在旧运行时执行），哪些原样保留。
- **`module`**：决定模块之间交互时使用哪套代码。

用哪个 `target`，取决于你预期运行这些 TypeScript 代码的 JavaScript 运行时具备哪些特性——可能是你支持的最老浏览器、你预期的最低 Node.js 版本，也可能来自运行时的特殊限制（比如 Electron）。

模块之间的所有通信都经由**模块加载器**完成，编译选项 `module` 决定用哪一个。运行时，模块加载器负责在执行某个模块前，定位并执行它的所有依赖。

下面这份使用 ES Modules 语法的 TypeScript 文件，展示了 `module` 几种取值的输出差异：

```ts
import { valueOfPi } from "./constants.js";
export const twoPi = valueOfPi * 2;
```

#### ES2020

```ts
import { valueOfPi } from "./constants.js";
export const twoPi = valueOfPi * 2;
```

#### CommonJS

```ts
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoPi = void 0;
const constants_js_1 = require("./constants.js");
exports.twoPi = constants_js_1.valueOfPi * 2;
```

#### UMD

```ts
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === "function" && define.amd) {
    define(["require", "exports", "./constants.js"], factory);
  }
})(function (require, exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.twoPi = void 0;
  const constants_js_1 = require("./constants.js");
  exports.twoPi = constants_js_1.valueOfPi * 2;
});
```

注意 ES2020 的输出与原文件基本一致。

## TypeScript 的 namespace

TypeScript 还有一套早于 ES Modules 标准的自有模块格式，叫 **namespace**。它在编写复杂的类型定义文件时有很多好用的特性，至今仍在 DefinitelyTyped 中大量使用。namespace 并未被废弃，但其大部分能力 ES Modules 都有，我们建议使用 ES Modules 以和 JavaScript 的发展方向保持一致。

> 本章译自 TypeScript 官方手册 [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)，并结合中文表达习惯做了整理；代码示例与结论均以官方原文为准。
