---
mode: docs

title: 枚举与模式匹配
date: 2026-10-24 14:40:00
updated: 2026-10-24 14:40:00
description: Rust 官方教程第六章中文整理：枚举携带数据、标准库 Option 与空值安全、match 表达式与穷尽性检查、模式绑定、if let 与 let else。
keywords: [Rust, 枚举, enum, match, Option, 模式匹配, 穷尽性, 中文文档]
order: 15
---

# 枚举与模式匹配

整理自官方 Book 第六章（Enums and Pattern Matching）。如果说结构体是「把相关的字段打包」，枚举就是「这个值只能是若干可能之一」——而且每个可能还能**各自携带不同类型的数据**。它与 `match` 结合，是 Rust 表达分支逻辑的核心手段。

## 枚举可以携带数据

以 IP 地址为例：程序只会遇到 v4 和 v6 两种，可以一一枚举，这就是 enumeration 的得名：

```rust
enum IpAddrKind {
    V4,
    V6,
}

let four = IpAddrKind::V4; // 变体命名空间在枚举名之下，用 :: 分隔
```

但光有「种类」不够，还要存地址数据。用结构体可以写成一个 `kind` 字段 + 一个 `address` 字段，然而更地道的写法是**把数据直接放进变体里**：

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));
```

枚举相对结构体的两个优势：

- **每个变体可以携带不同类型、不同数量的数据**——v4 存四个 `u8`、v6 存一个 `String`，结构体做不到；
- 定义变体的同时自动获得**同名构造函数**：`IpAddr::V4(…)` 本身就是函数调用。

各变体还可以携带完全不同形态的数据：

```rust
enum Message {
    Quit,                       // 不携带数据
    Move { x: i32, y: i32 },    // 具名字段，像结构体
    Write(String),              // 单个 String
    ChangeColor(i32, i32, i32), // 三个 i32
}
```

这四种变体等价于四个不同类型的结构体，但归在同一 `Message` 类型下——于是能写出「接收任意一种 Message」的函数。和结构体一样，`impl` 也能给枚举定义方法。

## Option：没有 null 的语言如何表达「没有值」

Rust **没有 null**。null 的发明者 Tony Hoare 自己称它为「十亿美元的错误」：null 让每个变量天然多出一种「没有值」的状态，而编译器无法帮你检查你是否处理了它。

Rust 用标准库枚举 `Option<T>` 承担这个职责：

```rust
enum Option<T> {
    None,
    Some(T),
}
```

`Some(T)` 表示有一个值，`None` 表示没有。关键在于：`Option<i32>` 和 `i32` 是**两个不同的类型**——想把 `Option` 里的值拿来当 `i32` 用，编译器强制你先明确处理它是不是 `None`。其他语言里「忘记判空」这一大类 bug，在 Rust 里根本编译不过。

## match：硬币分拣机

`match` 把一个值与一系列**模式**逐个比较，命中第一个就执行对应代码：

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

与 `if` 的三点区别：

- `if` 的条件必须是 `bool`，`match` 的比较对象可以是**任意类型**；
- 每个分支（arm）的代码是表达式，**命中分支的值就是整个 `match` 的值**；
- 分支代码多行时用花括号包起来，此时末尾逗号可省略。

### 模式可以绑定值

变体携带的数据可以在模式里绑定出来：

```rust
match coin {
    Coin::Penny => 1,
    Coin::Nickel => 5,
    Coin::Dime => 10,
    Coin::Quarter(state) => {
        println!("State quarter from {state:?}!");
        25
    }
}
```

命中 `Coin::Quarter(state)` 时，`state` 就绑定了变体里携带的州名。**枚举 + match + 绑定**是 Rust 代码里最高频的模式，用顺了会希望在所有语言里都有它。

处理 `Option` 同理：

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
```

## 穷尽性检查

`match` 的分支**必须覆盖所有可能**。漏掉一个变体是编译错误而不是线上事故：

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}
```

```console
error[E0004]: non-exhaustive patterns: `None` not covered
 --> src/main.rs:3:15
  |
3 |         match x {
  |               ^ pattern `None` not covered
```

这条规则是 Rust 把「忘记处理边界情况」变成编译期错误的机制。确实不想逐个处理时，用 `_` 通配符兜底（它必须放最后一个分支）。

## if let 与 let...else

只想处理一个模式、忽略其余时，`match` 要多写一个 `_ => ()` 占位。`if let` 是这种场景的语法糖：

```rust
// match 写法
let config_max = Some(3u8);
match config_max {
    Some(max) => println!("The maximum is configured to be {max}"),
    _ => (),
}

// if let 写法，行为完全一致
if let Some(max) = config_max {
    println!("The maximum is configured to be {max}");
}
```

代价是失去穷尽性检查——所以选择标准就是：简洁与安全之间的取舍。

`if let ... else` 的 `else` 分支等价于 `match` 里的 `_` 分支。而当「一个分支继续算、另一个分支直接返回」时，嵌套的 `if let` 会把主逻辑越缩越深，这时用 **`let...else`**——模式不匹配就走 `else`（`else` 必须从函数返回），主流程保持在「幸福路径」上：

```rust
fn describe_state_quarter(coin: Coin) -> Option<String> {
    let Coin::Quarter(state) = coin else {
        return None;
    };

    if state.existed_in(1900) {
        Some(format!("{state:?} is pretty old, for America!"))
    } else {
        Some(format!("{state:?} is relatively new."))
    }
}
```

`match`、`if let`、`let...else` 三者覆盖了从穷尽到简洁的所有场景，选择哪个取决于当前分支逻辑的形状。
