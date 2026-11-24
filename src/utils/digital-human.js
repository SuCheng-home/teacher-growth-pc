/**
 * AI 助手数字人形象播放器
 *
 * 素材：src/assets/ai-digital-human.pag（800×800 · 约 4s 循环 · 透明底），
 *       由原型 digital_human_v1.0_20261006.js 内嵌的 base64 提取而来。
 * 依赖：libpag 4.1.8 —— 与原型同版本，但原型走 jsdelivr CDN、本环境不可达，
 *       故把 UMD 产物自托管到 public/libpag（dev 直读；build 原样拷进 dist），
 *       从同域加载。产物来源：npm i libpag@4.1.8 后复制
 *       node_modules/libpag/lib/libpag.min.js 与 libpag.wasm 到 public/libpag，
 *       两个文件必须同目录（wasm 按脚本自身所在目录解析）。
 * 降级：任一环节失败都保留调用方的兜底形象（成长首页为纯 CSS 机器人），
 *       只输出一条 warn，不抛错、不阻断页面。
 *
 * 三个坑都来自实际报错，改动前务必看清：
 *   1. 路由切换会销毁组件，而挂载是异步的：画布从文档摘掉后再 PAGView.init
 *      取不到渲染面，报「Make PAGSurface from frameBuffer 0 fail」。故每个 await
 *      之后都要用 isAlive 复查宿主是否还在，中途放弃时静默返回 aborted。
 *   2. 素材内嵌视频轨，解码依赖页面可见：后台标签页会被 Chrome 以
 *      「video-only background media was paused to save power」暂停，play() 直接
 *      reject。故播放前等页面可见，失败再等可见重试一次。
 *   3. PAGView.play() 是 async，返回的 Promise 不接住就是 unhandled rejection；
 *      PAGFile 也不能跨 view 复用（view 销毁后再 init 同样报 frameBuffer 0），
 *      因此只缓存素材字节、每次挂载重新 load，销毁时 view 与 file 都要 destroy。
 */
import pagUrl from '@/assets/ai-digital-human.pag';

/* BASE_URL 与 vite.base 一致：dev 为 /，build 为 /teacher-growth-pc/ */
const LIBPAG_JS = `${import.meta.env.BASE_URL}libpag/libpag.min.js`;

/* 脚本与素材字节各只加载一次；PAGFile 不入缓存，理由见文件头注释 3 */
let libPending = null;
let bytesPending = null;

function loadLibpag() {
  if (libPending) return libPending;
  libPending = new Promise((resolve, reject) => {
    if (window.libpag) return resolve(window.libpag);
    const script = document.createElement('script');
    script.src = LIBPAG_JS;
    script.onload = () => {
      window.libpag ? resolve(window.libpag) : reject(new Error('libpag 未挂载'));
    };
    script.onerror = () => { reject(new Error('libpag 脚本加载失败：' + LIBPAG_JS)); };
    document.head.appendChild(script);
  });
  return libPending;
}

function loadPagBytes() {
  if (!bytesPending) {
    bytesPending = fetch(pagUrl)
      .then((res) => {
        if (!res.ok) throw new Error('数字人素材加载失败：' + res.status);
        return res.arrayBuffer();
      })
      .catch((err) => {
        /* 失败不缓存，下次挂载可重试 */
        bytesPending = null;
        throw err;
      });
  }
  return bytesPending;
}

/* 页面已可见时立即 resolve，否则等下一次可见 */
function whenDocumentVisible() {
  if (!document.hidden) return Promise.resolve();
  return new Promise((resolve) => {
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onVisible);
      resolve();
    };
    document.addEventListener('visibilitychange', onVisible);
  });
}

/**
 * 在 canvas 上播放数字人动画
 * @param {HTMLCanvasElement} canvas 目标画布
 * @param {Object} [opts] opts.isAlive 返回宿主组件是否仍存在，异步各阶段复查用
 * @returns {Promise<{status: string, destroy: Function, reason?: string}>}
 *          status：ready 播放成功 / fallback 已降级（调用方显示兜底形象）
 *                  / aborted 宿主已销毁、静默退出 / no-canvas 未取到画布
 *          destroy 幂等，宿主组件销毁时必须调用以释放 wasm 实例
 */
export async function mountDigitalHuman(canvas, opts) {
  const noop = () => {};
  if (!canvas) return { status: 'no-canvas', destroy: noop };

  const hostAlive = opts && typeof opts.isAlive === 'function' ? opts.isAlive : () => true;
  let view = null;
  let file = null;
  let disposed = false;

  const release = () => {
    disposed = true;
    try {
      if (view) {
        view.stop();
        view.destroy();
      }
    } catch (e) {
      /* wasm 侧已释放，忽略 */
    }
    try {
      if (file) file.destroy();
    } catch (e) {
      /* 同上 */
    }
    view = null;
    file = null;
    canvas.classList.remove('dh-ready');
  };
  const alive = () => !disposed && hostAlive();
  /* 中途放弃时也要回收已创建的实例，否则 wasm 侧泄漏 */
  const aborted = () => {
    release();
    return { status: 'aborted', destroy: release };
  };

  try {
    const lib = await loadLibpag();
    const PAG = await lib.PAGInit();
    const bytes = await loadPagBytes();
    if (!alive()) return aborted();

    /* 传副本：libpag 4.1.8 的 PAGFile.load 只接受 File|Blob|ArrayBuffer，
       且可能转移（detach）传入的 buffer，故不能直接交缓存原件 */
    file = await PAG.PAGFile.load(bytes.slice(0));
    /* 画布内部分辨率取素材原始尺寸，显示尺寸交回 CSS，保证清晰 */
    canvas.width = file.width();
    canvas.height = file.height();
    view = await PAG.PAGView.init(file, canvas);
    view.setRepeatCount(0);
    /* libpag 的 PAGView.init 会把当时的显示尺寸写成内联 style，
       内联样式吃不掉响应式，这里清掉把尺寸控制权交回样式表 */
    canvas.style.width = '';
    canvas.style.height = '';
    if (!alive()) return aborted();

    await whenDocumentVisible();
    if (!alive()) return aborted();
    try {
      await view.play();
    } catch (err) {
      /* 首帧解码常被后台媒体省电暂停打断：等页面可见后重试一次 */
      await whenDocumentVisible();
      if (!alive()) return aborted();
      await view.play();
    }

    /* 播放确认成功后才亮画布，避免解码失败留下空白形象区 */
    canvas.classList.add('dh-ready');
    return { status: 'ready', destroy: release };
  } catch (err) {
    if (!alive()) return aborted();
    console.warn('[digital-human] 未能加载数字人，保留兜底形象：', err && err.message);
    release();
    return { status: 'fallback', reason: err && err.message, destroy: release };
  }
}
