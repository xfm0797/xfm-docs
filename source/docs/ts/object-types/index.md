---
mode: docs

title: 对象类型（Object Types）
date: 2026-10-22 23:00:00
updated: 2026-10-22 23:00:00
description: TypeScript 官方手册《Object Types》中文整理：属性修饰符、索引签名、多余属性检查、extends 与交叉类型、泛型对象类型、Array/ReadonlyArray 与元组。
keywords: [TypeScript, 对象类型, 可选属性, readonly, 索引签名, 交叉类型, 元组, ReadonlyArray]
order: 6
---

# 对象类型（Object Types）

在 JavaScript 中，对数据进行分组和传递的基本方式就是对象。在 TypeScript 中，我们用**对象类型**来描述它们。

如你所见，对象类型可以是匿名的：

```ts
function greet(person: { name: string; age: number }) {
  return "Hello " + person.name;
}
```

也可以用 interface 或类型别名给它起名字：

```ts
interface Person {
  name: string;
  age: number;
}

function greet(person: Person) {
  return "Hello " + person.name;
}
```

```ts
type Person = {
  name: string;
  age: number;
};

function greet(person: Person) {
  return "Hello " + person.name;
}
```

以上三种写法，都描述了「接受一个含 `name`（string）与 `age`（number）属性的对象」的函数。

## 属性修饰符

对象类型中的每个属性都可以规定几件事：类型、是否可选、是否可写。

### 可选属性

很多情况下我们会处理「某个属性可能有、可能没有」的对象。这时在属性名后加问号 `?` 把它标记为可选：

```ts
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

function paintShape(opts: PaintOptions) {
  // ...
}

const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
```

这里 `xPos` 与 `yPos` 都是可选的：可以给、可以不给，上面每次调用都合法。可选性真正表达的只是：**如果这个属性存在，它必须符合指定类型**。

我们也可以读取这些属性，但在 `strictNullChecks` 下 TypeScript 会提醒它们可能是 `undefined`：

```ts
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos; // number | undefined
  let yPos = opts.yPos; // number | undefined
  // ...
}
```

在 JavaScript 中，即便属性从未被赋值，访问它也只是得到 `undefined`。我们可以专门检查 `undefined` 来处理：

```ts
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos; // number
  let yPos = opts.yPos === undefined ? 0 : opts.yPos; // number
  // ...
}
```

给未指定的值设置默认值太常见了，JavaScript 为此提供了专门的语法：

```ts
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log("x coordinate at", xPos); // number
  console.log("y coordinate at", yPos); // number
  // ...
}
```

这里对 `paintShape` 的参数使用了**解构模式**，并给 `xPos`、`yPos` 提供了默认值。于是在 `paintShape` 体内这两个变量必定存在，而对调用者来说仍是可选的。

> 目前无法在解构模式里写类型标注，因为下面这种语法在 JavaScript 中已有别的含义。

```ts
function draw({ shape: Shape, xPos: number = 100 }) {
  render(shape); // 报错：找不到名称 'shape'
  render(xPos); // 报错：找不到名称 'xPos'
}
```

在对象解构模式中，`shape: Shape` 的意思是「取出 `shape` 属性，在本地重命名为 `Shape`」；同理 `xPos: number` 会创建一个名为 `number` 的变量。

### readonly 属性

属性可以用 `readonly` 标记。它不改变运行时行为，但在类型检查阶段该属性不能被写入：

```ts
interface SomeType {
  readonly prop: string;
}

function doSomething(obj: SomeType) {
  // 可以读 obj.prop
  console.log(`prop has the value '${obj.prop}'.`);

  // 但不能重新赋值
  obj.prop = "hello";
  // 报错：无法分配到 'prop'，因为它是只读属性
}
```

`readonly` 修饰符并不意味着值完全不可变——它只意味着**属性本身不能被重新写入**。

```ts
interface Home {
  readonly resident: { name: string; age: number };
}

function visitForBirthday(home: Home) {
  // 可以读取并更新 home.resident 内部的属性
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}

function evict(home: Home) {
  // 但不能给 resident 属性本身赋值
  home.resident = { name: "Victor the Evictor", age: 42 };
  // 报错：无法分配到 'resident'，因为它是只读属性
}
```

