---
mode: docs

title: 首页与文章页
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 配置首页布局形态、Hero 大卡、置顶、摘要策略，以及文章页的目录、meta、版权、打赏、相关文章。
keywords: [首页, 文章页, 目录, 版权, 打赏, 相关文章, 阅读体验]
order: 13
---

# 首页与文章页

## 首页（Blog 模式）

```yaml
index:
  # 文章列表形态: card(卡片) / list(紧凑列表) / grid(网格) / classic(传统)
  layout: card
  # 是否显示头部的欢迎语 + 站点数据大卡
  hero: true
  # 是否显示置顶文章（front-matter 中设置 sticky: 100）
  sticky: true
  # 摘要来源: excerpt(<!-- more --> 以上) / auto(自动截取) / none(不显示)
  excerpt: excerpt
  # 自动截取摘要的长度
  excerpt_length: 140
  # 是否显示封面图
  cover: true
  # 每页文章数量（覆盖站点 per_page）
  per_page:
  # 是否在图片卡片上交替显示左右布局
  alternate_layout: true
```

### 列表形态 `layout`

| 值 | 表现 | 适合 |
| --- | --- | --- |
| `card` | 大卡片，带封面、摘要、meta | 默认，视觉优先 |
| `list` | 紧凑列表，信息密度高 | 文章多、偏工具站 |
| `grid` | 网格排列，一屏多篇 | 图片内容、作品集 |
| `classic` | 传统单列，标题 + 摘要 | 极简偏好 |

### Hero 大卡

开启后首页顶部渲染一块欢迎区：头像 + 站点标题 + 标语 + 数据统计（文章数 / 分类数 / 标签数，若开启 `vendors.busuanzi` 还会显示 PV）。

```yaml
index:
  hero: true
```

标题与副标题的取值优先级：

```text
theme.hero_title  >  config.title
theme.hero_subtitle  >  theme.tagline  >  config.subtitle
```

