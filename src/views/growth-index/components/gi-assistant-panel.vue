<template>
  <!-- AI 助手面板：问候 + 档案三字段 + 数字人形象区（点击唤起会话） + 底部快捷提问条 -->
  <div class="assistant-panel">
    <div class="assistant-copy">
      <span class="assistant-label"><span class="status-dot"></span>我的教师发展 AI 助手 <span class="tiny-badge">校园专属</span></span>
      <h2>{{ greeting }}</h2>
      <p>把每一次教学积累，变成下一步成长。</p>
      <div class="assistant-facts">
        <div><span>专业技术职称</span><strong>{{ archiveData.title || '—' }}</strong></div>
        <div><span>专业技术岗位</span><strong>{{ archiveData.grade || '—' }}</strong></div>
        <div><span>骨干教师称号</span><strong>{{ archiveData.honor || '—' }}</strong></div>
      </div>
    </div>
    <!-- 形象区：与原型一致由 libpag 在 canvas 上播放 .pag 数字人，纯 CSS 机器人作为加载失败兜底；整区可点击 -->
    <div class="assistant-art" aria-label="教师发展 AI 助手形象" @click="$emit('ask', '')">
      <div class="bot" :class="{ 'dh-fallback': botVisible }">
        <div class="bot-antenna"></div>
        <div class="bot-head"><div class="bot-face"><span></span><span></span><b></b></div></div>
        <div class="bot-body"><i data-lucide="sprout"></i></div>
        <div class="bot-arm left"></div>
        <div class="bot-arm right"></div>
      </div>
      <canvas ref="dhCanvas" class="dh-canvas" role="img" aria-label="教师发展 AI 助手数字人形象"></canvas>
      <span v-show="tipVisible" class="dh-tip" :class="{ on: tipVisible }">{{ tipText }}</span>
      <button class="dh-hit" type="button" title="打开教师发展 AI 助手" aria-label="打开教师发展 AI 助手" @click.stop="$emit('ask', '')"></button>
    </div>
    <div class="quick-prompts">
      <button v-for="prompt in quickPrompts" :key="prompt" type="button" @click="$emit('ask', prompt)">{{ prompt }}<i data-lucide="arrow-up-right"></i></button>
    </div>
  </div>
</template>

<script>
import { store } from 'auth-layout-zw';
import { mountDigitalHuman } from '@/utils/digital-human';
// 快捷提问文案（原型演示口径，点击后带入 AI 会话）
const QUICK_PROMPTS = [
  '我的职称还差什么？',
  '我的档案还缺哪些材料？',
  '今年有哪些论文评比？'
];
// 提示语轮播节奏：出现 3.2s → 淡出 0.42s → 停 4.8s（与原型 dhTips 一致）
const TIP_SHOW_MS = 3200;
const TIP_GAP_MS = 4800;
const TIP_FADE_MS = 420;

export default {
  name: 'GiAssistantPanel',
  props: {
    // 当前任职（职称/岗位/骨干称号），由容器经 getNowPost 获取后下发
    archiveData: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      quickPrompts: QUICK_PROMPTS,
      tipIndex: 0,
      tipVisible: false,
      tipTimer: null,
      /* 兜底机器人是否可见：默认隐藏，只在数字人挂载失败时显示，避免先闪机器人再淡出 */
      botVisible: false,
      /* 数字人释放函数，组件销毁时调用以回收 wasm 实例 */
      dhDestroy: null
    };
  },
  computed: {
    // 按时段问候（演示口径沿用原型「朱老师」）
    greeting() {
      const hour = new Date().getHours();
      const greet = hour < 11 ? '上午好' : (hour < 18 ? '下午好' : '晚上好');
      return `${store.getters.name}老师，${greet}。`;
    },
    tipText() {
      return ['点我，看你的职称还差什么', '今年的论文评比，我帮你理', '看看你在同辈中处在哪一档'][this.tipIndex % 3];
    }
  },
  mounted() {
    this.scheduleTip();
    /* 挂载是异步的，路由切换先销毁组件时靠这个标让播放器中途放弃 */
    this._dhAlive = true;
    /* 形象区渲染完成后再挂载数字人：播放成功才亮画布，失败才显示兜底机器人 */
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
    clearTimeout(this.tipTimer);
    /* 离开首页时停帧并释放 libpag 实例，避免后台持续渲染与 wasm 泄漏 */
    if (this.dhDestroy) {
      this.dhDestroy();
      this.dhDestroy = null;
    }
  },
  methods: {
    // 提示语循环：显示 3.2s 后淡出，停 4.8s 再出下一条
    scheduleTip() {
      this.tipTimer = setTimeout(() => {
        this.tipText && this.showTip();
      }, TIP_GAP_MS);
    },
    showTip() {
      this.tipVisible = true;
      this.tipTimer = setTimeout(() => {
        this.tipVisible = false;
        this.tipIndex += 1;
        this.tipTimer = setTimeout(this.showTip, TIP_FADE_MS + TIP_GAP_MS);
      }, TIP_SHOW_MS);
    }
  }
};
</script>
