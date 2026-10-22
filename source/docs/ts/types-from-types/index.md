---
mode: docs

title: 从类型创建类型
date: 2026-10-22 23:10:00
updated: 2026-10-22 23:10:00
description: TypeScript 官方手册《Creating Types from Types》中文整理：keyof / typeof 类型操作符、索引访问类型、条件类型与 infer、映射类型与键重映射、模板字面量类型。
keywords: [TypeScript, 类型操作, keyof, typeof, 索引访问, 条件类型, infer, 映射类型, 模板字面量类型]
order: 7
---

# 从类型创建类型

TypeScript 的类型系统之所以强大，是因为它允许**用其他类型来表达类型**。

最简单的形式是泛型；此外还有一整套类型操作符可用，也可以基于「已有的值」来推导类型。把这些操作符组合起来，就能用简洁、可维护的方式表达复杂的操作与约束。

本章介绍如何用「已有的类型或值」表达新的类型，包括：

- **泛型** —— 接受参数的类型（详见[泛型](/docs/ts/generics/)一章）
- **`keyof` 类型操作符** —— 用 `keyof` 创建新类型
- **`typeof` 类型操作符** —— 用 `typeof` 创建新类型
- **索引访问类型** —— 用 `Type['a']` 语法访问类型的子集
- **条件类型** —— 在类型系统里充当 if 语句的类型
- **映射类型** —— 通过映射已有类型的每个属性来创建类型
- **模板字面量类型** —— 通过模板字符串改变属性的映射类型

## keyof 类型操作符

`keyof` 操作符接受一个对象类型，产出其键的字符串或数字字面量联合。下面的 `P` 等价于 `type P = "x" | "y"`：

```ts
type Point = { x: number; y: number };
type P = keyof Point;
// type P = "x" | "y"
```

如果类型带有 `string` 或 `number` 索引签名，`keyof` 返回的就是这些类型：

```ts
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
// type A = number

type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
// type M = string | number
```

注意这里 `M` 是 `string | number`——因为 JavaScript 对象键总会被强制转为字符串，所以 `obj[0]` 与 `obj["0"]` 永远是一回事。

`keyof` 类型在与映射类型结合时尤其有用，下面会讲到。

## typeof 类型操作符

JavaScript 本身就有 `typeof` 运算符，用于表达式上下文：

```ts
// 打印 "string"
console.log(typeof "Hello world");
```

TypeScript 增加了在**类型上下文**中使用的 `typeof`，用来引用某个变量或属性的类型：

```ts
let s = "hello";
let n: typeof s;
// let n: string
```

对基本类型来说这没什么用，但与其他类型操作符组合时，`typeof` 能方便地表达很多模式。例如内置类型 `ReturnType<T>`——它接受一个函数类型并产出其返回类型：

```ts
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>;
// type K = boolean
```

如果直接对**函数名**使用 `ReturnType`，会得到一条很有教育意义的错误：

```ts
function f() {
  return { x: 10, y: 3 };
}

type P = ReturnType<f>;
// 报错：'f' 表示一个值，但在这里被当作类型使用。是否想写 'typeof f'？
```

记住：值与类型不是一回事。要引用值 `f` 所具有的类型，得用 `typeof`：

```ts
type P = ReturnType<typeof f>;
// type P = { x: number; y: number }
```

### 限制

TypeScript 有意限制了 `typeof` 能作用的表达式范围：只允许对**标识符**（变量名）或其属性使用。这样可以避免「你以为在写会执行的代码、其实并没有执行」这种陷阱：

```ts
// 本意是 type shouldContinue = ReturnType<typeof msgbox>
let shouldContinue: typeof msgbox("Are you sure you want to continue?");
// 报错：应为 ','
```

## 索引访问类型

可以用索引访问类型去查另一个类型上某个属性的类型：

```ts
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"];
// type Age = number
```

索引本身也是类型，因此可以用联合、`keyof` 或其他任意类型：

```ts
type I1 = Person["age" | "name"];
// type I1 = string | number

type I2 = Person[keyof Person];
// type I2 = string | number | boolean

type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName];
// type I3 = string | boolean
```

如果索引一个不存在的属性，会直接报错：

