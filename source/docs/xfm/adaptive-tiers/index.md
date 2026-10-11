---
mode: docs

title: 三档配置
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 逐项说明 mobile / tablet / desktop 三档的边界、栏数、导航、侧栏、目录、密度与组件开关。
keywords: [档位配置, 断点, 栏数, 组件开关, disable]
order: 31
---

# 三档配置

## 完整配置块

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
      container_width:       # 留空用该档默认值
      content_width:
      fluid: false           # 该档是否启用流式字号（true = 档内平滑缩放）
      density: compact       # comfortable / compact
      disable: []            # 该档关闭的组件，见下表
    tablet:
      max_width: 1079
      layout: two-column
      nav: drawer
      sidebar: inline
      toc: hide
      density: comfortable
      disable: []
    desktop:
      min_width: 1080        # 自动 ≥ tablet.max_width + 1
      layout: three-column
      nav: bar
      sidebar: sticky
      toc: sticky
      density: comfortable
      disable: []

  # 与档位无关的通用适配
  touch_target: 44
  safe_area: true
  compact_height: true
  user_zoom: true
  fluid_min_width: 360
  fluid_max_width: 1440
```

## 默认三档分别交付什么

| 档位 | 判定 | 栏数 | 导航 | 笔记/文档侧栏 | 目录 | 密度 |
| --- | --- | --- | --- | --- | --- | --- |
| mobile | 宽度 ≤ 767 或 UA 命中手机 | 单栏 | 汉堡抽屉 | 抽屉（悬浮按钮唤起） | 正文顶部折叠面板 | compact |
| tablet | 768 ~ 1079（或平板 UA） | 双栏 | 汉堡抽屉 | 内联折叠卡片 | 隐藏 | comfortable |
| desktop | ≥ 1080 | 三栏 | 横排菜单 | 吸附左栏 | 吸附右栏 | comfortable |

## 逐项说明

### 边界 `max_width` / `min_width`

每档只需配置一个边界，另一侧自动推导：

```text
mobile.max_width  : 默认 767   → mobile 覆盖 (0, 767]
tablet.max_width  : 默认 1079  → tablet 覆盖 [768, 1079]
desktop.min_width : 默认 1080  → desktop 覆盖 [1080, ∞)  自动 ≥ tablet.max_width + 1
```

主题会做**边界纠正**：如果填反了（如 `mobile.max_width: 1200` 而 `tablet.max_width: 800`），会自动修正为递增顺序而不是让规则互相覆盖。取值会被夹在合理区间内（mobile 320–1400，tablet 需 > mobile，desktop 需 > tablet）。

### 栏数 `layout`

| 值 | 效果 |
| --- | --- |
| `single` | 单栏，只有正文 |
| `two-column` | 双栏，正文 + 一侧（挂件栏或内联侧栏） |
| `three-column` | 三栏，左栏 + 正文 + 右栏 |

### 导航 `nav`

| 值 | 效果 |
| --- | --- |
| `bar` | 顶部横排菜单（桌面） |
| `drawer` | 汉堡按钮 + 左侧抽屉 |

### 侧栏 `sidebar`

| 值 | 效果 |
| --- | --- |
| `sticky` | 常驻并吸附，随滚动固定 |
| `inline` | 内联折叠卡片，插在正文流中 |
| `offcanvas` | 完全收进抽屉，由悬浮按钮唤起 |
| `hide` | 不显示 |

{% note tip offcanvas 与 hide 的区别 %}
`offcanvas` 收进抽屉但**仍可唤起**（手机上那枚"文档目录"悬浮按钮）；`hide` 是彻底不渲染入口。如果你希望移动端完全看不到侧栏入口，用 `hide`。
{% endnote %}

### 目录 `toc`

| 值 | 效果 |
| --- | --- |
| `sticky` | 独立右栏常驻吸附 |
| `panel` | 折叠面板，放在正文顶部，点击标题头展开 |
| `hide` | 不显示 |

### 流式字号 `fluid`

| 值 | 效果 |
| --- | --- |
| `false` | 该档内字号固定（离散） |
| `true` | 该档内字号在 `fluid_min_width` ~ `fluid_max_width` 间做 `clamp` 平滑缩放 |

典型用法：只在 `mobile` 打开 `fluid: true`，让手机在 360–767px 之间平滑过渡字号；桌面档保持固定，避免大屏字号失控。

### 密度 `density`

| 值 | 效果 |
| --- | --- |
| `comfortable` | 宽松留白，适合大屏 |
| `compact` | 压缩纵向留白，适合小屏（默认用于 mobile） |

### 容器与正文宽度

```yaml
tiers:
  desktop:
    container_width: 1320    # 整页最大宽度
    content_width: 760       # 正文最大宽度
```

留空则使用该档的默认值。**注意**：这两个值只在该档生效，是"逐档精调"的入口。

## 组件开关（disable）

每档可独立关掉不合适的组件。

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

写在任意档的 `disable` 数组里，只影响该档：

```yaml
adaptive:
  tiers:
    mobile:
      disable: [hero, cover, related, footer_stats]
```

{% note warning 键名必须精确匹配 %}
只有上表列出的键有效。写错名字不会报错，只是**静默不生效**——配置里的 `disable` 数组会被过滤器清洗，不认识的键直接丢弃。
{% endnote %}

## 常见配方

{% tabs %}
<!-- tab 极简：手机只留正文 -->
```yaml
adaptive:
  tiers:
    mobile:
      max_width: 767
      layout: single
      nav: drawer
      sidebar: offcanvas
      toc: panel
      fluid: true
      density: compact
      disable: [hero, cover, related, footer_stats, share]
```
手机端只看正文，一切"锦上添花"的区块都隐藏。适合内容型站点。
<!-- endtab -->
<!-- tab 文档站：平板也保留目录 -->
```yaml
adaptive:
  tiers:
    tablet:
      max_width: 1079
      layout: two-column
      nav: drawer
      sidebar: inline
      toc: sticky        # 默认是 hide，这里改为保留
      density: comfortable
```
文档站常需要平板上的双栏 + 目录，把 tablet 的 `toc` 从 `hide` 改成 `sticky` 即可。
<!-- endtab -->
<!-- tab 大屏增强 -->
```yaml
adaptive:
  tiers:
    desktop:
      min_width: 1280
      layout: three-column
      nav: bar
      sidebar: sticky
      toc: sticky
      container_width: 1440
      content_width: 800
```
把桌面档的门槛提高到 1280，避免小笔记本被判定为桌面档；同时放宽容器宽度。
<!-- endtab -->
{% endtabs %}

## 调完之后

```bash
hexo clean && hexo g && hexo s
```

因为在**构建期生成档位样式**，改 `adaptive` 后必须 `hexo clean`，否则旧的生成结果会残留。

### 强制预览某一档

三种方式，从临时到持久：

{% row %}
{% col 4 %}
**URL 参数**

在任意页面 URL 后加 `?__tier=mobile`，立即以该档渲染。分享"桌面版"链接时很有用。
{% endcol %}
{% col 4 %}
**控制台 API**

```js
XFM.adaptive.setTier('tablet')
```
remember 开启时会持久化。
{% endcol %}
{% col 4 %}
**fixed 策略**

```yaml
adaptive:
  strategy: fixed
  default_tier: mobile
```
整站锁定为单档，用于排查档位相关问题。
{% endcol %}
{% endrow %}
