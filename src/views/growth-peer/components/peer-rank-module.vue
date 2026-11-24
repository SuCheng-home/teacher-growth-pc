<template>
  <!-- 综合分析-综合分位模块：纯展示，数据全部来自 result -->
  <div class="bench-col">
    <div class="rank-cap">综合分位</div>
    <div class="rank-big num">
      <template v-if="degrade">—</template>
      <template v-else>前 {{ rankPercent }}<span class="pct">%</span></template>
    </div>
    <div class="rank-sub">{{ rankCaption }}</div>
    <div class="rank-bar"><i :style="{ width: rankBarWidth }"></i></div>
  </div>
</template>

<script>
export default {
  name: 'PeerRankModule',
  props: {
    result: { type: Object, required: true }
  },
  computed: {
    degrade() {
      return this.result.degrade;
    },
    rankPercent() {
      return this.result.rank == null ? '' : this.result.rank.toFixed(1);
    },
    rankCaption() {
      if (this.degrade) return '样本不足，暂不输出综合分位';
      return `在「${this.result.groupLabel}」组（共 ${this.result.size} 人）内的综合发展分位列位`;
    },
    rankBarWidth() {
      return this.degrade ? '0' : `${100 - this.result.rank}%`;
    }
  }
};
</script>
