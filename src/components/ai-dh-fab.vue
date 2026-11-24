<template>
  <!-- AI 助手悬浮球：与成长首页助手面板共用形象区结构（libpag 数字人 + CSS 机器人兜底），靠缩放塞进右下角圆钮 -->
  <button class="ai-dh-fab" type="button" title="打开教师发展 AI 助手" @click="$emit('open')">
    <span class="dh-fab-art">
      <span class="bot" :class="{ 'dh-fallback': botVisible }">
        <span class="bot-antenna"></span>
        <span class="bot-head"><span class="bot-face"><span></span><span></span><b></b></span></span>
        <span class="bot-body"><i data-lucide="sprout"></i></span>
        <span class="bot-arm left"></span>
        <span class="bot-arm right"></span>
      </span>
      <canvas ref="dhCanvas" class="dh-canvas" role="img" aria-label="教师发展 AI 助手数字人形象"></canvas>
    </span>
  </button>
</template>

<script>
import { mountDigitalHuman } from '@/utils/digital-human';

export default {
  name: 'AiDhFab',
  data() {
    return {
      /* 兜底机器人是否可见：默认隐藏，只在数字人挂载失败时显示，避免先闪机器人再淡出 */
      botVisible: false,
      /* 数字人释放函数，组件销毁时调用以回收 wasm 实例 */
      dhDestroy: null
    };
  },
  mounted() {
    /* 挂载是异步的，路由切换先销毁组件时靠这个标让播放器中途放弃 */
    this._dhAlive = true;
    this.$nextTick(() => {
      mountDigitalHuman(this.$refs.dhCanvas, { isAlive: () => this._dhAlive }).then((res) => {
        /* 收尾瞬间被销毁的兜底：拿不到 beforeDestroy 的释放机会，就地回收 */
        if (!this._dhAlive) {
          res.destroy();
          return;
        }
        if (res.status === 'ready') {
          this.dhDestroy = res.destroy;
        } else if (res.status === 'fallback') {
          this.botVisible = true;
        }
      });
    });
  },
  beforeDestroy() {
    this._dhAlive = false;
    /* 切到成长首页时悬浮球被销毁：停帧并释放 libpag 实例，避免后台持续渲染与 wasm 泄漏 */
    if (this.dhDestroy) {
      this.dhDestroy();
      this.dhDestroy = null;
    }
  }
};
</script>