```ts
type I1 = Person["alve"];
// 报错：类型 'Person' 上不存在属性 'alve'
```

另一个常见用法是用 `number` 索引取出数组元素的类型。配合 `typeof`，可以很方便地捕获数组字面量的元素类型：

```ts
const MyArray = [
  { name: "Alice", age: 15 },
  { name: "Bob", age: 23 },
  { name: "Eve", age: 38 },
];

type Person = typeof MyArray[number];
// type Person = { name: string; age: number }

type Age = typeof MyArray[number]["age"];
// type Age = number

// 或者
type Age2 = Person["age"];
// type Age2 = number
```

索引时只能使用**类型**，不能用 `const` 变量做引用：

```ts
const key = "age";
type Age = Person[key];
// 报错：类型 'key' 不能用作索引类型；'key' 表示一个值……
```

不过可以改用类型别名达到类似的重构效果：

```ts
type key = "age";
type Age = Person[key];
```

## 条件类型

大多数有用的程序都要根据输入做决策。JavaScript 程序也不例外；而由于值很容易被内省，这些决策也常常基于输入的类型。条件类型正是用来**描述输入类型与输出类型之间关系**的：

```ts
interface Animal {
  live(): void;
}

interface Dog extends Animal {
  woof(): void;
}

type Example1 = Dog extends Animal ? number : string;
// type Example1 = number

type Example2 = RegExp extends Animal ? number : string;
// type Example2 = string
```

条件类型的形式和 JavaScript 中的条件表达式（`condition ? trueExpression : falseExpression`）很像：

```ts
SomeType extends OtherType ? TrueType : FalseType;
```

当 `extends` 左侧的类型可以赋给右侧时，得到第一个分支（「真」分支）的类型，否则得到后一个分支（「假」分支）。

上面的例子看起来没什么用——`Dog extends Animal` 我们自己也能判断，然后手选 `number` 或 `string` 就行了。条件类型真正的威力在于与**泛型**结合。

例如下面这个 `createLabel` 函数：

```ts
interface IdLabel {
  id: number /* 其他字段 */;
}

interface NameLabel {
  name: string /* 其他字段 */;
}

function createLabel(id: number): IdLabel;
function createLabel(name: string): NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel {
  throw "unimplemented";
}
```

这些重载描述的是「同一个 JavaScript 函数根据输入类型做选择」。注意几个问题：

- 如果某个库在它的 API 中反复做同类判断，重载会变得非常臃肿。
- 这里必须写三个重载：类型确定时的两种情况（`string`、`number`），加上最一般的情况（`string | number`）。`createLabel` 每支持一种新类型，重载数量就成倍增长。

我们可以把这段逻辑编码成条件类型：

```ts
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;
```

然后用它把重载简化成一个无重载的函数：

```ts
function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw "unimplemented";
}

let a = createLabel("typescript");
// let a: NameLabel

let b = createLabel(2.8);
// let b: IdLabel

let c = createLabel(Math.random() ? "hello" : 42);
// let c: NameLabel | IdLabel
```

### 条件类型中的约束

条件类型里的检查常常能带来新信息：就像类型守卫能收窄类型，条件类型的**真分支**会用被检查的类型进一步约束泛型。

例如：

```ts
type MessageOf<T> = T["message"];
// 报错：类型 '"message"' 不能用于索引类型 'T'
```

因为 TypeScript 不知道 `T` 是否含有 `message` 属性。加上约束就不再报错：

```ts
type MessageOf<T extends { message: unknown }> = T["message"];

interface Email {
  message: string;
}

type EmailMessageContents = MessageOf<Email>;
// type EmailMessageContents = string
```

但如果我们希望 `MessageOf` 接受任意类型、在没有 `message` 属性时默认取 `never` 呢？把约束挪出来，引入条件类型即可：

```ts
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;

interface Email {
  message: string;
}

interface Dog {
  bark(): void;
}

type EmailMessageContents = MessageOf<Email>;
// type EmailMessageContents = string

type DogMessageContents = MessageOf<Dog>;
// type DogMessageContents = never
```

在真分支里，TypeScript 知道 `T` 一定有 `message` 属性。

再举一例：写一个 `Flatten`，把数组类型「压平」为元素类型，非数组类型则原样返回：

