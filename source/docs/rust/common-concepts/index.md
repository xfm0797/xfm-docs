---
mode: docs

title: 通用概念：变量、类型、函数与控制流
date: 2026-10-24 14:10:00
updated: 2026-10-24 14:10:00
description: Rust 官方教程第三章中文整理：变量与可变性、常量、遮蔽，标量与复合类型，语句与表达式，函数返回值，if 表达式与三种循环。
keywords: [Rust, 变量, 可变性, 常量, 数据类型, 元组, 数组, 函数, 控制流, 中文文档]
order: 12
---

# 通用概念：变量、类型、函数与控制流

整理自官方 Book 第三章（Common Programming Concepts）。本章覆盖所有语言共有的那部分概念，但每一处都能看出 Rust 的取向：**默认不可变、显式类型、一切皆表达式**。

## 变量与可变性

Rust 变量**默认不可变**。给名字绑定值之后再赋值，编译器直接拒绝：

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {x}");
    x = 6; // error[E0384]: cannot assign twice to immutable variable `x`
}
```

报错之外，编译器还给出了修改建议：把 `let x` 改成 `let mut x`。加 `mut` 后变量才可变：

```rust
let mut x = 5;
x = 6; // OK
```

为什么要默认不可变？因为「一部分代码假设值不变、另一部分代码悄悄改了它」是极难排查的一类 bug——尤其是改动的时机不确定的时候。编译器替你保证「声明不变就真的不变」，你就不必靠脑子追踪了。用不用 `mut` 的判断标准很简单：**在当前上下文里，哪个写法让读代码的人更容易理解**。

### 常量

`const` 与不可变变量相似但有三点区别：

- 声明用 `const`，**必须标注类型**；
- 可以在任何作用域声明（包括全局）；
- 只能绑定**编译期可求值**的常量表达式，不能是运行时才能算出的值。

```rust
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

命名惯例为全大写下划线分隔。常量在声明的作用域内整个程序运行期有效，适合表达「程序多个部分都需要知道的领域值」。

### 遮蔽（Shadowing）

重复使用 `let` 可以声明**同名的新变量**，新变量遮蔽旧变量：

```rust
fn main() {
    let x = 5;
    let x = x + 1;      // 6

    {
        let x = x * 2;  // 12，仅内层作用域
        println!("The value of x in the inner scope is: {x}");
    }

    println!("The value of x is: {x}"); // 6，回到外层
}
```

遮蔽与 `mut` 的两点区别值得注意：

- 遮蔽创建的是**新变量**，之后依然不可变——不小心少了 `let` 直接赋值仍会报错；
- 遮蔽可以**改变类型**并复用名字，而 `mut` 不允许改类型：

```rust
let spaces = "   ";
let spaces = spaces.len(); // OK：&str → usize

let mut spaces = "   ";
spaces = spaces.len();     // error[E0308]: expected `&str`, found `usize`
```

这省掉了 `spaces_str` / `spaces_num` 这类凑合的命名。

## 数据类型

Rust 是**静态类型**语言，编译期必须确定所有变量的类型。多数时候编译器能推断，推断不了时必须显式标注：

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

### 标量类型

一个标量代表单个值，共四种：整数、浮点数、布尔、字符。

**整数**：按长度与有无符号组合：

| 长度 | 有符号 | 无符号 |
| --- | --- | --- |
| 8-bit | i8 | u8 |
| 16-bit | i16 | u16 |
| 32-bit | i32 | u32 |
| 64-bit | i64 | u64 |
| 128-bit | i128 | u128 |
| 随架构 | isize | usize |

默认类型是 `i32`；`isize` / `usize` 主要用于集合索引。整数字面量支持下划线分隔（`1_000`）、十六进制（`0xff`）、八进制（`0o77`）、二进制（`0b1111_0000`）与字节（`b'A'`）。

**整数溢出**是个考点：debug 构建下溢出会导致 panic；release 构建下按二进制补码回绕（`u8` 的 256 变成 0），且**依赖回绕被视为错误**。需要显式处理时用标准库的方法族：`wrapping_*`（总是回绕）、`checked_*`（溢出返回 `None`）、`overflowing_*`（返回值 + 是否溢出的布尔）、`saturating_*`（饱和到边界）。

**浮点数**：`f32` 与 `f64`，默认 `f64`（现代 CPU 上速度相当、精度更高）。整数除法向零截断：

```rust
let quotient = 56.7 / 32.2;
let truncated = -5 / 3; // -1
```

**布尔**：`bool`，一个字节，只有 `true` / `false`。

**字符**：`char` 用单引号字面量，**4 字节**，表示 Unicode 标量值——中文字符、emoji、带音调字母都是合法的 `char`：

