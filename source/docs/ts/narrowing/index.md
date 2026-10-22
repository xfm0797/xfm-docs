---
mode: docs

title: 类型收窄（Narrowing）
date: 2026-10-19 23:10:00
updated: 2026-10-19 23:10:00
description: TypeScript 官方手册《Narrowing》中文翻译：typeof/真值/相等性/in/instanceof 收窄、赋值与控制流分析、类型谓词、可辨识联合与穷尽性检查。
keywords: [TypeScript, 类型收窄, 类型保护, 类型谓词, 可辨识联合, never]
order: 4
---

# 类型收窄（Narrowing）

想象我们有一个名为 `padLeft` 的函数。

```ts
function padLeft(padding: number | string, input: string): string {
  throw new Error("Not implemented yet!");
}
```

如果 `padding` 是一个 `number`（数字），它会将其视为我们想要前置到 `input` 的空格数量。如果 `padding` 是一个 `string`（字符串），它应该直接将 `padding` 前置到 `input`。让我们尝试实现当 `padLeft` 传入 `number` 类型的 `padding` 时的逻辑。

```ts
function padLeft(padding: number | string, input: string): string {
  return " ".repeat(padding) + input;
}
```

> 报错信息：类型为 'string | number' 的参数不能赋给类型为 'number' 的参数。类型 'string' 不能赋给类型 'number'。（诊断码 2345）

哎呀，我们在 `padding` 上遇到了一个错误。TypeScript 警告我们，正在将一个类型为 `number | string` 的值传递给 `repeat` 函数，而该函数只接受 `number`，它是对的。换句话说，我们还没有显式地检查 `padding` 是否首先是 `number`，也没有处理它是 `string` 的情况，所以让我们准确地去做这件事。

```ts
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

如果这看起来大多是乏味的 JavaScript 代码，那某种程度上正是重点。除了我们放置的注解外，这段 TypeScript 代码看起来就像 JavaScript。其理念是 TypeScript 的类型系统旨在让我们尽可能轻松地编写典型的 JavaScript 代码，而无需为了类型安全而过度弯曲（bend over backwards）。

虽然它可能看起来没什么，但实际上在幕后发生了很多事情。就像 TypeScript 使用静态类型分析运行时值一样，它将类型分析叠加在 JavaScript 的运行时控制流结构（如 `if/else`、条件三元运算符、循环、真值检查等）之上，这些都会影响那些类型。

在我们的 `if` 检查中，TypeScript 将 `typeof padding === "number"` 视为一种称为*类型保护（type guard）*的特殊代码形式。TypeScript 遵循我们程序可能采取的执行路径，以分析在给定位置某个值的最具体可能类型。它查看这些特殊检查（称为*类型保护*）和赋值，而将类型细化为比声明更具体的类型的过程称为*收窄（narrowing）*。在许多编辑器中，我们可以观察到这些类型随变化而改变，我们甚至会在示例中这样做。

```ts
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

TypeScript 能理解的用于收窄的结构有几种。

## [`typeof` 类型保护（Type Guards）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#typeof-type-guards)

正如我们所看到的，JavaScript 支持一个 `typeof` 运算符，它可以提供关于我们在运行时拥有的值的类型的基本信息。TypeScript 期望它返回一组特定的字符串：

- `"string"`
- `"number"`
- `"bigint"`
- `"boolean"`
- `"symbol"`
- `"undefined"`
- `"object"`
- `"function"`

就像我们在 `padLeft` 中看到的那样，这个运算符在许多 JavaScript 库中会频繁出现，TypeScript 能理解它在不同分支中收窄类型。

在 TypeScript 中，针对 `typeof` 返回的值进行检查是一种类型保护。因为 TypeScript 编码了 `typeof` 在不同值上的行为方式，它了解它在 JavaScript 中的一些怪癖。例如，请注意在上面的列表中，`typeof` 不返回字符串 `null`。查看以下示例：

```ts
function printAll(strs: string | string[] | null) {
  if (typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  } else {
    // do nothing
  }
}
```

> 报错信息：'strs' 可能为 'null'。（诊断码 18047）

