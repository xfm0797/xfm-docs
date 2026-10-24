---
mode: docs

title: 闭包与迭代器
date: 2026-10-24 15:30:00
updated: 2026-10-24 15:30:00
description: Rust 官方教程第十三章中文整理：闭包语法与类型推断、捕获环境的三种方式、Fn/FnMut/FnOnce、move 关键词；Iterator trait、惰性求值、常用适配方法与零成本抽象。
keywords: [Rust, 闭包, 迭代器, Fn, move, map, filter, collect, 零成本抽象, 中文文档]
order: 20
---

# 闭包与迭代器

整理自官方 Book 第十三章（Functional Language Features: Iterators and Closures）。闭包和迭代器是 Rust 里最接近函数式风格的部分，也是「零成本抽象」的最佳例证——写起来是高阶函数链，编译出来是手写循环。

## 闭包：能捕获环境的匿名函数

闭包是可以存进变量、作为参数传递的匿名函数，与函数的本质区别只有一条：**可以从定义它的作用域里捕获值**。

```rust
#[derive(Debug, PartialEq, Copy, Clone)]
enum ShirtColor { Red, Blue }

struct Inventory { shirts: Vec<ShirtColor> }

impl Inventory {
    fn giveaway(&self, user_preference: Option<ShirtColor>) -> ShirtColor {
        user_preference.unwrap_or_else(|| self.most_stocked())
    }

    fn most_stocked(&self) -> ShirtColor { /* 数库存返回多的那种 */ }
}
```

`unwrap_or_else` 的参数就是一个闭包：`|| self.most_stocked()`——竖线之间没有参数（这个闭包不接受参数），函数体返回当前库存最多的颜色。没有偏好的用户拿到库存最多的那种。

### 语法与类型推断

闭包与函数的语法对照，后三种完全等价：

```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1;
```

闭包通常**不用标类型**：函数必须标注，因为类型是其对外接口的一部分；闭包只活在狭小的上下文里，编译器推断即可（推断依据往往来自首次调用）。这也意味着**闭包的类型会被首次调用锁死**：

```rust
let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5); // error[E0308]: expected `String`, found integer
```

### 捕获环境的三种方式

闭包捕获值的方式与函数拿参数的三种方式一一对应，由**闭包体怎么使用**捕获值决定：

```rust
// 不可变借用：只读
let only_borrows = || println!("From closure: {list:?}");

// 可变借用：修改
let mut borrows_mutably = || list.push(7);

// 拿走所有权：强制移动用 move 关键词
thread::spawn(move || println!("From thread: {list:?}"));
```

`move` 强制闭包夺取环境值的所有权，最典型的场景是**把闭包交给新线程**——新线程可能活得比原作用域久，引用会悬垂，必须移动。

### Fn、FnMut、FnOnce

闭包按「如何处理捕获的值」自动实现一至三个 trait（可叠加），函数与结构体就是用这些 trait 声明「我能接受哪种闭包」：

| Trait | 适用闭包 | 可调用次数 |
| --- | --- | --- |
| `FnOnce` | 把捕获值**移出**函数体 | 只能一次 |
| `FnMut` | 不移出、但可能**修改**捕获值 | 多次 |
| `Fn` | 不移出不修改（或什么都不捕获） | 多次、可并发 |

三者是累加关系：所有闭包至少实现 `FnOnce`。标准库的签名用的正是它们——`unwrap_or_else(self, f: F) where F: FnOnce() -> T` 只调用一次闭包，所以只要求 `FnOnce`；要求越低，能接受的闭包越多。

## 迭代器：惰性的序列抽象

所有迭代器实现标准库的 `Iterator` trait：

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // 带默认实现的方法省略
}
```

实现者只需定义 `next`：每次调用返回 `Some(item)`，迭代耗尽返回 `None`。`for` 循环的底层就是反复调用 `next`。

三种形态的迭代器来自 Vec 的三个方法，与所有权对应：`iter()` 产不可变引用、`iter_mut()` 产可变引用、`into_iter()` 拿走值的所有权。

### 惰性求值

`Iterator` 的方法分两类：

- **消费适配器**（consuming adaptors）：调用 `next` 把迭代器耗尽，如 `sum()`、`collect()`；
- **迭代器适配器**（iterator adaptors）：**不消费**，只返回改造过的**新迭代器**，如 `map()`、`filter()`。

关键性质：**迭代器是惰性的**——不调用消费方法就什么都不会发生：

```rust
let v1: Vec<i32> = vec![1, 2, 3];

v1.iter().map(|x| x + 1);
// warning: unused `Map` that must be used
// note: iterators are lazy and do nothing unless consumed

let v2: Vec<_> = v1.iter().map(|x| x + 1).collect(); // [2, 3, 4]
```

适配器可以链式组合，读起来像数据流水线：

```rust
shoes.into_iter().filter(|s| s.size == shoe_size).collect()
```

`filter` 的闭包捕获了外部变量 `shoe_size`——迭代器方法大量接收闭包，两种特性在这里合流：**迭代行为由 `Iterator` 复用，元素级行为由闭包定制**。

### 零成本抽象

迭代器是不是比手写循环慢？不需要。官方用重构同一个搜索程序实测过：迭代器版本与手写索引循环编译产物性能相当，`sum()` 这类操作还能被编译器进一步优化。原理是**零成本抽象**（zero-cost abstraction）——抽象不引入额外运行时开销，编译器早已把迭代边界、去边界检查等优化做在编译期。

```rust
let buffer: &mut [i32] = …;
let coefficients: [i32; 12] = …;
let qlp_shift: i16 = …;

let mut prediction_buffer: Vec<i32> = …;

for i in 12..buffer.len() {
    let prediction = coefficients.iter()
        .zip(&prediction_buffer[i - 12..i])
        .map(|(coef, s)| *coef * s)
        .sum::<i32>() >> qlp_shift;
    prediction_buffer.push(prediction);
}
```

这段解码器风格的代码里，`zip`、`map`、`sum` 串成一条链，编译器知道迭代的次数是固定的（系数 12 个），能把结果存进寄存器、去掉所有边界检查——性能与手写的 SIMD 友好循环一致。

## 小结

- 闭包 = 匿名函数 + 环境捕获；捕获方式自动决定 `Fn` 家族归属，`move` 强制夺取所有权；
- 迭代器 = `next` 驱动的惰性序列；适配器返回新迭代器，消费适配器才真正执行；
- 两者结合让 Rust 能写出函数式风格的流水线，同时保持与手写循环同级的性能——抽象的代价在编译期付清。
