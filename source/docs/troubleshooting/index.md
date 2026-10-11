---
mode: docs

title: 故障排查
date: 2026-10-11 09:00:00
updated: 2026-10-11 09:00:00
description: 按症状定位 XFM 主题的常见问题：样式失效、侧边栏为空、搜索无结果、档位异常、构建报错。
keywords: [故障排查, 报错, 调试, troubleshooting]
order: 71
---

# 故障排查

本页按**症状**组织。找到你的现象，按步骤排查。

## 第一步永远是它

```bash
hexo clean && hexo g && hexo s
```

**`hexo clean` 能解决大约一半的问题**，原因有三：

1. 主题的档位样式是**构建期生成**的，配置改动不会自动重建
2. 站点的 `public/` 会残留上次构建的旧文件
3. Hexo 的模板缓存会保留已删除的 partial

{% note info 浏览器缓存也要清 %}
改完之后在浏览器里用 `Ctrl/Cmd + Shift + R` 强制刷新，或打开开发者工具勾选"禁用缓存"。CSS/JS 的文件名不含 hash，普通刷新可能仍拿旧文件。
{% endnote %}

## 症状索引

| 症状 | 跳到 |
| --- | --- |
| 页面完全没样式，像纯文本 | [样式完全失效](#样式完全失效) |
| 主题没生效，还是默认主题的样子 | [主题未生效](#主题未生效) |
| 改了配置没变化 | [配置改动不生效](#配置改动不生效) |
| 文档模式左侧栏空的 | [文档侧边栏为空](#文档侧边栏为空) |
| 点侧栏链接跳到首页 / 不高亮 | [侧栏链接点击异常](#侧栏链接点击异常) |
| 搜索打不开或没结果 | [搜索异常](#搜索异常) |
| 手机上布局不对 | [档位与响应异常](#档位与响应异常) |
| 构建报错 | [构建报错](#构建报错) |
| 评论不显示 | [评论不显示](#评论不显示) |
| 数学公式 / 图表没渲染 | [公式与图表](#公式与图表) |

## 样式完全失效

**现象**：页面能打开，但没有任何样式，像一份纯文本文件。

**排查顺序**：

{% timeline %}
{% event 检查 theme 配置 / 第 1 步 / warning %}
站点 `_config.yml` 里 `theme:` 的值必须与 `themes/` 下的**目录名**完全一致。

```bash
ls themes/                 # 应看到 xfm 或你自定义的名字
```

```yaml
theme: xfm                 # 必须与目录名一致
```
{% endevent %}
{% event 检查文件是否真的存在 / 第 2 步 / warning %}
```bash
ls themes/xfm/source/css/  # 应有 variables.css、base.css 等 7 个文件
```

若为空或报错"目录不存在"，说明主题被放到了错误的层级——常见错误是 `themes/xfm/xfm/...` 多套了一层目录。
{% endevent %}
{% event 检查构建产物 / 第 3 步 / info %}
```bash
ls public/css/             # 应有主题的 CSS 文件
```

若 `public/css/` 里没有主题文件，说明 Hexo 没识别到主题目录，回到第 1 步。
{% endevent %}
{% event 检查根路径 / 第 4 步 / info %}
部署在子目录时，`root` 必须配套：

```yaml
url: https://example.com/docs
root: /docs/
```

本地预览子目录场景：`hexo s --root /docs/`
{% endevent %}
{% endtimeline %}

## 主题未生效

**现象**：站点能构建，但看起来是 Hexo 默认主题（landscape）的样式。

大概率是 **`theme` 配置指向了不存在的目录，Hexo 静默回退到了默认主题**。

```yaml
# 站点 _config.yml
theme: xfm
```

同时检查：站点根目录下是否还有 `_config.landscape.yml` 之类的旧配置残留、`themes/` 下是否有多个目录但名字不匹配。

## 配置改动不生效

{% tabs %}
<!-- tab 改了 adaptive 但档位没变 -->
**这是最常见的一类。** 档位样式在**构建期**由 `layout/_partials/adaptive-style.ejs` 按配置生成，因此：

```bash
hexo clean          # 必须执行
hexo g
```

只在 `hexo s` 下热改配置是**不会**重建档位样式的。
<!-- endtab -->
<!-- tab 改了主题配置，被站点配置覆盖了 -->
配置优先级：

```text
主题默认值  <  themes/xfm/_config.yml  <  站点 _config.yml 的 theme_config
```

检查站点 `_config.yml` 里是否已有 `theme_config` 块，它可能覆盖了你改的项。

```yaml
# 站点 _config.yml
theme_config:
  appearance:
    primary: "#ff6b6b"     # ← 这一行会覆盖主题配置里的 primary
```
<!-- endtab -->
<!-- tab 布尔值写了字符串 -->
YAML 里 `false` 加引号会变成**非空字符串**，在 JS 里是**真值**：

```yaml
toc: "false"      # ❌ 实际被当作 true
toc: false        # ✅
```

主题内部的 `bool()` 归一化对 `'false'` 字符串做了特殊处理，但**并非所有配置项都走了这条路径**。稳妥起见：布尔值不加引号。
<!-- endtab -->
<!-- tab 颜色值没加引号 -->
```yaml
primary: #4f6bed      # ❌ "#" 是 YAML 注释符，值变成 null
primary: "#4f6bed"    # ✅
```
<!-- endtab -->
{% endtabs %}

## 文档侧边栏为空

**现象**：`mode: docs` 下，左侧栏显示"暂无文档目录"或完全空白。

{% tabs %}
<!-- tab 数据文件不存在或位置错 -->
正确的路径是**站点**的 `source/_data/docs.yml`：

```bash
ls source/_data/docs.yml
```

常见错误：

| 错误位置 | 问题 |
| --- | --- |
| `themes/xfm/source/_data/docs.yml` | 放在了主题里，不会被读取 |
| `source/_data/docs.yaml` | 扩展名必须是 `.yml` |
| `source/data/docs.yml` | 少了 `_` 前缀 |
<!-- endtab -->
<!-- tab YAML 语法错误 -->
用一个 YAML 校验器检查，或直接看 `hexo g` 的输出有没有解析警告。最常见的三个错误：

```yaml
# ❌ 用了 Tab 缩进
- title: 快速开始
	children:              # Tab 缩进

# ❌ path 少了前导斜杠
    - title: 简介
      path: docs/intro/    # 应为 /docs/intro/

# ❌ 中英文冒号混用
- title：快速开始          # 中文全角冒号
```
<!-- endtab -->
<!-- tab 树里的 path 与页面 URL 不匹配 -->
侧边栏有内容但**点击后跳到首页**，说明 `path` 与实际 URL 不一致。

```bash
# 确认页面的真实 URL
ls source/docs/intro/index.md     # → URL 为 /docs/intro/
```

```yaml
# docs.yml 里必须一致
- title: 主题简介
  path: /docs/intro/              # ✅
```

尾部的 `/` 会被归一化（有无均可），但**目录名拼写、前缀缺失会导致失配**。
<!-- endtab -->
<!-- tab 页面没有 title -->
当 `docs.yml` 不存在、主题自动生成侧边栏时，**没有 `title` 的页面不会出现**。给每篇文档补上：

```yaml
---
title: 主题简介
order: 1
---
```
<!-- endtab -->
{% endtabs %}

## 侧栏链接点击异常

**现象**：侧边栏能显示，但点击后跳到首页，或当前项不高亮。

**根因**：`docs.yml` 的 `path` 与页面的实际 URL 归一化后不相等。

**定位方法**：

{% note tip 用浏览器开发者工具看一眼 %}
1. 打开一个文档页，在控制台执行：
```js
document.body.className
```
若包含 `side-nav-sticky` / `side-nav-offcanvas`，说明文档模式已识别。

2. 在 Elements 面板找到侧栏链接，看它的 `href`：
```html
<a class="xfm-nav-link" href="/docs/intro/">主题简介</a>
```
3. 对比浏览器地址栏的路径。**两者去掉 `index.html` 与首尾斜杠后应完全一致。**
{% endnote %}

路径归一化规则（`normalizePath`）：

```text
/docs/intro/index.html   →  /docs/intro/
docs/intro/              →  /docs/intro/
/docs/intro              →  /docs/intro/
```

因此尾斜杠与 `index.html` 都不影响匹配，**但拼写错误不行**。

## 搜索异常

{% tabs %}
<!-- tab 打开搜索面板报"索引加载失败" -->
`/search.json` 请求 404。确认索引已生成：

```bash
hexo clean && hexo g
ls public/search.json
```

若文件不存在，检查：

```yaml
search:
  enable: true        # 关闭时不生成索引
```

以及站点根目录 `package.json` 是否包含 `hexo` 字段——**没有这个字段，Hexo 不会加载主题的生成器**：

```json
{
  "hexo": {
    "version": "8.0.0"
  }
}
```
<!-- endtab -->
<!-- tab 面板打开了但搜不到内容 -->
按顺序检查：

1. 索引里**有**你搜的内容吗？

```bash
# 直接在索引文件里搜关键词
grep -o '关键词' public/search.json | head
```

2. 没有 → 内容可能落在 `search.content_length` 之外（正文后半段不索引），或该页面**没有 `title`**
3. 有 → 前端脚本未加载，检查 `search.js` 是否 404
<!-- endtab -->
<!-- tab Ctrl+K 没反应 -->
快捷键由 `core.js` 全局监听。可能原因：

- 当前档位下搜索被 `disable: [search]` 之类配置隐藏（搜索没有单独的 disable 键，但 `search.enable: false` 会移除入口）
- 浏览器扩展占用了 `Ctrl+K`（某些浏览器把 `Ctrl+K` 绑定为地址栏搜索）
- 焦点在输入框内——主题的监听仍然有效，但部分扩展会拦截

试试直接用导航栏的 🔍 按钮。
<!-- endtab -->
{% endtabs %}

## 档位与响应异常

{% tabs %}
<!-- tab 手机上还是桌面布局 -->
{% note warning 检查是否被"手动档位"锁住 %}
浏览器曾在 `localStorage` 里写下 `xfm-tier`，会覆盖自动探测。**在控制台执行**：

```js
localStorage.removeItem('xfm-tier');
location.reload();
```

或者：

```js
XFM.adaptive.clearTier();
```
{% endnote %}

若清掉后仍不对，检查配置：

```yaml
adaptive:
  enable: true             # 关了会恒定使用 default_tier
  strategy: adaptive       # fixed 会锁定单档
  default_tier: desktop
```
<!-- endtab -->
<!-- tab 想验证某一档的样子 -->
三种方式：

```text
① URL 参数（临时，不改任何状态）
   https://example.com/any-page/?__tier=mobile

② 控制台 API（会写入 localStorage 若 remember 为 true）
   XFM.adaptive.setTier('tablet')

③ 锁定整站
   adaptive:
     strategy: fixed
     default_tier: mobile
```

推荐用 **① URL 参数**——不留下持久状态，适合截图与调试。
<!-- endtab -->
<!-- tab 缩小窗口档位不变 -->
这是**预期行为**。`strategy: adaptive` 时，UA 判定优先于宽度：桌面浏览器即使窗口缩到 400px，UA 仍非移动设备，会按宽度降档；但**手机浏览器**无论窗口多宽都会被 UA 判定为 mobile。

想让它像传统响应式一样只看宽度：

```yaml
adaptive:
  strategy: responsive
```
<!-- endtab -->
<!-- tab 平板被识别成桌面档 -->
```yaml
adaptive:
  detect:
    upgrade_large_screen: false   # 大屏平板不升级为桌面档
```
<!-- endtab %}
{% endtabs %}

## 构建报错

{% tabs %}
<!-- tab Cannot find module 'hexo-renderer-xxx' -->
Hexo 8 起核心不再内置渲染器。在**站点根目录**安装：

```bash
npm i hexo-renderer-marked hexo-renderer-ejs
```
<!-- endtab -->
<!-- tab YAMLException: bad indentation -->
配置或 front-matter 的 YAML 缩进错误。**只能用空格，不能用 Tab**。用编辑器的"显示不可见字符"功能检查。

front-matter 的常见触发点：

```yaml
---
title: 主题: 配置          # ❌ 冒号后的空格会被解析为映射
title: "主题: 配置"        # ✅
---
```
<!-- endtab -->
<!-- tab 缺少 hexo 字段的警告 -->
```
ERROR Package.json does not contain a "hexo" field
```

站点根目录 `package.json` 缺少 `hexo` 字段，导致**主题的生成器与过滤器不会被加载**（表现为：无 sitemap、无搜索索引、无 404 页）。

```json
{
  "name": "hexo-site",
  "version": "0.0.0",
  "hexo": {
    "version": "8.0.0"
  }
}
```
<!-- endtab -->
<!-- tab 提示找不到模板 / partial -->
通常是主题目录结构不完整。对照检查：

```bash
ls themes/xfm/layout/
ls themes/xfm/layout/_partials/
```

用 `git clone` 安装时若中断过，重新克隆：
```bash
rm -rf themes/xfm && git clone https://github.com/xfm0797/hexo-theme-xfm.git themes/xfm
```
<!-- endtab -->
{% endtabs %}

## 评论不显示

{% tabs %}
<!-- tab 一直显示"加载中" -->
1. 确认 `comments.enable: true`
2. **临时关掉懒加载**再刷新：`comments.lazyload: false`——若此时能显示，说明滚动触发有问题
3. 打开控制台看是否有外部脚本加载失败（网络原因最常见）
4. 确认该页 front-matter 没有 `comments: false`
5. 确认当前档位没有在 `disable` 里包含 `comments`
<!-- endtab -->
<!-- tab 提示"配置不完整" -->
主题在初始化前做了必填校验。逐个核对：

| 类型 | 必填 |
| --- | --- |
| giscus | `repo`、`repo_id`、`category_id` |
| utterances | `repo` |
| waline | `server_url` |
| twikoo | `env_id` |
| disqus | `shortname` |
| disqusjs | `shortname`、`apikey` |
| 畅言 | `appid`、`conf` |
| valine | `appid`、`appkey` |
<!-- endtab %}
<!-- tab giscus 显示空白框 -->
giscus 的三个前置条件缺一不可：

1. 仓库**公开**
2. 已安装 **giscus GitHub App**
3. 已在仓库创建对应的 **Discussions 分类**

到 [giscus.app](https://giscus.app/) 重新生成配置，核对 `repo_id` 与 `category_id` 是否复制完整（这两串较长，容易漏字符）。
<!-- endtab -->
{% endtabs %}

## 公式与图表

{% tabs %}
<!-- tab 数学公式没渲染 -->
1. 确认 `vendors.math` 不是 `none`
2. 确认 `vendors.math_auto_render: true`
3. **确认 CDN 可访问**——公式库从 jsDelivr 加载，网络受限时不会渲染
4. 检查语法：Markdown 里下划线 `_` 可能被当作斜体标记

```text
风险写法：$a_1 + a_2$
安全写法：$a\_1 + a\_2$
```

5. 查看控制台是否有 KaTeX 的 `ParseError`
<!-- endtab -->
<!-- tab Mermaid 图表不显示 -->
1. 确认 `vendors.mermaid: true`
2. 打开控制台，看是否有动态 `import()` 失败（同样是 CDN 可达性问题）
3. 检查语法：第一行必须直接是声明语句，**不能有空行**

```text
graph LR          ← 第一行必须是这个

  A --> B
```

4. 节点文字含 `:` `()` `,` 时用引号包裹：`A["标签: 说明"]`
5. 主题的 Mermaid 渲染在 `DOMContentLoaded` 时触发，**若你的内容由 JS 动态插入，图表不会被自动渲染**——需手动调用：

```js
await window.__xfmLoadMermaid();
```
<!-- endtab -->
{% endtabs %}

## 还是不行？

收集以下信息后到仓库提 issue：

{% note info 提 issue 时请附上 %}
1. **现象**：期望什么、实际什么
2. **复现步骤**：从 `hexo clean` 开始的最小复现路径
3. **环境**：`node -v`、`npx hexo version` 的输出
4. **配置**：相关的 `_config.yml` 片段（隐去敏感信息）
5. **控制台输出**：浏览器控制台的完整报错（含堆栈）
6. **构建日志**：`hexo g` 的完整输出
{% endnote %}

{% button https://github.com/xfm0797/hexo-theme-xfm/issues, 提交 Issue, github, fill %}
{% button /docs/faq/, 回到常见问题, arrow-left, outline %}
