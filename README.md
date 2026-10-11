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
│   └── xongyi/             # hexo-theme-xongyi 文档（8 篇）→ /docs/xongyi/*
│       ├── index.md        #   主题简介
│       ├── install/        #   安装部署
│       ├── preset/         #   预设布局
│       ├── sections/       #   首页板块
│       ├── config/         #   配置项详解
│       ├── writing/        #   写新闻与内容
│       ├── deploy/         #   一键部署
│       └── faq/            #   常见问题
├── js/xfm-tabs.js          # 站点级补丁：{% tabs %} 切换（主题 core.js 未内置）
├── about/                  # 关于本站
├── _posts/                 # 站点动态
└── ...
themes/xfm/                 # hexo-theme-xfm 主题（git submodule → 官方仓库）
```

## 启用能力

| 能力 | 配置 | 说明 |
| --- | --- | --- |
| RSS 订阅 | `feed`（插件 `hexo-generator-feed`）+ 主题 `vendors.rss_navbar` | 产出 `/atom.xml`，导航栏显示 RSS 入口 |
| 编辑此页 | 主题 `docs.edit_link` + `docs.edit_base` | 文档页底部链接到 `edit_base + page.source` |
| 评论 | 主题 `comments`（`type: waline`） | 服务端 `https://waline.xfm.qzz.io` |
| 社交邮箱 | 主题 `social.email` | `xfm@xfm.qzz.io` |

> 注：主题 `core.js` 未内置 `{% tabs %}` 的切换逻辑，且 Waline 配置会原样透传给 `@waline/client`（v2 需驼峰 `serverURL`）。这两处均由**站点层**规避（补丁脚本 + 正确键名），不改动主题仓库。


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
