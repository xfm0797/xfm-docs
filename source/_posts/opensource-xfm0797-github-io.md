---
title: xfm0797.github.io：我的 Hexo 建站学习站
date: 2026-10-11 20:50:00
categories: [开源项目]
tags: [Hexo, GitHub Pages, Cloudflare, 教程]
description: 搭建在 GitHub Pages 的 Hexo 学习笔记站，记录建站过程中遇到的问题、解决思路与优化方法，并由 Cloudflare Pages 双托管。
---

**xfm0797.github.io** 是我最早的 Hexo 站点，也是一份公开的建站学习笔记：记录 Hexo 从零搭建过程中遇到的问题、解决思路与优化方法。

<!-- more -->

## 站点定位

- 搭建在 GitHub Pages 的静态博客，源码即仓库，push 即发布
- 同步由 **Cloudflare Pages** 托管，保证任何网络环境下都能访问
- 内容以 Hexo 使用手册与踩坑记录为主

## 内容覆盖

从环境准备到部署上线，按步骤整理：

1. **环境要求**：Node.js（8.0+ 需 ≥ 20.19）、Git 的安装与版本对照表
2. **安装 Hexo**：全局 `hexo-cli` 与局部依赖两种方式
3. **常用命令**：`hexo clean` / `generate` / `server` 的用途与差异
4. **常见问题**：EACCES 权限、Snap 安装、Node 版本限制等的处理办法

## 意义

这个站点是后续 `hexo-theme-xfm`、`hexo-theme-xongyi` 两套主题与 HexoManager、x-site 等工具的起点 —— 先在纯手写流程里踩坑，再把经验沉淀成工具。

{% linkcard https://github.com/xfm0797/xfm0797.github.io, xfm0797.github.io 源码仓库, 学习 Hexo 建站 · GitHub Pages %}
