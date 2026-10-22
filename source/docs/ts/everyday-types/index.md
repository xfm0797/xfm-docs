---
mode: docs

title: 日常类型（Everyday Types）
date: 2026-10-19 23:10:00
updated: 2026-10-19 23:10:00
description: TypeScript 官方手册《Everyday Types》中文翻译：原始类型、数组、any、函数、对象类型、联合、类型别名、接口、字面量类型、null/undefined、枚举等日常类型。
keywords: [TypeScript, 日常类型, 原始类型, 联合类型, 类型别名, 接口, 字面量类型]
order: 3
---

# 日常类型（Everyday Types）

在本章中，我们将介绍在 JavaScript 代码中会见到的一些最常见的值类型，并解释在 TypeScript 中描述这些类型的相应方式。这不是一份详尽的清单，后续章节将介绍更多命名和使用其他类型的方法。

类型不仅可以出现在类型注解中，还可以出现在许多其他*位置*。在了解类型本身的同时，我们也会了解到可以引用这些类型以形成新的构造的位置。

我们将从回顾编写 JavaScript 或 TypeScript 代码时可能遇到的最基本、最常见的类型开始。它们随后将成为构造更复杂类型的核心基石。

## 基本类型（primitives）：`string`、`number` 和 `boolean`

JavaScript 有三个非常常用的[基本类型（primitives）](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)：`string`、`number` 和 `boolean`。它们在 TypeScript 中都有对应的类型。正如你所期望的，如果你对这些类型的值使用 JavaScript 的 `typeof` 运算符，看到的名字也是这些：

- `string` 表示字符串值，如 `"Hello, world"`
- `number` 用于表示数字，如 `42`。JavaScript 没有专门针对整数的运行时值，因此没有与 `int` 或 `float` 等价的概念——一切皆为 `number`
- `boolean` 用于表示两个值 `true` 和 `false`

> 类型名 `String`、`Number` 和 `Boolean`（首字母大写）是合法的，但指代的是一些特殊的内置类型，很少会在你的代码中出现。*始终*使用 `string`、`number` 或 `boolean` 作为类型。

## 数组（Arrays）

要指定像 `[1, 2, 3]` 这样的数组的类型，你可以使用语法 `number[]`；该语法适用于任何类型（例如 `string[]` 是字符串数组，依此类推）。你也可以看到写成 `Array<number>` 的形式，含义相同。我们将在介绍*泛型（generics）*时了解更多关于语法 `T<U>` 的内容。

> 注意 `[number]` 是不同的东西；请参阅有关 [元组（Tuples）](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) 的章节。

## `any`

TypeScript 还有一个特殊类型 `any`，每当你不希望某个特定值引发类型检查错误时，都可以使用它。

当一个值为 `any` 类型时，你可以访问它的任何属性（这些属性同样为 `any` 类型），像调用函数一样调用它，将其赋值给任何类型的值（或从任何类型的值赋值给它），或者做任何其他语法上合法的操作：

```ts
let obj: any = { x: 0 };
// None of the following lines of code will throw compiler errors.
// Using `any` disables all further type checking, and it is assumed
// you know the environment better than TypeScript.
obj.foo();
obj();
obj.bar = 100;
obj = "hello";
const n: number = obj;
```

当你不想仅仅为了让 TypeScript 相信某行代码没问题而写出很长的类型时，`any` 类型很有用。

### `noImplicitAny`

当你没有指定类型，且 TypeScript 无法从上下文推断出类型时，编译器通常会默认为 `any`。

不过，你通常希望避免这种情况，因为 `any` 不会进行类型检查。使用编译器标志 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 可以将任何隐式的 `any` 标记为错误。

## 变量上的类型注解（Type Annotations on Variables）

当你使用 `const`、`var` 或 `let` 声明变量时，可以选择添加类型注解来显式指定变量的类型：

```ts
let myName: string = "Alice";
```

> TypeScript 不使用“类型在左侧”风格的声明，如 `int x = 0;` 类型注解总是放在*被类型化事物*的后面。

