---
mode: docs

title: 类（Classes）
date: 2026-10-22 23:20:00
updated: 2026-10-22 23:20:00
description: TypeScript 官方手册《Classes》中文整理：字段与构造器、implements/extends、可见性修饰符、静态成员、泛型类、this 类型与守卫、参数属性、抽象类与结构化比较。
keywords: [TypeScript, 类, class, 继承, 可见性, private, protected, static, abstract, 参数属性]
order: 9
---

# 类（Classes）

TypeScript 完整支持 ES2015 引入的 `class` 关键字。和其他 JavaScript 语言特性一样，TypeScript 增加了类型标注等语法，让你能够表达类与其他类型之间的关系。

## 类成员

最基本的一个类——空的：

```ts
class Point {}
```

这个类还没什么用，我们开始添加成员。

### 字段

字段声明会在类上创建一个**公开可写**的属性：

```ts
class Point {
  x: number;
  y: number;
}

const pt = new Point();
pt.x = 0;
pt.y = 0;
```

和其他位置一样，类型标注是可选的；不写就是隐式 `any`。

字段也可以有初始化器，它们会在实例化类时自动执行：

```ts
class Point {
  x = 0;
  y = 0;
}

const pt = new Point();
console.log(`${pt.x}, ${pt.y}`); // 打印 0, 0
```

和 `const`、`let`、`var` 一样，类属性的初始化器会用来**推断类型**：

```ts
const pt = new Point();
pt.x = "0"; // 报错：类型 'string' 不能赋给类型 'number'
```

#### --strictPropertyInitialization

`strictPropertyInitialization` 设置控制「类字段是否必须在构造器中初始化」：

```ts
class BadGreeter {
  name: string;
  // 报错：属性 'name' 没有初始化器，且未在构造器中确定赋值
}
```

```ts
class GoodGreeter {
  name: string;

  constructor() {
    this.name = "hello";
  }
}
```

注意：字段必须在**构造器本身**里初始化。TypeScript 不会去分析你从构造器中调用的方法来检测初始化——因为派生类可能覆写这些方法，从而导致成员没有被初始化。

如果你打算通过构造器之外的手段确实初始化某个字段（比如某个外部库替你填充类的一部分），可以使用确定赋值断言运算符 `!`：

```ts
class OKGreeter {
  // 未初始化，但不报错
  name!: string;
}
```

### readonly

字段可以加 `readonly` 前缀，这会阻止在**构造器之外**给该字段赋值：

```ts
class Greeter {
  readonly name: string = "world";

  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName; // 构造器内可以
    }
  }

  err() {
    this.name = "not ok";
    // 报错：无法分配到 'name'，因为它是只读属性
  }
}

const g = new Greeter();
g.name = "also not ok";
// 报错：无法分配到 'name'，因为它是只读属性
```

### 构造器

类的构造器与函数非常相似：可以给参数加类型标注、默认值，也可以写重载：

```ts
class Point {
  x: number;
  y: number;

  // 带默认值的普通签名
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

```ts
class Point {
  x: number = 0;
  y: number = 0;

