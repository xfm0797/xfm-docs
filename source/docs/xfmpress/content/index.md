---
mode: docs

title: 内容与 Markdown
date: 2026-11-10 21:50:00
updated: 2026-11-10 22:30:00
description: xfmpress 的内容组织方式：content 目录与 URL 的对应规则、front-matter 全部字段、文章与页面与草稿的区别、scaffolds 脚手架、Markdown 扩展语法、相对链接解析与摘要生成。
keywords: [xfmpress, Markdown, front-matter, 页面, type: page, scaffolds, 草稿, URL, 提示容器, 脚注, 相对链接]
order: 25
---

# 内容与 Markdown

**中文** · [English version](/en/docs/xfmpress/content/)

内容全部放在 `content/` 下，支持 `.md`、`.markdown`、`.html`、`.htm` 四种扩展名。没有特殊的目录要求 —— 但目录结构决定 URL，所以约定还是值得说清楚。

## 目录与 URL 的对应

| 源文件 | 生成的 URL | 产物 |
| --- | --- | --- |
| `content/index.md` | `/` | `dist/index.html` |
| `content/about.md` | `/about/` | `dist/about/index.html` |
| `content/about/index.md` | `/about/` | `dist/about/index.html` |
| `content/posts/hello.md` | `/posts/hello/` | `dist/posts/hello/index.html` |
| `content/notes/2026/a.md` | `/notes/2026/a/` | `dist/notes/2026/a/index.html` |
| `content/raw.html` | `/raw.html` | `dist/raw.html` |

规则可以概括成三句：**`index` 折叠成目录本身；去掉扩展名后补尾斜杠；`.html` 保持原样**（避免链接与产物不一致）。

想固定某个地址，可以在 front-matter 里直接指定：

```yaml
---
title: 关于
url: /about-me/
---
```

`url`、`permalink`、`slug` 三个字段都认，都会做规范化（补前导斜杠、必要处补尾斜杠）。

非 ASCII 路径同样可用：`content/笔记/入门.md` 会生成 `/笔记/入门/`，落盘时把百分号编码还原成真实目录名 —— 静态服务器是「先解码 URL 再查文件」的，落盘成 `%E7%AC%94%E8%AE%B0` 会直接 404。

## front-matter

标准 YAML，夹在两行 `---` 之间，全部字段都可以省略：

```markdown
---
title: 文章标题
date: 2026-11-10 09:00:00
updated: 2026-11-10 12:30:00
description: 摘要，列表页与 RSS 使用
tags: [Node.js, 性能]
category: 工程
series: 静态站点生成器
layout: post.html
weight: 10
draft: false
toc: true
---
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 标题；不写则用文件名 |
| `date` | 日期 | 发布日期，RSS 与排序依赖它 |
| `published` | 日期 | `date` 的别名 |
| `updated` | 日期 | 更新时间，进 sitemap 的 `lastmod` |
| `description` | string | 摘要，优先于自动截取 |
| `summary` | string | `description` 的别名 |
| `tags` | 数组或逗号串 | 标签，`[a, b]` 与 `a, b` 都接受 |
| `category` | string | 分类，单个值 |
| `series` | string | 系列，单个值 |
| `layout` | string | 布局文件名，默认取 `defaults.layout` |
| `weight` | number | 排序权重，小的在前 |
| `order` | number | `weight` 的别名 |
| `draft` | bool | `true` 时生产构建跳过 |
| `toc` | bool | `false` 时该页不生成目录 |
| `type` | string | 设为 `page` 时不进入文章列表、RSS 与上下篇 |
| `url` / `permalink` / `slug` | string | 手动指定地址 |
| `group` / `section` | string | docs 主题的侧栏分组名 |

`type: page` 这一项很实用：关于页、友链页这类「不是文章」的内容，标上它就不会出现在首页列表、RSS 和 `prev` / `next` 链条里。

## 文章、页面与草稿

内容只有三种角色，差别全在 front-matter 的两三个字段上：

| 角色 | 建法 | 关键字段 | 表现 |
| --- | --- | --- | --- |
| 文章 | `xfm new "标题"` | `layout: post.html` | 进首页列表、RSS / JSON Feed、搜索索引、上下篇与相关推荐 |
| 页面 | `xfm new page about` | `layout: page.html` + `type: page` | 有独立地址 `/about/`，但不进任何列表与 feed |
| 草稿 | `xfm new draft "标题"` | `draft: true` | `xfm dev` 照常渲染，`xfm build` 跳过 |

页面与文章共用同一套布局能力，区别只在于**是否参与聚合**：`site.posts` 会排除所有 `type: page` 的页面，`sitemap` / `rss` / `search` / `related` 也一并不收。因此想让页面出现在导航里，得自己把它加进 `site.nav`：

```js
site: {
  nav: [
    { title: '首页', url: '/' },
    { title: '关于', url: '/about/' },
  ],
}
```

## 脚手架

`xfm new` 生成的初始内容不是写死在代码里的，而是读站点根目录的 `scaffolds/<布局>.md` —— 与 Hexo 的 `scaffolds/` 同构：

```text
scaffolds/
├── post.md      # xfm new "标题"  / xfm new post "标题"
├── page.md      # xfm new page 标题
└── draft.md     # xfm new draft 标题
```

模板里可用三个占位符：

| 占位符 | 替换成 |
| --- | --- |
| `{% raw %}{{ title }}{% endraw %}` | 标题 |
| `{% raw %}{{ date }}{% endraw %}` | 当前时间（本地时区） |
| `{% raw %}{{ layout }}{% endraw %}` | 布局文件名，如 `post.html` |

改完保存即生效，不需要重启 `xfm dev`（`xfm new` 是独立进程，每次都读最新文件）。站点里没有 `scaffolds/` 目录时用内置模板，所以老站点不用迁移；`xfm create` 新建站点时会把三份默认模板写出来，供直接修改。

漏写关键字段不用担心：生成时会补上 `title`、`date`、`layout`、`type: page` 与 `draft` —— 一个只剩标题的模板也能造出行为正确的页面，不会把页面当文章发布、也不会让草稿悄悄上线。

## 草稿

```yaml
---
title: 写到一半
draft: true
---
```

生产构建（`xfm build`）会跳过草稿，`xfm dev` 则照常渲染 —— 这样本地能预览，线上不会漏出去。想在构建里也包含草稿，把 `buildDrafts` 设为 `true`。

`xfm new draft "标题"` 会自动写入这个字段（`xfm new "标题" --draft` 等价）。

## 排序与上下篇

页面列表的排序规则是固定的三档：

1. 首页（`/`）永远排最前；
2. 其余按 `weight` 升序 —— 文档站靠这个控制章节顺序；
3. `weight` 相同时按 `date` 倒序。

`prev` / `next` 按同一顺序自动补全，只在文章之间串联（排除首页、`type: page` 与没有 `date` 的页面）。模板里直接读 `page.data.prev.url` / `page.data.prev.title` 即可。

## 标记语言

正文就是标准 Markdown，GFM 常用语法全支持。在此之上的扩展：

### 提示容器

```markdown
::: tip 提示标题
支持 `tip` / `info` / `warning` / `danger` / `details` 五种。
:::
```

类型决定配色与图标；标题可省略。`details` 会被折叠，适合放长附录。

### 代码块

围栏可以带语言标记，也可以带标题：

````markdown
```js app.js
const ok = true;
```
````

语言别名做了归一，大小写不敏感：

| 类别 | 可用标记 |
| --- | --- |
| JavaScript | `js` `javascript` `jsx` `ts` `tsx` |
| 后端语言 | `java` `c` `cpp` `csharp` `go` `golang` `rust` `rs` `swift` `kotlin` `scala` `php` `python` `py` |
| 脚本与配置 | `bash` `sh` `shell` `json` `yaml` `yml` |
| 标记与样式 | `html` `xml` `svg` `vue` `css` `scss` `markdown` `md` `text` |

未知语言不会报错，降级成纯转义的等宽文本。围栏首行的元信息（如 `{1,3-5}` 这类高亮范围标记）会被忽略，不影响构建。

### 引用式链接

```markdown
这几天在折腾[静态站点][ssg]，顺手把[文档][docs]也重排了一遍。

