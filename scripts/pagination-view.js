/**
 * 站点级补丁：覆盖主题的分页局部模板 _partials/pagination.ejs
 *
 * 背景：主题原版在「没有上一页 / 下一页」时直接省略按钮，导致首页（无上一页）与
 *       后续页（末页无下一页）的页码整体左右偏移，各页版式不一致。
 *
 * 做法：把站点根目录 overrides/pagination.ejs 的内容在 before_generate 阶段注入
 *       hexo.theme.setView()，覆盖主题里的同名视图。时机上 before_generate 晚于
 *       theme.process()（视图注册）、早于页面渲染，因此能稳定生效。
 *
 * 不改主题 submodule（themes/xfm 指向官方仓库），保持可复现。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const VIEW_PATH = '_partials/pagination.ejs';

hexo.extend.filter.register('before_generate', function () {
  const file = path.join(hexo.base_dir, 'overrides', 'pagination.ejs');
  try {
    const source = fs.readFileSync(file, 'utf8');
    hexo.theme.setView(VIEW_PATH, source);
    hexo.log.debug('分页模板已覆盖：%s', file);
  } catch (err) {
    hexo.log.error('分页模板覆盖失败（%s）：%s', file, err.message);
  }
});
