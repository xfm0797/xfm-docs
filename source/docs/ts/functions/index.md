---
mode: docs

title: 函数（More on Functions）
date: 2026-10-22 22:30:00
updated: 2026-10-22 22:30:00
description: TypeScript 官方手册《More on Functions》中文整理：函数类型表达式、调用与构造签名、泛型函数、可选参数、重载、this 类型、void/unknown/never、剩余参数与参数解构。
keywords: [TypeScript, 函数, 函数类型, 调用签名, 重载, 泛型函数, this 类型, 剩余参数]
order: 5
---

# 函数（More on Functions）

函数是任何应用的基本构件，无论是本地函数、从其他模块导入的函数，还是类上的方法。它们同时也是**值**，和其他值一样，TypeScript 提供了多种描述「函数如何被调用」的方式。

本章讲的是如何为函数编写类型。

## 函数类型表达式

描述一个函数最简单的方式是使用**函数类型表达式**，它的语法与箭头函数相似：

```ts
function greeter(fn: (a: string) => void) {
  fn("Hello, World");
}

function printToConsole(s: string) {
  console.log(s);
}

greeter(printToConsole);
```

`(a: string) => void` 的意思是「一个函数，有一个名为 `a`、类型为 `string` 的参数，且没有返回值」。和函数声明一样，如果不写参数类型，它就是隐式的 `any`。

> 参数名是**必需**的。写成 `(string) => void` 意思是「一个参数名为 `string`、类型为 `any` 的函数」，而不是「接受 string 的函数」。

当然，可以用类型别名给函数类型起个名字，读起来更清楚：

```ts
type GreetFunction = (a: string) => void;

function greeter(fn: GreetFunction) {
  // ...
}
```

## 调用签名

在 JavaScript 里，函数除了可调用之外还可以带有属性。但函数类型表达式不允许声明属性。如果要描述「可调用且带属性」的东西，就得在对象类型里写**调用签名**：

```ts
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};

function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}

function myFunc(someArg: number) {
  return someArg > 3;
}
myFunc.description = "default description";

doSomething(myFunc);
```

注意语法与函数类型表达式略有不同：参数列表和返回类型之间用 `:`，而不是 `=>`。

## 构造签名

JavaScript 函数还可以用 `new` 运算符调用。TypeScript 把这类函数称为构造函数，因为它们通常会创建新对象。在调用签名前面加 `new` 关键字，就是**构造签名**：

```ts
type SomeConstructor = {
  new (s: string): SomeObject;
};

function fn(ctor: SomeConstructor) {
  return new ctor("hello");
}
```

有些对象（比如 JavaScript 的 `Date`）既可以带 `new` 调用，也可以不带 `new` 调用。你可以在同一个类型里任意组合调用签名和构造签名：

```ts
interface CallOrConstruct {
  (n?: number): string;
  new (s: string): Date;
}

function fn(ctor: CallOrConstruct) {
  // 传 number 匹配第一个签名
  console.log(ctor(10));

  // 传 string 匹配第二个签名
  console.log(new ctor("10"));
}

fn(Date);
```

## 泛型函数

写函数时，常见的情况是输入类型与输出类型相关，或者两个输入的类型彼此相关。先看一个返回数组首元素的函数：

```ts
function firstElement(arr: any[]) {
  return arr[0];
}
```

它能用，但返回类型是 `any`。更好的做法是让函数返回数组元素的类型。

在 TypeScript 中，泛型用于描述两个值之间的**对应关系**——做法是在签名里声明一个类型参数：

```ts
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
```

把类型参数 `Type` 加到函数上，并在两处使用，就在输入（数组）和输出（返回值）之间建立了联系。现在调用它会得到更具体的类型：

```ts
// s 的类型是 'string'
const s = firstElement(["a", "b", "c"]);
// n 的类型是 'number'
const n = firstElement([1, 2, 3]);
// u 的类型是 undefined
const u = firstElement([]);
```

### 推断

注意上面的例子并没有显式指定 `Type`——它是 TypeScript 自动**推断**出来的。

也可以使用多个类型参数。比如独立版本的 `map` 是这样的：