[ssg]: https://example.com/ssg "静态站点生成器"
[docs]: https://example.com/docs
```

定义行不会出现在正文里。简写形式 `[ssg]` 也支持 —— 当链接文字就是标识符时，可以省掉第二对方括号。

### 脚注

```markdown
正文里插一句[^note]，文末自然出现注释。

[^note]: 按首次引用顺序编号，多处引用各自回链。
```

### 其他

- **Setext 标题**：段落下一行写 `====`（一级）或 `----`（二级）。
- **缩进代码块**：行首四个空格或一个 Tab（列表之外）。
- **转义**：`\*不是斜体\*`、`` \`不是代码` ``。
- **任务列表**：`- [x] 已完成` / `- [ ] 待办`，支持缩进续行与嵌套。
- **列表续行**：缩进续行与无缩进惰性续行都会并入同一项；有序列表保留起始编号（从 `3.` 开始就输出 `start="3"`）。
- **表格**：标准 GFM 表格，支持对齐标记。

### 标题锚点

二三级标题自动生成 `id`，中文标题也能得到可读锚点（重复标题自动加序号）。标题同时收集进 `page.toc`，主题据此渲染右侧目录 —— 因此 `toc: false` 只影响目录，不影响锚点本身。

## 相对链接

Markdown 里写相对路径，构建时会按源文件位置解析成正确的站点 URL：

```markdown
参见 [上一篇](./hello.md) 与 [图片](../../assets/diagram.png)。
```

规则：

- 带协议、协议相对、根路径（`/x`）、纯锚点（`#x`）的链接原样保留；
- 其他相对路径按「当前源文件所在目录」解析，再映射到目标页面的 URL；
- 指向不存在源文件的 `.md` 链接会保留原样 —— 拼错不会静默变成 404 之外的怪路径。

好处是文件可以随意移动目录，只要相对关系不变，链接就不断。

## 静态文件

`public/` 目录下的东西会**原样拷贝**到产物根目录，适合放 `favicon.ico`、`robots.txt`、需要自托管的字体或图片：

```text
public/
├── favicon.ico     → dist/favicon.ico
└── img/logo.svg    → dist/img/logo.svg
```

主题资源（CSS / JS）是另一条路径：它们放在主题的 `assets/` 下，构建后统一出现在 `site.assets`（默认 `/assets/`）。

## 摘要与阅读时长

列表页需要的摘要和阅读时长在扫描阶段就算好，不等渲染：

- **摘要**：优先用 front-matter 的 `description`；没有就取正文前 140 个字符，超出补省略号。计算时会剔除代码块、链接地址、引用式链接定义、脚注定义等噪音 —— 否则摘要里会冒出 `[home]: https://…`。
- **阅读时长**：按每分钟 350 字估算，最小 1 分钟。

两者分别暴露为 `page.excerpt` 与 `page.readTime`，主题可以直接用。

## 写作建议

- 一篇文章一个主题，标题里带清楚的关键词，`description` 写一句完整的话（它会进列表、RSS 与搜索摘要）。
- 系列文章用 `series` 串起来，`weight` 控制阅读顺序，这样 `/series/<name>/` 聚合页就是一条自然的阅读路径。
- 长文用小节切分，标题层级控制在二三级 —— 目录只收这两级，四级以下不进目录。
