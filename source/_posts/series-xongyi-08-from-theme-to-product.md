---
title: 从零造一个机构官网主题（八）：从主题到产品——仓库改造、演示站与真实落地
date: 2026-10-15 23:30:00
updated: 2026-10-15 23:30:00
categories: [主题开发]
tags: [Hexo, 开源, 产品, 主题开发]
description: 收官篇：仓库从「完整站点」改造为「官方主题仓库」的全过程与取舍、演示站与真实客户站的落地方式、文档站接入，以及机构主题与博客主题的方法论差异。
---

前七篇把主题做出来了。这一篇讲**怎么把它变成别人能用的产品**：仓库形态改造、演示站怎么用、真实客户站怎么落，以及我做完两套主题后总结的方法论差异。

<!-- more -->

## 一、仓库形态改造：两次折腾

### 起点：完整站点 + 内嵌主题

```
hexo-theme-xongyi/
├─ _config.yml        # 站点配置
├─ source/            # 示例内容
└─ themes/xongyi/     # 主题本体
```

目的是「导入即部署」。

### 第一次改造：符合官方命名

```bash
git mv themes/xongyi themes/hexo-theme-xongyi
```

{% note tip 用 git mv 而不是 mv %}
`git mv` 会让 Git 记录为「重命名」而不是「删除 + 新增」，**保留文件历史**。以后 `git log --follow` 还能追到改动来源。
{% endnote %}

改名的收益不只是规范：站点根目录的覆盖文件名是 `_config.<主题目录名>.yml`，目录名不规范，覆盖机制就别扭。

### 终态：官方主题仓库（根目录即主题本体）

```
hexo-theme-xongyi/
├─ _config.yml    layout/    scripts/    source/    languages/
├─ examples/      # 预设示例配置
└─ docs/preview/  # 三套预设预览图
```

这样 `git clone ... themes/hexo-theme-xongyi` 就能直接用。

{% note info 为什么最终还是拆成两个仓库 %}
「导入即部署」和「作为主题被集成」是两种用法，**一个仓库做不好两件事**：

- `hexo-theme-xongyi` —— 纯主题，给要集成的人；
- `hexo-theme-xongyi-demo` —— 完整站点（含示例内容 + 五平台部署配置），给想一键部署的人。

演示站用 **git submodule** 引入主题，配置只写差异：

```yaml
# _config.hexo-theme-xongyi.yml
brand:
  name: "Xongyi 演示站"
footer:
  copyright: "© 2026 Xongyi 演示站 · 保留所有权利"
```

于是「升级主题」变成 `git submodule update --remote`，**站点自己的配置一行都不丢**。
{% endnote %}

## 二、README 重写：从「项目说明」到「产品说明书」

最后一件事是把 README 重写成官方主题的样子。顺序按**用户的使用路径**排：

1. 徽章（License / Hexo / Node / Demo）
2. **预设预览图**（三张并排，第一眼就知道长什么样）
3. 特性一览（用 emoji 分条，扫读友好）
4. 安装（三种方式：git clone / 下载 / submodule）
5. 配置（指向 `_config.yml`）
6. 部署（五个平台）
7. 许可证

{% note warning 预览图必须进仓库 %}
README 用相对路径引用 `docs/preview/*.png`，所以图片**必须提交进仓库**——否则 npm 页面和第三方镜像上全是裂图。

代价是仓库变大（三张全页 PNG），但换来的是「任何地方看到的 README 都是完整的」。
{% endnote %}

## 三、真实落地：客户站怎么建

以落地的企业站（雄亿检测仪器）为例，它的结构是：

```
cn.xongyi.com/
├─ _config.yml                    # 站点配置（url / title / theme）
├─ source/                        # 客户内容：新闻、页面、图片
├─ themes/hexo-theme-xongyi/      # 主题（submodule）
└─ package.json                   # 含 build 脚本
```

客户侧的改动被限制在两处：

1. **`source/`**：写新闻、写页面；
2. **`_config.yml`**：改品牌、导航、文案、联系方式。

**主题目录一个字都不改。** 这是整个架构最重要的约束——一旦客户改了主题内部，下次升级就是冲突地狱。

{% note danger 交付时说清楚这条 %}
我会在交付文档里写明：**主题目录请勿修改，需要调整请联系我或改站点配置**。

否则客户会找人「顺手改一下主题」，几个月后就没人敢升级了。
{% endnote %}

## 四、文档站：让主题有地方被查

主题文档接入了统一文档站（`/docs/xongyi/`，21 篇），分组为：快速开始 / 预设布局 / 首页板块 / 配置参考 / 内容与新闻 / 定制与进阶 / 部署 / 帮助。

{% note tip 文档和代码同源的好处 %}
文档站本身就是用 Hexo + 主题构建的，文档的**每一条配置都能在 `_config.yml` 里找到**。写文档时我会对着配置文件逐项核对，而不是凭记忆——这样顺带能发现「声明了但没接线」的死配置。
{% endnote %}

## 五、还没做完的事

诚实列出待办，它们也是下一步的方向：

1. **发布到 npm**：目前只能 git 安装，`npm install hexo-theme-xongyi` 还不可用；
2. **GitHub topic**：仓库需要加 `hexo-theme` 标签才会被 hexo.io 主题市场收录（这一步必须手动在仓库设置里做）；
3. **更多预设**：医疗、园区、协会等，按第二篇的方法扩展成本很低。

## 六、两套主题做下来，最大的认知差

{% row %}
{% col 6 %}
**博客主题（xfm）**

- 用户是开发者，能改代码
- 形态差异大（blog / notes / docs）
- 配置项越多越好（743 行）
- 自己用，迭代快
{% endcol %}
{% col 6 %}
**机构主题（xongyi）**

- 用户是客户，只能改配置
- 形态统一，气质不同
- 配置项要克制（279 行）
- 交付后很少动
{% endcol %}
{% endrow %}

{% note tip 最通用的一条 %}
**做主题前先问：改文案的人是谁？**

- 是开发者 → 模板可以复杂，配置可以更细；
- 不是开发者 → **所有可见文字都必须是配置项**，并且要能在不看代码的情况下改对。

这一条决定了配置文件怎么写、文档怎么写、甚至要不要做预设。
{% endnote %}

## 七、可复用的做法清单

八篇下来，能直接搬到别的项目里的：

1. **预设只换 CSS 变量**，扩展成本 O(1)；
2. **约定优于配置**：`sections` 数组 + `section-<name>.ejs` 命名约定，加板块不用改模板；
3. **覆盖文件机制**：`_config.<主题名>.yml` 让升级不丢配置；
4. **示例配置给文案而不只是参数**；
5. **「导入即部署」与「可集成」拆成两个仓库**；
6. **影响首屏的状态在 `<head>` 同步定档**；
7. **换环境才出现的故障，先比入口命令与 Node 版本**。

## 系列导航

{% note tip 系列导航 %}
[xongyi 系列总入口](/series/xongyi/) · 上一篇：[部署工程化](/2026/10/15/series-xongyi-07-deploy-engineering/) · 回到第一篇：[机构官网到底需要什么](/2026/10/15/series-xongyi-01-institutional-website/) · 姐妹系列：[从零造一个 Hexo 主题（xfm）](/series/)
{% endnote %}
