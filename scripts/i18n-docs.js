/**
 * 英文文档页的语言标记与 hreflang
 *
 * 背景：主题的 lang_switcher 只切换「界面文案」，正文语言由 URL 决定；
 * layout.ejs 的 <html lang> 取站点 config.language（zh-CN），因此 /en/ 下的
 * 页面需要在这里按路径补一次，否则搜索爬虫与读屏软件都会把英文页当中文页。
 *
 * 挂的是 hexo 的 `_after_html_render` 过滤器（渲染出口、写盘之前），
 * 它拿得到 locals.path（如 en/docs/xfmpress/cli/index.html），
 * 比 after_generate 合适 —— 后者触发时文件还没写到 public/。
 *
 * 只做两件事，且都限定在已有英译的分区（目前是 xfmpress）：
 *   1. en/ 开头的页面：<html lang="zh-CN"> → <html lang="en">；
 *   2. 中英互加 hreflang，告诉搜索引擎两个地址是同一内容的不同语言。
 *
 * 不覆盖主题布局：主题是 submodule，站点层不复制 layouts/。
 * 处理是幂等的，增量构建与全量构建结果一致。
 */

const fs = require('fs');
const path = require('path');

// 中英对照的分区（en/<section>/... ↔ <section>/...）
const SECTIONS = ['docs/xfmpress'];

/** 路由路径归一：去掉首尾斜杠与 index.html，形如 docs/xfmpress/cli */
function routeKey(p) {
  return String(p || '')
    .replace(/^\/+/, '')
    .replace(/index\.html$/i, '')
    .replace(/\/+$/, '');
}

function sourceExists(rel) {
  const file = path.join(hexo.source_dir, rel, 'index.md');
  return fs.existsSync(file);
}

/** 插入 hreflang 三行（en / zh-CN / x-default），已有则跳过 */
function withHreflang(html, enRoute, zhRoute) {
  if (html.includes('hreflang="x-default"')) return html;
  const base = (hexo.config.url || '').replace(/\/+$/, '');
  const lines = [
    `<link rel="alternate" hreflang="en" href="${base}${enRoute}">`,
    `<link rel="alternate" hreflang="zh-CN" href="${base}${zhRoute}">`,
    `<link rel="alternate" hreflang="x-default" href="${base}${zhRoute}">`,
  ].join('\n  ');
  return html.replace('</head>', `  ${lines}\n</head>`);
}

hexo.extend.filter.register('_after_html_render', function (html, locals) {
  const key = routeKey(locals && locals.path);
  if (!key) return html;

  for (const section of SECTIONS) {
    const enPrefix = `en/${section}/`;
    const zhPrefix = `${section}/`;

    // 英文页：修正 lang + 补 hreflang（对应中文源存在时）
    if (key === `en/${section}` || key.startsWith(enPrefix)) {
      const zhKey = key.replace(/^en\//, '');
      let next = html.replace('<html lang="zh-CN"', '<html lang="en"');
      if (sourceExists(zhKey)) {
        next = withHreflang(next, '/' + key + '/', '/' + zhKey + '/');
      }
      return next;
    }

    // 中文页：反向 hreflang（对应英文源存在时）
    if (key === section || key.startsWith(zhPrefix)) {
      if (sourceExists(`en/${key}`)) {
        return withHreflang(html, `/en/${key}/`, `/${key}/`);
      }
      return html;
    }
  }

  return html;
});
