---
mode: docs

title: 泛型、Trait 与生命周期
date: 2026-10-24 15:20:00
updated: 2026-10-24 15:20:00
description: Rust 官方教程第十章中文整理：泛型函数与泛型结构体、trait 定义共享行为、默认实现、trait bound 与 impl Trait、生命周期标注如何描述引用之间的关系。
keywords: [Rust, 泛型, trait, 生命周期, trait bound, impl Trait, 中文文档]
order: 19
---

# 泛型、Trait 与生命周期

整理自官方 Book 第十章（Generic Types, Traits, and Lifetimes）。这是 Rust 抽象能力的三个支点，彼此咬合：**泛型**让代码对多种类型复用，**trait** 定义类型的共享行为并约束泛型，**生命周期**给编译器描述引用之间的关系。三者都发生在**编译期**——运行时零开销。

## 泛型

每个语言都要处理「概念的重复」。消除它的第一步是把重复代码提取成函数——参数代替具体值。泛型把同一思路推进到类型层面：**用占位符代替具体类型**。

你已经用过不少泛型：`Option<T>`、`Vec<T>`、`HashMap<K, V>`、`Result<T, E>` 都是。

```rust
// 泛型函数
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

// 泛型结构体
struct Point<T> {
    x: T,
    y: T,
}

// 泛型枚举（标准库的定义）
enum Option<T> {
    Some(T),
    None,
}
```

几个细节：

- `Point<T>` 里 `x`、`y` 必须是**同一类型** `T`；想让它们可以不同，用两个参数：`struct Point<T, U> { x: T, y: U }`；
- `T: PartialOrd` 是 **trait bound**（约束），意思是要能比较——没有它，`item > largest` 对任意 `T` 无从谈起；
- `impl` 块里可以只在「内类型满足某些 trait」时才实现方法：

```rust
impl<T: PartialOrd + Display> Pair<T> {
    fn cmp_display(&self) { /* … */ }
}
```

### 单态化：为什么泛型零开销

Rust 编译器做**单态化**（monomorphization）：编译时把泛型代码针对每个实际用到的具体类型**各生成一份**特化副本。`Option<i32>` 和 `Option<String>` 在机器码里是两个具体类型，没有任何运行时查表或分派——泛型写起来抽象，跑起来和你手写的两份代码一样快。

## Trait：定义共享行为

trait 类似其他语言里的接口：**把一组方法签名打包成一种类型可以共享的行为**。

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {}", self.headline, self.author)
    }
}
```

### 默认实现

trait 可以给方法提供默认行为，实现方只覆盖需要的部分：

```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}

impl Summary for SocialPost {} // 直接用默认实现
```

默认实现里还可以调用同一 trait 的其他方法（那些方法不必有默认实现）。

### trait 作为参数

```rust
// impl Trait 语法（简洁）
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// trait bound 语法（完整形式，二者等价）
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
```

`impl Trait` 是语法糖，简单场景更易读；需要表达复杂约束时用 bound 形式：

```rust
// 两个参数都实现 Summary，且要同一具体类型时用 T
pub fn notify(item1: &impl Summary, item2: &impl Summary);

// 多重约束用 +，where 子句让长签名更可读
fn some_fn<T: Summary + Display>(item: &T);

fn some_other_fn<T, U>(t: &T, u: &U) -> i32
where
    T: Summary + Clone,
    U: Debug,
{ /* … */ }
```

`impl Trait` 也能放在返回位置：`fn returns_summarizable() -> impl Summary`。限制是**只能返回一种具体类型**——不能让 `if` 返回 `NewsArticle`、`else` 返回 `SocialPost`（那需要 trait 对象，不在本手册范围）。

## 生命周期

生命周期是另一类泛型：**给编译器描述多个引用之间的关系**，让借用检查器能确认引用始终有效。它**不改变**任何引用的实际存续时间——只描述、不改变。

### 为什么需要它

看一个「返回两个字符串切片中较长者」的函数：

```rust
fn longest(x: &str, y: &str) -> ? {
    if x.len() > y.len() { x } else { y }
}
```

返回的引用有时指向 `x`、有时指向 `y`，编译器（不知道运行时会走哪个分支）无法确认返回值的存续时间，直接报错：

```console
error[E0106]: missing lifetime specifier
  |
  = help: this function's return type contains a borrowed value,
    but the signature does not say whether it is borrowed from `x` or `y`
help: consider introducing a named lifetime parameter
  |
9 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
  |           ++++     ++          ++          ++
```

### 标注语法

生命周期参数以 `'` 开头，惯用名 `'a`。上面的函数标注后：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

这个签名的含义：**对于某个生命周期 `'a`，两个参数都是活得至少和 `'a` 一样长的切片，返回的切片也活得至少一样长**。实际效果是：返回引用的有效期 = 两个参数中**较短**的那个。标注写进的是签名而不是函数体——它和类型一样是函数契约的一部分，检查不过时编译器能精确指向违规位置。

验证一下「取较短者」的语义：

```rust
let string1 = String::from("long string is long");
let result;
{
    let string2 = String::from("xyz");
    result = longest(string1.as_str(), string2.as_str());
}                       // string2 在此释放
println!("The longest string is {result}");
// error[E0597]: `string2` does not live long enough
```

### 三条省略规则

很多签名不用写生命周期标注——编译器按**省略规则**（elision rules）推断，推断不出才要求标注。概括地说：每个引用参数各得一个生命周期；只有一个输入生命周期时，它赋给所有输出；方法签名里有 `&self` 时，`self` 的生命周期赋给所有输出。

**实践建议**：生命周期标注是函数契约的显式声明，不是要回避的负担。结构体持有引用时也需要标注（`struct Excerpt<'a> { part: &'a str }`），含义与函数相同——**结构体实例不能活得比它借用的数据更久**。新手阶段遇到生命周期报错，先把编译器的 `help:` 建议逐字读懂再动手，比到处乱加 `'a` 有效得多。

## 小结

| 工具 | 解决的问题 | 成本 |
| --- | --- | --- |
| 泛型 | 一份逻辑适配多种类型 | 编译期单态化，零运行时开销 |
| Trait | 约束类型必须具备的行为 | 静态分发零开销 |
| 生命周期 | 引用之间存续关系的契约 | 纯编译期检查，零运行时开销 |

三者的报错信息都是 Rust 里信息量最大的部分——读懂它们，比背规则有用得多。
