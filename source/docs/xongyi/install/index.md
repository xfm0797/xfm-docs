---
title: 安装与部署
mode: docs
layout: page
order: 2
description: 安装 Xongyi 主题、补齐依赖插件、启用主题并掌握站点级配置覆盖的正确姿势。
keywords: [Hexo 安装, 主题安装, 依赖, 覆盖配置, 升级]
date: 2026-10-11 22:20:00
updated: 2026-10-11 22:20:00
---

# 安装与部署

## 环境要求

| 项目 | 要求 |
| --- | --- |
| Hexo | 7.x（推荐） |
| Node.js | >= 18 |
| 渲染器 | `hexo-renderer-ejs`（**必需**）、`hexo-renderer-marked`（或其它 Markdown 渲染器） |
| 生成器 | `hexo-generator-index`、`hexo-generator-archive`、`hexo-generator-category`、`hexo-generator-tag` |

{% note warning Hexo 7 不自带生成器 %}
上述四个生成器**不在** Hexo 7 核心中。如果你是用 `hexo init` 建站，默认站点已经包含；如果是手动搭的站点，缺首页或归档页时请补装：

```bash
npm i hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag
```
{% endnote %}

## 安装主题

{% tabs %}
{% tab Git 安装（推荐） active %}
在 Hexo 站点根目录执行：

```bash
git clone https://github.com/xfm0797/hexo-theme-xongyi.git themes/hexo-theme-xongyi
```

好处是可以随时 `git pull` 获取更新。
{% endtab %}
{% tab 下载解压 %}
从 [Releases](https://github.com/xfm0797/hexo-theme-xongyi/releases) 或仓库 `Code → Download ZIP` 下载后，解压到站点的 `themes/hexo-theme-xongyi/` 目录。

{% note warning 解压位置 %}
仓库根目录即主题本体，解压后请确认 `themes/hexo-theme-xongyi/_config.yml`、`layout/`、`source/` 直接位于该目录下（**不要多套一层目录**）。
{% endnote %}
{% endtab %}
{% tab 作为 submodule 引入 %}
适合把站点也托管在 Git 上的场景，主题版本随主仓库一起锁定：

```bash
git submodule add https://github.com/xfm0797/hexo-theme-xongyi.git themes/hexo-theme-xongyi
```

克隆站点时记得带上子模块：

```bash
git clone --recurse-submodules <你的站点仓库>
# 已经克隆过的仓库补拉：
git submodule update --init --recursive
```

升级主题：

```bash
git submodule update --remote themes/hexo-theme-xongyi
```
{% endtab %}
{% endtabs %}

## 启用主题

编辑站点根目录 `_config.yml`：

```yaml
theme: hexo-theme-xongyi
```

然后本地预览：

```bash
hexo clean && hexo server
```

打开 `http://localhost:4000`，应能看到 Xongyi 的默认企业版首页。

## 依赖插件（可选）

主题本身不依赖任何额外插件，但下面这些能显著改善官网体验：

| 插件 | 作用 | 建议 |
| --- | --- | --- |
| `hexo-generator-sitemap` | 生成 `sitemap.xml` | 强烈建议 |
| `hexo-generator-feed` | 生成 RSS（`/atom.xml`） | 新闻动态场景建议 |
| `hexo-renderer-marked` | Markdown 渲染 | 必装 |
| `hexo-server` | 本地预览服务 | 必装 |

```bash
npm i hexo-generator-sitemap hexo-generator-feed
```

## 推荐做法：站点级覆盖配置

**不要**在主题目录里直接改 `_config.yml`。正确姿势是在**站点根目录**新建 `_config.hexo-theme-xongyi.yml`，只写你要覆盖的键 —— Hexo 会把它与主题默认配置**深度合并**：

```yaml
# 站点根目录 _config.hexo-theme-xongyi.yml
preset: government

brand:
  name: "XX市政务服务网"
  slogan: "为民服务 · 便捷高效"

contact:
  phone: "400-000-0000"
  email: "hello@example.com"
```

{% note tip 深度合并的好处 %}
- 只需写**与默认值不同**的键，未涉及的配置自动沿用主题默认值；
- `git pull` 升级主题时，你的自定义内容完全不会丢失；
- 一份覆盖文件即"站点档案"，迁移与备份都更方便。
{% endnote %}

## 配置生效优先级

```text
站点 _config.hexo-theme-xongyi.yml   ← 最高（你写的覆盖）
        ↓ 深合并
主题 themes/hexo-theme-xongyi/_config.yml   ← 默认值（勿直接改）
```

{% note info 重新构建 %}
YAML 配置在 `hexo generate` 时读取。改完配置若页面没变化，先 `hexo clean` 再 `hexo generate`，排除缓存干扰。
{% endnote %}

## 升级主题

{% tabs %}
{% tab Git 安装 %}
```bash
cd themes/hexo-theme-xongyi
git pull
cd ../..
hexo clean && hexo generate
```
{% endtab %}
{% tab submodule %}
```bash
git submodule update --remote themes/hexo-theme-xongyi
hexo clean && hexo generate
```
{% endtab %}
{% endtabs %}

只要自定义都写在站点根的 `_config.hexo-theme-xongyi.yml`，升级不会影响你的内容。

## 懒得配置？直接用演示站

[hexo-theme-xongyi-demo](https://github.com/xfm0797/hexo-theme-xongyi-demo) 是配好一切的完整站点（主题以 submodule 引入 + 演示内容 + 五大平台部署配置），Fork 后一键部署即可。详见[一键部署](/docs/xongyi/deploy/)。

## 下一步

{% row %}
{% col 6 %}
{% button /docs/xongyi/quick-start/, 5 分钟上手, arrow-right, fill %}
{% endcol %}
{% col 6 %}
{% button /docs/xongyi/preset/, 切换预设布局, layers, outline %}
{% endcol %}
{% endrow %}
