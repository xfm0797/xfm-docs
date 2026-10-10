---
title: 常见问题
mode: docs
layout: page
order: 16
date: 2026-10-10 20:00:00
updated: 2026-10-10 23:00:00
---

{% fold 首页某个板块没有显示？ %}
检查该板块名是否写在 `sections` 数组中，且对应的配置节点已填写内容。`about-contact` 为合并板块，需在 `sections` 中显式存在才会渲染。
{% endfold %}

{% fold 怎么隐藏一个板块？ %}
从 `sections` 数组中删除对应行即可，无需删除其配置节点（便于日后恢复）。
{% endfold %}

{% fold 首页 / 归档页不生成？ %}
补装 `hexo-generator-index`、`hexo-generator-archive`、`hexo-generator-category`、`hexo-generator-tag`——Hexo 7 核心不自带这四个生成器。
{% endfold %}

{% fold 联系表单提交到哪里？ %}
在 `contact.form_action` 填入表单服务地址（如 Formspree：`https://formspree.io/f/xxxxx`）；留空则不渲染表单。
{% endfold %}

{% fold 如何修改备案号？ %}
在 `footer.icp` 填 ICP 备案号、`footer.police` 填公安备案号，并可通过 `icp_url` / `police_url` 指定跳转地址。
{% endfold %}

{% fold 换预设后颜色没变？ %}
确认改的是生效的配置（站点覆盖文件 `_config.hexo-theme-xongyi.yml` 优先于主题 `_config.yml`），并重新 `hexo clean && hexo generate`。
{% endfold %}

{% fold 升级主题会覆盖我的自定义吗？ %}
只要自定义写在站点根目录的 `_config.hexo-theme-xongyi.yml` 中，`git pull` 升级主题时就不会丢失。
{% endfold %}

{% fold 地图怎么嵌入？ %}
把地图服务商提供的 iframe 嵌入地址填入 `contact.map`，留空则不显示地图区域。
{% endfold %}