  // 构造器重载
  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: string | number, y: number = 0) {
    // 具体逻辑
  }
}
```

类构造器签名与函数签名只有几处差别：

- 构造器**不能**有类型参数——类型参数属于外层类声明。
- 构造器**不能**有返回类型标注——返回的永远是类的实例类型。

#### super 调用

和 JavaScript 一样，如果有基类，就必须在构造器体内、使用任何 `this.` 成员之前调用 `super();`：

```ts
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    // 在 ES5 中打印错误的值；在 ES6 中抛异常
    console.log(this.k);
    // 报错：在派生类的构造器中，访问 'this' 之前必须先调用 'super'
    super();
  }
}
```

在 JavaScript 里忘记调用 `super` 是常见错误，但 TypeScript 会在需要时直接告诉你。

### 方法

类上的函数属性称为**方法**，可以使用与函数、构造器相同的全部类型标注：

```ts
class Point {
  x = 10;
  y = 10;

  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

除了标准类型标注，TypeScript 没有给方法额外添加什么。

注意在方法体内，访问字段和其他方法**仍然必须**通过 `this.`。方法体内不加限定的名字永远指向外层作用域中的东西：

```ts
let x: number = 0;

class C {
  x: string = "hello";

  m() {
    // 这里试图修改第 1 行的 x，而不是类属性
    x = "world";
    // 报错：类型 'string' 不能赋给类型 'number'
  }
}
```

### Getter / Setter

类也可以有访问器：

```ts
class C {
  _length = 0;

  get length() {
    return this._length;
  }

  set length(value) {
    this._length = value;
  }
}
```

注意：在 JavaScript 中，「纯转发、无额外逻辑」的字段型 get/set 配对极少有价值。如果 get/set 过程中不需要额外逻辑，直接把字段公开就好。

TypeScript 对访问器有一些特殊的推断规则：

- 只有 `get` 没有 `set` 时，属性自动成为 `readonly`。
- 如果没有指定 setter 参数的类型，会从 getter 的返回类型推断。

从 TypeScript 4.3 起，访问器的读、写可以有不同（更宽）的类型：

```ts
class Thing {
  _size = 0;

  get size(): number {
    return this._size;
  }

  set size(value: string | number | boolean) {
    let num = Number(value);

    // 不允许 NaN、Infinity 等
    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }

    this._size = num;
  }
}
```

### 索引签名

类可以声明索引签名，其行为与其他对象类型的索引签名一致：

```ts
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);

  check(s: string) {
    return this[s] as boolean;
  }
}
```

因为索引签名类型还需要覆盖方法的类型，这类类型用起来并不容易。一般更好的做法是把「按索引访问的数据」放到别处，而不是放在类实例自身上。

## 类的继承关系

像其他面向对象语言一样，JavaScript 中的类可以从基类继承。

### implements 子句

可以用 `implements` 子句检查某个类是否满足特定的 `interface`。如果类没有正确实现该接口，就会报错：

```ts
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}

class Ball implements Pingable {
  // 报错：类 'Ball' 错误地实现了接口 'Pingable'，
  // 类型 'Ball' 中缺少属性 'ping'
  pong() {
    console.log("pong!");
  }
}
```

一个类也可以实现多个接口，例如 `class C implements A, B {}`。

#### 注意

要理解清楚：`implements` 子句**只是检查**这个类能否被当作该接口类型使用，它**完全不改变**类及其方法的类型。一个常见的错误来源就是以为 `implements` 会改变类的类型——并不会。

```ts
interface Checkable {
  check(name: string): boolean;
}

class NameChecker implements Checkable {
  check(s) {
    // 注意这里没有报错
    // 报错：参数 's' 隐式具有 'any' 类型
    return s.toLowerCase() === "ok";
  }
}
```

这个例子中，你可能以为 `s` 的类型会受 `check` 的 `name: string` 影响——并没有。`implements` 子句不改变类体的检查方式，也不影响类型推断。

同样地，实现一个带可选属性的接口，**不会**凭空创建那个属性：

```ts
interface A {
  x: number;
  y?: number;
}

class C implements A {
  x = 0;
}

const c = new C();
c.y = 10;
// 报错：类型 'C' 上不存在属性 'y'
```

### extends 子句

类可以 `extend` 一个基类。派生类拥有基类的所有属性与方法，也可以定义额外成员：

```ts
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}

const d = new Dog();
d.move(); // 基类方法
d.woof(3); // 派生类方法
```

#### 覆写方法

派生类可以覆写基类的字段或属性，可以用 `super.` 语法访问基类方法。注意：因为 JavaScript 的类本质上是查找对象，并不存在「super 字段」这种概念。

TypeScript 强制要求**派生类永远是其基类的子类型**。下面是一个合法的覆写：

```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}

const d = new Derived();
d.greet();
d.greet("reader");
```

派生类遵守基类契约非常重要。因为「通过基类引用指向派生类实例」非常常见（而且永远合法）：

```ts
// 通过基类引用指向派生类实例
const b: Base = d;
b.greet(); // 没问题
```

如果 `Derived` 不遵守 `Base` 的契约呢？

```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  // 把参数改成必需
  greet(name: string) {
    // 报错：'Derived' 中的 'greet' 不能赋给基类 'Base' 中的同名属性，
    // 类型 '(name: string) => void' 不能赋给 '() => void'
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

如果无视错误强行编译，下面的代码就会崩溃：

```ts
const b: Base = new Derived();
// 崩溃，因为 "name" 会是 undefined
b.greet();
```

#### 仅类型字段声明

当 `target >= ES2022` 或 `useDefineForClassFields` 为 `true` 时，类字段会在父类构造器执行完之后初始化，**覆盖**父类设置的值。如果你只是想为继承来的字段重新声明一个更精确的类型，这可能造成问题。处理办法是写 `declare`，告诉 TypeScript 这个字段声明不应产生任何运行时效果：

```ts
interface Animal {
  dateOfBirth: any;
}

interface Dog extends Animal {
  breed: any;
}

class AnimalHouse {
  resident: Animal;

  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // 不生成 JavaScript 代码，只保证类型正确
  declare resident: Dog;

