---
title: 自适应式响应
mode: docs
layout: page
order: 4
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

XFM 用的是**自适应（Adaptive）**，而不是传统的「响应式（Responsive）」。

## 响应式 vs 自适应

| | 响应式 Responsive | 自适应 Adaptive（本主题） |
| --- | --- | --- |
| 判定方式 | `@media (max-width…)` 由浏览器连续匹配 | 先识别设备档位，写入 `<html data-tier>` |
| 布局变化 | 同一套 DOM 随宽度连续缩放 | 每档一整套独立令牌 + 栏数 + 组件形态，档位之间跳变 |
| 结构差异 | 靠 CSS 变形 | 导航 / 侧栏 / 目录按档位切换 `bar·drawer`、`sticky·inline·offcanvas·hide`、`sticky·panel·hide` |
| 配置入口 | 六档断点宽度的数值 | 三档的「边界 + 形态」，形态是可读的枚举而非像素 |

流程只有两步：**`<head>` 里的探测脚本先定档 → 档位样式接管布局**。档位边界、每档形态、组件开关全部集中在 `adaptive` 一节。

## 配置

```yaml
adaptive:
  enable: true               # 关闭则恒定使用 default_tier 的布局
  strategy: adaptive         # adaptive 设备识别 / responsive 纯宽度 / fixed 固定档
  default_tier: desktop      # 探测失败兜底档（fixed 策略也用它）
  remember: true             # 记住手动切换的档位（localStorage）

  detect:                    # 探测维度（responsive 策略自动只保留 width）
    width: true              # 视口宽度
    ua: true                 # UA 设备指纹（iPhone / iPad / Android 平板…）
    touch: true              # 触摸能力 → data-input="touch"
    dpr: true                # 像素密度 → data-dpr
    orientation: true        # 横竖屏 → data-orientation
    upgrade_large_screen: true   # 大屏平板升级为桌面档

  tiers:                     # 三档定义
    mobile:
      max_width: 767         # ≤ 该宽度或 UA 命中手机
      layout: single         # single / two-column / three-column
      nav: drawer            # bar 顶部菜单 / drawer 抽屉
      sidebar: offcanvas     # offcanvas 抽屉 / inline 内联折叠 / hide 隐藏 / sticky 吸附
      toc: panel             # panel 折叠面板 / sticky 常驻 / hide 隐藏
      fluid: false           # 该档是否启用流式字号
      density: compact       # comfortable / compact
      disable: []            # 该档关闭的组件
    tablet:
      max_width: 1079
      layout: two-column
      nav: drawer
      sidebar: inline
      toc: hide
      density: comfortable
    desktop:
      min_width: 1080        # 自动 ≥ tablet.max_width + 1
      layout: three-column
      nav: bar
      sidebar: sticky
      toc: sticky
      density: comfortable

  touch_target: 44           # 触摸设备最小可点击边长（px）
  safe_area: true            # 适配刘海屏 / 手势条安全区
  compact_height: true       # 矮屏（手机横屏）压缩纵向留白
  user_zoom: true            # 是否允许双指缩放
  fluid_min_width: 360       # 流式字号插值参考宽度
  fluid_max_width: 1440
```

## 默认三档分别交付什么

| 档位 | 判定 | 栏数 | 导航 | 笔记/文档侧栏 | 目录 | 密度 |
| --- | --- | --- | --- | --- | --- | --- |
| mobile | 宽度 ≤ 767 或 UA 命中手机 | 单栏 | 汉堡抽屉 | 抽屉（悬浮按钮唤起） | 正文顶部折叠面板 | compact |
| tablet | 768 ~ 1079（或平板 UA） | 双栏 | 汉堡抽屉 | 内联折叠卡片 | 隐藏 | comfortable |
| desktop | ≥ 1080 | 三栏 | 横排菜单 | 吸附左栏 | 吸附右栏 | comfortable |

每档都会拿到一整套独立的设计令牌（容器宽度、栏宽、间距、导航高度、六级字号），所以档位切换是**整档跳变**，不会出现「半桌面半手机」的中间态。某档把 `fluid: true` 打开后，该档内部才会做平滑缩放（`clamp`）。

## 组件开关（disable）

每档可独立关掉不合适的组件：

| 键 | 作用元素 |
| --- | --- |
| `hero` | 首页欢迎语大卡 |
| `cover` | 文章封面图 |
| `related` | 相关文章 |
| `sidebar` | blog 侧边挂件栏 |
| `toc` | 右侧目录栏 |
| `footer_stats` | 页脚统计 |
| `brand_text` | 导航栏站点标题 |
| `comments` | 评论区 |
| `share` | 分享按钮组 |

例如手机档只保留正文：`tiers.mobile.disable: [hero, cover, related]`。

## 实现方式

| 环节 | 文件 | 职责 |
| --- | --- | --- |
| 定档 | `_partials/adaptive-boot.ejs` | `<head>` 首行同步脚本：解析 URL `?__tier=` / localStorage → UA 指纹 → 宽度，写入 `data-tier`（渲染前完成，无闪烁） |
| 出样式 | `_partials/adaptive-style.ejs` | 按 `adaptive` 配置生成 `html[data-tier="…"]` 规则 |
| 转结构 | `layout.ejs` | 构建期写入兜底档位与 `side-nav-*` 变体标记 |
| 运行时 | `source/js/adaptive.js` | `XFM.adaptive.tier() / setTier() / clearTier() / onTierChange()`，跨档派发 `xfm:tierchange` |
| 与档位无关 | `source/css/adaptive.css` | 打印样式、`prefers-reduced-motion` 降级 |

前端脚本不再写死断点：所有阈值来自配置，由模板注入（`window.XFM.adaptive`）。
