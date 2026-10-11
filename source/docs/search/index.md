---
mode: docs

title: 搜索
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: XFM 内置的全文检索：索引生成、快捷键唤起、键盘导航与索引裁剪。
keywords: [搜索, 全文检索, Ctrl K, 索引, search.json]
order: 50
---

# 搜索

主题**自带**全文检索能力，不需要安装 `hexo-generator-search` 之类的插件——索引由 `scripts/generators/search.js` 生成。

## 配置

```yaml
search:
  # 是否启用（生成 /search.json 索引文件）
  enable: true
  # 索引文件路径
  path: search.json
  # 是否索引文章正文
  index_content: true
  # 正文索引的最大长度（字符）
  content_length: 3000
  # 每条结果显示的最大正文预览长度
  preview_length: 100
  # 单次最多返回结果数
  max_results: 20
  # 是否显示搜索快捷键提示
  hotkey: true
  # 是否显示搜索结果中的日期
  show_date: true
```

| 配置项 | 说明 |
| --- | --- |
| `enable` | 关闭后不生成索引，导航栏与文档树的搜索按钮一并消失 |
| `path` | 索引文件输出路径。一般无需修改 |
| `index_content` | 关闭则只索引标题与描述，索引体积大幅减小 |
| `content_length` | **每条**记录正文只保留前 N 字符，是控制索引体积的主要手段 |
| `preview_length` | 结果列表里显示的正文字数 |
| `max_results` | 单次返回上限，防止结果过多拖慢渲染 |
| `hotkey` | 是否在搜索按钮旁显示 `Ctrl K` 提示 |
| `show_date` | 结果条目是否显示日期 |

## 索引包含什么

生成器会扫描**文章与页面两类内容**：

| 来源 | 收录条件 | `layout` 字段 |
| --- | --- | --- |
| 文章（`source/_posts/`） | 非草稿（`draft` 为假） | `post` |
| 页面（`source/` 下其它 md） | **必须设置 `title`** | `page` |

每条记录的字段：

```json
{
  "title": "Docs 文档模式",
  "url": "/docs/mode-docs/",
  "content": "用 docs 模式搭建三栏产品文档站……",
  "date": 1760000000000,
  "dateText": "2026-10-11",
  "categories": [],
  "tags": [],
  "excerpt": "…",
  "cover": null,
  "layout": "page"
}
```

{% note tip 页面也要写 description %}
页面被收录的前提是**有 `title`**——这是硬条件。`description` 与 `tags` 虽非必需，但会进入 `excerpt` / `tags` 字段，直接提升检索命中率。**建议每篇文档都写 `description`。**
{% endnote %}

## 检索行为

前端检索脚本 `source/js/search.js` 在**标题、正文、标签**三个字段上匹配，并据此标注命中位置（对应界面上的"标题 / 正文 / 标签"标签）。

| 特性 | 说明 |
| --- | --- |
| 唤起方式 | 点击导航栏 🔍 按钮，或按 `Cmd/Ctrl + K` |
| 键盘导航 | `↑` `↓` 选择，`Enter` 打开，`Esc` 关闭 |
| 关键词高亮 | 命中片段中的关键词会被高亮 |
| 结果上限 | 受 `max_results` 限制 |
| 空索引提示 | 索引未生成时给出"请先执行 hexo g"的提示 |

移动端同样支持：导航栏的搜索图标始终可见。

## 索引体积控制

搜索索引是一个 JSON 文件，在全站页面加载时按需拉取。索引过大会拖慢搜索面板的首次打开。

{% row %}
{% col 6 %}
**减小体积的手段**

1. 调小 `content_length`（如 `1000`）
2. 关闭 `index_content`，只索引标题
3. 给长文档精简正文（索引取的是前 N 字符，恰好是页面开头）
{% endcol %}
{% col 6 %}
**参考量级**

- 100 篇中等长度的文档，`content_length: 3000`
- 索引约 **300–600 KB**（未压缩）
- 静态托管通常开启 gzip，实际传输约 **1/3**
{% endcol %}
{% endrow %}

{% note warning 别把 content_length 设得过小 %}
设为 `200` 以下时，正文几乎只剩标题附近的字，命中后无法判断相关性。**建议不低于 800。**
{% endnote %}

## 搜索在文档模式下的入口

文档模式有两处搜索入口，共用同一个面板：

1. **导航栏**的 🔍 按钮
2. **文档树顶部**的搜索按钮（`layout/_partials/docs/nav.ejs`）

手机档下，文档树收进抽屉，此时从抽屉顶部也能唤起搜索。

## 常见问题

{% tabs %}
<!-- tab 搜索没反应 / 报索引加载失败 -->
浏览器开了开发者工具会看到 `/search.json` 请求 404。原因是索引未生成或路径不对。

```bash
hexo clean && hexo g
ls public/search.json      # 确认文件存在
```

若站点部署在子路径（`config.root` 不是 `/`），确认 `search.path` 生成的位置与前端请求的路径一致——生成器会自动带上 `root` 前缀，通常无需手动改。
<!-- endtab -->
<!-- tab 搜不到某篇文档 -->
按顺序检查：

1. 该页面 front-matter **有 `title`** 吗？
2. 它是 `draft` 吗？
3. 关键词是否落在**前 `content_length` 个字符**之外？
4. 是否执行过 `hexo clean`？

第 3 条最常见——文档很长时，关键词出现在正文后半段就不会被索引。
<!-- endtab -->
<!-- tab 想完全关掉搜索 -->
```yaml
search:
  enable: false
```

关闭后：不生成索引文件、导航栏与文档树的搜索入口都不渲染、前端不加载 `search.js`。
<!-- endtab -->
{% endtabs %}
