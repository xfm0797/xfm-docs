/* 站点层覆盖主题视图：_partials/post/copyright.ejs
 * 模板内容在 overrides/post-copyright.ejs（不能放 scripts/ 下 —— scripts 目录
 * 会被非递归地当作脚本逐个执行）。
 * 注册在 before_generate：hexo.load() 先 theme.process() 注册视图，
 * 再 _generate() 里跑 before_generate，此时覆盖稳定生效。
 */
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('before_generate', function () {
  const file = path.join(hexo.base_dir, 'overrides', 'post-copyright.ejs');
  hexo.theme.setView('_partials/post/copyright.ejs', fs.readFileSync(file, 'utf8'));
});