不过，在大多数情况下，这并不必要。只要有可能，TypeScript 会尝试自动*推断*代码中的类型。例如，变量的类型是根据其初始化器的类型推断出来的：

```ts
// No type annotation needed -- 'myName' inferred as type 'string'
let myName = "Alice";
```

在很大程度上，你不需要显式学习推断规则。如果你刚入门，试着比你认为需要的更少使用类型注解——你可能会惊讶地发现，TypeScript 完全理解发生了什么所需的注解竟如此之少。

## 函数（Functions）

函数是 JavaScript 中传递数据的主要手段。TypeScript 允许你指定函数的输入值和输出值的类型。

### 参数类型注解（Parameter Type Annotations）

声明函数时，可以在每个参数后添加类型注解，以声明该函数接受哪些类型的参数。参数类型注解位于参数名之后：

```ts
// Parameter type annotation
function greet(name: string) {
  console.log("Hello, " + name.toUpperCase() + "!!");
}
```

当参数具有类型注解时，对该函数的参数调用将被检查：

```ts
// Would be a runtime error if executed!
greet(42);
```

> 报错信息：类型 'number' 的参数不能分配给类型 'string' 的参数。（诊断码 2345）

> 即使你的参数没有类型注解，TypeScript 仍会检查你传递了正确数量的参数。

### 返回类型注解（Return Type Annotations）

你也可以添加返回类型注解。返回类型注解出现在参数列表之后：

```ts
function getFavoriteNumber(): number {
  return 26;
}
```

与变量类型注解非常相似，你通常不需要返回类型注解，因为 TypeScript 会根据函数的 `return` 语句推断其返回类型。上面示例中的类型注解并没有改变任何东西。一些代码库会出于文档目的、防止意外更改或个人偏好而显式指定返回类型。

#### 返回 Promise 的函数（Functions Which Return Promises）

如果你想注解返回 promise 的函数的返回类型，应该使用 `Promise` 类型：

```ts
async function getFavoriteNumber(): Promise<number> {
  return 26;
}
```

### 匿名函数（Anonymous Functions）

匿名函数与函数声明略有不同。当函数出现在 TypeScript 能够确定其调用方式的位置时，该函数的参数会自动获得类型。

示例如下：

```ts
const names = ["Alice", "Bob", "Eve"];
 
// Contextual typing for function - parameter s inferred to have type string
names.forEach(function (s) {
  console.log(s.toUpperCase());
});
 
// Contextual typing also applies to arrow functions
names.forEach((s) => {
  console.log(s.toUpperCase());
});
```

尽管参数 `s` 没有类型注解，TypeScript 仍使用 `forEach` 函数的类型以及数组的推断类型来确定 `s` 将具有的类型。

这个过程称为*上下文类型推断（contextual typing）*，因为函数所在的*上下文*决定了它应该具有什么类型。

与推断规则类似，你不需要显式学习这是如何发生的，但明白它*确实*会发生，能帮助你注意到何时不需要类型注解。稍后，我们会看到更多关于值所处的上下文如何影响其类型的示例。

## 对象类型（Object Types）

除了基本类型，你会遇到的最常见的类型是*对象类型（object type）*。它指的是任何带有属性的 JavaScript 值，而几乎所有值都是如此！要定义对象类型，我们只需列出它的属性和它们的类型。

例如，下面是一个接受类似点的对象的函数：