```ts
type Flatten<T> = T extends any[] ? T[number] : T;

// 取出元素类型
type Str = Flatten<string[]>;
// type Str = string

// 原样返回
type Num = Flatten<number>;
// type Num = number
```

当 `Flatten` 收到数组类型时，它用 `number` 索引访问取 `string[]` 的元素类型；否则直接返回原类型。

### 在条件类型中推断（infer）

我们刚才用条件类型来「施加约束再提取类型」。这种操作太常见了，所以条件类型提供了更省事的写法：用 `infer` 关键字在真分支里**从被比较的类型中推断**。

例如 `Flatten` 里的元素类型本可以推断出来，而不必「手动」用索引访问去取：

```ts
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
```

这里用 `infer` 声明式地引入了一个新的泛型类型变量 `Item`，而不需要在真分支里指明「如何取出 `Type` 的元素类型」。这让我们不必再费心去拆解感兴趣类型的内部结构。

用 `infer` 可以写出一些很有用的辅助类型别名。例如在简单情形下提取函数类型的返回类型：

```ts
type GetReturnType<Type> = Type extends (...args: never[]) => infer Return
  ? Return
  : never;

type Num = GetReturnType<() => number>;
// type Num = number

type Str = GetReturnType<(x: string) => string>;
// type Str = string

type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>;
// type Bools = boolean[]
```

当从**有多个调用签名**的类型（比如重载函数的类型）中推断时，推断依据是**最后一个签名**（通常是最宽松的兜底分支）。无法根据实参类型列表做重载解析：

```ts
declare function stringOrNum(x: string): number;
declare function stringOrNum(x: number): string;
declare function stringOrNum(x: string | number): string | number;

type T1 = ReturnType<typeof stringOrNum>;
// type T1 = string | number
```

### 分布式条件类型

当条件类型作用于泛型、并且给它传入联合类型时，它会**分布式**地展开。例如：

```ts
type ToArray<Type> = Type extends any ? Type[] : never;
```

把一个联合类型传给 `ToArray`，条件类型会分别作用于联合的每个成员：

```ts
type StrArrOrNumArr = ToArray<string | number>;
// type StrArrOrNumArr = string[] | number[]
```

它等价于对 `string | number` 逐项映射：

```ts
ToArray<string> | ToArray<number>;
```

得到：

```ts
string[] | number[];
```

通常这正是我们想要的行为。若要避免分布式，可以把 `extends` 两侧都用方括号包起来：

```ts
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

// 'ArrOfStrOrNum' 不再是联合
type ArrOfStrOrNum = ToArrayNonDist<string | number>;
// type ArrOfStrOrNum = (string | number)[]
```

## 映射类型

不想重复自己的时候，类型常常需要基于另一个类型来构建。

映射类型建立在**索引签名**的语法之上——索引签名用于声明「事先未声明的属性」的类型：

```ts
type OnlyBoolsAndHorses = {
  [key: string]: boolean | Horse;
};

const conforms: OnlyBoolsAndHorses = {
  del: true,
  rodney: false,
};
```

映射类型则是一个泛型类型，用 `PropertyKey` 的联合（通常由 `keyof` 生成）遍历键来创建类型：

```ts
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
```

这个例子中，`OptionsFlags` 会取 `Type` 的所有属性，并把它们的值类型改成 `boolean`：

```ts
type Features = {
  darkMode: () => void;
  newUserProfile: () => void;
};

type FeatureOptions = OptionsFlags<Features>;
// type FeatureOptions = {
//   darkMode: boolean;
//   newUserProfile: boolean;
// }
```

### 映射修饰符

映射过程中还可以应用两个修饰符：`readonly` 和 `?`，分别影响可变性与可选性。

在它们前面加 `-` 或 `+` 可以移除或添加；不加前缀默认视为 `+`。

```ts
// 移除类型属性上的 'readonly'
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};

type LockedAccount = {
  readonly id: string;
  readonly name: string;
};

type UnlockedAccount = CreateMutable<LockedAccount>;
// type UnlockedAccount = { id: string; name: string }
```

