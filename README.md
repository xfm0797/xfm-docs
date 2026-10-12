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
├── about/                  # 关于本站
├── _posts/                 # 站点动态
└── ...
themes/xfm/                 # hexo-theme-xfm 主题（git submodule → 官方仓库）
```

## 文档侧栏的展开行为

文档树的分组（`hexo-theme-xfm` / `hexo-theme-xongyi` 及其下的各章节）**默认收起，点击展开**：

自主题 **v1.1.0** 起，这一行为由主题原生配置提供，`_config.yml` 里只有两行：

```yaml
docs:
  expanded: false      # 默认收起全部分支
  auto_expand: true    # 只自动展开当前页所在的那条分支
```

- **收起态由主题 CSS 决定**：`.xfm-nav-item.has-children:not(.is-open) > .xfm-nav-list { display: none }`，无 JS 也不会闪开；
- **展开 / 收起由主题 `core.js`** 接管（点击 `.xfm-nav-toggle` 或整行标签，支持 Enter / Space，同步 `aria-expanded`）；
- 规则基于 `.has-children` 通用判断，**后续新增的文档分组自动生效**，无需逐页配置。

> 在这之前（主题 ≤ v1.0.0）这里由站点级 CSS/JS 补丁实现；主题修复后已全部移除，详见 `.workbuddy/memory/site-patches.md`。


## 启用能力

| 能力 | 配置 | 说明 |
| --- | --- | --- |
| RSS 订阅 | `feed`（插件 `hexo-generator-feed`）+ 主题 `vendors.rss_navbar` | 产出 `/atom.xml`，导航栏显示 RSS 入口 |
| 编辑此页 | 主题 `docs.edit_link` + `docs.edit_base` | 文档页底部链接到 `edit_base + page.source` |
| 评论 | 主题 `comments`（`type: waline`） | 服务端 `https://waline.xfm.qzz.io` |
| 社交邮箱 | 主题 `social.email` | `xfm@xfm.qzz.io` |
| 文档树折叠 | 主题 `docs.expanded` / `docs.auto_expand` | 默认收起、点击展开，当前页分支自动展开 |
| 笔记收录范围 | 主题 `notes.note_categories` / `note_tags` | 左侧笔记侧栏只收录「更新日志」分类 |
| 菜单顺序 | 主题 `menu_order` | 显式声明顺序，绕开 `deepMerge` 追加到末尾的行为 |

> 上述能力在主题 ≤ v1.0.0 时需靠站点层规避（补丁脚本 + 样式）。主题 **v1.1.0** 已把它们全部做成原生配置，对应补丁已删除；后续若再有需要，可经 `_config.yml` 的 `theme_config.custom.css / custom.js` 注入（资源放 `source/css/`、`source/js/`）。
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