在 `printAll` 函数中，我们尝试检查 `strs` 是否为对象，以查看它是否为数组类型（现在可能是重申数组在 JavaScript 中是对象类型的好时机）。但事实证明，在 JavaScript 中，`typeof null` 实际上是 `"object"`！这是历史上那些不幸的意外之一。

有足够经验的用户可能不会感到惊讶，但并非每个人都在 JavaScript 中遇到过这种情况；幸运的是，TypeScript 让我们知道 `strs` 仅被收窄为 `string[] | null` 而不是单纯的 `string[]`。

这可能是引入我们称之为“真值（truthiness）”检查的好时机。

## [真值收窄（Truthiness narrowing）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#truthiness-narrowing)

真值（Truthiness）可能不是你会在字典里找到的词，但它在 JavaScript 中是非常常听到的概念。

在 JavaScript 中，我们可以在条件语句、`&&`、`||`、`if` 语句、布尔取反（`!`）等中使用任何表达式。例如，`if` 语句并不期望它们的条件总是具有 `boolean` 类型。

```ts
function getUsersOnlineMessage(numUsersOnline: number) {
  if (numUsersOnline) {
    return `There are ${numUsersOnline} online now!`;
  }
  return "Nobody's here. :(";
}
```

在 JavaScript 中，像 `if` 这样的构造首先将其条件“强制转换（coerce）”为 `boolean` 以理解它们，然后根据结果是 `true` 还是 `false` 选择分支。像以下这样的值：

- `0`
- `NaN`
- `""`（空字符串）
- `0n`（`bigint` 版本的零）
- `null`
- `undefined`

都强制转换为 `false`，其他值则强制转换为 `true`。你可以通过 `Boolean` 函数运行它们，或者使用更简短的双重布尔取反来始终将值强制转换为 `boolean`。（后者有一个优势，即 TypeScript 推断出狭窄的字面量布尔类型 `true`，而推断前者为类型 `boolean`。）

```ts
// both of these result in 'true'
Boolean("hello"); // type: boolean, value: true
!!"world"; // type: true,    value: true
```

> 报错信息：这种表达式总是为真（truthy）。（诊断码 2872）

利用这种行为相当流行，特别是对于防止像 `null` 或 `undefined` 这样的值。例如，让我们尝试将其用于我们的 `printAll` 函数。

```ts
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
```

你会注意到我们通过检查 `strs` 是否为真值，消除了上面的错误。这至少防止了我们在运行代码时出现可怕的错误，例如：

```txt
TypeError: null is not iterable
```

但请记住，对原始值进行真值检查往往容易出错。例如，考虑另一种编写 `printAll` 的尝试。

```ts
function printAll(strs: string | string[] | null) {
  // !!!!!!!!!!!!!!!!
  //  DON'T DO THIS!
  //   KEEP READING
  // !!!!!!!!!!!!!!!!
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}
```

我们将函数的整个主体包裹在真值检查中，但这有一个微妙的缺点：我们可能不再正确处理空字符串情况。

TypeScript 在这里完全没有伤害我们，但如果你不太熟悉 JavaScript，这种行为值得注意。TypeScript 通常可以帮助你尽早发现错误，但如果你选择对某个值*不采取任何行动*，在不至于过于专断的情况下，它能做的也就这么多了。如果你愿意，你可以确保使用 linter 来处理此类情况。

关于通过真值进行收窄的最后一句话是，使用 `!` 的布尔取反会从取反的分支中过滤掉。

```ts
function multiplyAll(
  values: number[] | undefined,
  factor: number
): number[] | undefined {
  if (!values) {
    return values;
  } else {
    return values.map((x) => x * factor);
  }
}
```

## [相等性收窄（Equality narrowing）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#equality-narrowing)

TypeScript 也使用 `switch` 语句和相等性检查如 `===`、`!==`、`==` 和 `!=` 来收窄类型。例如：

```ts
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    x.toUpperCase();
    y.toLowerCase();
  } else {
    console.log(x);
    console.log(y);
  }
}
```

当我们在上面的例子中检查 `x` 和 `y` 相等时，TypeScript 知道它们的类型也必须相等。由于 `string` 是 `x` 和 `y` 都能采用的唯一公共类型，TypeScript 知道在第一分支中 `x` 和 `y` 必须是 `string`。

