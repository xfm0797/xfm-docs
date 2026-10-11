---
mode: docs

title: 工作原理
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 理解 XFM 的自适应策略：先定档再出样式，与响应式媒体查询的本质区别。
keywords: [自适应, adaptive, 响应式, 档位, data-tier]
order: 30
---

# 工作原理

## 先厘清一个概念

主题用的是**自适应（Adaptive）**，不是传统的**响应式（Responsive）**。这两者常被混用，但实现路径完全不同。

| | 响应式 Responsive | 自适应 Adaptive（本主题） |
| --- | --- | --- |
| 判定方式 | `@media (max-width…)` 由浏览器连续匹配 | 先识别设备档位，写入 `<html data-tier>` |
| 布局变化 | 同一套 DOM 随宽度连续缩放 | 每档一整套独立令牌 + 栏数 + 组件形态，档位之间**跳变** |
| 结构差异 | 靠 CSS 变形 | 导航 / 侧栏 / 目录按档位切换 `bar·drawer`、`sticky·inline·offcanvas·hide`、`sticky·panel·hide` |
| 配置入口 | 六档断点宽度的数值 | 三档的"边界 + 形态"，形态是**可读的枚举**而非像素 |
| 中间态 | 容易长期处于"半桌面半手机" | 不存在，任一时刻必属唯一档位 |

一句话：**响应式是在一套结构上做连续变形，自适应是多套结构之间做离散切换。**

## 两步流程

```text
① <head> 里的探测脚本先定档（渲染前完成，无闪烁）
                    ↓
② 档位样式接管布局（每档一整套令牌与形态）
```

只有两步。所有档位边界、每档形态、组件开关全部集中在 `adaptive` 一节，**改配置即可，不要改模板或 CSS**。

## 第 1 步：定档

`layout/_partials/adaptive-boot.ejs` 是 `<head>` 里的**首行同步脚本**，在页面渲染前执行，避免先渲染桌面布局再跳变造成的闪烁。

判定优先级（从高到低）：

```text
1. URL 参数 ?__tier=desktop        ← 最高，用于分享"桌面版"链接
2. localStorage 的 xfm-tier        ← 用户手动切换过则记住
3. UA 设备指纹                      ← iPhone / iPad / Android 平板…
4. 视口宽度                         ← 兜底
```

判定完成后，脚本向 `<html>` 写入若干属性：

| 属性 | 取值 | 含义 |
| --- | --- | --- |
| `data-tier` | `mobile` / `tablet` / `desktop` | 当前档位，**布局的唯一依据** |
| `data-input` | `touch` / `pointer` | 输入能力（`pointer: coarse` 判定） |
| `data-dpr` | 如 `2` / `2.75` | 像素密度 |
| `data-orientation` | `portrait` / `landscape` | 横竖屏 |

{% note info 为什么可以做到"无闪烁" %}
探测脚本是**内联同步脚本**，位于 `<head>` 最前，在浏览器开始渲染 `<body>` 之前就已执行完。因此第一帧画出来时 `data-tier` 已经就位，不会出现"先是桌面版、闪一下变成手机版"。
{% endnote %}

### 三种策略

```yaml
adaptive:
  strategy: adaptive    # adaptive / responsive / fixed
```

| 策略 | 判定依据 | 适用 |
| --- | --- | --- |
| `adaptive` | 综合 UA / 触摸 / 像素密度 / 宽度 | 默认，最贴近真实设备 |
| `responsive` | **只按视口宽度**实时映射档位 | 桌面浏览器缩窗口调试，或希望与旧行为一致 |
| `fixed` | 不探测，恒定使用 `default_tier` | 只想做单档站点，或排查档位相关问题时锁定 |

`strategy: responsive` 时，探测配置里的 `ua` / `touch` / `dpr` 会被自动忽略。

### 兜底与记忆

```yaml
adaptive:
  enable: true
  default_tier: desktop   # 探测失败或 strategy: fixed 时使用
  remember: true          # 记住手动切换的档位（localStorage）
```

`remember: true` 时，用户通过 JS API 手动切档（如"切换到桌面版"按钮）会被持久化，刷新后仍生效。

## 第 2 步：出样式与转结构