  constructor(dog: Dog) {
    super(dog);
  }
}
```

#### 初始化顺序

JavaScript 类的初始化顺序有时出人意料。看这段代码：

```ts
class Base {
  name = "base";

  constructor() {
    console.log("My name is " + this.name);
  }
}

class Derived extends Base {
  name = "derived";
}

// 打印 "base"，而不是 "derived"
const d = new Derived();
```

发生了什么？JavaScript 定义的类初始化顺序是：

1. 基类字段初始化
2. 基类构造器执行
3. 派生类字段初始化
4. 派生类构造器执行

也就是说，基类构造器执行时看到的是**自己的** `name`，因为派生类的字段初始化还没跑。

#### 继承内置类型

> 如果你不打算继承 `Array`、`Error`、`Map` 等内置类型，或者编译目标是 ES6 / ES2015 及以上，可以跳过这一节。

在 ES2015 中，返回对象的构造器会隐式用返回值替换 `super(...)` 调用者中的 `this`。因此生成的构造器代码必须捕获 `super(...)` 可能的返回值并替换 `this`。

结果就是：在降级到 ES5 时，`Error`、`Array` 等子类化可能不再按预期工作。原因是 `Error`、`Array` 这些构造器函数使用 ES6 的 `new.target` 来调整原型链，而在 ES5 中调用构造器时无法保证 `new.target` 的值。

对于下面这样的子类：

```ts
class MsgError extends Error {
  constructor(m: string) {
    super(m);
  }

  sayHello() {
    return "hello " + this.message;
  }
}
```

你可能会发现：

- 构造出的实例上方法可能是 `undefined`，因此调用 `sayHello` 会报错；
- `instanceof` 关系被破坏，`(new MsgError()) instanceof MsgError` 会返回 `false`。

建议的做法是：在任何 `super(...)` 调用之后立即手动修正原型：

```ts
class MsgError extends Error {
  constructor(m: string) {
    super(m);

    // 显式设置原型
    Object.setPrototypeOf(this, MsgError.prototype);
  }

  sayHello() {
    return "hello " + this.message;
  }
}
```

不过 `MsgError` 的任何子类也必须手动设置原型。对于不支持 `Object.setPrototypeOf` 的运行时，可以改用 `__proto__`。遗憾的是，这些方案在 IE10 及更早版本上无效。

## 成员可见性

可以用 TypeScript 控制某些方法或属性是否对类外部代码可见。

### public

类成员的默认可视性是 `public`，可以在任何地方访问：

```ts
class Greeter {
  public greet() {
    console.log("hi!");
  }
}

const g = new Greeter();
g.greet();
```

因为 `public` 已是默认修饰符，你永远不必写它；出于风格或可读性考虑也可以写。

### protected

`protected` 成员只在其声明所在的类及其子类中可见：

```ts
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }

  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    // 这里访问 protected 成员是允许的
    console.log("Howdy, " + this.getName());
  }
}

