---
mode: docs

title: Rust 手册
date: 2026-10-24 14:00:00
updated: 2026-10-24 14:00:00
description: Rust 官方教程《The Rust Programming Language》中文整理版导读：Rust 是什么、它靠什么保证内存安全、手册的阅读路径与章节索引，以及环境搭建与 Cargo 上手。
keywords: [Rust, Rust Book, 所有权, Cargo, rustup, 内存安全, 中文文档]
order: 11
---

# Rust 手册

这是一份 Rust 官方教程 [The Rust Programming Language](https://doc.rust-lang.org/book/)（俗称 The Book）的中文整理版，按本站文档形态重新组织：章节顺序与官方 Book 对应，示例代码、编译器报错与结论保持原样，讲解按中文表达习惯重写。原文基于 Rust 1.97.0 / 2024 edition。

## Rust 是什么

Rust 是一门**系统级编程语言**：没有垃圾回收器、没有运行时虚拟机，编译产物是一份独立的可执行文件。它常被拿来和 C / C++ 对比——性能在同一档位，但它靠**类型系统与所有权模型**在编译期挡住了一大类 C / C++ 里最难缠的缺陷：

- **内存安全**：悬垂指针、重复释放、越界访问，绝大多数在编译期直接报错，而不是变成线上偶现的段错误；
- **数据竞争**：并发代码里多个线程同时读写同一块内存的问题，同样由类型系统在编译期拦截；
- **零成本抽象**：迭代器、闭包、泛型这些高级抽象，编译后与手写循环同等性能。

代价是学习曲线：所有权、借用、生命周期这几个概念在其他主流语言里没有对应物，初学时会被编译器「劝退」很多次。本手册的任务就是把这条曲线铺平。

## 环境搭建

Rust 通过 `rustup` 安装（一个管理 Rust 版本与工具链的命令行工具）：

```console
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

Windows 用户从 [rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) 下载安装器，过程中按提示安装 Visual Studio C++ 生成工具（提供链接器与原生库）。

安装完验证并了解三个常用命令：

```console
$ rustc --version    # 查看编译器版本
$ rustup update      # 升级到最新稳定版
$ rustup doc         # 打开本地文档（离线可用）
```

## Hello, World!

不借助任何工具链，最小的 Rust 程序长这样：

```rust
fn main() {
    println!("Hello, world!");
}
```

保存为 `main.rs`，直接用编译器编译运行：

```console
$ rustc main.rs
$ ./main
Hello, world!
```

三个细节值得记住：`fn` 声明函数，`main` 是可执行程序的入口；`println!` 带 `!` 是**宏**调用而不是函数（宏会生成代码来扩展语法，规则不必和函数一致）；语句以分号结尾。

## Cargo：构建系统与包管理器

实际项目都用 Cargo——它同时负责构建、依赖管理与测试运行。这也是 Rust 生态统一度高的原因：几乎所有项目都是「一个 `Cargo.toml` + 一个 `src/`」的结构。

```console
$ cargo new hello_cargo   # 创建项目：Cargo.toml + src/main.rs，并初始化 git
$ cd hello_cargo
$ cargo check             # 快速检查能否编译（不产出可执行文件，最快）
$ cargo build             # 编译，产物在 target/debug/
$ cargo run               # 编译并运行，一步到位
$ cargo build --release   # 发布构建（开优化，产物在 target/release/）
```

`Cargo.toml` 是项目清单，TOML 格式：

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]
```

日常开发的节奏通常是：写代码 → 随时 `cargo check` → 写完 `cargo run` → 发布前 `cargo build --release`。`check` 不产出二进制，比 `build` 快得多，适合边写边验。

## 章节索引

{% row %}
{% col %}
- [通用概念](/docs/rust/common-concepts/) —— 变量、数据类型、函数、控制流
- [所有权](/docs/rust/ownership/) —— 栈与堆、移动语义、借用与切片
- [结构体](/docs/rust/structs/) —— 定义、派生调试输出、方法语法
- [枚举与模式匹配](/docs/rust/enums/) —— 枚举携带数据、match 穷尽性、if let
- [模块系统](/docs/rust/modules/) —— 包与 crate、路径与可见性、use、文件组织
{% endcol %}
{% col %}
- [常用集合](/docs/rust/collections/) —— Vec、String、HashMap
- [错误处理](/docs/rust/error-handling/) —— panic!、Result 与 ?、何时 panic
- [泛型、Trait 与生命周期](/docs/rust/generics/) —— 抽象的三个支点
- [闭包与迭代器](/docs/rust/closures-iterators/) —— Fn trait、惰性求值、零成本抽象
- 官方原文：[doc.rust-lang.org/book](https://doc.rust-lang.org/book/)
{% endcol %}
{% endrow %}

## 阅读建议

- 有 C / C++ / Go 背景的读者，重点读**所有权**与**生命周期**两章，其余章节可以快速过；
- 从动态语言（Python / JavaScript）过来的读者，建议按顺序读，`Cargo` 的编译模型和 `String` / `&str` 的区分需要时间适应；
- 本手册每章的示例都可直接放进一个 `cargo new` 出来的项目里运行；遇到编译错误是常态，Rust 的错误信息质量很高，**先读错误提示再改代码**。
