---
title: CommonJS 与 ESM：一次 require 报错背后的模块之争
date: 2026-10-17 13:30:00
updated: 2026-10-17 13:30:00
categories: [前端]
tags: [JavaScript, Node.js, 工程化, 踩坑]
description: 从一次 ERR_REQUIRE_ESM 的线上构建失败出发，讲清 CJS 与 ESM 的本质差异、Node 如何判定模块类型、require(ESM) 为何长期不可用，以及 package.json 里那些字段到底管什么。
---

本地构建一切正常，推上去平台构建失败：

```text
Error [ERR_REQUIRE_ESM]: require() of ES Module …/strip-ansi/index.js not supported.
```

第一反应是"平台环境有问题"。查完才明白：**是我的本地 Node 版本比平台新，新版本的某个能力把这个问题掩盖了**。

这个坑值得完整记录一遍，因为 CJS 与 ESM 的混用是 Node 生态里最常见、也最容易被环境差异隐藏的问题。

<!-- more -->

## 一、两套模块系统到底差在哪

| | CommonJS（CJS） | ES Module（ESM） |
| --- | --- | --- |
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 加载时机 | **运行期**，可以写在 if 里 | **解析期**，必须在顶层 |
| 是否异步 | 同步加载 | 支持顶层 await、异步加载 |
| `this` | 指向 `module.exports` | `undefined` |
| 常用扩展名 | `.js` `.cjs` | `.mjs` `.js`（带 type 声明） |

{% note info 最本质的差异是"何时确定依赖" %}
CJS 的依赖在**代码执行到那一行**时才解析，所以可以动态拼接路径、可以条件加载。

ESM 的依赖在**解析阶段**就要确定（为了支持静态分析和 tree-shaking），所以 `import` 必须写在顶层，路径必须是字面量。
{% endnote %}

## 二、Node 怎么判断一个 `.js` 文件是哪种

规则很简单，但影响深远：

1. **扩展名优先**：`.mjs` 一定是 ESM，`.cjs` 一定是 CJS。
2. **否则看最近的 `package.json` 的 `"type"` 字段**：
   - `"type": "module"` → 该目录下的 `.js` 是 ESM
   - `"type": "commonjs"`（默认）→ 是 CJS

```json
{ "type": "module" }
```

{% note danger 这就是为什么升级依赖会突然炸 %}
一个包从 v6 升到 v7，如果它在自己的 `package.json` 里加了 `"type": "module"`，那么**它整体变成了 ESM**。

而使用方如果还在用 `require()` 引它，就会抛 `ERR_REQUIRE_ESM`。**调用方的代码一行没改，只是升级了依赖版本就挂了。**
{% endnote %}

## 三、`require(ESM)` 为什么长期不可用

直觉上"require 一个 ESM"应该没问题——都是模块嘛。实际不行，原因是**技术性的**：

{% fold 展开看技术原因 %}
`require()` 是**同步**的：调用后必须立刻拿到导出对象，代码才能继续往下走。

而 ESM 允许**顶层 await**，模块的执行本身可以是异步的——你没法同步地拿到它的导出结果。

这不是"还没实现"的问题，而是两种语义根本不兼容。所以 Node 长期以来的行为就是：遇到 `require(ESM)` 直接抛错。
{% endfold %}

好消息是 **Node 22.12+ / 20.19+ 支持了 `require(ESM)`**（前提是目标模块不含顶层 await），通过 `--experimental-require-module` 或默认启用。

{% note warning 版本门槛要记牢 %}
- **Node ≥ 22.12 或 ≥ 20.19**：支持 `require(ESM)`
- **更早版本**：不支持，抛 `ERR_REQUIRE_ESM`

很多构建平台预装的 Node 版本**低于这个门槛**，这就是"本地能跑、平台失败"的来源。
{% endnote %}

## 四、事故复盘

本站的构建链路：

```text
hexo → 依赖链深处的 strip-ansi → v7 是纯 ESM（"type": "module"）
```

- 本地 Node 22.22 → 支持 `require(ESM)` → **构建成功**
- EdgeOne Pages 构建机 Node 22.11 → **差一个补丁版本**，不支持 → `ERR_REQUIRE_ESM`

