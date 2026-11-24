<template>
  <!-- 同辈 AI 分析模块：概要文案由纯函数依据 result 生成 -->
  <section class="card">
    <div class="card-head">
      <h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/></svg>
        同辈 AI 分析
      </h2>
    </div>
    <div class="ai-box">
      <div class="ai-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/></svg></div>
      <div class="ai-body">
        <p>{{ summaryText }}</p>
        <div class="ai-src">{{ sourceLine }}</div>
      </div>
    </div>
  </section>
</template>

<script>
import { buildPeerSummary } from '@/utils/peer-benchmark';

export default {
  name: 'PeerAiSummaryModule',
  props: {
    result: { type: Object, required: true }
  },
  computed: {
    summaryText() {
      return buildPeerSummary(this.result);
    },
    sourceLine() {
      return '来源：本人档案与同辈组统计 · 口径：组内分位标准化';
    }
  }
};
</script>
