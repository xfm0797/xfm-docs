---
mode: docs

title: 导航与菜单
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 配置导航栏行为与两级下拉菜单，并了解各档位下的导航形态差异。
keywords: [导航栏, 菜单, 下拉菜单, 抽屉, 图标]
order: 12
---

# 导航与菜单

## 导航栏行为

```yaml
navbar:
  # 是否显示
  enable: true
  # 是否固定在顶部（滚动时不消失）
  sticky: true
  # 导航栏高度（px）
  height: 64
  # 是否在滚动时自动隐藏导航栏
  auto_hide: true
```

| 配置项 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enable` | bool | `true` | 关闭后整个顶部导航不渲染 |
| `sticky` | bool | `true` | 吸顶。关闭则随页面滚出视口 |
| `height` | number | `64` | 同时写入 CSS 变量 `--xfm-nav-h`，锚点跳转的偏移量按它计算 |
| `auto_hide` | bool | `true` | 向下滚动时隐藏、向上滚动时立即重现。仅在 `sticky: true` 时生效 |

{% note warning height 与锚点偏移联动 %}
`navbar.height` 会作为 `--xfm-nav-h` 注入，平滑滚动与目录定位都以它为基准线。如果你把导航栏高度改大，锚点跳转的落点会自动跟随，**但若你在自定义 CSS 里硬编码了别的偏移量，需要同步调整**。
{% endnote %}

## 菜单配置

`menu` 支持两级：一级为菜单项，二级通过 `children` 定义下拉子菜单。

```yaml
menu:
  首页:
    path: /
    icon: home
  归档:
    path: /archives/
    icon: archive
  分类:
    path: /categories/
    icon: folder
  标签:
    path: /tags/
    icon: tag
  更多:
    icon: compass
    children:
      友链:
        path: /links/
        icon: link
      关于:
        path: /about/
        icon: user
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| （键名） | string | 是 | 菜单显示文本。**键名即文案**，不通过 `title` 配置 |
| `path` | string | 分组项可省 | 目标地址。以 `/` 开头为站内路径，`http(s)://` 开头为外链 |
| `icon` | string | 否 | 图标名，取自主题内置 SVG 图标库；留空则不显示图标 |
| `children` | object | 否 | 子菜单。结构同上，**仅支持两级** |
| `external` | bool | 否 | 设为 `true` 时强制新窗口打开 |

### 行为细节

- **当前项高亮**：模板用 `xfm_active(path)` 判定，命中时给链接加 `is-active`。首页的判定是"路径为空或首页分页"，其余按前缀匹配。
- **纯分组项**：不写 `path` 的菜单项渲染为不可点击的文本，带下拉箭头，只作二级菜单的容器。
- **外链**：`path` 以 `http://` / `https://` 开头时自动加 `target="_blank" rel="noopener noreferrer"`。
- **笔记模式的归档项**：当 `mode: notes` 且菜单里没有指向 `/archives/` 的项时，主题会自动追加一个"归档"菜单项。

### 内置图标名

主题内置了一套 24×24 线性图标（`layout/_partials/sprite.ejs`），在菜单里直接写名字即可：

{% row %}
{% col 6 %}
**导航类**
`home` `archive` `folder` `folder-open` `tag` `compass` `link` `list` `book` `file-doc` `hash`
{% endcol %}
{% col 6 %}
**账号类**
`user` `github` `twitter` `weibo` `qq` `wechat` `bilibili` `zhihu` `juejin` `email` `rss`
{% endcol %}
{% endrow %}

{% row %}
{% col 6 %}
**状态类**
`info` `warning` `check` `close` `close-circle` `star` `bulb` `quote` `note` `fire` `heart` `bookmark`
{% endcol %}
{% col 6 %}
**操作类**
`search` `menu` `close` `copy` `download` `external` `share` `eye` `clock` `calendar` `globe` `arrow-*` `chevron-*`
{% endcol %}
{% endrow %}

完整清单见 `layout/_partials/sprite.ejs`。图标名不匹配时不报错，只是渲染为空。

## 三档下的导航形态

导航栏的具体形态由 [adaptive](/docs/xfm/adaptive-tiers/) 决定，**不在这里配**：

| 档位 | `nav` 取值 | 表现 |
| --- | --- | --- |
| mobile | `drawer` | 顶部只留汉堡按钮，菜单收进左侧抽屉 |
| tablet | `drawer` | 同上，宽度稍宽 |
| desktop | `bar` | 横排菜单，二级为下拉 |

移动端抽屉由 `layout/_partials/header.ejs` 生成，包含品牌区、全部一级与二级菜单、社交图标，点击遮罩或 `Esc` 关闭。

## 导航栏工具区

导航栏右侧的工具按钮由各自的功能开关控制，不需要在 `menu` 里配置：

| 按钮 | 控制项 | 默认 |
| --- | --- | --- |
| 搜索 | `search.enable` | 开启 |
| 快捷键提示 `Ctrl K` | `search.hotkey` | 开启 |
| RSS | `vendors.rss_navbar` | 开启 |
| 深浅色切换 | `reading.scheme_toggle` | 开启 |

```yaml
search:
  enable: true
  hotkey: true

vendors:
  rss:            # 留空则自动指向 /atom.xml
  rss_navbar: true

reading:
  scheme_toggle: true
```

{% note tip 搜索是文档站的核心入口 %}
文档模式下左侧文档树的顶部也有一枚搜索按钮（`layout/_partials/docs/nav.ejs`），它与导航栏的搜索共用同一个 `Cmd/Ctrl + K` 面板。
{% endnote %}
