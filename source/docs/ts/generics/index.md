---
mode: docs

title: 泛型（Generics）
date: 2026-10-22 22:50:00
updated: 2026-10-22 22:50:00
description: TypeScript 官方手册《Generics》中文整理：类型变量、泛型接口与泛型类、泛型约束、用类型参数做约束、类类型工厂、参数默认值与型变注解。
keywords: [TypeScript, 泛型, 类型参数, 泛型约束, 泛型类, 型变, 协变, 逆变]
order: 8
---

# 泛型（Generics）

软件工程的重要一环，是构建这样的组件：它不仅有定义良好、前后一致的 API，而且**可复用**。能处理「今天的数据」也能处理「明天的数据」的组件，才是构建大型软件系统时最灵活的能力来源。

在 C#、Java 这类语言里，打造可复用组件的主要工具之一就是**泛型**——能够创建一个适用于多种类型（而不只是单一类型）的组件，并让使用方把自己的类型带进来。

## 泛型的 Hello World

先从一个「hello world」级别的泛型例子开始：**identity 函数**。它会把传入的东西原样返回，你可以类比 `echo` 命令。

不用泛型的话，要么给它写死一个具体类型：

```ts
function identity(arg: number): number {
  return arg;
}
```

要么用 `any` 来描述：

```ts
function identity(arg: any): any {
  return arg;
}
```

用 `any` 确实「通用」——函数能接受任意类型，但我们丢失了「传进来的是什么类型」这一信息：传进去一个 number，能确定的只是「返回值可能是任意类型」。

我们需要一种办法，**捕获实参的类型**，并用它来表示返回值的类型。这里要用到**类型变量**——一种作用于类型而非值的特殊变量。

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}
```

我们给 identity 函数加上了类型变量 `Type`。它让我们捕获用户提供的类型（比如 `number`），并在之后使用这一信息；这里把 `Type` 又用作返回类型，于是实参和返回值使用了同一个类型——类型信息从函数一端流入、另一端流出。

这个版本的 identity 就是**泛型函数**，因为它可以作用于一系列类型。与使用 `any` 不同，它和第一个写死 `number` 的版本一样精确，不丢失任何信息。

写好泛型 identity 之后，有两种调用方式。第一种是显式传入类型实参：

```ts
let output = identity<string>("myString");
// output: string
```

这里把 `Type` 显式设为 `string`，写法是用 `<>` 包住类型实参（而不是用 `()`）。

第二种、也是最常见的方式是**类型实参推断**：让编译器根据传入的实参类型自动推断 `Type` 的取值：

```ts
let output = identity("myString");
// output: string
```

注意我们没有在尖括号里写类型，编译器看了值 `"myString"` 就推断出 `Type` 是 `string`。

类型实参推断能让代码更短、更好读；但在更复杂的场景中编译器可能推断失败，这时就需要像前一个例子那样显式写出类型实参。

## 使用泛型类型变量

开始用泛型后你会发现：写 `identity` 这类泛型函数时，编译器会要求你在函数体内**正确地**使用带泛型类型的参数——也就是要像对待「任意类型」那样对待它们。

回看这个 identity：

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}
```

如果想在每次调用时打印 `arg` 的长度，你可能会这样写：

```ts
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  // 报错：类型 'Type' 上不存在属性 'length'
  return arg;
}
```

编译器会报错：我们用了 `arg.length`，但从未声明 `arg` 有这个成员。因为类型变量可以代表任意类型，调用者完全可能传入一个没有 `.length` 的 `number`。

如果这个函数本来就是想作用于「`Type` 的数组」而不是 `Type` 本身，那么 `.length` 就应该可用——毕竟在操作数组：

```ts
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length);
  return arg;
}
```

可以这样读 `loggingIdentity` 的类型：「泛型函数 `loggingIdentity` 接收一个类型参数 `Type`，以及一个 `arg`，它是 `Type` 的数组，并返回 `Type` 的数组。」传入数字数组就返回数字数组，因为 `Type` 绑定到了 `number`。这让我们可以把类型变量作为「正在操作的类型的**一部分**」，而不是整个类型，灵活性更大。

也可以写成另一种等价形式：

