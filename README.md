# xfm-docs

**XFM 开源官方文档** —— 收录两套由 [XFM](https://github.com/xfm0797) 开发并开源的 Hexo 主题的官方技术文档。

| 主题 | 定位 | 源码 |
| --- | --- | --- |
| [hexo-theme-xfm](https://github.com/xfm0797/hexo-theme-xfm) | 高端大气的三模式主题（博客 / 笔记 / 文档） | Git submodule → `themes/xfm` |
| [hexo-theme-xongyi](https://github.com/xfm0797/hexo-theme-xongyi) | 面向机构官网的通用主题（企业 / 政务 / 教育） | 独立仓库 |

> 本站由 **hexo-theme-xfm** 的 `docs` 模式驱动，使用 Hexo 8 构建。
> 主题通过 **git submodule** 引用官方仓库 `themes/xfm`，仓库内不存放主题源码，构建时按 `.gitmodules` 检出即可。

## 文档结构

```
source/
├── _data/docs.yml          # 文档侧栏树（按主题分区，可递归到三级）
├── docs/
│   ├── index.md            # 文档中心（两套主题总入口）
│   ├── xfm/                # hexo-theme-xfm 文档（28 篇）→ /docs/xfm/*
│   │   ├── index.md        #   文档首页
│   │   ├── intro/          #   快速开始 · 主题简介
│   │   ├── install/        #   快速开始 · 安装与部署
│   │   ├── quick-start/    #   快速开始 · 5 分钟上手
│   │   ├── config*/        #   配置参考（总览 / 外观 / 导航 / 首页 / 侧栏）
│   │   ├── mode-*/         #   三种模式（blog / notes / docs）
│   │   ├── adaptive*/      #   自适应式响应
│   │   ├── tags*/          #   标签插件
│   │   ├── search|comments|vendors|seo/   # 扩展能力
│   │   ├── customize|front-matter|api-structure/  # 定制与进阶
│   │   └── faq|troubleshooting/           # 帮助
│   └── xongyi/             # hexo-theme-xongyi 文档（21 篇）→ /docs/xongyi/*
│       ├── index.md        #   文档首页
│       ├── intro|install|quick-start/              # 快速开始
│       ├── preset|preset-examples/                 # 预设布局
│       ├── sections|sections-config/               # 首页板块
│       ├── config|config-brand-nav|config-contact|config-footer|config-features/  # 配置参考
│       ├── writing|front-matter/                   # 内容与新闻
│       ├── icons|customize|structure/              # 定制与进阶
│       ├── deploy/                                 # 部署
│       └── faq|troubleshooting/                    # 帮助
├── css/xfm-docs-tree.css   # 站点级补丁：文档树分组默认收起 + 箭头样式
├── js/xfm-tabs.js          # 站点级补丁：{% tabs %} 切换（主题 core.js 未内置）
├── js/xfm-docs-tree.js     # 站点级补丁：文档树分组点击展开 / 收起
├── about/                  # 关于本站
├── _posts/                 # 站点动态
└── ...
themes/xfm/                 # hexo-theme-xfm 主题（git submodule → 官方仓库）
```

## 文档侧栏的展开行为

文档树的分组（`hexo-theme-xfm` / `hexo-theme-xongyi` 及其下的各章节）**默认收起，点击展开**：

- **服务端**已把「当前页所在分支」的各级祖先标记为 `is-open`，因此默认只展开你正在阅读的那条路径，其余一律收起（无 JS 也不会闪开）；
- `source/css/xfm-docs-tree.css` 负责收起态与箭头样式，`source/js/xfm-docs-tree.js` 负责点击（标签整行或箭头）与键盘切换；
- 规则基于 `.has-children` 通用判断，**后续新增的文档分组自动生效**，无需逐页配置。


## 启用能力

| 能力 | 配置 | 说明 |
| --- | --- | --- |
| RSS 订阅 | `feed`（插件 `hexo-generator-feed`）+ 主题 `vendors.rss_navbar` | 产出 `/atom.xml`，导航栏显示 RSS 入口 |
| 编辑此页 | 主题 `docs.edit_link` + `docs.edit_base` | 文档页底部链接到 `edit_base + page.source` |
| 评论 | 主题 `comments`（`type: waline`） | 服务端 `https://waline.xfm.qzz.io` |
| 社交邮箱 | 主题 `social.email` | `xfm@xfm.qzz.io` |
| 文档树折叠 | 主题 `custom.css` / `custom.js` | 分组默认收起、点击展开，当前页分支自动展开 |

> 注：主题 `core.js` 未内置 `{% tabs %}` 的切换逻辑，也未给 docs 侧栏的 `.xfm-nav-toggle` 绑定任何点击处理（箭头还没有样式）。这两处均由**站点层**规避（补丁脚本 + 样式），不改动主题仓库。
>
> 另：Waline 配置会被原样透传给 `@waline/client`，而 v2 的必填项是**驼峰 `serverURL`**（主题自带的 `server_url` 对 v2 无效），因此站点配置里使用 `waline.serverURL`。


## 本地开发

```bash
# 首次克隆需带上主题子模块（或克隆后执行 git submodule update --init --recursive）
git clone --recurse-submodules https://github.com/xfm0797/xfm-docs.git
cd xfm-docs

npm install
hexo clean
hexo server          # http://localhost:4000
```

## 构建

```bash
hexo generate        # 产物输出到 public/
```

## 说明

- 文档内容由各主题仓库的 `README.md`、`_config.yml` 与 `examples/` 示例配置解析整理而成，与源码保持同步。
- 主题配置采用站点级覆盖：站点 `_config.yml` 的 `theme_config` 覆盖主题自带同名键，便于主题升级。

## License

[MIT](https://github.com/xfm0797/hexo-theme-xfm/blob/main/LICENSE) © 2026 XFM
