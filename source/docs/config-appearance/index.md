---
mode: docs

title: 外观与品牌
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 配置站点 Logo、头像、favicon、配色方案、主色、圆角、磨砂玻璃与字体。
keywords: [外观, 品牌, 配色, 主色, 圆角, 深色模式]
order: 11
---

# 外观与品牌

## 品牌与资源

这组配置决定站点"是谁"，分布在 `_config.yml` 顶部。

```yaml
# 站点 Logo（留空则显示站点标题）
logo:
# 站点标题旁的副标题 / 标语
tagline: ""
# 博主头像（侧边栏 & 移动端抽屉使用）
avatar: /images/avatar.svg
# 站点 favicon
favicon: /images/favicon.svg
# 无封面文章使用的默认头图，留空则使用渐变色
default_cover:
# 默认占位图（懒加载 & 灯箱兜底）
placeholder: /images/default-cover.svg
```

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `logo` | string | 空 | 导航栏左侧图标。留空时渲染站点标题首字母的方块标记 |
| `tagline` | string | 空 | 显示在站点标题旁的灰色小字，也用于移动端抽屉副标题 |
| `avatar` | string | `/images/avatar.svg` | 首页 Hero、侧边栏 profile 挂件、版权卡、移动端抽屉共用 |
| `favicon` | string | `/images/favicon.svg` | 浏览器标签图标 |
| `default_cover` | string | 空 | 文章无 `cover` / `banner` 时的封面。留空则用纯色渐变 |
| `placeholder` | string | `/images/default-cover.svg` | 图片加载失败或懒加载占位 |

{% note tip 零外链的资源 %}
主题自带 `avatar.svg` / `favicon.svg` / `default-cover.svg`，全部为内联 SVG，不请求任何外部域名。替换时把文件放进站点 `source/images/`，然后改这里的路径即可。
{% endnote %}

## 外观

```yaml
appearance:
  # 色彩方案: light / dark / auto（跟随系统）
  scheme: auto
  # 主题主色（十六进制），作用于链接、按钮、进度条、选中态
  primary: "#4f6bed"
  # 圆角档位: sharp / normal / round
  radius: normal
  # 是否启用磨砂玻璃导航栏
  glass_navbar: true
  # 是否启用元素入场动画
  animation: true
  # 自定义背景图（浅色 / 深色），留空则使用纯色渐变
  background_light:
  background_dark:
  # 自定义字体 CDN 链接（留空使用系统字体栈）
  font_family: ""
  # 是否在导航栏显示站点标题
  site_title: true
```

### 色彩方案 `scheme`

| 值 | 行为 |
| --- | --- |
| `light` | 默认浅色，用户点切换按钮可在 浅色 → 深色 → 跟随系统 间循环 |
| `dark` | 默认深色，同样可循环切换 |
| `auto` | 跟随操作系统偏好，系统切换时页面实时跟随（无需刷新） |

三态切换按钮由 `reading.scheme_toggle` 控制是否显示在导航栏：

```yaml
reading:
  scheme_toggle: true
```

用户的切换结果写入 `localStorage` 的 `xfm-scheme`，优先级高于配置的默认值。多设备登录的访客会各自保留自己的偏好。

### 主色 `primary`

主色以 CSS 变量 `--xfm-primary` 注入到 `<head>`，因此**一处修改，全站生效**：

- 链接与 hover 态
- 按钮、徽标的填充色
- 阅读进度条
- 目录当前项高亮
- 表单与搜索框的聚焦环
- `theme-color` meta（移动端浏览器地址栏配色）

```yaml
appearance:
  primary: "#0ea5e9"   # 换成天蓝
```

{% note warning 颜色值必须加引号 %}
`#` 在 YAML 里是注释起始符。写成 `primary: #4f6bed` 会被解析成 `null`。**必须加引号**：`primary: "#4f6bed"`。
{% endnote %}

### 圆角 `radius`

| 值 | 基准半径 | 观感 |
| --- | --- | --- |
| `sharp` | 6px | 方正、克制，适合工具类文档 |
| `normal` | 14px | 默认，现代平衡 |
| `round` | 22px | 圆润、松弛，适合博客与品牌站 |

主题会以基准半径为源，派生出三层圆角令牌：

```text
--xfm-radius-sm = 基准 × 0.6
--xfm-radius    = 基准
--xfm-radius-lg = 基准 × 1.5
```

所以卡片、按钮、输入框、代码块会各取所需，不依赖你逐个调。

### 磨砂导航栏 `glass_navbar`

开启后导航栏使用 `backdrop-filter: blur()` 实现毛玻璃效果。**注意**：在不支持该属性的旧浏览器上会降级为半透明实色，不影响可读性；若你的站点需要绝对稳定的对比度（例如强光环境下的户外使用场景），可以关掉。

### 入场动画 `animation`

开启后，首页卡片、侧栏挂件、Hero 面板在滚动进入视口时依次淡入（`IntersectionObserver` 驱动，带 45ms 级联延迟）。关闭后所有元素直接显示。

{% note info 动效降级是自动的 %}
无论 `animation` 是否开启，当用户系统设置了 `prefers-reduced-motion: reduce` 时，主题都会自动关闭动画。这一行为写在 `source/css/adaptive.css` 中，不需要配置。
{% endnote %}

### 自定义背景图

```yaml
appearance:
  background_light: /images/bg-light.jpg
  background_dark: /images/bg-dark.jpg
```

深浅两套背景图分别生效。留空则使用主题内置的纯色渐变。

### 自定义字体

```yaml
appearance:
  font_family: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
```

这里填的是**样式表 URL**，不是字体名。主题会把它作为 `<link rel="stylesheet">` 插入到所有 CSS 之后。留空则使用系统字体栈（`-apple-system` / `Segoe UI` / `PingFang SC` 等）。

### 站点标题 `site_title`

`appearance.site_title: false` 会隐藏导航栏中的站点标题文本，只保留 Logo。适合 Logo 本身已经包含文字的品牌站。

这同时也是[组件开关](/docs/adaptive-tiers/#组件开关-disable)中 `brand_text` 键作用的元素，可以只在特定档位隐藏。
