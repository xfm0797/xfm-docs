---
title: IntersectionObserver：滚动动效与懒加载的正确写法
date: 2026-10-17 11:30:00
updated: 2026-10-17 11:30:00
categories: [前端]
tags: [JavaScript, 浏览器API, 性能]
description: 用 IntersectionObserver 替代 scroll 监听做进入视口检测：完整参数解析、懒加载与滚动动效的两种写法、为什么要在触发后取消观察，以及三个真实踩坑。
---

「元素滚动到可见时淡入」——用 `scroll` 事件 + `getBoundingClientRect()` 能做，但每次滚动都要强制浏览器同步计算布局，滚动一快就掉帧。

`IntersectionObserver` 把这件事交给了浏览器：**它在合成线程上异步检测，回调里拿到的交叉信息是现成的**。

<!-- more -->

## 一、最小可用写法

```js
const io = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);   // 关键：触发后取消观察
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -60px 0px',
});

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity .5s ease, transform .5s ease;
}
.reveal.is-visible { opacity: 1; transform: none; }
```

## 二、两个参数到底怎么调

### `threshold`：交叉比例阈值

`0` 表示**露出 1 像素就触发**，`1` 表示**完全进入才触发**，也可以给数组 `[0, 0.25, 0.5, 1]` 让它在多个节点都回调一次。

| 场景 | 建议值 |
| --- | --- |
| 淡入动效 | `0.1` ~ `0.2`（早点触发，别让用户等） |
| 图片懒加载 | `0` |
| 「已读」标记 | `0.5` 或 `1`（要求真正看到） |
| 曝光统计 | `0.5` + 停留时长判断 |

### `rootMargin`：提前或延后触发

语法和 `margin` 一样（**只支持 px 和 %，不支持 auto**）。正值扩大判定区域，负值缩小。

```js
{ rootMargin: '0px 0px -60px 0px }   // 底部内缩 60px：元素进入视口底部 60px 后才触发
{ rootMargin: '200px 0px' }          // 上下各外扩 200px：提前 200px 触发（懒加载常用）
```

{% note tip 负值让动效更自然 %}
淡入动效常用 `0px 0px -60px 0px`：元素**稍微进入视口一点**后再开始动画，而不是刚露头就播——用户实际感受到的时机更接近"看到了"。
{% endnote %}

## 三、一定要 `unobserve`

这是最容易忽略的一点。如果你的动效只需要播一次（绝大多数情况），触发后必须取消观察：

```js
observer.unobserve(entry.target);
// 或全部取消：observer.disconnect();
```

不取消的后果：元素滚出视口时 `isIntersecting` 变 `false`，滚回来又变 `true`——**动画反复播放**。而反复触发的过渡动画是明显的性能负担。

{% note warning 例外 %}
需要"进入/离开都响应"的场景（比如吸顶导航的显隐、视频进出视口自动暂停）**不要** unobserve，改用 `isIntersecting` 做双向分支。
{% endnote %}

## 四、图片懒加载的现代写法

其实 img 有原生属性，不需要 JS：

```html
<img src="photo.jpg" loading="lazy" decoding="async" width="800" height="450" alt="描述">
```

{% fold 什么时候才需要 IntersectionObserver 做懒加载 %}
原生 `loading="lazy"` 已经覆盖了绝大多数图片场景，优先用它。

需要 JS 的情况：

1. **背景图**（`background-image` 没有 lazy 属性）；
2. **需要更精细的控制**：按网络状况决定是否加载高清图、加载失败重试、加载前先显示占位色；
3. **非图片资源**：iframe、视频、需要滚动到才初始化的重组件。
{% endfold %}

JS 版写法（用 `data-src` 存真实地址）：

```html
<img data-src="photo.jpg" width="800" height="450" alt="描述">
```

```js
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    obs.unobserve(img);
  });
}, { rootMargin: '200px 0px' });   // 提前 200px 开始加载，避免用户看到空白
```

{% note danger 必须写 width 和 height %}
懒加载最大的副作用是**布局抖动（CLS）**：图片加载前高度为 0，加载完突然把下面的内容顶下去。

显式写 `width` / `height`（或 CSS `aspect-ratio`）让浏览器提前预留空间，这一点比懒加载本身更重要。
{% endnote %}

## 五、三个真实踩坑

### 坑一：观察器创建太早，元素还没渲染

动态渲染的列表（异步拉取后插入 DOM），如果在插入前就 `observe`，拿不到元素。要**插入后再观察**，或者用事件委托式的思路：在容器上用 `MutationObserver` 监听新增节点。

### 坑二：`root` 设为某个滚动容器时的判定基准

```js
new IntersectionObserver(cb, { root: document.querySelector('.scroll-box') });
```

指定了 `root` 后，交叉判定是相对于**这个容器的可视区**，不是视口。如果容器本身有 `overflow: hidden` 且高度为 0，所有元素都永远不交叉——**回调一次都不触发**，而且不报错。

### 坑三：CSS 里写了 `visibility: hidden` 会影响判定吗

不会。`visibility: hidden` 的元素**依然参与布局、依然会触发交叉**（这与"用户是否看得见"是两码事）。但 `display: none` 的元素尺寸为 0，不会触发。

{% note info 判定的是几何交叉，不是可见性 %}
IntersectionObserver 只回答「两个矩形是否重叠」。不透明度、z-index 遮挡、祖先的 `overflow` 裁剪它都管一部分（裁剪会算），但**元素被别的元素完全盖住**它不知道。
{% endnote %}

## 六、和 `scroll` 事件的性能对比

| | scroll + getBoundingClientRect | IntersectionObserver |
| --- | --- | --- |
| 触发频率 | 每次滚动（每秒数十次） | 只在跨越阈值时（通常几次） |
| 是否强制同步布局 | **是**（读取几何信息触发 reflow） | 否，浏览器内部异步计算 |
| 代码量 | 需要自己节流 + 缓存位置 | 声明式 |
| 主线程占用 | 高 | 极低 |

{% note tip 相关阅读 %}
[动画性能：为什么有的动画卡有的不卡](/2026/10/17/fe-animation-performance/) · [事件委托：为什么列表的监听器应该只绑一个](/2026/10/17/fe-event-delegation/) · [前端性能：把 Core Web Vitals 拆成可执行的动作](/2026/10/17/fe-core-web-vitals/)
{% endnote %}
