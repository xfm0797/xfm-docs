---
mode: docs

title: 结构体：定义、实例与方法
date: 2026-10-24 14:30:00
updated: 2026-10-24 14:30:00
description: Rust 官方教程第五章中文整理：结构体定义与实例化、字段初始化简写与结构体更新语法、元组结构与单元结构、派生 Debug 输出、方法语法与自动引用解引用。
keywords: [Rust, 结构体, struct, 方法, impl, 字段简写, 调试输出, 中文文档]
order: 14
---

# 结构体：定义、实例与方法

整理自官方 Book 第五章（Using Structs to Structure Related Data）。结构体与元组一样能聚合多个相关值，但**每个字段都有名字**——不必依赖位置来理解数据，这让它在字段多于两三个时几乎总是更好的选择。

## 定义与实例化

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

fn main() {
    let mut user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };

    user1.email = String::from("anotheremail@example.com");
}
```

要点：

- 实例用「结构体名 + 花括号里的 `key: value` 对」创建，字段的书写顺序**不必**与定义一致；
- 取值和赋值用点号（`user1.email`）；
- 可变性是**整实例级别**的——Rust 不允许只把某个字段标成可变；
- 结构体实例作为函数体最后一个表达式，可以隐式返回。

## 三个简写

**字段初始化简写**：参数名与字段名相同时，不必写 `email: email`：

```rust
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}
```

**结构体更新语法**：基于旧实例创建新实例，`..user1` 放最后，未显式给出的字段取旧实例的值：

```rust
let user2 = User {
    email: String::from("another@example.com"),
    ..user1
};
```

注意这背后同样是**移动语义**：`username` 这类不可 `Copy` 的字段从 `user1` 移到了 `user2`，之后 `user1` 的对应字段不能再被整个实例使用。

**元组结构与单元结构**：

```rust
struct Color(i32, i32, i32);       // 元组结构体：字段匿名，按位置访问
struct Point(i32, i32, i32);       // Color 与 Point 是不同类型
struct AlwaysEqual;                // 单元结构体：没有任何字段
```

## 调试输出

结构体默认不能直接 `println!`——打印行为需要派生。在定义前加 `#[derive(Debug)]`，然后用 `{:?}`（或大结构体用 `{:#?}` 美化多行输出）：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {rect1:?}");
    // rect1 is Rectangle { width: 30, height: 50 }
}
```

## 方法语法

方法定义在 `impl`（implementation，实现）块里，第一个参数永远是 `self`：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };

    println!("The area is {} square pixels.", rect1.area());
    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2)); // true
}
```

关于 `&self`：

- `&self` 是 `self: &Self` 的缩写，`Self` 是 `impl` 块所属类型的别名；
- 第一个参数的三种写法对应所有权的三种关系：`&self`（只读借用，最常见）、`&mut self`（可变借用，方法要修改实例）、`self`（拿走所有权，只在方法要把实例转换成别的东西、并阻止调用者再用原实例时用）。

**没有 `->` 运算符**。C / C++ 里对象用 `.`、指针用 `->`；Rust 用**自动引用与解引用**：调用 `object.something()` 时，编译器自动补上 `&`、`&mut` 或 `*`，让 `object` 匹配方法签名。因此无论 `rect1` 是值还是引用，`rect1.area()` 都成立。

方法可以与字段同名——带括号是方法、不带是字段。这种同名方法常被用作 **getter**（如 `fn width(&self) -> bool { self.width > 0 }`）：字段保持私有、方法公开，就能把只读访问纳入类型的公开 API（可见性见[模块系统](/docs/rust/modules/)）。

## 关联函数

`impl` 块里不取 `self` 的函数叫**关联函数**，最经典的用途是构造器。调用时用 `::`：

```rust
impl Rectangle {
    fn square(size: u32) -> Self {
        Self {
            width: size,
            height: size,
        }
    }
}

let sq = Rectangle::square(3);
```

`String::from` 就是一个关联函数。`::` 用于关联函数和命名空间，`.` 用于访问实例的字段与方法——两者在 Rust 里分工明确。