const g = new SpecialGreeter();
g.greet(); // OK
g.getName();
// 报错：'getName' 是受保护的，只能在类 'Greeter' 及其子类中访问
```

#### 暴露 protected 成员

派生类需要遵守基类契约，但也可以选择暴露「能力更强的子类型」，其中就包括把 `protected` 成员变成 `public`：

```ts
class Base {
  protected m = 10;
}

class Derived extends Base {
  // 没有修饰符，默认为 'public'
  m = 15;
}

const d = new Derived();
console.log(d.m); // OK
```

注意 `Derived` 本来就能自由读写 `m`，所以这并没有实质改变「安全性」。真正需要注意的是：如果不是有意暴露，在派生类里要记得重复写 `protected` 修饰符。

#### 跨层级访问 protected

TypeScript 不允许在类层级中访问**兄弟类**的 `protected` 成员：

```ts
class Base {
  protected x: number = 1;
}

class Derived1 extends Base {
  protected x: number = 5;
}

class Derived2 extends Base {
  f1(other: Derived2) {
    other.x = 10;
  }

  f2(other: Derived1) {
    other.x = 10;
    // 报错：'x' 是受保护的，只能在类 'Derived1' 及其子类中访问
  }
}
```

原因在于：在 `Derived2` 中访问 `x` 只应允许来自 `Derived2` 的子类，而 `Derived1` 不是。更何况，通过 `Derived1` 引用访问 `x` 本身就非法——那么通过基类引用访问也不该让情况变好。

### private

`private` 与 `protected` 类似，但连子类也不允许访问：

```ts
class Base {
  private x = 0;
}

const b = new Base();
// 类外部不能访问
console.log(b.x);
// 报错：'x' 是私有的，只能在类 'Base' 中访问
```

```ts
class Derived extends Base {
  showX() {
    // 子类也不能访问
    console.log(this.x);
    // 报错：'x' 是私有的，只能在类 'Base' 中访问
  }
}
```

因为 `private` 成员对派生类不可见，派生类无法提升其可见性：

```ts
class Base {
  private x = 0;
}

class Derived extends Base {
  // 报错：类 'Derived' 错误地继承了基类 'Base'，
  // 'x' 在 'Base' 中是私有的，但在 'Derived' 中不是
  x = 1;
}
```

#### 跨实例访问 private

不同面向对象语言对「同一类的不同实例能否互访 `private` 成员」看法不一：Java、C#、C++、Swift、PHP 允许，Ruby 不允许。TypeScript **允许**跨实例访问 `private`：

```ts
class A {
  private x = 10;

  public sameAs(other: A) {
    // 没有报错
    return other.x === this.x;
  }
}
```

#### 注意事项

与类型系统其他部分一样，`private` 和 `protected` **只在类型检查时**生效。这意味着 JavaScript 的运行时手段（例如 `in` 或直接属性查找）仍能访问 `private` / `protected` 成员：

```ts
class MySafe {
  private secretKey = 12345;
}
```

```js
// 在一个 JavaScript 文件中……
const s = new MySafe();

// 会打印 12345
console.log(s.secretKey);
```

`private` 在类型检查期间也允许用**方括号**访问。这使 `private` 字段在单元测试等场景更容易访问，代价是它只是「软私有」，并不能严格保证隐私：

```ts
class MySafe {
  private secretKey = 12345;
}

const s = new MySafe();

// 类型检查阶段不允许
console.log(s.secretKey);
// 报错：'secretKey' 是私有的

// 但这样 OK
console.log(s["secretKey"]);
```

与 TypeScript 的 `private` 不同，JavaScript 的私有字段（`#`）在编译后**依然是私有的**，不提供上面那些「后门」（如方括号访问），因此是**硬私有**：

```ts
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

编译到 ES2021 或更低版本时，TypeScript 会用 WeakMap 代替 `#`：

```ts
"use strict";
var _Dog_barkAmount;
class Dog {
  constructor() {
    _Dog_barkAmount.set(this, 0);
    this.personality = "happy";
  }
}
_Dog_barkAmount = new WeakMap();
```

如果你需要保护类中的值不被恶意代码获取，应使用提供运行时硬私有的机制，例如闭包、WeakMap 或私有字段。注意这些运行时隐私检查可能带来性能开销。