```rust
let c = 'z';
let z: char = 'ℤ';
let heart_eyed_cat = '😻';
```

### 复合类型

**元组**：固定长度、各位置类型可以不同：

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
let (x, y, z) = tup;      // 解构
let six_point_four = x.1; // 点号 + 索引访问
```

没有任何值的元组 `()` 叫**单元类型**（unit），表达式不返回其他值时就隐式返回它——后面函数返回值一节还会遇到它。

**数组**：固定长度、所有元素同类型、分配在栈上：

```rust
let a = [1, 2, 3, 4, 5];
let a: [i32; 5] = [1, 2, 3, 4, 5]; // 类型 + 长度
let a = [3; 5];                    // 5 个 3
```

需要伸缩就用 `Vec`（见[常用集合](/docs/rust/collections/)）；元素个数确定不变（如十二个月）才用数组。

**越界访问**会在运行时 panic：

```console
thread 'main' panicked at src/main.rs:19:19:
index out of bounds: the len is 5 but the index is 10
```

索引值编译期不可知，这个检查只能在运行时做——但它一定会做。很多低级语言不做检查，错误索引直接访问非法内存；Rust 选择立即退出，这就是内存安全原则的落地。

## 函数

函数与变量名用 snake case。参数**必须标注类型**——这是有意的设计：签名处写清类型，编译器几乎不需要你在别处补注解，报错也更精准：

```rust
fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");
}
```

### 语句与表达式

Rust 是**基于表达式**的语言，这是理解它的关键分野：

- **语句**（statement）执行动作、不返回值。`let y = 6;` 是语句，函数定义也是语句。
- **表达式**（expression）求值出结果。`5 + 6`、函数调用、宏调用、花括号块都是表达式。

因此 `let x = (let y = 6);` 编译不过——语句不产生值，`x` 无东西可绑。同样，块的求值结果是**末尾的表达式**：

```rust
let y = {
    let x = 3;
    x + 1   // 注意：没有分号
};          // y = 4
```

表达式**不带分号**；加了分号它就变成语句、不再返回值。

### 返回值

返回类型写在 `->` 之后，函数体最后一个表达式的值就是返回值：

```rust
fn plus_one(x: i32) -> i32 {
    x + 1
}
```

在 `x + 1` 后面加个分号会怎样？

```console
error[E0308]: mismatched types
 --> src/main.rs:7:24
7 | fn plus_one(x: i32) -> i32 {
  |    --------            ^^^ expected `i32`, found `()`
8 |     x + 1;
  |          - help: remove this semicolon to return this value
```

加了分号，`x + 1` 变成语句、不再产生值，函数体隐式返回了单元类型 `()`，与声明的 `i32` 冲突。这是新手最常撞上的错误之一，报错里的 `help: remove this semicolon` 就是答案。

## 控制流

### if 表达式

```rust
let number = 6;

if number % 4 == 0 {
    println!("number is divisible by 4");
} else if number % 3 == 0 {
    println!("number is divisible by 3");
} else {
    println!("number is not divisible by 4, 3, or 2");
}
```

两个要点：

- 条件**必须是 `bool`**，不会像 JavaScript 那样自动转换：`if number {}` 直接报 `expected bool, found integer`；
- `else if` 过多会让代码变乱，超过一两个就该考虑换 `match`（见[枚举与模式匹配](/docs/rust/enums/)）。

**if 是表达式**，可以直接用于 `let` 右侧：

```rust
let condition = true;
let number = if condition { 5 } else { 6 }; // 5
```

两个分支的求值结果必须**同类型**，否则编译报 `if and else have incompatible types`——因为编译期就要确定 `number` 的类型。

### 三种循环

**loop**：无限循环，`break` 可带出返回值，`continue` 跳过本轮：

```rust
let mut counter = 0;

let result = loop {
    counter += 1;
    if counter == 10 {
        break counter * 2;
    }
};

println!("The result is {result}"); // 20
```

嵌套循环时可用**循环标签**指定 `break` / `continue` 作用于哪一层，标签以单引号开头：`break 'counting_up;`。

**while**：条件循环，替代 `loop` + `if` + `break` 的组合写法。

**for**：遍历集合的**首选**。用 `while` + 索引遍历又慢（每次迭代都要做边界检查）又容易越界 panic：

```rust
let a = [10, 20, 30, 40, 50];

for element in a {
    println!("the value is: {element}");
}

for number in (1..4).rev() { // 范围 + 反转
    println!("{number}!");
}
```

`for` 从机制上消除了越界的可能，是 Rust 里最常见的循环形态。