```ts
// 移除类型属性上的 'optional'
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

type MaybeUser = {
  id: string;
  name?: string;
  age?: number;
};

type User = Concrete<MaybeUser>;
// type User = { id: string; name: string; age: number }
```

### 通过 as 重映射键

TypeScript 4.1 起，可以在映射类型中用 `as` 子句重新映射键：

```ts
type MappedTypeWithNewProperties<Type> = {
  [Properties in keyof Type as NewKeyType]: Type[Properties];
};
```

借助模板字面量类型等特性，可以由旧属性名生成新的属性名：

```ts
type Getters<Type> = {
  [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property];
};

interface Person {
  name: string;
  age: number;
  location: string;
}

type LazyPerson = Getters<Person>;
// type LazyPerson = {
//   getName: () => string;
//   getAge: () => number;
//   getLocation: () => string;
// }
```

还可以通过条件类型产出 `never` 来**过滤掉**某些键：

```ts
// 移除 'kind' 属性
type RemoveKindField<Type> = {
  [Property in keyof Type as Exclude<Property, "kind">]: Type[Property];
};

interface Circle {
  kind: "circle";
  radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
// type KindlessCircle = { radius: number }
```

你还可以映射任意联合类型——不只是 `string | number | symbol` 的联合，而是任意类型的联合：

```ts
type EventConfig<Events extends { kind: string }> = {
  [E in Events as E["kind"]]: (event: E) => void;
};

type SquareEvent = { kind: "square"; x: number; y: number };
type CircleEvent = { kind: "circle"; radius: number };

type Config = EventConfig<SquareEvent | CircleEvent>;
// type Config = {
//   square: (event: SquareEvent) => void;
//   circle: (event: CircleEvent) => void;
// }
```

### 组合使用

映射类型与本节的其它特性配合得很好。例如下面这个映射类型结合了条件类型，根据对象是否把 `pii` 设为字面量 `true` 而返回 `true` 或 `false`：

```ts
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};

type DBFields = {
  id: { format: "incrementing" };
  name: { type: string; pii: true };
};

type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;
// type ObjectsNeedingGDPRDeletion = { id: false; name: true }
```

## 模板字面量类型

模板字面量类型建立在字符串字面量类型之上，能够通过联合展开成许多字符串。语法与 JavaScript 的模板字符串相同，只是用在类型位置。与具体的字面量类型一起使用时，模板字面量会把内容拼接起来，产生一个新的字符串字面量类型：

```ts
type World = "world";
type Greeting = `hello ${World}`;
// type Greeting = "hello world"
```

当插值位置是联合类型时，结果就是「每个联合成员可能表示的所有字符串字面量」的集合：

```ts
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// type AllLocaleIDs = "welcome_email_id" | "email_heading_id"
//                   | "footer_title_id" | "footer_sendoff_id"
```

模板字面量有多个插值位置时，各位置的联合会**交叉相乘**：

```ts
type Lang = "en" | "ja" | "pt";

type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;
// type LocaleMessageIDs = "en_welcome_email_id" | ... | "pt_footer_sendoff_id"
```

对于大型字符串联合，一般建议用「提前生成」的方式；但规模较小时这种写法很实用。

### 用类型约束字符串联合

模板字面量的威力在于「基于类型内部的信息定义新的字符串」。设想一个函数 `makeWatchedObject(baseObject)`，它给传入对象添加一个 `on()` 方法：

```ts
const passedObject = {
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
};
```

`on` 函数接受两个参数：`eventName`（字符串）与 `callback`（函数）。

`eventName` 的形式应为「对象中的属性名 + `Changed`」，例如由 `firstName` 派生出 `firstNameChanged`。

而 `callback` 在被调用时：

- 应接收到与 `attributeInThePassedObject` 类型一致的值——`firstName` 是 `string`，所以 `firstNameChanged` 事件的回调应收到 `string`；同理 `age` 相关的回调应收到 `number`。
- 返回类型应为 `void`（为演示简便）。

朴素版签名可能写成 `on(eventName: string, callback: (newValue: any) => void)`。但前面描述中的重要类型约束，我们希望能写进代码里——模板字面量类型正好能做到：

```ts
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

// makeWatchedObject 已给这个匿名对象加上了 `on`
person.on("firstNameChanged", (newValue) => {
  console.log(`firstName was changed to ${newValue}!`);
});
```