```ts
// The parameter's type annotation is an object type
function printCoord(pt: { x: number; y: number }) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

在这里，我们为参数注释了一个具有两个属性——`x` 和 `y`——的类型，它们都是 `number` 类型。你可以使用 `,` 或 `;` 来分隔属性，无论哪种方式，最后一个分隔符都是可选的。

每个属性的类型部分也是可选的。如果你不指定类型，它将被视为 `any`。

### 可选属性（Optional Properties）

对象类型还可以指定其部分或全部属性为*可选*。为此，在属性名后添加 `?`：

```ts
function printName(obj: { first: string; last?: string }) {
  // ...
}
// Both OK
printName({ first: "Bob" });
printName({ first: "Alice", last: "Alisson" });
```

在 JavaScript 中，如果你访问一个不存在的属性，你会得到值 `undefined` 而不是运行时错误。因此，当你从可选属性*读取*时，必须在使用前检查是否为 `undefined`。

```ts
function printName(obj: { first: string; last?: string }) {
  // Error - might crash if 'obj.last' wasn't provided!
  console.log(obj.last.toUpperCase());
  if (obj.last !== undefined) {
    // OK
    console.log(obj.last.toUpperCase());
  }
 
  // A safe alternative using modern JavaScript syntax:
  console.log(obj.last?.toUpperCase());
}
```

> 报错信息：'obj.last' 可能为 'undefined'。（诊断码 18048）

## 联合类型（Union Types）

TypeScript 的类型系统允许你使用大量运算符从现有类型构建新类型。既然我们已经知道如何编写一些类型，现在是时候开始以有趣的方式*组合*它们了。

### 定义联合类型（Defining a Union Type）

你可能会看到的第一种组合类型的方式是*联合（union）*类型。联合类型是由两个或多个其他类型构成的一种类型，表示可能是这些类型中*任意一个*的值。我们将这些类型中的每一个称为联合的*成员*。

我们来编写一个可以处理字符串或数字的函数：

```ts
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
// OK
printId(101);
// OK
printId("202");
// Error
printId({ myID: 22342 });
```

> 报错信息：类型 '{ myID: number; }' 的参数不能分配给类型 'string | number' 的参数。（诊断码 2345）

> 联合成员的分隔符允许出现在第一个元素之前，因此你也可以这样写：

```ts
function printTextOrNumberOrBool(
  textOrNumberOrBool:
    | string
    | number
    | boolean
) {
  console.log(textOrNumberOrBool);
}
```

### 使用联合类型（Working with Union Types）

*提供*一个匹配联合类型的值很容易——只需提供匹配联合中任意成员的类型即可。如果你*拥有*一个联合类型的值，该如何处理它呢？

TypeScript 只允许对联合中*每一个*成员都有效的操作。例如，如果你有联合 `string | number`，就不能使用仅存在于 `string` 上的方法：

```ts
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
```

> 报错信息：属性 'toUpperCase' 不存在于类型 'string | number'。属性 'toUpperCase' 不存在于类型 'number'。（诊断码 2339）

解决方案是用代码对联合进行*收窄（narrow）*，就像在没有类型注解的 JavaScript 中那样。当 TypeScript 能够根据代码结构推断出某个值更具体的类型时，就会发生*收窄（Narrowing）*。

例如，TypeScript 知道只有 `string` 值才会具有 `typeof` 值 `"string"`：

```ts
function printId(id: number | string) {
  if (typeof id === "string") {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else {
    // Here, id is of type 'number'
    console.log(id);
  }
}
```

另一个例子是使用像 `Array.isArray` 这样的函数：

```ts
function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // Here: 'x' is 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // Here: 'x' is 'string'
    console.log("Welcome lone traveler " + x);
  }
}
```

注意，在 `else` 分支中，我们不需要做任何特殊处理——如果 `x` 不是 `string[]`，那么它一定是 `string`。

有时你会遇到所有成员都有共同点的联合。例如，数组和字符串都有 `slice` 方法。如果联合中的每个成员都有一个共同的属性，你就可以直接使用该属性而无需收窄：

```ts
// Return type is inferred as number[] | string
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}
```

> 类型的*联合（union）*看起来拥有这些类型属性的*交集（intersection）*，这可能令人困惑。但这并非偶然——*union* 这个名字源于类型理论。*联合* `number | string` 是通过取每种类型*值的联合*构成的。请注意，给定两个集合以及关于每个集合的相应事实，只有这些事实的*交集*适用于集合本身的*并集*。例如，如果我们有一个房间全是戴帽子的高个子，另一个房间全是戴帽子的西班牙语使用者，合并这些房间后，我们对*每个*人唯一已知的事实就是他们一定戴着帽子。

## 类型别名（Type Aliases）

我们一直通过在类型注解中直接编写对象类型和联合类型来使用它们。这很方便，但通常我们会希望多次使用同一类型并用一个单一名称来引用它。

*类型别名（type alias）*正是如此——任何*类型*的*名字*。类型别名的语法是：

```ts
type Point = {
  x: number;
  y: number;
};
 
