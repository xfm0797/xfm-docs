---
mode: docs

title: 常用集合：Vec、String 与 HashMap
date: 2026-10-24 15:00:00
updated: 2026-10-24 15:00:00
description: Rust 官方教程第八章中文整理：Vec 的创建与访问、借用规则如何拦截增长中的引用；String 与 &str 的关系、UTF-8 与索引难题；HashMap 的所有权、entry API 与词频统计。
keywords: [Rust, Vec, String, HashMap, 集合, UTF-8, entry, 中文文档]
order: 17
---

# 常用集合：Vec、String 与 HashMap

整理自官方 Book 第八章（Common Collections）。标量与数组之外，标准库提供的三种最常用集合都把数据放在**堆**上——数量编译期未知、可以伸缩。也正因为在堆上，它们与所有权系统的交互格外频繁。

## Vec&lt;T&gt;：可增长列表

`Vec<T>` 把同类型的值连续存放。创建、追加与访问：

```rust
let v: Vec<i32> = Vec::new();      // 空表需要类型标注
let v = vec![1, 2, 3];             // vec! 宏 + 初始值，类型自动推断

let mut v = Vec::new();
v.push(5);                          // 追加元素，v 必须是 mut

let third: &i32 = &v[2];            // 索引：越界直接 panic
let third: Option<&i32> = v.get(2); // get：越界返回 None，用 match 处理
```

两种访问方式的取舍：**确定不能越界用 `[]`**（越界就崩溃是正确行为）；**越界可能正常发生**（比如用户输入的序号）用 `get`，拿到 `Option` 走[枚举与模式匹配](/docs/rust/enums/)那套处理。

### 借用规则的真实案例

持有元素的不可变引用的同时追加元素，编译不过：

```rust
let mut v = vec![1, 2, 3, 4, 5];
let first = &v[0];
v.push(6);
println!("The first element is: {first}");
// error[E0502]: cannot borrow `v` as mutable
// because it is also borrowed as immutable
```

这看起来过分——往尾部加元素，为什么引用第一个元素会出事？原因在 `Vec` 的存储方式：元素在内存中连续排列，剩余空间不足时**追加会触发重新分配**，旧元素整体搬到新内存，`first` 就成了悬垂引用。借用规则从一开始就杜绝了这种局面。

### 遍历

```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50; // 解引用后修改
}
```

不可变遍历与可变遍历都安全：循环体里尝试插入或删除元素会直接编译报错，借用规则确保遍历期间结构不变。

## String：UTF-8 字节集合

核心语言里只有一种字符串类型：字符串切片 `str`（通常以借用形式 `&str` 出现）。`String` 是标准库提供的**可增长、可变、有所有权、UTF-8 编码**的字符串类型——本质上就是一个 `Vec<u8>` 加上若干保证：

```rust
let mut s = String::new();
let s = "initial contents".to_string(); // 或 String::from("…")

s.push_str("bar");          // 追加字符串切片，不夺取所有权
s.push('!');                // 追加单个字符

let s3 = s1 + &s2;          // + 拼接：s1 被移动，结果归 s3
let s = format!("{s1}-{s2}"); // format! 更顺手：不夺取任何参数的所有权
```

### 索引难题

`String` 不支持 `s1[0]` 这种单字符索引，直接编译报错 `the type str cannot be indexed by {integer}`。原因在于 **UTF-8 编码**：字符串是字节序列，一个「字符」可能占 1–4 个字节，单数字索引的返回类型说不清是字节、字符还是字素簇。

需要按索引切片时必须显式给**字节范围**，且范围必须落在字符边界上，切进多字节字符中间会 panic：

```rust
let hello = "Здравствуйте";
let s = &hello[0..4]; // "Зд"：每个西里尔字母 2 字节
```

按「字符」遍历用 `chars()`（Unicode 标量值），按原始字节用 `bytes()`：

```rust
for c in "Зд".chars()   { /* 'З' 'д' */ }
for b in "Зд".bytes()   { /* 208 151 208 180 */ }
```

从其他语言过来，「字符串能随便按位取字符」的直觉在 Rust 里要放下——它换来的是所有 `String` 都保证是合法 UTF-8。

## HashMap&lt;K, V&gt;：键值映射

三种常用集合中它最少用，所以**不在预导入（prelude）里**，需要显式 `use std::collections::HashMap;`。键、值各自同类型：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let score = scores.get(&team_name).copied().unwrap_or(0);
// get 返回 Option<&V>；copied 转 Option<V>，unwrap_or 给默认值
```

**所有权规则**：`Copy` 类型的值按位复制进表；`String` 这类拥有型值会**移入** `HashMap`，之后原变量失效。想保留原值就传引用，但被引用的值活得至少和表一样长。

### 更新值的三种套路

```rust
// 1. 覆盖：同键重复 insert，新值替换旧值
scores.insert(String::from("Blue"), 25); // {"Blue": 25}

// 2. 键不存在才插入：entry API
scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50); // 已存在，不动

// 3. 基于旧值更新：经典词频统计
let text = "hello world wonderful world";
let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}
// {"world": 2, "hello": 1, "wonderful": 1}
```

`entry().or_insert()` 返回该键对应值的**可变引用**——存在就直接用，不存在先插入再给引用。比手写「查一下有没有、没有再插入」干净得多，和借用检查器的相处也更融洽（`or_insert` 的引用只活在这一行，不会阻塞后续操作）。