要对 `readonly` 的语义有合理预期：它在开发期用来向 TypeScript 表达意图。TypeScript 在检查两个类型是否兼容时**不考虑**属性是否为 `readonly`，所以 `readonly` 属性也可以通过别名被改变：

```ts
interface Person {
  name: string;
  age: number;
}

interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}

let writablePerson: Person = {
  name: "Person McPersonface",
  age: 42,
};

// 可行
let readonlyPerson: ReadonlyPerson = writablePerson;

console.log(readonlyPerson.age); // 打印 '42'
writablePerson.age++;
console.log(readonlyPerson.age); // 打印 '43'
```

使用映射修饰符可以移除 `readonly` 属性。

### 索引签名

有时你不知道类型里所有属性的名字，但知道**值的形状**。这时可以用索引签名描述可能值的类型：

```ts
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = getStringArray();
const secondItem = myArray[1]; // string
```

上面的 `StringArray` 有索引签名，表示「用 number 索引 `StringArray` 时返回 string」。

索引签名属性只允许少数几种类型：`string`、`number`、`symbol`、模板字符串模式，以及仅由这些组成的联合类型。

也可以同时支持多种索引器，但要注意：同时使用 `number` 和 `string` 索引器时，数字索引返回的类型必须是字符串索引返回类型的**子类型**。因为用 number 索引时，JavaScript 会先把它转成 string 再索引对象——`obj[100]` 与 `obj["100"]` 是同一件事，两者必须一致。

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 报错：用数字字符串索引可能拿到完全不同的 Animal
interface NotOkay {
  [x: number]: Animal;
  [x: string]: Dog;
}
```

字符串索引签名虽然能很好地描述「字典」模式，但它同时要求**所有属性都符合它的返回类型**，因为字符串索引意味着 `obj.property` 也可用 `obj["property"]` 访问：

```ts
interface NumberDictionary {
  [index: string]: number;

  length: number; // ok
  name: string;
  // 报错：'name' 的类型 'string' 不能赋给 'string' 索引类型 'number'
}
```

如果索引签名是各属性类型的联合，那么不同类型的属性就可以共存：

```ts
interface NumberOrStringDictionary {
  [index: string]: number | string;

  length: number; // ok
  name: string; // ok
}
```

最后，索引签名也可以加 `readonly`，从而禁止给索引赋值：

```ts
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = "Mallory";
// 报错：类型 'ReadonlyStringArray' 中的索引签名仅允许读取
```

## 多余属性检查

「把对象赋给某个类型的**位置与方式**」会影响类型系统，多余属性检查（excess property checking）就是典型例子：在**创建**对象字面量并赋给对象类型时，TypeScript 会检查得更严格。

```ts
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}

let mySquare = createSquare({ colour: "red", width: 100 });
// 报错：对象字面量只能指定已知属性，'colour' 不存在于类型 'SquareConfig' 中
```

注意实参拼成了 `colour` 而不是 `color`。在纯 JavaScript 里，这种错误会静默失败。

你或许会争辩说这个程序「类型正确」：`width` 兼容、没有 `color` 属性、多出来的 `colour` 无关紧要。但 TypeScript 的判断是——这多半是个 bug。

对象字面量在赋给其他变量或作为实参传入时会受到特殊对待，接受多余属性检查：只要对象字面量含有「目标类型」没有的属性，就会报错。

绕过这项检查其实很简单。最省事的办法是用类型断言：

```ts
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

不过更好的做法是：如果你确定这个对象可以带一些「特殊用途的额外属性」，就加一个字符串索引签名：

```ts
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: unknown;
}
```

这表示 `SquareConfig` 可以有任意数量的属性，只要不是 `color` 或 `width`，其类型无所谓。

还有最后一种绕过方式，可能有点出人意料——把对象先赋给另一个变量：赋值给 `squareOptions` 时不会触发多余属性检查，于是编译器不报错：

```ts
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
```

这个变通只在 `squareOptions` 与 `SquareConfig` 至少有一个公共属性时成立（本例是 `width`）。如果没有任何公共属性，仍会失败：

```ts
let squareOptions = { colour: "red" };
let mySquare = createSquare(squareOptions);
// 报错：类型 '{ colour: string; }' 与类型 'SquareConfig' 没有任何共同属性
```