// Exactly the same as the earlier example
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
 
printCoord({ x: 100, y: 100 });
```

实际上，你可以使用类型别名为任何类型命名，不仅仅是对象类型。例如，类型别名可以为联合类型命名：

```ts
type ID = number | string;
```

请注意，别名*仅仅*是别名——你不能使用类型别名来创建同一类型的不同/独立“版本”。当你使用别名时，就如同你写了被别名化的类型一样。换句话说，下面的代码可能*看起来*不合法，但根据 TypeScript 它是没问题的，因为两种类型都是同一类型的别名：

```ts
type UserInputSanitizedString = string;
 
function sanitizeInput(str: string): UserInputSanitizedString {
  return sanitize(str);
}
 
// Create a sanitized input
let userInput = sanitizeInput(getInput());
 
// Can still be re-assigned with a string though
userInput = "new input";
```

## 接口（Interfaces）

*接口声明（interface declaration）*是命名对象类型的另一种方式：

```ts
interface Point {
  x: number;
  y: number;
}
 
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
 
printCoord({ x: 100, y: 100 });
```

就像我们上面使用类型别名一样，这个示例就像我们使用了匿名对象类型一样正常工作。TypeScript 只关心我们传递给 `printCoord` 的值的*结构*——它只关心它是否具有预期的属性。只关注类型的结构和能力，这就是我们称 TypeScript 为*结构化类型（structurally typed）*系统的原因。

### 类型别名与接口的区别（Differences Between Type Aliases and Interfaces）

类型别名和接口非常相似，在许多情况下你可以自由地在它们之间选择。 `interface` 的几乎所有特性在 `type` 中都可用，关键区别在于类型别名在创建后不能重新打开以添加新属性，而接口始终是可扩展的。

`Interface` `Type`

扩展接口（Extending an interface）

```ts
interface Animal {
  name: string;
}

interface Bear extends Animal {
  honey: boolean;
}

const bear = getBear();
bear.name;
bear.honey;
```

通过交叉类型扩展类型（Extending a type via intersections）

```ts
type Animal = {
  name: string;
}

type Bear = Animal & { 
  honey: boolean;
}

const bear = getBear();
bear.name;
bear.honey;
```

向现有接口添加新字段（Adding new fields to an existing interface）

```ts
interface Window {
  title: string;
}

interface Window {
  ts: TypeScriptAPI;
}

const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
```

类型在创建后无法更改（A type cannot be changed after being created）

```ts
type Window = {
  title: string;
}