针对特定字面量值（与变量相对）的检查也有效。在我们关于真值收窄的部分中，我们编写了一个容易出错的 `printAll` 函数，因为它意外地没有正确处理空字符串。相反，我们可以进行特定检查以排除 `null`，TypeScript 仍然正确地从 `strs` 的类型中移除 `null`。

```ts
function printAll(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}
```

JavaScript 中使用 `==` 和 `!=` 的较宽松相等性检查也能被正确收窄。如果你不熟悉，检查某物 `== null` 实际上不仅检查它是否 specifically 是值 `null` —— 它还检查它是否可能是 `undefined`。这同样适用于 `== undefined`：它检查一个值是 `null` 还是 `undefined`。

```ts
interface Container {
  value: number | null | undefined;
}

function multiplyValue(container: Container, factor: number) {
  // Remove both 'null' and 'undefined' from the type.
  if (container.value != null) {
    console.log(container.value);

    // Now we can safely multiply 'container.value'.
    container.value *= factor;
  }
}
```

## [`in` 运算符收窄（The `in` operator narrowing）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing)

JavaScript 有一个用于确定对象或其原型链是否具有特定名称属性的运算符：`in` 运算符。TypeScript 将其视为缩小潜在类型的一种方式。

例如，使用代码：`"value" in x`，其中 `"value"` 是字符串字面量，`x` 是联合类型。“true”分支收窄 `x` 中具有可选或必需属性 `value` 的类型，“false”分支收窄为具有可选或缺失属性 `value` 的类型。

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }

  return animal.fly();
}
```

重申一下，可选属性将出现在收窄的两侧。例如，人类既可以游泳也可以飞（使用合适的装备），因此应该出现在 `in` 检查的两侧：

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };
type Human = { swim?: () => void; fly?: () => void };

function move(animal: Fish | Bird | Human) {
  if ("swim" in animal) {
    animal;
  } else {
    animal;
  }
}
```

## [`instanceof` 收窄（instanceof narrowing）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#instanceof-narrowing)

JavaScript 有一个运算符用于检查一个值是否是另一个值的“实例”。更具体地说，在 JavaScript 中 `x instanceof Foo` 检查 `x` 的*原型链*是否包含 `Foo.prototype`。虽然我们不会深入讨论，当你了解类时会看到更多，但它们对于任何可以使用 `new` 构造的值仍然有用。正如你可能猜到的，`instanceof` 也是一个类型保护，TypeScript 在由 `instanceof` 保护的分支中收窄类型。

```ts
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
  } else {
    console.log(x.toUpperCase());
  }
}
```

## [赋值（Assignments）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#assignments)

正如我们之前提到的，当我们赋值给任何变量时，TypeScript 会查看赋值的右侧，并适当地收窄左侧。

```ts
let x = Math.random() < 0.5 ? 10 : "hello world!";
x = 1;

console.log(x);
x = "goodbye!";

console.log(x);
```

注意这些赋值中的每一个都是有效的。尽管在第一次赋值后 `x` 的观察类型变为 `number`，我们仍然能够为 `x` 分配一个 `string`。这是因为 `x` 的*声明类型*——即 `x` 初始时的类型——是 `string | number`，而可赋值性总是针对声明类型进行检查。

如果我们给 `x` 分配一个 `boolean`，我们会看到一个错误，因为那不是声明类型的一部分。

```ts
let x = Math.random() < 0.5 ? 10 : "hello world!";
x = 1;

console.log(x);
x = true;

console.log(x);
```

> 报错信息：类型 'boolean' 不能赋给类型 'string | number'。（诊断码 2322）

## [控制流分析（Control flow analysis）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#control-flow-analysis)

到目前为止，我们已经经历了一些关于 TypeScript 如何在特定分支内收窄的基本示例。但除了从每个变量向上走并在 `if`、`while`、条件语句等中寻找类型保护之外，还有更多事情发生。例如