```ts
function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
  return arr.map(func);
}

// 参数 n 的类型是 'string'
// parsed 的类型是 'number[]'
const parsed = map(["1", "2", "3"], (n) => parseInt(n));
```

这里 TypeScript 既能从传入的 `string` 数组推断出 `Input`，也能根据函数表达式的返回值（`number`）推断出 `Output`。

### 约束

前面写的泛型函数可以接受任意类型的值。但有时我们想把两个值关联起来，又只能操作其中某一类值。这时可以用**约束**来限制类型参数能接受的类型范围。

比如写一个返回「较长者」的函数，需要访问一个数字类型的 `length` 属性，就用 `extends` 子句约束类型参数：

```ts
function longest<Type extends { length: number }>(a: Type, b: Type) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray 的类型是 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);

// longerString 的类型是 'alice' | 'bob'
const longerString = longest("alice", "bob");

// 报错！number 没有 'length' 属性
const notOK = longest(10, 100);
```

这个例子有几点值得注意：

- 我们让 TypeScript 推断 `longest` 的返回类型——**返回类型推断同样适用于泛型函数**。
- 因为把 `Type` 约束为 `{ length: number }`，我们才能访问 `a` 和 `b` 的 `.length`。没有约束就访问不到，因为这些值可能是没有 length 的其他类型。
- `longerArray` 和 `longerString` 的类型由实参推断而来。记住：泛型的核心就是用同一个类型把两个或多个值关联起来。
- 最后，`longest(10, 100)` 被拒绝，因为 `number` 没有 `.length` 属性。

### 使用受约束的值

使用泛型约束时有一个常见错误：

```ts
function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type {
  if (obj.length >= minimum) {
    return obj;
  } else {
    return { length: minimum };
    // 报错：类型 '{ length: number; }' 不能赋给类型 'Type'。
    // '{ length: number; }' 可赋给 'Type' 的约束，但 'Type' 可能被实例化为
    // 该约束的不同子类型。
  }
}
```

看上去没问题：`Type` 被约束为 `{ length: number }`，函数返回的要么是 `Type`，要么是符合该约束的值。问题在于——函数承诺返回**和传入时同一种**对象，而不只是「符合约束的某个对象」。如果这段代码合法，就会出现下面这种必定崩溃的写法：

```ts
// arr 得到 { length: 6 }
const arr = minimumLength([1, 2, 3], 6);

// 这里会崩溃：数组有 slice 方法，返回的对象没有！
console.log(arr.slice(0));
```

### 显式指定类型参数

泛型调用中 TypeScript 通常能推断出想用的类型参数，但并非总是如此。比如写一个合并两个数组的函数：

```ts
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
```

一般情况下，用类型不匹配的数组调用它会报错：

```ts
const arr = combine([1, 2, 3], ["hello"]);
// 报错：类型 'string' 不能赋给类型 'number'
```

如果你确实想这么做，可以手动指定 `Type`：

```ts
const arr = combine<string | number>([1, 2, 3], ["hello"]);
```

### 编写好泛型函数的准则

写泛型函数很有趣，但也很容易滥用类型参数。类型参数太多、或在不需要的地方加约束，都会让推断成功率下降，最终让你的调用者抓狂。

#### 把类型参数下推

下面两种写法看起来很像：

```ts
function firstElement1<Type>(arr: Type[]) {
  return arr[0];
}

function firstElement2<Type extends any[]>(arr: Type) {
  return arr[0];
}

// a: number（好）
const a = firstElement1([1, 2, 3]);
// b: any（差）
const b = firstElement2([1, 2, 3]);
```

看起来差不多，但 `firstElement1` 是更好的写法：它的推断返回类型是 `Type`；而 `firstElement2` 的推断返回类型是 `any`，因为 TypeScript 必须用约束类型去解析 `arr[0]`，而不是「等到调用时」再解析元素类型。

> 规则：尽可能直接使用类型参数本身，而不是去约束它。

#### 少用类型参数

再看一对相似的函数：

```ts
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func);
}

function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func);
}
```

我们创建了一个不关联任何两个值的类型参数 `Func`。这永远是危险信号：调用者想指定类型参数时，就得毫无理由地多写一个。`Func` 除了让函数更难读、更难推理之外没做任何事。

