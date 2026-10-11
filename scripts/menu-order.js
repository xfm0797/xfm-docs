/**
 * 顶部导航顺序
 * ---------------------------------------------------------------------------
 * 主题默认菜单是「首页 / 归档 / 分类 / 标签 / 更多」，Hexo 在合并 theme_config 时
 * 采用的是「以主题配置为底、站点新增键追加到末尾」的深合并策略，
 * 因此站点新增的「文档 / 笔记」会被排到「更多」之后。
 *
 * 这里在生成前把菜单键按期望顺序重排：
 *   首页 → 归档 → 分类 → 标签 → 文档 → 笔记 → 更多（友链 / 关于）
 * 未列出的键按原顺序追加到末尾，保证扩展时不丢项。
 */

const MENU_ORDER = ['首页', '归档', '分类', '标签', '文档', '笔记', '更多'];

hexo.extend.filter.register('before_generate', function () {
  const themeConfig = hexo.theme && hexo.theme.config;
  const menu = themeConfig && themeConfig.menu;
  if (!menu || Array.isArray(menu)) return;

  const reordered = {};
  MENU_ORDER.forEach(function (key) {
    if (Object.prototype.hasOwnProperty.call(menu, key)) reordered[key] = menu[key];
  });
  Object.keys(menu).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(reordered, key)) reordered[key] = menu[key];
  });

  themeConfig.menu = reordered;
});
