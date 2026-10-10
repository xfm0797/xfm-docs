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
├── _data/docs.yml          # 文档侧栏树（两级：主题 → 页面）
├── docs/
│   ├── index.md            # 文档中心
│   ├── xfm/                # hexo-theme-xfm 文档（8 篇）
│   │   ├── index.md        #   主题简介
│   │   ├── install/        #   安装部署
│   │   ├── mode/           #   三种模式
│   │   ├── adaptive/       #   自适应式响应
│   │   ├── config/         #   核心配置
│   │   ├── tags/           #   标签插件
│   │   ├── front-matter/   #   Front-matter
│   │   └── faq/            #   常见问题
│   └── xongyi/             # hexo-theme-xongyi 文档（8 篇）
│       ├── index.md        #   主题简介
│       ├── install/        #   安装部署
│       ├── preset/         #   预设布局
│       ├── sections/       #   首页板块
│       ├── config/         #   配置项详解
│       ├── writing/        #   写新闻与内容
│       ├── deploy/         #   一键部署
│       └── faq/            #   常见问题
├── about/                  # 关于本站
├── _posts/                 # 站点动态
└── ...
themes/xfm/                 # hexo-theme-xfm 主题（git submodule → 官方仓库）
```

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