```ts
function loggingIdentity<Type>(arg: Array<Type>): Array<Type> {
  console.log(arg.length); // Array 有 .length，不再报错
  return arg;
}
```

## 泛型类型

前面写的是泛型 **identity 函数**。接下来看看函数本身的类型，以及如何创建泛型接口。

泛型函数的类型与普通函数类型一样，只是类型参数列表在最前面：

```ts
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: <Type>(arg: Type) => Type = identity;
```

只要类型变量的数量和用法对得上，类型里也可以用别的名字：

```ts
let myIdentity: <Input>(arg: Input) => Input = identity;
```

还可以把泛型类型写成对象字面量类型的调用签名：

```ts
let myIdentity: { <Type>(arg: Type): Type } = identity;
```

由此就得到了第一个泛型接口——把上面的对象字面量搬进 interface：

```ts
interface GenericIdentityFn {
  <Type>(arg: Type): Type;
}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn = identity;
```

类似的例子中，我们可能想把泛型参数提到整个接口上。这样可以直观看到「对什么类型做泛型」（比如 `Dictionary<string>` 而不只是 `Dictionary`），并且让类型参数对接口里所有成员可见：

```ts
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

注意这个例子含义变了：它描述的不再是「泛型函数」，而是「泛型类型里的一个非泛型函数签名」。使用 `GenericIdentityFn` 时必须同时指定对应的类型实参（这里是 `number`），相当于把底层调用签名要用的类型固定下来。

搞清楚「类型参数该放在调用签名上、还是放在接口本身上」，对准确描述类型的哪一部分是泛型很有帮助。

除了泛型接口，还可以创建**泛型类**。注意：**不能**创建泛型 enum 和泛型 namespace。

## 泛型类

泛型类的形状与泛型接口类似：在类名后面用尖括号 `<>` 声明泛型类型参数列表。

```ts
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
```

这是对 `GenericNumber` 最直白的使用，但你可能已经注意到：没有任何东西限制它只能用 `number`。换成 `string` 甚至更复杂的对象都可以：

```ts
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x, y) {
  return x + y;
};

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

和接口一样，把类型参数放在类本身上，可以保证类的所有属性都在同一个类型上工作。

在「类」一章中会提到：类的类型分为**静态侧**和**实例侧**。泛型类只对实例侧泛型，对静态侧不泛型——因此类的静态成员**不能**使用类的类型参数。

## 泛型约束

有时你想写一个泛型函数，工作于「某一类特征已知」的类型集合上。在 `loggingIdentity` 例子里，我们想访问 `arg.length`，但编译器无法证明每个类型都有 `.length`，于是警告我们不能做这个假设。

与其接受任意类型，不如把这个函数**约束**到「同时具有 `.length` 属性的类型」上：只要类型有这个成员就允许，但至少必须有它。做法是把要求写成 `Type` 的约束。

先创建一个描述约束的接口——这里只有一个 `.length` 属性，然后用 `extends` 关键字表达约束：

```ts
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // 现在确定有 .length，不再报错
  return arg;
}
```

因为加了约束，这个泛型函数不再接受任意类型：

```ts
loggingIdentity(3);
// 报错：类型 'number' 不能赋给类型 'Lengthwise'
```

此时必须传入「类型具备全部必需属性」的值：

```ts
loggingIdentity({ length: 10, value: 3 });
```

## 在泛型约束中使用类型参数

可以声明一个受**另一个类型参数**约束的类型参数。比如「按属性名从对象取值」，我们想确保不会误取对象上不存在的属性，就在两个类型之间加约束：

```ts
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
// 报错：类型 '"m"' 不能赋给类型 '"a" | "b" | "c" | "d"'
```

## 在泛型中使用类类型

用泛型在 TypeScript 中创建工厂函数时，需要通过构造函数来引用类类型。例如：

```ts
function create<Type>(c: { new (): Type }): Type {
  return new c();
}
```

更进阶的例子利用 `prototype` 属性，来推断并约束构造函数与类实例侧之间的关系：

```ts
class BeeKeeper {
  hasMask: boolean = true;
}

class ZooKeeper {
  nametag: string = "Mikle";
}

class Animal {
  numLegs: number = 4;
}

class Bee extends Animal {
  numLegs = 6;
  keeper: BeeKeeper = new BeeKeeper();
}

class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
```