type Window = {
  ts: TypeScriptAPI;
}
```

> 报错信息：重复标识符 'Window'。

你将在后续章节中学习更多关于这些概念的内容，所以如果你不能立刻完全理解，不必担心。

- 在 TypeScript 4.2 版本之前，类型别名名称[可能出现在错误信息中](https://www.typescriptlang.org/play?#code/PTAEGEHsFsAcEsA2BTATqNrLusgzngIYDm+oA7koqIYuYQJ56gCueyoAUCKAC4AWHAHaFcoSADMaQ0PCG80EwgGNkALk6c5C1EtWgAsqOi1QAb06groEbjWg8vVHOKcAvpokshy3vEgyyMr8kEbQJogAFND2YREAlOaW1soBeJAoAHSIkMTRmbbI8e6aPMiZxJmgACqCGKhY6ABGyDnkFFQ0dIzMbBwCwqIccabcYLyQoKjIEmh8kwN8DLAc5PzwwbLMyAAeK77IACYaQSEjUWZWhfYAjABMAMwALA+gbsVjoADqgjKESytQPxCHghAByXigYgB8HhPgB5aDwem-Ph1TCV3AEEirTp4ELtRbTPD4vwKjOfAuioSQHuDXBcnmgACC+eCONFEs73YAPGGZVT5cRyyhiHh7AAON7lsG3vBggB8XGV3l8-nVISOgghxoLq9i7io-AHsayRWGaFrlFauq2rg9qaIGQHwCBqChtKdgRo8TxRjeyB3o+7xAA)，有时会替代等效的匿名类型（这可能是想要的，也可能不是）。接口在错误信息中总是会显示其名称。
- 类型别名可能不参与[声明合并，但接口可以](https://www.typescriptlang.org/play?#code/PTAEAkFMCdIcgM6gC4HcD2pIA8CGBbABwBtIl0AzUAKBFAFcEBLAOwHMUBPQs0XFgCahWyGBVwBjMrTDJMAshOhMARpD4tQ6FQCtIE5DWoixk9QEEWAeV37kARlABvaqDegAbrmL1IALlAEZGV2agBfampkbgtrWwMAJlAAXmdXdy8ff0Dg1jZwyLoAVWZ2Lh5QVHUJflAlSFxROsY5fFAWAmk6CnRoLGwmILzQQmV8JmQmDzI-SOiKgGV+CaYAL0gBBdyy1KCQ-Pn1AFFplgA5enw1PtSWS+vCsAAVAAtB4QQWOEMKBuYVUiVCYvYQsUTQcRSBDGMGmKSgAAa-VEgiQe2GLgKQA)。
- 接口只能用于[声明对象的形状，而不能重命名基本类型](https://www.typescriptlang.org/play?#code/PTAEAkFMCdIcgM6gC4HcD2pIA8CGBbABwBtIl0AzUAKBFAFcEBLAOwHMUBPQs0XFgCahWyGBVwBjMrTDJMAshOhMARpD4tQ6FQCtIE5DWoixk9QEEWAeV37kARlABvaqDegAbrmL1IALlAEZGV2agBfampkbgtrWwMAJlAAXmdXdy8ff0Dg1jZwyLoAVWZ2Lh5QVHUJflAlSFxROsY5fFAWAmk6CnRoLGwmILzQQmV8JmQmDzI-SOiKgGV+CaYAL0gBBdyy1KCQ-Pn1AFFplgA5enw1PtSWS+vCsAAVAAtB4QQWOEMKBuYVUiVCYvYQsUTQcRSBDGMGmKSgAAa-VEgiQe2GLgKQA)。
- 接口名称在错误信息中会[*始终*以其原始形式出现](https://www.typescriptlang.org/play?#code/PTAEGEHsFsAcEsA2BTATqNrLusgzngIYDm+oA7koqIYuYQJ56gCueyoAUCKAC4AWHAHaFcoSADMaQ0PCG80EwgGNkALk6c5C1EtWgAsqOi1QAb06groEbjWg8vVHOKcAvpokshy3vEgyyMr8kEbQJogAFND2YREAlOaW1soBeJAoAHSIkMTRmbbI8e6aPMiZxJmgACqCGKhY6ABGyDnkFFQ0dIzMbBwCwqIccabcYLyQoKjIEmh8kwN8DLAc5PzwwbLMyAAeK77IACYaQSEjUWZWhfYAjABMAMwALA+gbsVjoADqgjKESytQPxCHghAByXigYgB8HhPgB5aDwem-Ph1TCV3AEEirTp4ELtRbTPD4vwKjOfAuioSQHuDXBcnmgACC+eCONFEs73YAPGGZVT5cRyyhiHh7AAON7lsG3vBggB8XGV3l8-nVISOgghxoLq9i7io-AHsayRWGaFrlFauq2rg9qaIGQHwCBqChtKdgRo8TxRjeyB3o+7xAA)，但*仅*在按名称使用时。
- 对编译器而言，使用带有 `extends` 的接口[通常比使用交叉类型的类型别名性能更好](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections)

在大多数情况下，你可以根据个人偏好选择，如果需要另一种声明方式，TypeScript 会告诉你。如果你想要一个启发式规则，那就是：优先使用 `interface`，直到你需要使用 `type` 的特性。

## 类型断言（Type Assertions）

有时你会掌握一些关于值类型的信息，而 TypeScript 无法知晓。

例如，如果你正在使用 `document.getElementById`，TypeScript 只知道它会返回*某种* `HTMLElement`，但你可能知道你的页面总会有一个具有给定 ID 的 `HTMLCanvasElement`。

在这种情况下，你可以使用*类型断言（type assertion）*来指定一个更具体的类型：

```ts
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