> 规则：类型参数越少越好。

#### 类型参数应当出现两次

有时我们会忘记某个函数根本不需要泛型：

```ts
function greet<Str extends string>(s: Str) {
  console.log("Hello, " + s);
}

greet("world");
```

完全可以写成更简单的版本：

```ts
function greet(s: string) {
  console.log("Hello, " + s);
}
```

记住：类型参数是用来**关联多个值的类型**的。如果一个类型参数在签名里只出现一次，它就没有关联任何东西。这包括推断出的返回类型——比如 `Str` 若是 `greet` 推断返回类型的一部分，它就同时关联了实参和返回值，即便在代码字面上只出现一次，也算「用了两次」。

> 规则：如果类型参数只出现在一个位置，请认真考虑是否真的需要它。

## 可选参数

JavaScript 函数经常接受可变数量的参数。例如 `number` 的 `toFixed` 方法接受一个可选的位数：

```ts
function f(n: number) {
  console.log(n.toFixed()); // 0 个参数
  console.log(n.toFixed(3)); // 1 个参数
}
```

在 TypeScript 中用 `?` 把参数标记为可选：

```ts
function f(x?: number) {
  // ...
}
f(); // OK
f(10); // OK
```

虽然参数声明为 `number`，但 `x` 的实际类型是 `number | undefined`，因为 JavaScript 中未传入的参数值是 `undefined`。

也可以给参数提供默认值：

```ts
function f(x = 10) {
  // ...
}
```

此时在 `f` 内部，`x` 的类型是 `number`，因为任何 `undefined` 实参都会被替换为 `10`。注意：参数可选时，调用者始终可以传 `undefined`，这只相当于「省略」了该实参：

```ts
// 都 OK
f();
f(10);
f(undefined);
```

### 回调中的可选参数

学过可选参数和函数类型表达式之后，写「调用回调」的函数时很容易犯下面这个错误：

```ts
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}
```

人们写 `index?` 时通常的想法是：这两种调用都合法：

```ts
myForEach([1, 2, 3], (a) => console.log(a));
myForEach([1, 2, 3], (a, i) => console.log(a, i));
```

但这实际表达的却是：`callback` **可能只被一个参数调用**。换句话说，这个函数定义在说「实现可能是这样的」：

```ts
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    // 今天懒得提供 index
    callback(arr[i]);
  }
}
```

于是 TypeScript 会按这个含义检查，报出实际上不可能出现的错误：

```ts
myForEach([1, 2, 3], (a, i) => {
  console.log(i.toFixed());
  // 报错：'i' 可能为 'undefined'
});
```

在 JavaScript 中，用多于形参数量的实参调用函数，多余的实参会被直接忽略；TypeScript 的行为也一样。**形参更少（且类型相同）的函数，永远可以替代形参更多的函数。**

> 规则：为回调写函数类型时，除非你确实打算不传该实参而调用它，否则不要写可选参数。

## 函数重载

有些 JavaScript 函数可以用不同的参数个数和类型调用。例如写一个生成 `Date` 的函数，既接受时间戳（一个参数），也接受「月 / 日 / 年」（三个参数）。

在 TypeScript 中，通过编写**重载签名**来声明「可以用不同方式调用」的函数：先写若干个函数签名（通常两个或更多），再写函数体：

```ts
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}

const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3); // 报错：没有任何重载期望 2 个参数
```

这里写了两个重载：一个接受 1 个参数，另一个接受 3 个参数。前两个签名称为**重载签名**，后面带函数体的那个是**实现签名**——它不能被直接调用。尽管实现签名里 `d` 和 `y` 都是可选的，函数仍然不能用 2 个参数调用。

### 重载签名与实现签名

这是最容易让人困惑的地方。经常有人这样写，然后不明白为什么报错：

```ts
function fn(x: string): void;
function fn() {
  // ...
}

// 期望可以零参数调用
fn();
// 报错：应有 1 个参数，但得到 0 个
```

再次强调：**实现签名从外部是「看不见」的**。

> 写重载函数时，实现之前必须至少有两个签名；实现签名还必须与所有重载签名兼容。