```ts
function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

`padLeft` 从其第一个 `if` 块中返回。TypeScript 能够分析此代码并看到其余主体（`return padding + input;`）在 `padding` 是 `number` 的情况下是*不可达的*。结果，它能够从 `padding` 的类型中移除 `number`（从 `string | number` 收窄为 `string`），用于函数的其余部分。

这种基于可达性的代码分析称为*控制流分析（control flow analysis）*，TypeScript 使用此流分析在遇到类型保护和赋值时收窄类型。当分析一个变量时，控制流可以一遍又一遍地分叉和重新合并，并且可以观察到该变量在每个点具有不同的类型。

```ts
function example() {
  let x: string | number | boolean;

  x = Math.random() < 0.5;

  console.log(x);

  if (Math.random() < 0.5) {
    x = "hello";
    console.log(x);
  } else {
    x = 100;
    console.log(x);
  }

  return x;
}
```

## [使用类型谓词（Using type predicates）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

到目前为止，我们已经使用现有的 JavaScript 构造来处理收窄，然而有时你想对类型在代码中的变化有更直接的控制。

要定义用户定义的类型保护，我们只需定义一个返回类型为*类型谓词（type predicate）*的函数：

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

在我们的示例中，`pet is Fish` 是类型谓词。谓词采用 `parameterName is Type` 的形式，其中 `parameterName` 必须是当前函数签名中参数的名称。

任何时候使用某个变量调用 `isFish`，如果该原始类型兼容，TypeScript 会将该变量*收窄*到该特定类型。

```ts
// Both calls to 'swim' and 'fly' are now okay.
let pet = getSmallPet();

if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

注意 TypeScript 不仅知道在 `if` 分支中 `pet` 是 `Fish`；它还知道在 `else` 分支中，你*没有* `Fish`，所以你必须有 `Bird`。

你可以使用类型保护 `isFish` 来过滤 `Fish | Bird` 数组并获得 `Fish` 数组：

```ts
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()];
const underWater1: Fish[] = zoo.filter(isFish);
// or, equivalently
const underWater2: Fish[] = zoo.filter(isFish) as Fish[];

// The predicate may need repeating for more complex examples
const underWater3: Fish[] = zoo.filter((pet): pet is Fish => {
  if (pet.name === "sharkey") return false;
  return isFish(pet);
});
```