与类型注解一样，类型断言会被编译器移除，不会影响代码的运行时行为。

你也可以使用尖括号语法（除非代码在 `.tsx` 文件中），它是等效的：

```ts
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

> 提醒：因为类型断言在编译时被移除，所以类型断言没有关联的运行时检查。如果类型断言是错误的，也不会抛出异常或生成 `null`。

TypeScript 只允许转换为类型的*更具体*或*更不具体*版本的类型断言。此规则防止了“不可能的”强制转换，例如：

```ts
const x = "hello" as number;
```

> 报错信息：将类型 'string' 转换为类型 'number' 可能是个错误，因为两者没有充分的重叠。如果这是有意的，请先将表达式转换为 'unknown'。（诊断码 2352）

有时此规则可能过于保守，会禁止某些可能有效的更复杂强制转换。如果发生这种情况，你可以使用两次断言，先转换为 `any`（或 `unknown`，我们稍后介绍），然后再转换为所需的类型：

```ts
const a = expr as any as T;
```

## 字面量类型（Literal Types）

除了通用类型 `string` 和 `number`，我们还可以在类型位置上引用*特定的*字符串和数字。

一种思考方式是考虑 JavaScript 提供的不同声明变量的方式。`var` 和 `let` 都允许更改变量内部持有的值，而 `const` 不行。这反映在 TypeScript 如何为字面量创建类型上。

```ts
let changingString = "Hello World";
changingString = "Olá Mundo";
// Because `changingString` can represent any possible string, that
// is how TypeScript describes it in the type system
changingString;

let changingString: string

const constantString = "Hello World";
// Because `constantString` can only represent 1 possible string, it
// has a literal type representation
constantString;

