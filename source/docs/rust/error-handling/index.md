---
mode: docs

title: 错误处理：panic!、Result 与 ?
date: 2026-10-24 15:10:00
updated: 2026-10-24 15:10:00
description: Rust 官方教程第九章中文整理：不可恢复错误的 panic 与栈回退、可恢复错误的 Result 枚举、unwrap 与 expect、? 运算符传播错误与自动类型转换、何时该 panic 的判断准则。
keywords: [Rust, 错误处理, panic, Result, expect, 问号运算符, 中文文档]
order: 18
---

# 错误处理：panic!、Result 与 ?

整理自官方 Book 第九章（Error Handling）。Rust 把错误分成两类，各给一套工具：

- **不可恢复**（unrecoverable）：bug 的另一种说法——程序进入无法继续正确执行的状态，用 `panic!` 停下来；
- **可恢复**（recoverable）：文件不存在、连接被拒这类**预期中可能失败**的操作，用 `Result<T, E>` 把失败信息编码进类型，让调用者决定怎么办。

## panic!：不可恢复错误

```rust
fn main() {
    panic!("crash and burn");
}
```

```console
thread 'main' panicked at src/main.rs:2:5:
crash and burn
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

panic 的默认行为是**栈回退**（unwinding）：沿调用栈逐层回退、逐个清理各函数的数据。回退清理代价不小，若想让二进制更小，可以改成立即**中止**（abort，不做清理、交给操作系统）：

```toml
[profile.release]
panic = 'abort'
```

`panic!` 可能发生在自己写的代码里，也可能发生在自己调用的第三方代码里——后者报错位置是别人的代码。此时用 `RUST_BACKTRACE=1` 打开**回溯**，看 panic 是经由哪些函数一路传过来的，定位到真正引发问题的那行。

`unwrap` 与 `expect` 是两个「有 Result 就拆开」的快捷方法：

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

- `unwrap()`：`Ok` 给出内值，`Err` 直接 panic；
- `expect("…")`：同 `unwrap`，但 panic 消息用你提供的文字——**生产代码里推荐 `expect`**，好的错误消息能传达你的意图，事后排查省一半时间。

## Result：可恢复错误

`Result<T, E>` 是标准库枚举：`Ok(T)` 装成功值，`Err(E)` 装错误值。`File::open` 的签名决定了它的返回类型是 `Result<File, io::Error>`——成功给文件句柄，失败给错误信息：

```rust
use std::fs::File;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {error:?}"),
    };
}
```

`Result` 与其变体在预导入里，`match` 分支不用写 `Result::` 前缀。

### 按错误种类分别处理

`io::Error` 有个 `kind()` 方法返回 `io::ErrorKind` 枚举。比如「文件不存在就创建、其他错误照旧 panic」：

```rust
use std::fs::File;
use std::io::ErrorKind;

let greeting_file = match greeting_file_result {
    Ok(file) => file,
    Err(error) => match error.kind() {
        ErrorKind::NotFound => match File::create("hello.txt") {
            Ok(fc) => fc,
            Err(e) => panic!("Problem creating the file: {e:?}"),
        },
        _ => panic!("Problem opening the file: {error:?}"),
    },
};
```

`match` 嵌套三层——能用，但很啰嗦。`Result` 上还有一批基于闭包的方法（`unwrap_or_else`、`unwrap_or` 等）可以写得更短（闭包见[闭包与迭代器](/docs/rust/closures-iterators/)），而传播错误有专门的语法糖。

## ? 运算符：传播错误

写一个「读文件拿用户名」的函数，失败原因全部抛给调用者。手写 `match` 版本：

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = match File::open("hello.txt") {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match username_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}
```

错误传播这个模式太常见，Rust 给了它专属语法 `?`：

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();

    File::open("hello.txt")?.read_to_string(&mut username)?;

    Ok(username)
}
```

`?` 作用于 `Result`：值是 `Ok`，取出内值继续往下执行；值是 `Err`，**从当前函数提前 `return` 错误**。于是两段 `match` 变成两个 `?`。

用标准库现成的 `fs::read_to_string` 还能再短：

```rust
use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

一个重要细节：`?` 不只是转发错误，它还会调用 `From` trait 做**错误类型转换**——把收到的错误转成函数签名声明的错误类型。所以同一个函数里不同来源（文件、网络、解析）的错误，只要都实现了到目标错误类型的 `From` 转换，就能统一用一个 `?` 往上抛。

限制：`?` 只能用在返回 `Result`（或 `Option`，以及实现了对应 trait 的类型）的函数里。`main` 返回 `Result<(), E>` 也是合法的，便于在命令行程序里直接用 `?`。

## 什么时候该 panic

两条分界线：

- **库代码、示例之外的生产逻辑：返回 `Result` 是默认选择**——把决定权交给调用者；
- **示例、原型代码、测试：直接 `unwrap` / `expect` 是合理甚至正确的**——示例要清晰，原型要快，测试里方法失败就该让整个测试失败。

自己的代码里适合 `expect` 的一类场景：**你掌握编译器不知道的信息**——有其他逻辑保证了 `Result` 必然是 `Ok`（比如解析一段硬编码的合法 IP），此时 `expect` 把「逻辑上不可能失败」的理由写进错误消息，比 `unwrap` 的沉默好得多。

给 panic 定一条准绳：当**坏状态**（假设、契约或不变量被打破）满足以下任一条件时，panic 是对的——

1. 这个坏状态是**意料之外**的，而非「用户偶尔会输错格式」这种预期内失败；
2. 之后的代码需要**依赖**它不处于坏状态，而不是每一步都重新检查；
3. 没有好的方式把这一信息编码进类型。

反之，解析器收到畸形输入、HTTP 请求被限流这类**预期内的失败**，一律返回 `Result`——调用者比库更清楚失败时该怎么办。宁可多传一层错误，也不要替调用者做「崩溃」的决定。