注意 `on` 监听的事件是 `"firstNameChanged"`，而不只是 `"firstName"`。如果我们把可选事件名约束为「被监听对象属性名联合 + `Changed`」，`on()` 就会健壮得多。在 JavaScript 里做这种计算很自然（`Object.keys(passedObject).map(x => `${x}Changed`)`），而类型系统里的模板字面量提供了类似的字符串操作能力：

```ts
type PropEventSource<Type> = {
  on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

/// 创建一个带 `on` 方法的「被监听对象」
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
```

这样就能做出「写错属性名就报错」的效果：

```ts
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

person.on("firstNameChanged", () => {});

// 防止低级错误（用了属性名而不是事件名）
person.on("firstName", () => {});
// 报错：类型 '"firstName"' 不能赋给
// '"firstNameChanged" | "lastNameChanged" | "ageChanged"'

// 也能挡住拼写错误
person.on("frstNameChanged", () => {});
// 报错：类型 '"frstNameChanged"' 不能赋给同一联合
```

### 配合模板字面量的推断

上面的写法还没用上原对象的全部信息：`firstName` 变化时（即 `firstNameChanged` 事件），回调应收到 `string`；`age` 变化时应收到 `number`。我们却朴素地用 `any` 标注了回调参数。模板字面量类型同样能让「属性类型」与「回调第一个参数类型」保持一致。

关键思路是使用带泛型的函数，使：

- 第一个实参中的字面量被捕获为字面量类型；
- 这个字面量类型可被校验为「泛型中合法属性的联合」的成员；
- 通过索引访问在泛型结构中查出该属性的类型；
- 再把这份类型信息应用到回调参数上，保证其类型相同。

```ts
type PropEventSource<Type> = {
  on<Key extends string & keyof Type>(
    eventName: `${Key}Changed`,
    callback: (newValue: Type[Key]) => void
  ): void;
};

declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

person.on("firstNameChanged", (newName) => {
  // (parameter) newName: string
  console.log(`new name is ${newName.toUpperCase()}`);
});

person.on("ageChanged", (newAge) => {
  // (parameter) newAge: number
  if (newAge < 0) {
    console.warn("warning! negative age");
  }
});
```

这里把 `on` 变成了泛型方法。当用户以 `"firstNameChanged"` 调用时，TypeScript 会尝试推断 `Key` 的正确类型：它拿 `Key` 去匹配 `"Changed"` 之前的内容，推断出 `"firstName"`；随后 `on` 就能取出原对象上 `firstName` 的类型（这里是 `string`）。同理，传入 `"ageChanged"` 时会找到 `age` 的类型 `number`。

推断还可以用各种方式组合，常用于「拆解字符串、再以另一种方式重组」。

## 内置的字符串操作类型

为便于字符串处理，TypeScript 内置了一组可用于字符串操作的类型。为性能考虑，它们由编译器内置，不出现在 TypeScript 附带的 `.d.ts` 文件中。

| 类型 | 作用 |
| --- | --- |
| `Uppercase<StringType>` | 每个字符转大写 |
| `Lowercase<StringType>` | 每个字符转小写 |
| `Capitalize<StringType>` | 首字符转大写 |
| `Uncapitalize<StringType>` | 首字符转小写 |

```ts
type Greeting = "Hello, world";
type ShoutyGreeting = Uppercase<Greeting>;
// type ShoutyGreeting = "HELLO, WORLD"

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`;
type MainID = ASCIICacheKey<"my_app">;
// type MainID = "ID-MY_APP"

type LowercaseGreeting = "hello, world";
type Greeting2 = Capitalize<LowercaseGreeting>;
// type Greeting2 = "Hello, world"

type UppercaseGreeting = "HELLO WORLD";
type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;
// type UncomfortableGreeting = "hELLO WORLD"
```

> 这些内置类型直接调用 JavaScript 的字符串运行时函数实现，且不感知区域设置（locale）。

> 本章整理自 TypeScript 官方手册 [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) 及其 keyof / typeof / Indexed Access / Conditional / Mapped / Template Literal 各节，代码示例与结论均以官方原文为准。
