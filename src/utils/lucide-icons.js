/*
 * 全局 Lucide 图标自动渲染
 *
 * 背景：Lucide 以 CDN 全局脚本（window.lucide）方式引入，模板里的
 *       <i data-lucide="xxx"> 只是占位，需要调用 createIcons() 才会被替换成 SVG。
 *       而 Vue 的 v-if / 弹框 append-to-body 会在运行时分批插入新的占位，
 *       导致每个页面都要手动 $nextTick(createIcons)，既重复又容易漏调。
 *
 * 方案：应用启动时安装一个 MutationObserver，监听 body 内任何新增/变更的
 *       <i data-lucide> 占位，用 requestAnimationFrame 合并去抖后自动渲染。
 *       各页面组件此后无需再手动调用 createIcons。
 */

let observer = null;
let scheduled = false;

// 仅当存在尚未转换的 <i> 占位时才调用，避免 createIcons 生成 SVG 反噬观察器形成死循环
function renderPendingIcons() {
  scheduled = false;
  if (!window.lucide || typeof window.lucide.createIcons !== 'function') return;
  if (!document.querySelector('i[data-lucide]')) return;
  window.lucide.createIcons();
}

// 同一帧内的多次 DOM 变更合并为一次渲染
function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(renderPendingIcons);
}

// 在应用挂载后调用一次即可全局生效
export function setupLucideAutoRender() {
  if (observer || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver(scheduleRender);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-lucide']
  });
  // 首屏已存在的占位主动渲染一次（此时 defer 引入的 lucide 已就绪）
  scheduleRender();
}

export function teardownLucideAutoRender() {
  if (!observer) return;
  observer.disconnect();
  observer = null;
  scheduled = false;
}
