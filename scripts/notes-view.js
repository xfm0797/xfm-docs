/**
 * 站点级补丁：覆盖主题的笔记侧栏局部模板 _partials/notes/nav.ejs
 *
 * 背景：主题原生的 xfm_notes_nav() 会把「全站文章」全部列进笔记侧栏，与归档页重复；
 *       本站约定「笔记」= 更新日志类记录，需要按分类过滤。详见 overrides/notes-nav.ejs。
 *
 * 做法：把站点根目录 overrides/notes-nav.ejs 的内容在 before_generate 阶段注入
 *       hexo.theme.setView()，覆盖主题里的同名视图。时机上 before_generate 晚于
 *       theme.process()（视图注册）、早于页面渲染，因此能稳定生效。
 *
 * 不改主题 submodule（themes/xfm 指向官方仓库），保持可复现。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const VIEW_PATH = '_partials/notes/nav.ejs';

hexo.extend.filter.register('before_generate', function () {
  const file = path.join(hexo.base_dir, 'overrides', 'notes-nav.ejs');
  try {
    const source = fs.readFileSync(file, 'utf8');
    hexo.theme.setView(VIEW_PATH, source);
    hexo.log.debug('笔记侧栏模板已覆盖：%s', file);
  } catch (err) {
    hexo.log.error('笔记侧栏模板覆盖失败（%s）：%s', file, err.message);
  }
});
