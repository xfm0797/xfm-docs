---
mode: docs

title: 代码块与第三方增强
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 代码块工具条配置，以及数学公式、Mermaid、灯箱、统计、RSS、PWA 等第三方增强项。
keywords: [代码块, 行号, 复制, 折叠, 灯箱, 统计, RSS, PWA]
order: 52
---

# 代码块与第三方增强

## 代码块

```yaml
code_block:
  # 是否显示行号（需站点 _config.yml 中 highlight.line_number: true）
  line_number: true
  # 是否显示语言标签
  language: true
  # 是否显示复制按钮
  copy: true
  # 超过多少行自动折叠（-1 表示不折叠）
  max_height: -1
  # 超过行数折叠时是否默认展开
  fold_default: false
  # 是否使用 Mac 风格窗口三色点
  mac_style: true
```

### 工具条

代码块顶部会自动生成一条工具条（`scripts/filters/content.js`）：

```text
┌──────────────────────────────────────────────┐
│ ● ● ●   JavaScript                  [复制]    │
├──────────────────────────────────────────────┤
│ const theme = 'xfm';                          │
└──────────────────────────────────────────────┘
  ↑三色点  ↑语言标签                  ↑复制按钮
```

| 配置项 | 效果 |
| --- | --- |
| `mac_style` | 左侧显示 Mac 风格三色点 |
| `language` | 显示语言标签。语言名会被**自动美化为可读形式** |
| `copy` | 右上角复制按钮，复制后短暂显示"已复制" |

语言标签的映射表（部分）：

| 源码标记 | 显示 |
| --- | --- |
| `js` / `javascript` | JavaScript |
| `ts` / `typescript` | TypeScript |
| `sh` / `bash` / `zsh` | Shell |
| `yml` / `yaml` | YAML |
| `py` / `python` | Python |
| `md` / `markdown` | Markdown |

未在映射表中的语言直接转为大写显示。**未识别到语言时显示 `Code`。**

### 行号

行号**由 Hexo 的语法高亮器生成**，不在主题里控制。因此需要两部分同时满足：

```yaml
# 站点 _config.yml
highlight:
  enable: true
  line_number: true
  auto_detect: false
  tab_replace: ''
```

```yaml
# 主题 _config.yml
code_block:
  line_number: true
```

{% note warning 行号开关的两处联动 %}
只改主题的 `code_block.line_number` 不生效——真正的行号节点由站点 `highlight.line_number` 输出。主题这一项只是声明"我准备好展示行号列了"。
{% endnote %}

### 长代码折叠

```yaml
code_block:
  max_height: 20        # 超过 20 行自动折叠
  fold_default: false   # 折叠时默认收起
```

`max_height` 为正数时，超过该行数的代码块会被折叠，底部出现"展开"遮罩，点击后完整展开。

{% note info 行数怎么统计的 %}
过滤器会**优先从真正的代码列统计行数**（`<td class="code">`），忽略行号列。因此在开启行号的情况下，折叠阈值仍然是按代码本身的行数计算，不受行号影响。
{% endnote %}

行数与折叠的对应关系：

```text
max_height: -1     → 永不折叠
max_height: 20     → 21 行及以上折叠
max_height: 0      → 同 -1（不小于 1 视为关闭）
```

## 内容增强

```yaml
vendors:
  # 是否给外链自动添加 target="_blank"
  external_link: true
  # 是否启用 Markdown 内容净化（标题锚点、表格包裹、任务列表）
  content_enhance: true
  # 是否给所有代码块启用单行高亮
  line_highlight: true
```

`content_enhance: true` 时，`scripts/filters/content.js` 会在渲染后增强正文：

| 增强项 | 效果 |
| --- | --- |
| **标题锚点** | 给所有 H1–H6 补 `id`（由标题文本 slug 化，重复时加序号后缀），同时附加 `headline` 类 |
| **表格滚动容器** | 用 `<div class="table-wrap" tabindex="0">` 包裹每张表格，窄屏可横向滑动 |
| **图片懒加载** | 自动补 `loading="lazy"`、`decoding="async"`、`alt=""` |
| **外链新窗** | 站外链接自动加 `target="_blank" rel="noopener noreferrer nofollow"` 与 `ext-link` 类 |
| **任务列表** | 把 `- [ ]` / `- [x]` 渲染为带 `task-list-item` 类的列表项 |

