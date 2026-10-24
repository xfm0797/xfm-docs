---
mode: docs

title: 模块系统：包、crate 与可见性
date: 2026-10-24 14:50:00
updated: 2026-10-24 14:50:00
description: Rust 官方教程第七章中文整理：包与 crate 的关系、mod 声明与文件查找规则、路径与可见性（pub）、use 惯用法、as 别名、pub use 重导出与模块文件组织。
keywords: [Rust, 模块, module, crate, 包, 可见性, pub, use, 中文文档]
order: 16
---

# 模块系统：包、crate 与可见性

整理自官方 Book 第七章（Managing Growing Projects with Packages, Crates, and Modules）。项目一大，就需要按相关性拆分代码、控制哪些部分对外可见。Rust 用 **包（package）、crate、模块（module）** 三层结构解决这件事。

## 包与 crate

- **crate** 是编译器一次考虑的最小代码单元。两种形态：**二进制 crate**（编译成可执行文件，必须有 `main`）与**库 crate**（不含 `main`、不产出可执行文件，定义供多个项目复用的功能）。日常语境里的 crate 多指库 crate，与「库（library）」混用。
- **package** 是一个或多个 crate 的捆绑，含一个描述如何构建它们的 `Cargo.toml`。规则是：可以有任意多个二进制 crate，但**至多一个库 crate**。

Cargo 有两条约定：`src/main.rs` 是与包同名的**二进制 crate 的 crate root**；`src/lib.rs` 是与包同名的**库 crate 的 crate root**。两者都在，就是「一个库 + 一个二进制」的组合。额外的二进制 crate 放 `src/bin/` 下，每个文件一个。

## 模块速查表

编译器从 crate root（`src/lib.rs` 或 `src/main.rs`）出发，按以下规则工作：

- **声明模块**：在 crate root 里写 `mod garden;`，编译器按顺序在三处找代码——`mod garden { … }` 内联花括号、`src/garden.rs`、`src/garden/mod.rs`；
- **声明子模块**：在非 crate root 的文件里（如 `src/garden.rs` 中）写 `mod vegetables;`，编译器在**父模块同名目录**下找——`src/garden/vegetables.rs` 或 `src/garden/vegetables/mod.rs`；
- **引用模块内代码**：用路径，如 `crate::garden::vegetables::Asparagus`；
- **可见性**：模块内代码对父模块**默认私有**。`mod` 换成 `pub mod` 让模块公开，`pub` 前缀让模块内的条目也公开；
- **`use`**：在作用域内为长路径创建快捷方式。

## 路径与可见性

路径分两种：**绝对路径**（从 crate root 开始——当前 crate 用字面量 `crate`，外部 crate 用其名字）与**相对路径**（从当前模块开始，可用 `self` / `super` / 当前模块名），后接 `::` 分隔的标识符。

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    crate::front_of_house::hosting::add_to_waitlist(); // 绝对路径
    front_of_house::hosting::add_to_waitlist();        // 相对路径
}
```

两个经验：

- **优先绝对路径**：代码定义与调用点往往会被独立移动，相对路径更容易牵连失效；
- **可见性默认私有，且私有方向有讲究**：子模块能看见并使用祖先模块里的条目，反过来不行——子模块包装并隐藏自己的实现细节，就像餐厅后厨对顾客不可见、经理却能看见整个餐厅。**注意 `pub mod` 只让模块本身可被引用，其内容仍是私有的**——`mod hosting` 加了 `pub` 之后，里面的 `fn add_to_waitlist()` 还得再标 `pub`，否则照样报 `function add_to_waitlist is private`。

私有化的收益：隐藏内部实现后，你清楚地知道**哪些内部代码可以随便改、哪些动了会破坏外部使用者**。

## use 惯用法

`use` 把路径引入作用域，之后只写短名：

```rust
use crate::garden::vegetables::Asparagus;
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

两条约定俗成（没有强理由，就是社区共识）：

- **引入函数时，引到其父模块**，调用处写 `hosting::add_to_waitlist()`——一眼看出函数不是本地定义的；
- **引入结构体、枚举等条目时，引完整路径**——`use std::collections::HashMap;`。

同名冲突用 `as` 起本地别名：

```rust
use std::fmt::Result;
use std::io::Result as IoResult;
```

**`pub use` 重导出**：`use` 引入的名字默认只在本作用域可用；写成 `pub use` 则把条目重新导出，外部代码可以走这条短路径——库作者常用它把内部结构「摆到」对外 API 里。配合**通配符** `use std::collections::*;` 可一次引入全部公开条目（可读性差，慎用）。

## 把模块拆到不同文件

模块树在 crate root 里声明，但代码不必全挤在一个文件里。以 crate root 为 `src/lib.rs` 为例：

```text
src/
├── lib.rs          // mod front_of_house;
├── front_of_house.rs
└── front_of_house/
    └── hosting.rs  // 子模块
```

```rust
// src/lib.rs
mod front_of_house;      // 声明即可，分号结尾——实现在别的文件里

// src/front_of_house.rs
pub mod hosting;         // 继续声明子模块

// src/front_of_house/hosting.rs
pub fn add_to_waitlist() {}
```

`mod` 声明**只需写一次**（crate root 或父模块里），重复声明会被当作定义。`garden/mod.rs` 这种旧式布局依然支持，但同一模块混用两种风格会报错，建议统一用 Rust 2018 之后的 `garden.rs` + `garden/` 目录风格。