Hero 只在第一页显示（模板判定 `page.current === 1`）。移动端可以通过[组件开关](/docs/xfm/adaptive-tiers/#组件开关-disable)单独关掉：

```yaml
adaptive:
  tiers:
    mobile:
      disable: [hero]
```

### 置顶

在文章的 front-matter 里加权重即可：

```yaml
---
title: 重要公告
sticky: 100
---
```

数值越大越靠前，**非置顶文章始终排在置顶文章之后**。若只想让某篇"浮"到不置顶内容的最前面，给个较小的数（如 `10`）即可。

### 摘要策略

| 值 | 行为 |
| --- | --- |
| `excerpt` | 取 `<!-- more -->` 之前的内容；没有标记则取 `post.excerpt` |
| `auto` | 从正文剥离标签后截取 `excerpt_length` 个字符，超出加省略号 |
| `none` | 不显示摘要 |

{% note tip 手动摘要是最优解 %}
`excerpt` 模式下，在正文里合适的位置插入 `<!-- more -->`，首页卡片就显示到这里为止。这比自动截取更可控——不会在句子中间断开。
{% endnote %}

### 条目数与交替布局

```yaml
index:
  per_page: 10          # 覆盖站点 _config.yml 的 per_page
  alternate_layout: true
```

`alternate_layout: true` 时，相邻的带图卡片会左右交替排布，避免视觉单调。

## 文章页

```yaml
post:
  # 是否显示目录
  toc: true
  # 目录包含的标题层级范围
  toc_depth: [2, 3, 4]
  # 目录是否换行显示长标题
  toc_wrap: true
  # 是否显示面包屑
  breadcrumb: true
```

### 目录

| 配置项 | 说明 |
| --- | --- |
| `toc` | 总开关。单篇可用 front-matter `toc: false` 覆盖 |
| `toc_depth` | 目录收录的标题层级。`[2, 3]` 表示只收 H2 与 H3 |
| `toc_wrap` | 长标题是否折行显示，关闭则省略号截断 |

目录出现在哪里取决于模式：

| 模式 | 目录位置 |
| --- | --- |
| blog | 右侧挂件栏内的 `toc` 挂件 |
| notes | 独立右侧目录栏（`notes.toc` 控制） |
| docs | 独立右侧目录栏（`docs.toc` 控制） |

三种形态下，目录都具备**滚动跟随高亮**与**自动滚入可见区**的能力。在手机档，目录被折叠为正文顶部的面板，点击标题头展开。

### meta 显示项

```yaml
post:
  meta:
    - author
    - date
    - updated
    - categories
    - wordcount
    - reading
```

**顺序即显示顺序**。可选项：`author` `date` `updated` `categories` `wordcount` `reading`。删掉某项即隐藏。

相关的辅助配置：

```yaml
post:
  show_updated: true         # 更新日期
  wordcount: true            # 字数统计
  words_per_minute: 350      # 每分钟阅读字数，用于估算阅读时长
```

{% note info 字数与阅读时长怎么算的 %}
主题用 `xfm_wordcount()` 统计：中日韩字符按**每个字符计 1 字**，拉丁文按**按单词计 1 字**。阅读时长 = 字数 ÷ `words_per_minute`，向上取整且至少 1 分钟。`words_per_minute` 默认 350（中文阅读速度），英文站可调到 200 左右。
{% endnote %}

### 上下篇与版权

```yaml
post:
  # 是否显示上一篇 / 下一篇
  post_nav: true
  # 是否显示版权声明卡片
  copyright: true
  # 版权提示文案（支持 {link} 占位符）
  copyright_text: 本文为原创内容，转载请注明出处：{link}
  # 是否显示标签
  tags: true
```

`copyright_text` 中的 `{link}` 会被替换为指向本文的 `<a>` 链接。

### 打赏

```yaml
post:
  reward: false
  reward_text: 如果这篇文章对你有帮助，可以请我喝杯咖啡。
  reward_wechat:
  reward_alipay:
```

开启后文章底部出现"打赏"按钮，点击展开付款码。微信与支付宝可分别配置，都留空则只显示文案。

### 相关文章

```yaml
post:
  related_posts: true
  related_count: 4
```

推荐算法基于**标签与分类权重**：同标签 +2 分，同分类 +3 分，按总分降序取前 N 篇。所以给文章打好标签、归好分类，是相关推荐质量的前提。

### 分享

```yaml
share:
  # 可选: weibo / qq / twitter / facebook / telegram / whatsapp / copy / qrcode
  services:
    - copy
    - weibo
    - qq
    - twitter
  # 是否显示二维码分享
  qrcode: true
```

`copy` 是复制链接按钮，`qrcode` 是弹出二维码。文章页的分享组由 `post.share` 总开关控制。

## 面包屑

```yaml
post:
  breadcrumb: true
```

开启后在正文上方显示路径导航（首页 / 分类 / 当前文章）。**文档与笔记模式下同样生效**，有助于读者定位自己在文档树中的位置。

## 阅读体验

```yaml
reading:
  # 顶部阅读进度条
  progress_bar: true
  # 阅读时长提示（顶部渐显）
  reading_time: true
  # 返回顶部按钮
  back_to_top: true
  # 图片是否支持点击放大（依赖 lightbox）
  zoom_image: true
  # 深色 / 浅色切换是否显示浮动按钮
  scheme_toggle: true
  # 是否显示「文章过时提醒」（超过 N 天提示）
  outdated_notice: false
  outdated_days: 365
  # 平滑滚动
  smooth_scroll: true
```

| 配置项 | 说明 |
| --- | --- |
| `progress_bar` | 页面顶部细进度条，随滚动填充 |
| `reading_time` | 基于 `words_per_minute` 估算 |
| `back_to_top` | 滚动超过 320px 时出现 |
| `zoom_image` | 点击图片打开灯箱（需 `vendors.lightbox: true`） |
| `outdated_notice` | 文章距最后更新超过 `outdated_days` 天时，正文顶部插一条黄色提示 |
| `smooth_scroll` | 锚点跳转平滑滚动，并自动补偿导航栏高度 |

{% note tip 文档站建议关掉过时提醒 %}
文档是"长期有效"的内容，`outdated_notice` 更适合博客。文档站保持 `false` 可避免读者误以为内容失效。
{% endnote %}

## 分类 / 标签 / 归档页

```yaml
taxonomy:
  # 标签页是否显示云标签
  tag_cloud: true
  # 分类页是否显示分类云
  category_cloud: true
  # 归档页是否开启分组
  archive_group: true
  # 归档是否按年分桶
  archive_yearly: true
  # 是否显示时间轴样式
  timeline_style: true
  # 归档列表形态: timeline / list / grid
  layout: timeline
```

对应的页面需要手动创建（见[安装与部署](/docs/xfm/install/#需要的独立页面)）：

```bash
hexo new page tags         # type: tags
hexo new page categories   # type: categories
hexo new page archives     # 无需 type
```