{% note tip 表格滚动提示 %}
被包裹的表格在窄屏上会显示"左右滑动查看完整表格"的提示文案（取自语言包的 `misc.table_wrap_hint`）。宽表格在手机档不再撑破布局。
{% endnote %}

## 图片灯箱与懒加载

```yaml
vendors:
  # 图片灯箱
  lightbox: true
  # 图片懒加载
  lazyload: true
```

配合阅读体验里的：

```yaml
reading:
  zoom_image: true
```

三者关系：

```text
lazyload: true      → 给 <img> 补 loading="lazy"，延迟加载
zoom_image: true    → 给 <img> 补 data-zoomable="true"（依赖 lazyload 分支）
lightbox: true      → 前端监听 data-zoomable 的图片，点击打开全屏灯箱
```

灯箱支持：点击图片放大、点击背景或按 `Esc` 关闭、显示图片的 `alt` 作为说明文字。

{% note warning 三者需要同时开启 %}
只开 `lightbox` 不开 `zoom_image` 时，图片不会被标记 `data-zoomable`（标记逻辑在 `lazyload` 分支内），点击不会有反应。
{% endnote %}

## 数学公式

```yaml
vendors:
  math: katex                # katex / mathjax / none
  katex_version: "0.16.9"
  mathjax_version: "3.2.2"
  math_auto_render: true
```

从 CDN 加载，无需安装依赖。写法与注意事项见[图表与链接卡片](/docs/xfm/tags-mermaid/#数学公式)。

## Mermaid

```yaml
vendors:
  mermaid: true
  mermaid_version: "10.9.1"
  mermaid_theme: default      # default / forest / dark / neutral
```

用动态 `import()` 按需加载 ES 模块，不阻塞首屏。深浅色切换时图表会自动重绘。

## 统计

```yaml
vendors:
  # 站点访问统计 busuanzi
  busuanzi: false
  # 站长统计（自定义 HTML/JS 片段，注入 footer）
  analytics: ""
```

| 配置项 | 说明 |
| --- | --- |
| `busuanzi` | 开启后引入不蒜子脚本，首页 Hero 显示 PV |
| `analytics` | 任意 HTML/JS 片段，原样注入到页脚前。放百度统计、Google Analytics 等 |

```yaml
vendors:
  analytics: |
    <script>
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?xxxxx";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    </script>
```

{% note warning analytics 片段会被原样输出 %}
这段内容不经过任何转义或过滤，直接写入 HTML。**只放你信任的代码。**
{% endnote %}

## RSS

```yaml
vendors:
  rss:                    # 留空则自动 /atom.xml
  rss_navbar: true        # 是否在导航栏显示 RSS 图标
```

需要安装 `hexo-generator-feed` 才会真正生成 `/atom.xml`：

```bash
npm i hexo-generator-feed
```

站点 `_config.yml` 中配置订阅源：

```yaml
feed:
  type: atom
  path: atom.xml
  limit: 20
```

## PWA

```yaml
vendors:
  pwa: false
  manifest: /manifest.json
```

开启后会在 `<head>` 注入 `manifest` 链接。**主题不生成 manifest 文件**，需要你自己提供服务：

```json
{
  "name": "我的文档站",
  "short_name": "文档",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    { "src": "/images/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/images/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

把文件放到站点 `source/manifest.json`。

## 完整配置参考

```yaml
code_block:
  line_number: true
  language: true
  copy: true
  max_height: -1
  fold_default: false
  mac_style: true

vendors:
  math: katex
  katex_version: "0.16.9"
  mathjax_version: "3.2.2"
  math_auto_render: true

  mermaid: true
  mermaid_version: "10.9.1"
  mermaid_theme: default

  lightbox: true
  lazyload: true
  line_highlight: true

  busuanzi: false
  analytics: ""

  rss:
  rss_navbar: true

  pwa: false
  manifest: /manifest.json

  external_link: true
  content_enhance: true
```
