---
mode: docs

title: 所有权：移动、借用与切片
date: 2026-10-24 14:20:00
updated: 2026-10-24 14:20:00
description: Rust 官方教程第四章中文整理：所有权三规则、栈与堆、移动语义、clone 与 Copy、引用与借用规则、悬垂引用、切片类型。
keywords: [Rust, 所有权, 移动语义, 借用, 引用, 切片, Copy, 中文文档]
order: 13
---

# 所有权：移动、借用与切片

整理自官方 Book 第四章（Understanding Ownership）。这是 Rust 最独特的一章——所有权是 Rust 在没有垃圾回收的前提下保证内存安全的全部机制。

## 三条规则

所有程序都要在运行时管理内存：有的语言靠垃圾回收器（GC）定时清理，有的语言要求程序员手动分配与释放。Rust 走第三条路——**所有权**：一组由编译器在编译期检查的规则，违反任何一条程序都编译不过，且这些检查不给运行时带来任何开销：

- Rust 中每个值都有一个**所有者**（owner）；
- 同一时刻**只能有一个**所有者；
- 所有者离开作用域时，值会被**丢弃**（drop）。

## 栈与堆

理解所有权为什么这样设计，先要分清两块内存：

- **栈**：后进先出，存的数据**大小固定**。入栈出栈只是移动栈顶指针，速度快；
- **堆**：存编译期大小未知或可能变化的数据。向内存分配器申请空间，找到足够大的空位后返回一个**指针**（地址）。

入栈比堆分配快（不用搜索空位），访问栈数据也比堆数据快（不用跟着指针跳转，现代处理器偏爱连续访问）。调用函数时，参数与局部变量入栈，函数结束时出栈。

所有权的核心目的就是管理**堆数据**：谁在用、怎么避免重复、什么时候清理。理解了这一点，它的规则就不再玄学。

## 从 String 看分配与释放

字符串字面量（`let s = "hello";`）在编译期内容已知，直接写进可执行文件，快但不可变。要处理运行期才确定的文本，就得用 `String`——它把内容放堆上：

```rust
let mut s = String::from("hello");
s.push_str(", world!"); // 可变、可增长
```

堆内存需要显式归还。有 GC 的语言由 GC 代劳；C 风格的语言要手动 `free`——忘记就泄漏、太早就产生无效变量、释放两次是更严重的安全漏洞。Rust 的答案是：**变量离开作用域时自动调用 `drop`**，作者在 `drop` 里写释放逻辑，编译器在右花括号处自动插入调用。（熟悉 C++ RAII 的话，这就是同一个模式。）

## 移动语义

```rust
let s1 = String::from("hello");
let s2 = s1;
```

一个 `String` 在栈上由三部分组成：指向堆内容的指针、长度、容量。赋值时**只复制这三样**，不复制堆数据——否则大字符串的赋值会很贵。

但问题来了：两个指针指向同一块堆内存，两者离开作用域时会**重复释放**同一块内存。Rust 的处理方式简单粗暴：`let s2 = s1;` 之后，**`s1` 立即失效**。这个操作就叫**移动**（move）：

```rust
let s1 = String::from("hello");
let s2 = s1;

println!("{s1}, world!");
// error[E0382]: borrow of moved value: `s1`
// help: consider cloning the value if the performance cost is acceptable
```

由此得出两个推论：

- Rust **永远不会自动做深拷贝**——所有自动复制都可以假定开销很小；
- 想真复制堆数据就显式调用 `s1.clone()`——看到 `clone` 就知道「这里有任意代码在跑、可能很贵」，它是一个视觉信号。

另外，给已有变量赋一个全新的值时，旧值会被立即 `drop`：`s = String::from("ahoy");` 执行完，原来的 `"hello"` 内存马上释放。

## Copy：栈上类型不移动

```rust
let x = 5;
let y = x;      // 复制，x 仍有效
println!("x = {x}, y = {y}"); // 没问题
```

整数这类编译期大小已知的类型整个存在栈上，复制实际值轻而易举，没有理由禁用 `x`。这类类型实现了 **`Copy` trait**：赋值时按位复制而不是移动。

实现 `Copy` 的类型：所有整数、`bool`、所有浮点、`char`，以及**成员全部 `Copy`** 的元组——`(i32, i32)` 是，`(i32, String)` 不是。规则很直觉：简单的标量组合可以 `Copy`；需要分配内存或持有资源的类型不行（`Copy` 与 `Drop` 互斥，编译器强制）。

## 函数与所有权

