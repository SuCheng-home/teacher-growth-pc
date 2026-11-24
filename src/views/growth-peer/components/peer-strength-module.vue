<template>
  <!-- 综合分析-强弱项模块：纯展示，强/弱项维度名称直接来自后端统计结果 result -->
  <div class="bench-col strength-col">
    <div class="sg hi">
      <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 14l6-6 4 4 6-6"/><path d="M14 6h6v6"/></svg>强于组内多数</h3>
      <div class="chip-row">
        <span v-for="(name, index) in strengths" :key="'hi-' + index" class="chip hi">{{ name }}</span>
        <span v-if="!strengths.length" class="chip">暂无</span>
      </div>
    </div>
    <div class="sg lo">
      <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10l6 6 4-4 6 6"/><path d="M14 18h6v-6"/></svg>弱于组内多数</h3>
      <div class="chip-row">
        <span v-for="(name, index) in weaknesses" :key="'lo-' + index" class="chip lo">{{ name }}</span>
        <span v-if="!weaknesses.length" class="chip">暂无</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PeerStrengthModule',
  props: {
    result: { type: Object, required: true }
  },
  computed: {
    strengths() {
      return this.result.strongDimensions || [];
    },
    weaknesses() {
      return this.result.weakDimensions || [];
    }
  }
};
</script>
