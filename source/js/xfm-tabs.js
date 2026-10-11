/* ==========================================================================
   XFM · xfm-tabs.js  ——  选项卡（{% tabs %}）切换增强（站点级补丁）
   --------------------------------------------------------------------------
   背景：主题渲染的 {% tabs %} 会产出下面的 DOM，但 core.js 未内置切换逻辑，
        导致点击选项卡「无响应」。
        <div class="xfm-tabs" data-active="0">
          <div class="xfm-tabs-nav"><button class="xfm-tab-btn" data-tab-index="0">…</button>…</div>
          <div class="xfm-tabs-panels"><div class="xfm-tab-panel" data-tab-index="0">…</div>…</div>
        </div>
   本脚本只依赖以上结构做「切换 is-active」，不侵入主题源码。
   ========================================================================== */
(function () {
  'use strict';

  function activate(tabs, index) {
    if (!tabs) return;
    var btns = tabs.querySelectorAll('.xfm-tab-btn');
    var panels = tabs.querySelectorAll('.xfm-tab-panel');
    if (!btns.length) return;

    var i = Number(index);
    if (isNaN(i) || i < 0 || i >= btns.length) i = 0;

    Array.prototype.forEach.call(btns, function (btn, k) {
      var on = k === i;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.setAttribute('tabindex', on ? '0' : '-1');
    });
    Array.prototype.forEach.call(panels, function (panel, k) {
      panel.classList.toggle('is-active', k === i);
    });
    tabs.setAttribute('data-active', String(i));
  }

  /* 事件委托：兼容懒加载 / 运行期插入的选项卡 */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.xfm-tab-btn') : null;
    if (!btn) return;
    var tabs = btn.closest('.xfm-tabs');
    if (!tabs) return;
    e.preventDefault();
    activate(tabs, btn.getAttribute('data-tab-index'));
  });

  /* 无障碍：左右方向键切换 */
  document.addEventListener('keydown', function (e) {
    var el = document.activeElement;
    if (!el || !el.classList || !el.classList.contains('xfm-tab-btn')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var tabs = el.closest('.xfm-tabs');
    if (!tabs) return;
    var count = tabs.querySelectorAll('.xfm-tab-btn').length;
    if (!count) return;
    var cur = Number(el.getAttribute('data-tab-index')) || 0;
    var next = e.key === 'ArrowRight' ? (cur + 1) % count : (cur - 1 + count) % count;
    e.preventDefault();
    activate(tabs, next);
    var target = tabs.querySelector('.xfm-tab-btn[data-tab-index="' + next + '"]');
    if (target) target.focus();
  });

  /* 初始化：按 data-active 校正一次，保证首个面板可见 */
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.xfm-tabs'), function (tabs) {
      activate(tabs, tabs.getAttribute('data-active') || 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