传参和赋值遵循同一套规则——传入的值**移动**或**复制**：

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s);  // s 移入函数，之后不可再使用

    let x = 5;
    makes_copy(x);       // i32 是 Copy，x 之后仍可用
}

fn takes_ownership(some_string: String) {
    println!("{some_string}");
} // some_string 离开作用域，drop 释放内存
```

返回值同样转移所有权。想让函数用完值之后自己还能用，要么用元组把值传回来：

```rust
fn calculate_length(s: String) -> (String, usize) {
    let length = s.len();
    (s, length)
}
```

——但这太啰嗦了。Rust 提供了更常规的手段：**引用**。

## 引用与借用

```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{s1}' is {len}."); // s1 仍可用
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

`&` 创建**引用**：指向某个值、但不拥有它。因为不拥有，引用离开作用域时它指向的值不会被丢弃。创建引用的动作叫**借用**（borrowing）——借的东西用完要还，你不拥有它。

和变量一样，引用默认不可变，不能修改借来的东西。要修改就用**可变引用**：

```rust
fn change(some_string: &mut String) {
    some_string.push_str(", world");
}

// 调用处：
change(&mut s); // s 本身必须是 mut
```

### 借用规则

可变引用有一条核心限制：**同一时间内，一个值要么有一个可变引用，要么有任意多个不可变引用，二者不可兼得**。这段代码编译不过：

```rust
let r1 = &mut s;
let r2 = &mut s; // error[E0499]: cannot borrow `s` as mutable more than once at a time
```

这条规则存在的意义是**在编译期阻止数据竞争**。数据竞争 = 两个及以上指针同时访问同一数据 + 至少一个在写 + 没有同步机制。数据竞争导致未定义行为，且在运行时极难排查；Rust 直接拒绝编译带数据竞争的代码。

混用同样不行——不可变引用的使用者不该看到值「在脚下突然改变」：

```rust
let r1 = &s;
let r2 = &s;
let r3 = &mut s; // error[E0502]: cannot borrow `s` as mutable
                 // because it is also borrowed as immutable
```

两个细节让这条规则在实践中没那么难受：

- 花括号创建新作用域可以拿到「不**同时**存在的多个可变引用」；
- 引用的作用域从引入处开始，到**最后一次使用**为止（NLL，非词法作用域生命周期）。下面的代码是合法的，因为 `r1`、`r2` 在 `println!` 之后已不再使用：

```rust
let r1 = &s;
let r2 = &s;
println!("{r1} and {r2}");
// r1、r2 到此为止

let r3 = &mut s; // OK：作用域不重叠
println!("{r3}");
```

### 悬垂引用

指针语言里，释放了内存却留着指针，就制造出**悬垂指针**。Rust 编译器保证引用永不悬垂——有引用在，被指向的数据就不会先出作用域：

```rust
fn dangle() -> &String {
    let s = String::from("hello");
    &s
} // s 在此释放，返回的引用指向无效内存 —— 编译器直接拒绝
```

解决办法就是直接返回 `String` 本身，所有权移出去，什么都不悬垂。

## 切片

引用的另一种形态。**切片**让你引用集合中一段连续的元素，不带所有权：

```rust
let s = String::from("hello world");

let hello = &s[0..5]; // 或 &s[..5]
let world = &s[6..11]; // 或 &s[6..]
```

`[起始索引..结束索引]`，区间左闭右开。内部就是「起始位置 + 长度」。

为什么需要它？看一个反面教材：找字符串第一个单词，返回**结束索引**。这个索引是个孤立的 `usize`，与字符串的状态毫无绑定——拿到索引之后 `s.clear()` 清空字符串，索引 `5` 依然有效，但用它就是 bug，而且编译器毫无察觉。

把返回值改成切片，这类 bug 就**在编译期消失**：

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

```rust
let word = first_word(&s);
s.clear(); // error[E0502]: cannot borrow `s` as mutable
           // because it is also borrowed as immutable
```

`clear` 需要可变引用来清空，而 `word` 的不可变引用还活着——借用规则直接拦下。同一个 API，可错空间小了一个数量级。

两个随之而来的知识点：

- **字符串字面量的类型就是 `&str`**——指向二进制中某段文本的切片，这也是字面量不可变的原因；
- **参数写 `&str` 而不是 `&String`**（上面的签名已经这么做了）：`&String` 可以自动转成 `&str`（解引用强制转换），同一个函数就能同时接受 `String` 和字符串字面量。这是 Rust 惯用法。