请记住：对于上面这类简单代码，你大概不该去「绕过」检查。真正需要记住这些技巧的，是那些带方法、有状态的复杂对象字面量；而绝大多数多余属性报错其实都是真 bug。

也就是说，如果你在「选项对象」之类的地方频繁撞上多余属性检查，可能需要回头修改类型声明：比如本例中，如果 `color` 和 `colour` 都允许传给 `createSquare`，那正确的做法是修改 `SquareConfig` 的定义。

## 扩展类型

「某个类型是另一个类型的更具体版本」非常常见。比如 `BasicAddress` 描述在美国寄信寄包裹所需的字段：

```ts
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

有些场景这样就够了，但地址常常还带单元号。于是我们描述一个 `AddressWithUnit`：

```ts
interface AddressWithUnit {
  name?: string;
  unit: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

能用，但缺点是：改动纯属「新增」，却要把 `BasicAddress` 的其他字段全部抄一遍。更好的做法是扩展原始类型，只补充新增的字段：

```ts
interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

interface 上的 `extends` 关键字可以复制其他具名类型的成员，并添加任意新成员。这既减少了类型声明的样板代码，也表达了「多处声明同一个属性可能彼此相关」的意图——比如 `AddressWithUnit` 不必重复 `street`，而且读者能看出它与 `BasicAddress` 有关联。

interface 还可以同时扩展多个类型：

```ts
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
```

## 交叉类型

interface 让我们可以通过扩展从其他类型构建新类型。TypeScript 还提供了**交叉类型**，主要用于组合已有的对象类型，用 `&` 运算符定义：

```ts
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;
```

这里把 `Colorful` 与 `Circle` 交叉，得到一个同时具备两者所有成员的新类型：

```ts
function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}

// 没问题
draw({ color: "blue", radius: 42 });

// 出错
draw({ color: "red", raidus: 42 });
// 报错：'raidus' 不存在于类型 'Colorful & Circle' 中，是否想写 'radius'？
```

## 接口扩展 vs 交叉类型

上面看到了两种组合类型的方式，它们相似但有微妙差异。主要区别在于**冲突如何处理**，这通常也是在 interface 与「交叉类型的类型别名」之间做选择的主要原因。

如果多个同名 interface 定义，且属性兼容，TypeScript 会尝试**合并**它们；如果属性不兼容（同名但类型不同），则直接报错：

```ts
interface Person {
  name: string;
}

interface Person {
  name: number;
}
// 报错：后续属性声明必须具有相同的类型
```

而在交叉类型中，不同类型的同名属性会被自动合并，使用时 TypeScript 会要求该属性**同时满足**两种类型——这可能产生意外结果：

```ts
interface Person1 {
  name: string;
}

interface Person2 {
  name: number;
}

type Staff = Person1 & Person2;

declare const staffer: Staff;
staffer.name; // never
```

此时 `Staff` 要求 `name` 既是 string 又是 number，于是属性类型变成 `never`。

## 泛型对象类型

设想一个可以装任意值的 `Box` 类型——string、number、长颈鹿，什么都行：

```ts
interface Box {
  contents: any;
}
```

`contents` 是 `any`，能用，但后续容易出事故。换成 `unknown` 呢？那在已经知道 `contents` 类型的场景里，就得做防御性检查，或者用容易出错的类型断言：

```ts
interface Box {
  contents: unknown;
}

let x: Box = { contents: "hello world" };

// 可以检查 x.contents
if (typeof x.contents === "string") {
  console.log(x.contents.toLowerCase());
}

// 也可以用类型断言
console.log((x.contents as string).toLowerCase());
```

另一种类型安全的做法是：为每种 `contents` 都定义一个 `Box`：

```ts
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
```

但这样一来，操作这些类型的函数也得分别写，或者写重载：

```ts
function setContents(box: StringBox, newContents: string): void;
function setContents(box: NumberBox, newContents: number): void;
function setContents(box: BooleanBox, newContents: boolean): void;
function setContents(box: { contents: any }, newContents: any) {
  box.contents = newContents;
}
```

样板代码太多，而且以后新增类型还得再加重载。令人沮丧的是——这些 box 类型和重载本质上完全一样。

于是我们做一个声明了类型参数的泛型 `Box`：

```ts
interface Box<Type> {
  contents: Type;
}
```

可以读作「`Type` 的 `Box`，就是 `contents` 类型为 `Type` 的东西」。之后引用 `Box` 时，必须在 `Type` 的位置给出类型实参：

```ts
let box: Box<string>;
```

把 `Box` 想成真实类型的**模板**，`Type` 是占位符，会被替换成别的类型。TypeScript 看到 `Box<string>` 时，会把 `Box<Type>` 中每一处 `Type` 替换为 `string`，最终得到类似 `{ contents: string }` 的东西。换句话说，`Box<string>` 与之前的 `StringBox` 行为完全一致。

```ts
interface Box<Type> {
  contents: Type;
}