此外，类可以使用 [`this is Type`](https://www.typescriptlang.org/docs/handbook/2/classes.html#this-based-type-guards) 来收窄它们的类型。

## [断言函数（Assertion functions）](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)

类型也可以使用 [断言函数（Assertion functions）](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) 进行收窄。

# [可辨识联合（Discriminated unions）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

到目前为止，我们看的大多数示例都集中在具有简单类型（如 `string`、`boolean` 和 `number`）的单个变量的收窄上。虽然这很常见，但在 JavaScript 中，我们大部分时间都在处理稍微复杂一些的结构。

出于一些动机，让我们想象试图编码诸如圆形和正方形之类的形状。圆形跟踪其半径，正方形跟踪其边长。我们将使用一个称为 `kind` 的字段来告诉我们正在处理哪种形状。这是定义 `Shape` 的第一次尝试。

```ts
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}
```

注意我们使用字符串字面量类型的联合：`"circle"` 和 `"square"` 来告诉我们要将形状视为圆形还是正方形。通过使用 `"circle" | "square"` 而不是 `string`，我们可以避免拼写错误问题。

```ts
function handleShape(shape: Shape) {
  // oops!
  if (shape.kind === "rect") {
    // ...
  }
}
```

> 报错信息：此比较似乎是无意的，因为类型 '"circle" | "square"' 和 '"rect"' 没有重叠。（诊断码 2367）

我们可以编写一个 `getArea` 函数，根据处理的是圆形还是正方形应用正确的逻辑。我们首先尝试处理圆形。

```ts
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2;
}
```

> 报错信息：'shape.radius' 可能为 'undefined'。（诊断码 18048）

在 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 下，这会给我们一个错误——这是合适的，因为 `radius` 可能未定义。但是如果我们针对 `kind` 属性执行适当的检查会怎样？

```ts
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
}
```

> 报错信息：'shape.radius' 可能为 'undefined'。（诊断码 18048）

嗯，TypeScript 仍然不知道在这里该怎么做。我们已经到了比类型检查器更了解我们的值的地步。我们可以尝试使用非空断言（在 `shape.radius` 后的 `!`）来表示 `radius` 肯定存在。

```ts
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius! ** 2;
  }
}
```

但这感觉并不理想。我们不得不对类型检查器大喊大叫（使用那些非空断言 `!`）以说服它 `shape.radius` 已定义，但如果我们开始移动代码，这些断言很容易出错。此外，在 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 之外，我们无论如何都能意外访问那些字段中的任何一个（因为读取可选属性时假定它们始终存在）。我们肯定可以做得更好。

`Shape` 的这种编码问题在于类型检查器无法根据 `kind` 属性知道 `radius` 或 `sideLength` 是否存在。我们需要向我们自己知道的信息传达给类型检查器。考虑到这一点，让我们再次尝试定义 `Shape`。

```ts
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;
```

在这里，我们已经将 `Shape` 正确地分成了两个具有不同 `kind` 属性值的类型，但 `radius` 和 `sideLength` 在它们各自的类型中被声明为必需属性。

让我们看看当我们尝试访问 `Shape` 的 `radius` 时会发生什么。

```ts
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2;
}
```

> 报错信息：属性 'radius' 不存在于类型 'Shape' 上。属性 'radius' 不存在于类型 'Square' 上。（诊断码 2339）

就像我们对 `Shape` 的第一次定义一样，这仍然是一个错误。当 `radius` 是可选的时候，我们得到了一个错误（启用 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 时），因为 TypeScript 无法判断该属性是否存在。现在 `Shape` 是一个联合类型，TypeScript 告诉我们 `shape` 可能是一个 `Square`，而 `Square` 上没有定义 `radius`！两种解释都是正确的，但只有 `Shape` 的联合编码方式才会导致错误，无论 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 如何配置。

但是如果我们再次尝试检查 `kind` 属性呢？

```ts
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
}
```

这消除了错误！当联合类型中的每个类型都包含一个带有字面量类型的公共属性时，TypeScript 将其视为*可辨识联合（discriminated union）*，并且可以收窄联合类型的成员。

在这种情况下，`kind` 是那个公共属性（这被认为是 `Shape` 的*判别属性（discriminant property）*）。检查 `kind` 属性是否为 `"circle"` 消除了 `Shape` 中每个没有类型为 `"circle"` 的 `kind` 属性的类型。这将 `shape` 收窄为 `Circle` 类型。

相同的检查也适用于 `switch` 语句。现在我们可以试着编写完整的 `getArea` 而没有任何恼人的 `!` 非空断言。

```ts
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
  }
}
```

这里重要的是 `Shape` 的编码。向 TypeScript 传达正确的信息——即 `Circle` 和 `Square` 确实是具有特定 `kind` 字段的两个独立类型——是至关重要的。这样做让我们编写类型安全的 TypeScript 代码，看起来与我们本来会编写的 JavaScript 毫无区别。从那里，类型系统能够做“正确”的事情，并弄清楚我们 `switch` 语句每个分支中的类型。

> 顺便提一下，试着玩弄上面的示例并移除一些 return 关键字。你会看到类型检查可以帮助避免在 `switch` 语句的不同子句中意外贯穿（fall through）而导致的错误。

可辨识联合不仅可用于谈论圆形和正方形。它们非常适合表示 JavaScript 中的任何消息传递方案，例如通过网络发送消息（客户端/服务器通信），或在状态管理框架中编码变更。

# [`never` 类型（The `never` type）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-never-type)

在收窄时，你可以将联合类型的选项减少到没有任何可能性的地步，什么也不剩。在这些情况下，TypeScript 将使用 `never` 类型来表示不应该存在的状态。

# [穷尽性检查（Exhaustiveness checking）](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)

`never` 类型可赋值给每种类型；但是，没有类型可赋值给 `never`（除了 `never` 本身）。这意味着你可以使用收窄并依赖 `never` 的出现来对 `switch` 语句进行穷尽性检查。

例如，在我们的 `getArea` 函数中添加一个 `default` 分支，该分支尝试将 shape 赋值给 `never`，当每个可能的情况都被处理时，不会引发错误。

```ts
type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

向 `Shape` 联合添加新成员将导致 TypeScript 错误：

```ts
interface Triangle {
  kind: "triangle";
  sideLength: number;
}

type Shape = Circle | Square | Triangle;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

> 报错信息：类型 'Triangle' 不能赋给类型 'never'。（诊断码 2322）
