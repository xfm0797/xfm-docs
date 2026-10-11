/* ==========================================================================
   文档树：点击分组行 / 箭头 → 展开或收起
   --------------------------------------------------------------------------
   站点级补丁。主题 core.js 只给 .xfm-nav-group-head（笔记侧栏）绑了折叠事件，
   docs 侧栏的 .xfm-nav-toggle 没有对应处理，点上去毫无反应。
   这里用事件委托统一接管（不改主题 submodule）：
     · 点击分组标签或箭头按钮 → 切换该分组的 .is-open
     · 键盘 Enter / Space 同样可用
     · 规则基于 .has-children，后续新增的文档分组自动生效
   字体图标与尺寸由 source/css/xfm-docs-tree.css 负责。
   ========================================================================== */
(function () {
  'use strict';

  var OPEN = 'is-open';

  /** 取分组行上的直接子级（避免命中更深层级） */
  function directChild(li, selector) {
    var kids = li.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].matches && kids[i].matches(selector)) return kids[i];
    }
    return null;
  }

  function setOpen(li, open) {
    li.classList.toggle(OPEN, open);
    var btn = directChild(li, '.xfm-nav-toggle');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function groupOf(el) {
    var li = el.closest ? el.closest('.xfm-nav-item.has-children') : null;
    if (!li) return null;
    // 只接管文档侧栏，笔记侧栏用的是 .xfm-nav-group，不在此列
    if (!li.closest('.xfm-sidebar-nav')) return null;
    // 标签/箭头必须是该分组自身的行，否则是在点嵌套分组
    if (el.classList && el.classList.contains('xfm-nav-text')) {
      if (el.parentElement !== li) return null;
    } else if (el.parentElement !== li) {
      return null;
    }
    return li;
  }

  function activate(el) {
    var li = groupOf(el);
    if (!li) return false;
    setOpen(li, !li.classList.contains(OPEN));
    return true;
  }

  document.addEventListener('click', function (e) {
    var hit = e.target.closest ? e.target.closest('.xfm-nav-toggle, .xfm-nav-text') : null;
    if (!hit) return;
    if (activate(hit)) e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var hit = e.target.closest ? e.target.closest('.xfm-nav-text') : null;
    if (!hit) return;
    if (activate(hit)) e.preventDefault();
  });

  /** 初始化：补齐 aria 状态，并让分组标签可聚焦 */
  function init() {
    var items = document.querySelectorAll('.xfm-sidebar-nav .xfm-nav-item.has-children');
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var open = li.classList.contains(OPEN);
      var btn = directChild(li, '.xfm-nav-toggle');
      if (btn) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', '展开或收起分组');
      }
      var label = directChild(li, '.xfm-nav-text');
      if (label) {
        label.setAttribute('role', 'button');
        if (!label.hasAttribute('tabindex')) label.setAttribute('tabindex', '0');
        label.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    // 兜底：极少数情况下 DOMContentLoaded 已错过，load 时再补一次（init 幂等）
    window.addEventListener('load', init);
  } else {
    init();
  }
})();