## 静态成员

类可以有 `static` 成员。它们不属于某个具体实例，而是通过类构造器对象本身访问：

```ts
class MyClass {
  static x = 0;

  static printX() {
    console.log(MyClass.x);
  }
}

console.log(MyClass.x);
MyClass.printX();
```

静态成员同样可以使用 `public`、`protected`、`private` 修饰符：

```ts
class MyClass {
  private static x = 0;
}

console.log(MyClass.x);
// 报错：'x' 是私有的，只能在类 'MyClass' 中访问
```

静态成员也会被继承：

```ts
class Base {
  static getGreeting() {
    return "Hello world";
  }
}

class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
```

### 特殊的静态名称

一般不应、也无法覆盖 `Function` 原型上的属性。因为类本身也是可用 `new` 调用的函数，所以某些 `static` 名称不能使用——`name`、`length`、`call` 等函数属性不能定义为静态成员：

```ts
class S {
  static name = "S!";
  // 报错：静态属性 'name' 与构造器函数 'S' 的内置属性 'Function.name' 冲突
}
```

### 为什么没有「静态类」？

TypeScript（以及 JavaScript）没有 C# 那种 `static class` 结构。这类结构之所以存在，是因为那些语言强制所有数据与函数都放在类里；TypeScript 没有这种限制，自然也不需要。只有一个实例的「类」，在 JavaScript / TypeScript 中通常就直接用普通对象表示：

```ts
// 不必要的「静态」类
class MyStaticClass {
  static doSomething() {}
}

// 推荐写法一
function doSomething() {}

// 推荐写法二
const MyHelperObject = {
  dosomething() {},
};
```

## 类中的 static 块

静态块允许你写一段有独立作用域的语句序列，并可访问所在类的私有字段。也就是说，初始化代码可以使用完整的语句能力、不泄漏变量，同时完全访问类的内部：

```ts
class Foo {
  static #count = 0;

  get count() {
    return Foo.#count;
  }

  static {
    try {
      const lastInstances = loadLastInstances();
      Foo.#count += lastInstances.length;
    } catch {}
  }
}
```

## 泛型类

类与接口一样可以是泛型的。用 `new` 实例化泛型类时，类型参数会像函数调用那样被推断：

```ts
class Box<Type> {
  contents: Type;

  constructor(value: Type) {
    this.contents = value;
  }
}

const b = new Box("hello!");
// const b: Box<string>
```

类可以像接口一样使用泛型约束与默认值。

### 静态成员中的类型参数

下面这段代码不合法，原因可能不明显：

```ts
class Box<Type> {
  static defaultValue: Type;
  // 报错：静态成员不能引用类的类型参数
}
```

记住：类型在编译后总是被**完全擦除**的！运行时只有一个 `Box.defaultValue` 属性槽。这意味着设置 `Box<string>.defaultValue`（如果允许的话）也会同时改变 `Box<number>.defaultValue`——显然不行。因此泛型类的 `static` 成员永远不能引用类的类型参数。

## 类中运行时的 this

要记住 TypeScript 不改变 JavaScript 的运行时行为，而 JavaScript 的运行时行为有些「出了名的怪」。

JavaScript 对 `this` 的处理确实不寻常：

```ts
class MyClass {
  name = "MyClass";

  getName() {
    return this.name;
  }
}

const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};

// 打印 "obj"，而不是 "MyClass"
console.log(obj.getName());
```

简而言之，默认情况下函数内部 `this` 的值取决于函数**如何被调用**。本例中函数经由 `obj` 引用调用，于是 `this` 是 `obj` 而非类实例。

这几乎从来不是你想要的。TypeScript 提供了几种缓解或阻止此类错误的办法。

### 箭头函数

如果某个函数经常在「丢失 `this` 上下文」的方式下被调用，用箭头函数属性代替方法定义是合理的：

```ts
class MyClass {
  name = "MyClass";

  getName = () => {
    return this.name;
  };
}

const c = new MyClass();
const g = c.getName;

// 打印 "MyClass"，不会崩溃
console.log(g());
```

这有一些取舍：