定档之后，两个环节接管：

| 环节 | 文件 | 职责 |
| --- | --- | --- |
| **出样式** | `layout/_partials/adaptive-style.ejs` | 按 `adaptive` 配置生成 `html[data-tier="…"]` 规则：每档的令牌、栏数、组件形态 |
| **转结构** | `layout/layout.ejs` | 构建期写入兜底档位与 `side-nav-*` 变体标记，保证抽屉所需的 DOM 节点始终存在 |

因为样式规则是**按配置在构建期生成**的（而不是写死在 CSS 里），所以你改 `adaptive` 一节后必须 `hexo clean` 让模板重新渲染。

## 每档拿到什么

每档都会拿到**一整套独立的设计令牌**：

- 容器宽度
- 栏宽
- 间距
- 导航高度
- 六级字号
- 信息密度

所以档位切换是**整档跳变**，不会出现"半桌面半手机"的中间态。某档把 `fluid: true` 打开后，该档内部才会做平滑缩放（`clamp`）。

## 运行时 API

`source/js/adaptive.js` 暴露了一组 API，供你在自定义脚本里消费：

```js
// 当前档位
XFM.adaptive.tier()                  // "desktop"

// 是否属于某档
XFM.adaptive.is('mobile')            // false

// 是否触摸设备
XFM.adaptive.isTouch()               // false

// 手动切档（remember 为 true 时持久化）
XFM.adaptive.setTier('mobile')

// 清除手动档位，回到自动探测
XFM.adaptive.clearTier()

// 取当前档的形态配置
XFM.adaptive.variant('toc')          // "sticky"

// 完整快照
XFM.adaptive.snapshot()
// { tier, input, dpr, orientation, width, variant }

// 监听跨档
XFM.adaptive.onTierChange(function (tier, prev) {
  console.log('档位变化：', prev, '->', tier);
});
```

跨档时主题还会在 `document` 上派发 `xfm:tierchange` 事件，`source/js/core.js` 监听它来复位抽屉等"窄屏专属"状态。

## 与档位无关的通用适配

除三档之外，还有一组**不区分档位**的适配项：

```yaml
adaptive:
  # 触摸设备的最小可点击区域边长（px），建议 ≥ 44
  touch_target: 44
  # 是否适配刘海屏 / 手势条安全区
  safe_area: true
  # 矮屏（如手机横屏，高度 ≤ 480px）是否压缩纵向留白
  compact_height: true
  # 两根手指缩放：关闭可避免移动端误触排版错乱，但影响无障碍
  user_zoom: true
  # 流式字号（fluid: true 的档位）的插值参考宽度
  fluid_min_width: 360
  fluid_max_width: 1440
```

| 配置项 | 说明 |
| --- | --- |
| `touch_target` | 触摸设备上按钮的最小边长，避免误触 |
| `safe_area` | 开启后使用 `viewport-fit=cover` + `env(safe-area-inset-*)`，避开刘海与手势条 |
| `compact_height` | 手机横屏时压缩纵向留白，保证一屏能看到更多内容 |
| `user_zoom` | 设为 `false` 会输出 `maximum-scale=1, user-scalable=no`，**可能违反无障碍规范**，仅在明确需要时关闭 |
| `fluid_min_width` / `fluid_max_width` | 流式字号的插值区间，字号在此区间内做 `clamp` 平滑缩放 |

## 降级与兼容

`source/css/adaptive.css` 承载了两类与档位无关的适配：

- **打印样式**：打印时隐藏导航、侧栏、目录、悬浮按钮，正文按纸张宽度排版
- **动效降级**：`prefers-reduced-motion: reduce` 时关闭全部动画与过渡

{% note tip 旧配置能直接跑 %}
`xfm_breakpoints()` 辅助函数仍然保留：它会由 `adaptive` **反算**出旧的六档断点（`xxl/xl/lg/md/sm/xs`）与 `mobile_sidebar` / `mobile_toc` 等字段。因此使用旧版响应式配置的老站点，不升级配置也能直接运行，不会因为主题升级而错乱。
{% endnote %}

## 下一步

具体的三档参数怎么调，见[三档配置](/docs/adaptive-tiers/)。