例如下面两个函数都会报错，因为实现签名没有正确地匹配重载：

```ts
function fn(x: boolean): void;
// 参数类型不对
function fn(x: string): void;
// 报错：此重载签名与其实现签名不兼容
function fn(x: boolean) {}
```

```ts
function fn(x: string): string;
// 返回类型不对
function fn(x: number): boolean;
// 报错：此重载签名与其实现签名不兼容
function fn(x: string | number) {
  return "oops";
}
```

### 写好重载

和泛型一样，使用重载时也有一些准则。遵循它们会让函数更容易调用、更容易理解、也更容易实现。

考虑一个返回字符串或数组长度的函数：

```ts
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}
```

这个函数没问题，字符串和数组都能调用。但**不能**用一个「可能是字符串或数组」的值调用它，因为 TypeScript 只能把一次调用解析到单个重载上：

```ts
len(""); // OK
len([0]); // OK
len(Math.random() > 0.5 ? "hello" : [0]);
// 报错：没有与此调用匹配的重载
```

因为两个重载的参数个数和返回类型都相同，我们完全可以写一个非重载版本：

```ts
function len(x: any[] | string) {
  return x.length;
}
```

这样好得多！调用者可以用任意一种值调用，而且我们不必再操心实现签名是否兼容。

> 规则：能用联合类型参数解决时，优先用联合类型而不是重载。

## 在函数中声明 this

TypeScript 会通过代码流分析推断函数中的 `this` 应该是什么，例如：

```ts
const user = {
  id: 123,
  admin: false,
  becomeAdmin: function () {
    this.admin = true;
  },
};
```

TypeScript 知道 `user.becomeAdmin` 有一个对应的 `this`，即外层对象 `user`。多数情况下这样就够了，但很多时候你需要更精确地控制 `this` 代表哪个对象。JavaScript 规范规定不能有名为 `this` 的参数，TypeScript 就利用这块语法空间，让你声明函数体中 `this` 的类型：

```ts
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

const db = getDB();
const admins = db.filterUsers(function (this: User) {
  return this.admin;
});
```

这种模式在回调式 API 中很常见——通常由另一个对象决定何时调用你的函数。注意这里必须用 `function`，不能用箭头函数：

```ts
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

const db = getDB();
const admins = db.filterUsers(() => this.admin);
// 报错：包含该箭头函数捕获了全局的 'this'
```

## 其他需要了解的类型

有些类型在函数场景下特别常见。它们和其他类型一样可以用在任何地方，但在函数上下文中尤其相关。

### void

`void` 表示**不返回值**的函数的返回值。函数没有任何 `return` 语句、或 `return` 不返回显式值时，推断出的类型就是 `void`：

```ts
// 推断的返回类型是 void
function noop() {
  return;
}
```

在 JavaScript 中，不返回值的函数会隐式返回 `undefined`。但在 TypeScript 中，`void` 和 `undefined` 不是一回事。

> `void` 不等于 `undefined`。

### object

特殊类型 `object` 指代所有**非原始值**（非 `string`、`number`、`bigint`、`boolean`、`symbol`、`null`、`undefined`）。它既不同于空对象类型 `{}`，也不同于全局类型 `Object`。你几乎永远不需要用 `Object`。

> `object` 不是 `Object`，请始终使用 `object`。

注意在 JavaScript 中函数值也是对象：它们有属性、原型链上有 `Object.prototype`、`instanceof Object` 成立、可以对其调用 `Object.keys` 等等。因此，在 TypeScript 中函数类型被视为 `object`。

### unknown

`unknown` 类型表示任意值。它和 `any` 相似，但更安全，因为对 `unknown` 值做任何操作都是非法的：

```ts
function f1(a: any) {
  a.b(); // OK
}

function f2(a: unknown) {
  a.b(); // 报错：'a' 的类型为 'unknown'
}
```

描述函数类型时这很有用：你可以描述「接受任意值」的函数，而函数体内不会出现 `any` 值。反过来，也可以描述返回「类型未知」的值的函数：

```ts
function safeParse(s: string): unknown {
  return JSON.parse(s);
}

// 使用 obj 时要小心！
const obj = safeParse(someRandomString);
```