- `this` 值在运行时保证正确，即使代码没经过 TypeScript 检查；
- 会更占内存，因为每个实例都会有一份该函数的副本；
- 派生类里无法使用 `super.getName`，因为原型链上没有可获取基类方法的入口。

### this 参数

在方法或函数定义中，名为 `this` 的首个参数在 TypeScript 中有特殊含义，编译时会被擦除：

```ts
// TypeScript 输入（带 this 参数）
function fn(this: SomeType, x: number) {
  /* ... */
}
```

```js
// JavaScript 输出
function fn(x) {
  /* ... */
}
```

TypeScript 会检查「带 `this` 参数的函数是否在正确的上下文中被调用」。因此除了箭头函数，也可以给方法定义加 `this` 参数，从静态层面强制方法被正确调用：

```ts
class MyClass {
  name = "MyClass";

  getName(this: MyClass) {
    return this.name;
  }
}

const c = new MyClass();
c.getName(); // OK

// 报错，这样调用会崩溃
const g = c.getName;
console.log(g());
// 报错：类型 'void' 的 'this' 上下文不能赋给类型 'MyClass' 的方法 'this'
```

这种做法的取舍与箭头函数正好相反：

- JavaScript 调用方仍可能误用类方法而不自知；
- 每个类定义只分配一个函数，而不是每个实例一份；
- 基类方法仍可通过 `super` 调用。

## this 类型

在类中，有一个特殊类型 `this` 动态地指向**当前类**的类型。看它的用处：

```ts
class Box {
  contents: string = "";

  set(value: string) {
    // (method) Box.set(value: string): this
    this.contents = value;
    return this;
  }
}
```

这里 TypeScript 把 `set` 的返回类型推断为 `this`，而不是 `Box`。现在做一个 `Box` 的子类：

```ts
class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const a = new ClearableBox();
const b = a.set("hello");
// const b: ClearableBox
```

`this` 也可以用在参数类型标注中：

```ts
class Box {
  content: string = "";

  sameAs(other: this) {
    return other.content === this.content;
  }
}
```

这与写 `other: Box` 不同——如果有派生类，它的 `sameAs` 方法将只接受**同一个派生类**的其他实例：

```ts
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}

class DerivedBox extends Box {
  otherContent: string = "?";
}

const base = new Box();
const derived = new DerivedBox();
derived.sameAs(base);
// 报错：类型 'Box' 不能赋给类型 'DerivedBox'，
// 因为 'Box' 缺少派生类必需的属性 'otherContent'
```

### 基于 this 的类型守卫

在类与接口的方法返回位置可以使用 `this is Type`。与类型收窄（比如 `if` 语句）配合时，目标对象的类型会被收窄为指定的 `Type`：

```ts
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }

  isDirectory(): this is Directory {
    return this instanceof Directory;
  }

  isNetworked(): this is Networked & this {
    return this.networked;
  }

  constructor(public path: string, private networked: boolean) {}
}

class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}

class Directory extends FileSystemObject {
  children: FileSystemObject[];
}

interface Networked {
  host: string;
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content; // fso: FileRep
} else if (fso.isDirectory()) {
  fso.children; // fso: Directory
} else if (fso.isNetworked()) {
  fso.host; // fso: Networked & FileSystemObject
}
```

基于 `this` 的类型守卫有一个常见用途：对某个字段做**惰性校验**。例如下面这个例子中，在 `hasValue` 被验证为 `true` 之后，盒子里的值就不再带 `undefined`：

```ts
class Box<T> {
  value?: T;

  hasValue(): this is { value: T } {
    return this.value !== undefined;
  }
}

const box = new Box<string>();
box.value = "Gameboy";

box.value; // (property) Box<string>.value?: string

if (box.hasValue()) {
  box.value; // (property) value: string
}
```

## 参数属性

TypeScript 提供了一种特殊语法，把构造器参数变成同名的类属性。这类成员叫**参数属性**，做法是在构造器参数前加上 `public`、`private`、`protected` 或 `readonly` 之一。生成的字段会带上这些修饰符：

