---
title: 故障排查
mode: docs
layout: page
order: 71
description: 按症状定位 Xongyi 的常见问题：样式失效、板块消失、导航 404、构建报错、部署异常。
keywords: [故障排查, 报错, 调试, troubleshooting]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 故障排查

本页按**症状**组织。找到你的现象，按步骤排查。

## 页面完全没有样式（裸奔）

**症状**：网页能打开，但只有黑白文字，没有布局与配色。

{% timeline %}
{% event 第 1 步：看控制台 / 网络 / 找 404 / primary %}
浏览器 F12 → Network，筛选 404。若 `css/style.css` 是 404，说明资源路径错了。

最常见原因是站点 `_config.yml` 的 `root` 与部署路径不一致。
{% endevent %}
{% event 第 2 步：核对 root / 部署 / info %}
| 部署方式 | `url` | `root` |
| --- | --- | --- |
| 独立域名 | `https://www.example.com` | `/` |
| GitHub Pages 项目站点 | `https://user.github.io/repo` | `/repo/` |
| 子目录 | `https://example.com/org` | `/org/` |
{% endevent %}
{% event 第 3 步：重新构建 / 验证 / success %}
```bash
hexo clean && hexo generate
```

构建后检查 `public/css/style.css` 是否存在。
{% endevent %}
{% endtimeline %}

{% note tip 判断是不是路径问题 %}
直接在浏览器访问 `你的域名/css/style.css`。能打开 = 路径对（那问题在别处）；404 = 就是 `root` 配置问题。
{% endnote %}

## 某个首页板块不显示

**症状**：`sections` 里明明写了，页面却没有。

排查顺序：

1. **核对拼写** —— 板块名必须与 `layout/_partial/section-<name>.ejs` 完全一致（注意 `quicklinks` 结尾的 `s`）。
2. **检查配置节点** —— 例如 `services` 板块需要 `services.items` 有内容；空数组会渲染成空白区域。
3. **检查 `about-contact`** —— 它是合并板块，文案取自 `about` 与 `contact`，且需 `about-contact.enable` 不为 `false`。
4. **确认改的是生效配置** —— 站点覆盖文件优先于主题默认值。

```bash
# 快速核对板块名与模板文件名
ls themes/hexo-theme-xongyi/layout/_partial/section-*.ejs
```

## 导航点击 404

**症状**：点导航项跳到不存在的页面。

| 原因 | 现象 | 修复 |
| --- | --- | --- |
| 页面文件不存在 | `/about/` 404 | `hexo new page about` 生成 `source/about/index.md` |
| 页面写成了 `about.md` | 生成 `/about.html`，`/about/` 404 | 改为目录 + `index.md` |
| 链接没写全 | `/about`（无尾斜杠）在部分托管上 404 | 统一写 `/about/` |
| 菜单指向未建的目录 | 如 `/products/` 但没有该页面 | 创建页面或从 `menu` 中移除 |

## 新闻列表 / 归档为空

**症状**：`/news/` 或 `/archives/` 没有内容。

1. `source/_posts/` 下是否有文章？没有就先 `hexo new post "标题"`。
2. `/news/` 页面的 front-matter 是否有 `layout: news`？
3. 生成器是否装齐？缺 `hexo-generator-archive` 时 `/archives/` 根本不会生成：

```bash
npm i hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag
```

## 构建报错

{% tabs %}
{% tab Cannot find module 'hexo-renderer-ejs' %}
EJS 渲染器缺失：

```bash
npm i hexo-renderer-ejs
```
{% endtab %}
{% tab 首页/归档 404 或未生成 %}
生成器缺失，补装四个 generator（见上一节）。
{% endtab %}
{% tab YAML 解析错误 %}
front-matter 中的值含冒号却没加引号，例如：

```yaml
title: 合作: 新起点        # 错误
title: "合作: 新起点"      # 正确
```
{% endtab %}
{% tab 主题目录找不到 %}
`theme: hexo-theme-xongyi` 与 `themes/` 下的实际目录名不一致。用 `ls themes/` 核对，注意大小写。
{% endtab %}
{% endtabs %}

{% note tip 永远从 clean 开始 %}
排查构建类问题，第一步都是 `hexo clean && hexo generate`，先把缓存因素排除掉。
{% endnote %}

## 改了 `_config.hexo-theme-xongyi.yml` 不生效

**症状**：配置明明改了，页面还是旧的。

1. 文件名必须是 `_config.hexo-theme-xongyi.yml`，且放在**站点根目录**（与 `_config.yml` 同级）；
2. 主题名要与 `theme: hexo-theme-xongyi` 完全对应（Hexo 按主题名查找该覆盖文件）；
3. `hexo clean && hexo generate`；
4. 若 YAML 缩进错了，Hexo 可能静默忽略 —— 用在线 YAML 校验器检查一下。

{% note warning YAML 对缩进敏感 %}
用**空格**缩进（不要 Tab），同级键对齐。一个缩进错误可能导致整段配置被丢弃而不报错。
{% endnote %}

## 暗色模式 / 动画异常

| 症状 | 原因 | 处理 |
| --- | --- | --- |
| 暗色模式点了没反应 | `features.dark_mode` 被设为 `false` | 检查配置 |
| 内容一直"隐身"（不淡入） | `reveal` 动画被浏览器 / 系统禁用，或自定义 CSS 覆盖了透明度 | 关掉 `features.reveal`，或检查注入的 CSS |
| 数字统计不滚动 | `features.stats_animation: false` | 打开该开关 |
| 系统开了"减弱动态效果"后动画消失 | 主题遵循 `prefers-reduced-motion` | 预期行为，不是 bug |

{% note tip reveal 与自定义 CSS 的冲突 %}
若你的自定义 CSS 给元素设了 `opacity: 0` 之类的初始状态，可能与 `reveal` 动画叠加。排查时先临时关掉 `features.reveal`。
{% endnote %}

## 部署后与本地不一致

| 症状 | 原因 | 处理 |
| --- | --- | --- |
| 线上样式错乱 | 线上 `root` 与本地不一致 | 用 `--config _config.yml,_config.pages.generated.yml` 方式自动生成（见[一键部署](/docs/xongyi/deploy/)） |
| 主题目录为空 / 构建失败 | 主题是 submodule，CI 没拉取 | checkout 加 `submodules: recursive` |
| 新增页面线上 404 | 只推了源码没触发重新构建 | 检查 CI 是否在 `main` 上触发，或手动重新部署 |
| 图片 404 | 图片没提交（在 `.gitignore` 里）或被大文件限制 | 检查 `git status` 与仓库设置 |

## 诊断信息收集

提 Issue 前，把这些信息一并附上能大幅加快定位：

```bash
node -v
npx hexo version
cat _config.hexo-theme-xongyi.yml
ls themes/
```

并说明：**操作系统 / 本地还是线上 / 具体页面地址 / 控制台报错截图**。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/faq/, 常见问题, info, fill %}
{% endcol %}
{% col 6 %}
{% button https://github.com/xfm0797/hexo-theme-xongyi/issues, 提交 Issue, github, outline %}
{% endcol %}
{% endrow %}