### never

有些函数永远不返回值：

```ts
function fail(msg: string): never {
  throw new Error(msg);
}
```

`never` 类型表示「永远不会被观察到的值」。作为返回类型时，意味着函数抛出了异常或终止了程序执行。

当 TypeScript 判断一个联合类型里什么都不剩时，`never` 也会出现：

```ts
function fn(x: string | number) {
  if (typeof x === "string") {
    // 做点什么
  } else if (typeof x === "number") {
    // 做点别的
  } else {
    x; // 类型是 'never'！
  }
}
```

### Function

全局类型 `Function` 描述了 `bind`、`call`、`apply` 等所有 JavaScript 函数值都有的属性。它还有一个特殊性质：`Function` 类型的值总是可以被调用，而且这些调用返回 `any`：

```ts
function doSomething(f: Function) {
  return f(1, 2, 3);
}
```

这是**无类型函数调用**，因为返回 `any` 不安全，一般应避免。如果你需要接受任意函数但**不打算调用**它，用 `() => void` 通常更安全。

## 剩余参数与展开实参

### 剩余参数

除了可选参数和重载，还可以用**剩余参数**定义接受不定数量实参的函数。

剩余参数出现在所有其他参数之后，使用 `...` 语法：

```ts
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}

// a 得到 [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4);
```

在 TypeScript 中，这类参数的隐式类型是 `any[]` 而不是 `any`；显式标注时必须写成 `Array<T>`、`T[]` 或元组类型。

### 展开实参

反过来，可以用展开语法把可迭代对象（比如数组）展开成不定数量的实参。例如数组的 `push` 接受任意多个参数：

```ts
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
```

注意 TypeScript 一般不假设数组是不可变的，这会导致一些意外的行为：

```ts
// 推断类型是 number[]，即「零个或多个 number 的数组」，而不是「恰好两个 number」
const args = [8, 5];
const angle = Math.atan2(...args);
// 报错：展开实参必须具有元组类型，或传给剩余参数
```

最佳修复方式取决于具体代码，但通常 `const` 断言是最直接的办法：

```ts
// 推断为长度为 2 的元组
const args = [8, 5] as const;
const angle = Math.atan2(...args); // OK
```

面向较旧的运行时使用展开实参时，可能需要开启 `downlevelIteration`。

## 参数解构

参数解构可以把作为实参传入的对象，方便地拆解成函数体内的若干局部变量。在 JavaScript 中是这样：

```js
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });
```

对象的类型标注写在解构语法之后：

```ts
function sum({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
```

看起来有点啰嗦，但同样可以使用具名类型：

```ts
type ABC = { a: number; b: number; c: number };
function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

## 函数的可赋值性

### 返回类型 void

函数的 `void` 返回类型会产生一些不寻常但符合预期的行为。

带 `void` 返回类型的上下文类型，并**不强制**函数不返回值。换句话说，一个有 `void` 返回类型的上下文函数类型（`type voidFunc = () => void`），在实现时可以返回任何值，只是返回值会被忽略。

因此下面这些 `() => void` 的实现都是合法的：

```ts
type voidFunc = () => void;

const f1: voidFunc = () => {
  return true;
};

const f2: voidFunc = () => true;

const f3: voidFunc = function () {
  return true;
};
```

而当这些函数的返回值赋给另一个变量时，得到的类型仍然是 `void`：

```ts
const v1 = f1();
const v2 = f2();
const v3 = f3();
```

这种设计是为了让下面的代码合法——尽管 `Array.prototype.push` 返回数字，而 `Array.prototype.forEach` 期望的函数返回类型是 `void`：

```ts
const src = [1, 2, 3];
const dst = [0];
src.forEach((el) => dst.push(el));
```

还有一个特殊情形需要注意：当**字面量函数定义**的返回类型是 `void` 时，该函数必须不返回任何东西。

```ts
function f2(): void {
  // @ts-expect-error
  return true;
}

const f3 = function (): void {
  // @ts-expect-error
  return true;
};
```

> 本章译自 TypeScript 官方手册 [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)，并结合中文表达习惯做了整理；代码示例与结论均以官方原文为准。