```ts
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // 无需函数体
  }
}

const a = new Params(1, 2, 3);
console.log(a.x); // (property) Params.x: number

console.log(a.z);
// 报错：'z' 是私有的，只能在类 'Params' 中访问
```

## 类表达式

类表达式与类声明非常相似，唯一实质区别是类表达式**不需要名字**（不过我们仍可通过它绑定的标识符引用它）：

```ts
const someClass = class<Type> {
  content: Type;

  constructor(value: Type) {
    this.content = value;
  }
};

const m = new someClass("Hello, world");
// const m: someClass<string>
```

## 构造签名

JavaScript 的类用 `new` 运算符实例化。给定了类本身的类型后，工具类型 `InstanceType` 就是这一操作的建模：

```ts
class Point {
  createdAt: number;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.createdAt = Date.now();
    this.x = x;
    this.y = y;
  }
}

type PointInstance = InstanceType<typeof Point>;

function moveRight(point: PointInstance) {
  point.x += 5;
}

const point = new Point(3, 4);
moveRight(point);
point.x; // => 8
```

## 抽象类与抽象成员

TypeScript 中的类、方法与字段都可以是抽象的。抽象方法或抽象字段就是「没有提供实现」的成员，它们必须存在于**抽象类**中，而抽象类不能被直接实例化。

抽象类的作用是作为基类，由子类实现所有抽象成员。没有抽象成员的类称为**具体类**。

```ts
abstract class Base {
  abstract getName(): string;

  printName() {
    console.log("Hello, " + this.getName());
  }
}

const b = new Base();
// 报错：无法创建抽象类的实例
```

因为 `Base` 是抽象的，不能用 `new` 实例化。需要创建派生类并实现抽象成员：

```ts
class Derived extends Base {
  getName() {
    return "world";
  }
}

const d = new Derived();
d.printName();
```

如果忘记实现基类的抽象成员，就会报错：

```ts
class Derived extends Base {
  // 报错：非抽象类 'Derived' 没有实现从 'Base' 继承的抽象成员 'getName'
  // 忘了做任何事
}
```

### 抽象构造签名

有时你想接受某个类构造器函数，而它产生的实例派生自某个抽象类。例如你可能想这样写：

```ts
function greet(ctor: typeof Base) {
  const instance = new ctor();
  // 报错：无法创建抽象类的实例
  instance.printName();
}
```

TypeScript 正确地提示你：你正在试图实例化抽象类。毕竟按 `greet` 的定义，下面这行代码完全合法，而它会构造一个抽象类：

```ts
// 糟糕！
greet(Base);
```

正确的做法是写一个接受「构造签名」的函数：

```ts
function greet(ctor: new () => Base) {
  const instance = new ctor();
  instance.printName();
}

greet(Derived);
greet(Base);
// 报错：类型 'typeof Base' 不能赋给类型 'new () => Base'，
// 不能把抽象构造类型赋给非抽象构造类型
```

这样 TypeScript 就能正确告诉你哪些类构造器函数可以被调用——`Derived` 可以（具体类），`Base` 不行。

## 类之间的关系

大多数情况下，TypeScript 中的类和其他类型一样是**结构化**比较的。例如下面两个类完全相同，因此可以互相替代：

```ts
class Point1 {
  x = 0;
  y = 0;
}

class Point2 {
  x = 0;
  y = 0;
}

const p: Point1 = new Point2(); // OK
```

同样，即使没有显式继承，类之间也可以存在子类型关系：

```ts
class Person {
  name: string;
  age: number;
}

class Employee {
  name: string;
  age: number;
  salary: number;
}

const p: Person = new Employee(); // OK
```

听起来很直观，但有些情形会比较奇怪。空类没有任何成员；在结构化类型系统中，没有成员的类型通常是任何其他类型的**超类型**。所以如果你写了一个空类（别这么做！），任何东西都能替代它：

```ts
class Empty {}

function fn(x: Empty) {
  // 对 'x' 做不了什么，所以什么都不做
}

// 全都 OK！
fn(window);
fn({});
fn(fn);
```

> 本章译自 TypeScript 官方手册 [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)，并结合中文表达习惯做了整理；代码示例与结论均以官方原文为准。
