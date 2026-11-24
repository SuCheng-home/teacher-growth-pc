<template>
  <!-- 通用计数条形列表：条目为 [名称, 人数, 占比%?]，宽度按本组最大人数归一（区段统计条目为升序，不能直接取首条） -->
  <div class="bar-list">
    <div v-for="e in entries" :key="'bar-' + e[0]" class="bar">
      <span :title="e[0]">{{ e[0] }}</span>
      <div class="track"><div class="fill" :style="fillStyle(e[1])"></div></div>
      <b>{{ e[1] }}<small> 人</small></b>
      <i v-if="e.length > 2" class="pct num">{{ e[2] }}%</i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeamBarList',
  props: {
    // 计数条目：[名称, 人数, 占比%] 数组，占比可缺省
    entries: { type: Array, default: () => [] },
    // 填充色，留空则沿用样式表默认色
    fillColor: { type: String, default: '' }
  },
  computed: {
    max() {
      return this.entries.reduce((max, e) => Math.max(max, e[1]), 1);
    }
  },
  methods: {
    fillStyle(n) {
      const style = { width: `${(n / this.max * 100).toFixed(1)}%` };
      if (this.fillColor) style.background = this.fillColor;
      return style;
    }
  }
};
</script>

<style scoped>
.bar-list .pct{width:52px;flex-shrink:0;text-align:right;font-size:10.5px;font-style:normal;color:var(--muted)}
</style>
