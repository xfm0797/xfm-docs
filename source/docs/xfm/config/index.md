---
mode: docs

title: 配置总览
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: XFM 主题全部配置项的分组索引与优先级规则。
keywords: [配置, _config.yml, 主题配置]
order: 10
---

# 配置总览

主题的全部配置集中在 `themes/xfm/_config.yml`，每个配置项都有中文注释。本页给出分组索引与优先级规则，具体细节见各分组子页。

## 优先级规则

配置来源有三层，**后者覆盖前者**：

```text
主题默认值（代码内）  <  themes/xfm/_config.yml  <  站点 _config.yml 的 theme_config
```

也就是说，你**不需要修改主题目录里的文件**。在站点 `_config.yml` 里用 `theme_config` 覆盖即可，这样主题升级时不会冲突：

```yaml
# 站点 _config.yml
theme_config:
  appearance:
    primary: "#ff6b6b"
  docs:
    expanded: false
```

{% note tip 两种写法怎么选 %}
- **单人维护、不常升级**：直接改 `themes/xfm/_config.yml`，改动集中、好找。
- **跟随上游升级**：用站点的 `theme_config` 覆盖，`themes/xfm` 保持干净，`git pull` 不产生冲突。
{% endnote %}

## 配置分组索引

| 分组 | 作用 | 详情 |
| --- | --- | --- |
| `mode` | 站点形态：`blog` / `notes` / `docs` | [三种模式](/docs/xfm/mode-blog/) |
| 品牌资源 | `logo` / `tagline` / `avatar` / `favicon` / `default_cover` / `placeholder` | [外观与品牌](/docs/xfm/config-appearance/) |
| `appearance` | 配色、主色、圆角、磨砂、动画、字体 | [外观与品牌](/docs/xfm/config-appearance/) |
| `adaptive` | 设备档位、每档形态、组件开关 | [三档配置](/docs/xfm/adaptive-tiers/) |
| `navbar` | 导航栏显示、吸顶、高度、滚动隐藏 | [导航与菜单](/docs/xfm/config-navbar/) |
| `menu` | 导航菜单，支持两级下拉 | [导航与菜单](/docs/xfm/config-navbar/) |
| `index` | 首页布局、Hero、置顶、摘要、分页 | [首页与文章页](/docs/xfm/config-index-post/) |
| `post` | 文章目录、meta、版权、打赏、相关文章 | [首页与文章页](/docs/xfm/config-index-post/) |
| `sidebar` | blog 侧边挂件栏位置与挂件参数 | [侧边栏与页脚](/docs/xfm/config-sidebar-footer/) |
| `notes` | 笔记模式分组、排序、宽度、目录 | [Notes 笔记模式](/docs/xfm/mode-notes/) |
| `docs` | 文档模式数据源、展开、翻页、编辑链接 | [Docs 文档模式](/docs/xfm/mode-docs/) |
| `footer` | 页脚版权、运行时长、统计、备案 | [侧边栏与页脚](/docs/xfm/config-sidebar-footer/) |
| `code_block` | 行号、语言标签、复制、折叠、Mac 风格 | [代码块与第三方增强](/docs/xfm/vendors/) |
| `search` | 索引生成、快捷键、结果条数 | [搜索](/docs/xfm/search/) |
| `comments` | 8 种评论系统的独立参数 | [评论系统](/docs/xfm/comments/) |
| `vendors` | 数学公式、Mermaid、灯箱、统计、RSS、PWA | [代码块与第三方增强](/docs/xfm/vendors/) |
| `seo` | OG、JSON-LD、canonical、站长验证 | [SEO 与站点地图](/docs/xfm/seo/) |
| `share` | 分享渠道与二维码 | [首页与文章页](/docs/xfm/config-index-post/) |
| `social` | 社交账号图标 | [侧边栏与页脚](/docs/xfm/config-sidebar-footer/) |
| `links` | 友链数据 | [侧边栏与页脚](/docs/xfm/config-sidebar-footer/) |
| `reading` | 进度条、返回顶部、过时提醒、平滑滚动 | [首页与文章页](/docs/xfm/config-index-post/) |
| `taxonomy` | 标签云、分类云、归档样式 | [首页与文章页](/docs/xfm/config-index-post/) |
| `error_404` | 404 页标题、文案、推荐数 | [SEO 与站点地图](/docs/xfm/seo/) |
| `sitemap` | sitemap.xml 与 robots.txt | [SEO 与站点地图](/docs/xfm/seo/) |
| `custom` | 自定义 HTML / CSS / JS 注入 | [自定义样式与注入](/docs/xfm/customize/) |

## 快速定位：我想改……

| 我想…… | 改这里 |
| --- | --- |
| 换主题色 | `appearance.primary` |
| 换圆角风格 | `appearance.radius` |
| 默认深色 | `appearance.scheme: dark` |
| 导航栏不要自动隐藏 | `navbar.auto_hide: false` |
| 首页不要大卡 | `index.hero: false` |
| 首页改成列表 | `index.layout: list` |
| 文章不显示目录 | `post.toc: false` |
| 目录只要二三级 | `post.toc_depth: [2, 3]` |
| 关掉版权卡 | `post.copyright: false` |
| 开启打赏 | `post.reward: true` |
| 侧边栏放左边 | `sidebar.position: left` |
| 手机端不显示封面 | `adaptive.tiers.mobile.disable: [cover]` |
| 文档侧边栏默认收起 | `docs.expanded: false` |
| 代码块超过 20 行折叠 | `code_block.max_height: 20` |
| 关闭全文搜索 | `search.enable: false` |
| 开启评论 | `comments.enable: true` + 填对应系统参数 |
| 页脚显示运行时长 | `footer.runtime: true` + `footer.runtime_start` |
| 加备案号 | `footer.icp` / `footer.police` |

## 校验配置是否生效

改动配置后必须重新生成，`hexo s` 的热更新对 `_config.yml` 不完全可靠：

```bash
hexo clean && hexo g && hexo s
```

{% note warning YAML 语法是最常见的坑 %}
- 缩进**只能用空格**，不能用 Tab。
- 字符串里的 `#` 会被当成注释，颜色值必须加引号：`primary: "#4f6bed"`。
- 布尔值 `true` / `false` 不要加引号，写成 `"false"` 会被当成非空字符串（**仍为真**）。
{% endnote %}