interface StringBox {
  contents: string;
}

let boxA: Box<string> = { contents: "hello" };
boxA.contents; // string

let boxB: StringBox = { contents: "world" };
boxB.contents; // string
```

`Box` 的可复用性在于 `Type` 可以被任意类型替代：需要新类型的盒子时，根本不必再声明新的 `Box` 类型。

```ts
interface Apple {
  // ....
}

// 等价于 '{ contents: Apple }'
type AppleBox = Box<Apple>;
```

这也意味着我们可以用泛型函数彻底避免重载：

```ts
function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

值得一提的是，类型别名也可以是泛型的。前面那个 `Box<Type>` 接口可以用类型别名写成：

```ts
type Box<Type> = {
  contents: Type;
};
```

因为类型别名不像 interface 那样只能描述对象类型，它还能用来写其他泛型辅助类型：

```ts
type OrNull<Type> = Type | null;

type OneOrMany<Type> = Type | Type[];

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;
// OneOrMany<Type> | null

type OneOrManyOrNullStrings = OneOrManyOrNull<string>;
// OneOrMany<string> | null
```

### Array 类型

泛型对象类型往往是某种「容器」，其行为与元素类型无关。数据结构按这种方式设计最理想，因为可以跨数据类型复用。

其实本手册一直在用这样一个类型：`Array`。我们写 `number[]` 或 `string[]` 时，它只是 `Array<number>` 和 `Array<string>` 的简写。

```ts
function doSomething(value: Array<string>) {
  // ...
}

let myArray: string[] = ["hello", "world"];

// 两种写法都行！
doSomething(myArray);
doSomething(new Array("hello", "world"));
```

和上面的 `Box` 一样，`Array` 本身就是泛型类型：

```ts
interface Array<Type> {
  /**
   * 获取或设置数组的长度。
   */
  length: number;

  /**
   * 移除数组最后一个元素并返回它。
   */
  pop(): Type | undefined;

  /**
   * 向数组追加新元素，并返回数组的新长度。
   */
  push(...items: Type[]): number;

  // ...
}
```

现代 JavaScript 还提供了其他泛型数据结构，如 `Map<K, V>`、`Set<T>` 和 `Promise<T>`。它们之所以是泛型的，是因为其行为可以适用于任意类型集合。

### ReadonlyArray 类型

`ReadonlyArray` 是描述「不应被修改的数组」的特殊类型：

```ts
function doStuff(values: ReadonlyArray<string>) {
  // 可以读 values……
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ……但不能修改 values
  values.push("hello!");
  // 报错：类型 'readonly string[]' 上不存在属性 'push'
}
```

与属性的 `readonly` 修饰符一样，它主要是表达意图的工具：函数返回 `ReadonlyArray` 说明我们不该改其内容；函数接受 `ReadonlyArray` 说明可以放心把任何数组传进去，不用担心被改动。

和 `Array` 不同，`ReadonlyArray` 没有可用的构造函数：

```ts
new ReadonlyArray("red", "green", "blue");
// 报错：'ReadonlyArray' 只表示类型，但此处被当作值使用
```

正确做法是把普通数组赋给 `ReadonlyArray`：

```ts
const roArray: ReadonlyArray<string> = ["red", "green", "blue"];
```

就像 `Array<Type>` 有 `Type[]` 简写，`ReadonlyArray<Type>` 也有 `readonly Type[]` 简写：

```ts
function doStuff(values: readonly string[]) {
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);
  values.push("hello!"); // 报错
}
```

最后一点要注意：与属性的 `readonly` 修饰符不同，普通 `Array` 与 `ReadonlyArray` 之间的可赋值性**不是双向的**：

```ts
let x: readonly string[] = [];
let y: string[] = [];

x = y; // OK
y = x; // 报错：'readonly string[]' 是只读的，不能赋给可变类型 'string[]'
```