差的就是 `22.11` 与 `22.12` 这一位。

### 三种解法与取舍

{% row %}
{% col %}
**方案一：升 Node**

最理想，但**构建平台的 Node 版本不由你决定**。平台只预装固定的几个版本时此路不通。
{% endcol %}
{% col %}
**方案二：降级依赖**

在本站就是给 `package.json` 加 `overrides`，把 ESM-only 的包锁回 CJS 版本：

```json
"overrides": {
  "strip-ansi": "6.0.1",
  "ansi-regex": "5.0.1"
}
```
{% endcol %}
{% endrow %}

{% note tip 方案三：改自己的代码用 import %}
如果报错的是**你自己写的** `require()`，把项目切到 ESM（加 `"type": "module"` 并改用 `import`）即可。

但如果报错发生在**第三方包内部**（本站就是这样），你改不了它的源码，只能用方案二。
{% endnote %}

## 五、`package.json` 里那些字段到底管什么

这是最容易被搞混的一块，一次说清：

| 字段 | 谁读它 | 作用 |
| --- | --- | --- |
| `main` | Node（CJS） | `require('pkg')` 的入口 |
| `module` **不是标准** | 打包器（webpack/vite） | 提示 ESM 入口，**Node 完全不认** |
| `exports` | Node 12+ / 打包器 | 现代入口定义，可区分 import/require 条件 |
| `type` | Node | 决定 `.js` 按哪种模块解析 |

推荐的现代写法：

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

{% fold 为什么要同时提供两种 %}
`exports` 的 `import` / `require` 条件让**同一个包能同时服务两类使用方**：

- 用 `import` 引它的，拿到 `.mjs`；
- 用 `require` 引它的，拿到 `.cjs`。

这就是"双格式发布"。如果一个包只发了 ESM 而不提供 CJS 入口，那它在旧环境里就是不可用的——**这正是 strip-ansi v7 的情况**。
{% endfold %}

## 六、如何提前发现这类问题

不要等平台构建失败。本地模拟平台环境：

```bash
node --no-experimental-require-module node_modules/hexo/bin/hexo generate
```

`--no-experimental-require-module` 关掉那个"新能力"，让本机表现得像老版本 Node。**如果这条命令能过，平台基本就能过。**

{% note danger 更通用的检查 %}
升级依赖或新增依赖后，扫一遍依赖树里有没有 ESM-only 的包：

```bash
# 找出所有声明了 type: module 的依赖
node -e "
const fs=require('fs'),path=require('path');
function walk(dir,depth){
  if(depth>3) return;
  for(const d of fs.readdirSync(dir,{withFileTypes:true})){
    if(!d.isDirectory()||d.name.startsWith('.')) continue;
    const p=path.join(dir,d.name);
    try{
      const pkg=JSON.parse(fs.readFileSync(path.join(p,'package.json')));
      if(pkg.type==='module') console.log('ESM-only:',d.name,pkg.version);
    }catch(e){}
    const nested=path.join(p,'node_modules');
    if(fs.existsSync(nested)) walk(nested,depth+1);
  }
}
walk('node_modules',0);
"
```

列出来的包如果被项目用 `require` 引用，就是潜在雷区。
{% endnote %}

## 七、给库作者的三条建议

1. **发布双格式**（`exports` 里同时给 import 和 require），别只发 ESM；
2. **大版本升级时如果改成纯 ESM，要在 CHANGELOG 醒目位置说明**——这是破坏性变更；
3. **`.mjs` / `.cjs` 显式扩展名比 `type` 字段更安全**：它不依赖目录上下文，不会被上层配置意外改变。

{% note tip 相关阅读 %}
[前端性能：把 Core Web Vitals 拆成可执行的动作](/2026/10/17/fe-core-web-vitals/) · [事件委托：为什么列表的监听器应该只绑一个](/2026/10/17/fe-event-delegation/) · [组件 API 设计：让调用方不需要读你的源码](/2026/10/17/design-component-api/)
{% endnote %}