这种模式正是 mixin 设计模式的基础。

## 泛型参数默认值

给泛型类型参数声明默认值，就可以让对应的类型实参变成可选的。例如一个创建新 `HTMLElement` 的函数：不传参数时生成 `HTMLDivElement`，第一个参数传元素时生成该元素类型的元素，还可以额外传子元素列表。以前你得这样定义：

```ts
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

有了泛型参数默认值，可以简化为：

```ts
declare function create<T extends HTMLElement = HTMLDivElement, U = T[]>(
  element?: T,
  children?: U
): Container<T, U>;

const div = create();
// div: Container<HTMLDivElement, HTMLDivElement[]>

const p = create(new HTMLParagraphElement());
// p: Container<HTMLParagraphElement, HTMLParagraphElement[]>
```

泛型参数默认值遵循以下规则：

- 有默认值的类型参数被视为**可选**。
- 必选类型参数不能跟在可选类型参数之后。
- 默认类型必须满足该类型参数的约束（如果存在约束）。
- 指定类型实参时，只需为必选类型参数指定；未指定的类型参数会取默认类型。
- 如果指定了默认类型且推断不出候选，则使用默认类型。
- 与已有类 / 接口声明合并时，可以为已有类型参数引入默认值。
- 与已有类 / 接口声明合并时，只要指定了默认值，就可以引入新的类型参数。

## 型变注解（Variance Annotations）

> 这是解决特定问题的高级特性，只应在你**明确知道为什么需要**时才使用。

协变（covariance）与逆变（contravariance）是类型理论中描述两个泛型类型之间关系的术语。先看一个「能生产某种类型」的接口：

```ts
interface Producer<T> {
  make(): T;
}
```

在期望 `Producer<Animal>` 的地方可以使用 `Producer<Cat>`，因为 `Cat` 是 `Animal`。这种关系叫**协变**：`Producer<T>` 到 `Producer<U>` 的关系，与 `T` 到 `U` 的关系相同。

反过来，「能消费某种类型」的接口：

```ts
interface Consumer<T> {
  consume: (arg: T) => void;
}
```

在期望 `Consumer<Cat>` 的地方可以使用 `Consumer<Animal>`，因为能接受 `Animal` 的函数必然也能接受 `Cat`。这称为**逆变**：`Consumer<T>` 到 `Consumer<U>` 的关系，与 `U` 到 `T` 的关系相同——注意方向和协变正好相反。

在 TypeScript 这样的结构化类型系统中，协变与逆变是类型定义自然涌现的行为，即便没有泛型也能观察到。比较两个类型时，通常的算法是展开双方结构逐项比较；而型变提供了一个非常有用的优化：如果 `Producer<T>` 对 `T` 协变，那么直接比较 `Cat` 和 `Animal` 即可。注意这种优化只在比较**同一个泛型类型的两份实例化**时成立，`Producer<T>` 与 `FastProducer<U>` 之间仍然要结构比较。

由于型变是结构化类型自然涌现的性质，TypeScript 会自动推断每个泛型类型的型变。极少见的循环类型场景下这一测量可能不准，此时可以给类型参数写型变注解强制指定：

```ts
// 逆变注解
interface Consumer<in T> {
  consume: (arg: T) => void;
}

// 协变注解
interface Producer<out T> {
  make(): T;
}

// 不变注解
interface ProducerConsumer<in out T> {
  consume: (arg: T) => void;
  make(): T;
}
```

几条硬性提醒：

- 只写**与结构行为一致**的型变注解；绝不写与结构型变不符的注解。
- 型变注解只在「基于实例化的比较」中生效，在结构比较中完全不起作用——所以不能用它把类型「强制」成不变。
- 不要在正常代码里写型变注解。TypeScript 在绝大多数情况下都能正确推断；只有你已定位到具体需求时才使用。
- 型变注解适合临时用于「类型调试」：注解明显写错时编译器会报错。调试完请删掉。
- 试图用型变注解改变类型检查行为是错误用法，会导致不可预期的结果。

> 本章译自 TypeScript 官方手册 [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)，并结合中文表达习惯做了整理；代码示例与结论均以官方原文为准。