### 元组类型

元组类型是另一种 `Array` 类型，它精确知道包含多少个元素，以及每个位置上是什么类型：

```ts
type StringNumberPair = [string, number];
```

`StringNumberPair` 是 `string` 与 `number` 的元组类型。和 `ReadonlyArray` 一样，它在运行时没有表示，但对 TypeScript 有意义：索引 `0` 处是 `string`，索引 `1` 处是 `number`。

```ts
function doSomething(pair: [string, number]) {
  const a = pair[0]; // string
  const b = pair[1]; // number
  // ...
}

doSomething(["hello", 42]);
```

如果索引超出元素数量，会报错：

```ts
function doSomething(pair: [string, number]) {
  const c = pair[2];
  // 报错：长度为 '2' 的元组类型 '[string, number]' 在索引 '2' 处没有元素
}
```

元组也可以用 JavaScript 的数组解构来拆解：

```ts
function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;
  console.log(inputString); // string
  console.log(hash); // number
}
```

元组类型在「约定很强」的 API 中很有用——每个元素的含义「显而易见」，解构时可以自由命名。但也正因为「显而易见」因人而异，你也许该考虑改用带描述性属性名的对象，对 API 更友好。

除了长度检查，这种简单元组类型等价于「为特定索引声明属性、并用数字字面量类型声明 `length`」的数组版本：

```ts
interface StringNumberPair {
  // 特殊属性
  length: 2;
  0: string;
  1: number;

  // 其他 Array 成员……
  slice(start?: number, end?: number): Array<string>;
}
```

元组还可以有可选元素（在元素类型后写 `?`）。可选元素只能出现在末尾，并且会影响 `length` 的类型：

```ts
type Either2dOr3d = [number, number, number?];

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;
  // z: number | undefined

  console.log(`Provided coordinates had ${coord.length} dimensions`);
  // length: 2 | 3
}
```

元组还能有剩余元素，其类型必须是数组或元组类型：

```ts
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
```

- `StringNumberBooleans`：前两个元素分别是 `string` 和 `number`，后面可以有任意多个 `boolean`。
- `StringBooleansNumber`：第一个是 `string`，接着任意多个 `boolean`，以 `number` 结尾。
- `BooleansStringNumber`：开头任意多个 `boolean`，最后是 `string`、`number`。

带剩余元素的元组没有固定的 `length`，只有若干「位置已确定」的元素：

```ts
const a: StringNumberBooleans = ["hello", 1];
const b: StringNumberBooleans = ["beautiful", 2, true];
const c: StringNumberBooleans = ["world", 3, true, false, true, false, true];
```

可选元素与剩余元素有什么用？它们让元组能与参数列表对应起来。元组类型可以用在剩余参数与展开实参中，因此：

```ts
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
```

基本等价于：

```ts
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

当你需要用剩余参数接收不定数量的实参、又要求至少几个元素、还不想引入中间变量时，这就很方便。

### readonly 元组类型

元组类型也有 `readonly` 变体，在元组前加 `readonly` 修饰符即可——与数组简写语法一致：

```ts
function doSomething(pair: readonly [string, number]) {
  // ...
}
```

如你所料，`readonly` 元组的任何属性在 TypeScript 中都不允许写入：

```ts
function doSomething(pair: readonly [string, number]) {
  pair[0] = "hello!";
  // 报错：无法分配到 '0'，因为它是只读属性
}
```

大多数代码中元组创建后就不再修改，因此尽可能标注为 `readonly` 元组是个好习惯。更重要的一点是：带 `const` 断言的数组字面量会被推断为 `readonly` 元组类型。

```ts
let point = [3, 4] as const;

function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}

distanceFromOrigin(point);
// 报错：类型 'readonly [3, 4]' 不能赋给类型 '[number, number]'
// 因为 'readonly [3, 4]' 是只读的，不能赋给可变类型 '[number, number]'
```

这里 `distanceFromOrigin` 从不修改元素，但它要求一个**可变**元组；而 `point` 被推断为 `readonly [3, 4]`，无法保证元素不被改动，因此不兼容。

> 本章译自 TypeScript 官方手册 [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)，并结合中文表达习惯做了整理；代码示例与结论均以官方原文为准。