const constantString: "Hello World"
```

字面量类型本身并不是很有价值：

```ts
let x: "hello" = "hello";
// OK
x = "hello";
// ...
x = "howdy";
```

> 报错信息：类型 '"howdy"' 不能分配给类型 '"hello"'。（诊断码 2322）

拥有一个只能有一个值的变量没什么用处！

但是通过将字面量*组合*成联合，你可以表达一个更有用的概念——例如，只接受某些已知值集合的函数：

```ts
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre");
```

> 报错信息：类型 '"centre"' 不能分配给类型 '"left" | "right" | "center"' 的参数。（诊断码 2345）

数字字面量类型的工作方式相同：

```ts
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}
```

当然，你可以将它们与非字面量类型组合：

```ts
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
```

> 报错信息：类型 '"automatic"' 不能分配给类型 'Options | "auto"' 的参数。（诊断码 2345）

还有另一种字面量类型：布尔字面量。只有两个布尔字面量类型，正如你可能猜到的，它们是 `true` 和 `false`。`boolean` 类型本身实际上只是联合 `true | false` 的别名。

### 字面量推断（Literal Inference）

当你用一个对象初始化变量时，TypeScript 假设该对象的属性稍后可能会更改值。例如，如果你编写如下代码：

```ts
const obj = { counter: 0 };
if (someCondition) {
  obj.counter = 1;
}
```

TypeScript 不会假设将 `1` 赋值给之前为 `0` 的字段是一个错误。换句话说，`obj.counter` 必须具有类型 `number`，而不是 `0`，因为类型用于确定*读取*和*写入*行为。

这同样适用于字符串：

```ts
declare function handleRequest(url: string, method: "GET" | "POST"): void;
 
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
```

> 报错信息：类型 'string' 不能分配给类型 '"GET" | "POST"' 的参数。（诊断码 2345）

在上面的例子中，`req.method` 被推断为 `string`，而不是 `"GET"`。因为在创建 `req` 和调用 `handleRequest` 之间可能会执行代码，这些代码可能将像 `"GUESS"` 这样的新字符串分配给 `req.method`，TypeScript 认为这段代码存在错误。

有两种方法可以解决这个问题。

1. 你可以通过在任一位置添加类型断言来更改推断：

```ts
// Change 1:
const req = { url: "https://example.com", method: "GET" as "GET" };
// Change 2
handleRequest(req.url, req.method as "GET");
```

更改 1 意味着“我打算让 `req.method` 始终具有*字面量类型* `"GET"`”，从而防止之后可能将 `"GUESS"` 分配给该字段。更改 2 意味着“我出于其他原因知道 `req.method` 具有值 `"GET"`”。

2. 你可以使用 `as const` 将整个对象转换为字面量类型：

```ts
const req = { url: "https://example.com", method: "GET" } as const;
handleRequest(req.url, req.method);
```

`as const` 后缀的作用类似于 `const`，但适用于类型系统，确保所有属性都被赋值为字面量类型，而不是像 `string` 或 `number` 这样更通用的版本。

## `null` 和 `undefined`

JavaScript 有两个用于指示缺失或未初始化值的原始值：`null` 和 `undefined`。

TypeScript 有同名的两种对应*类型*。这些类型的行为取决于你是否开启了 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 选项。

### `strictNullChecks` 关闭（off）

当 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) *关闭*时，可能为 `null` 或 `undefined` 的值仍然可以正常访问，并且 `null` 和 `undefined` 可以分配给任何类型的属性。这类似于没有空值检查的语言（例如 C#、Java）的行为。缺乏对这些值的检查往往是错误的主要来源；我们始终建议人们如果在代码库中可行，就开启 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)。

### `strictNullChecks` 开启（on）

当 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) *开启*时，当值为 `null` 或 `undefined` 时，你需要先测试这些值，然后才能使用该值上的方法或属性。就像在使用可选属性之前检查 `undefined` 一样，我们可以使用*收窄（narrowing）*来检查可能为 `null` 的值：

```ts
function doSomething(x: string | null) {
  if (x === null) {
    // do nothing
  } else {
    console.log("Hello, " + x.toUpperCase());
  }
}
```

### 非空断言运算符（后缀 `!`）（Non-null Assertion Operator (Postfix `!`)）

TypeScript 还有一种特殊语法，可以在不做任何显式检查的情况下从类型中移除 `null` 和 `undefined`。在任何表达式后写 `!` 实际上是一种类型断言，断言该值不是 `null` 或 `undefined`：

```ts
function liveDangerously(x?: number | null) {
  // No error
  console.log(x!.toFixed());
}
```

与其他类型断言一样，这不会改变代码的运行时行为，因此重要的是，只有在你明确知道该值*不可能*为 `null` 或 `undefined` 时才使用 `!`。

## 枚举（Enums）

枚举（Enums）是 TypeScript 为 JavaScript 添加的一项特性，允许描述可能是一组命名常量之一的值。与大多数 TypeScript 特性不同，这*不是*对 JavaScript 的类型级添加，而是对语言和运行时的添加。因此，这是一个你应该知道它存在的特性，但除非你确定，否则暂不使用。你可以在 [枚举参考页面](https://www.typescriptlang.org/docs/handbook/enums.html) 阅读更多关于枚举的内容。

## 较少见的原始类型（Less Common Primitives）

值得一提的是 JavaScript 中在类型系统里有表示的其余原始类型。不过我们在此不会深入讨论。

#### `bigint`

从 ES2020 开始，JavaScript 中有一个用于非常大整数的原始类型 `BigInt`：

```ts
// Creating a bigint via the BigInt function
const oneHundred: bigint = BigInt(100);
 
// Creating a BigInt via the literal syntax
const anotherHundred: bigint = 100n;
```

你可以在 [TypeScript 3.2 发行说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-2.html#bigint) 中了解更多关于 BigInt 的信息。

#### `symbol`

JavaScript 中有一个原始类型，用于通过函数 `Symbol()` 创建全局唯一的引用：

```ts
const firstName = Symbol("name");
const secondName = Symbol("name");
 
if (firstName === secondName) {
  // Can't ever happen
}
```

> 报错信息：此比较似乎无意，因为类型 'typeof firstName' 和 'typeof secondName' 没有重叠。（诊断码 2367）

你可以在 [Symbols 参考页面](https://www.typescriptlang.org/docs/handbook/symbols.html) 了解有关它们的更多信息。
