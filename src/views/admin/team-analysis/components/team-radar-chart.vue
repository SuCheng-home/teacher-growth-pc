<template>
  <!-- 维度雷达：轴数由维度数量决定，命中组实线多边形可选叠加参照虚线，几何由 analysis-helper 计算 -->
  <div class="radar-wrap">
    <svg viewBox="0 0 400 400" role="img" :aria-label="ariaLabel">
      <g>
        <polygon v-for="r in rings" :key="'ring-' + r" :points="polyOfScale(r)" fill="none" stroke="#e7ece8" stroke-width="1" />
        <line v-for="i in axisIndex" :key="'sp-' + i" x1="200" y1="206" :x2="point(i, 1)[0]" :y2="point(i, 1)[1]" stroke="#e7ece8" stroke-width="1" />
        <polygon v-if="hasRef" :points="refPoly" fill="none" stroke="#bcc9be" stroke-width="1.5" stroke-dasharray="4 3" />
        <polygon :points="grpPoly" fill="rgba(63,138,114,.15)" stroke="#3f8a72" stroke-width="2" />
        <circle v-for="(v, i) in values" :key="'dot-' + i" :cx="point(i, v)[0]" :cy="point(i, v)[1]" r="3.4" fill="#3f8a72" />
        <text v-for="(d, i) in dims" :key="'lb-' + i" :x="labelPos(i)[0]" :y="labelPos(i)[1]" :text-anchor="labelPos(i)[2]" font-size="12" fill="#3a4a41">{{ d }}</text>
        <text v-for="(v, i) in values" :key="'vl-' + i" :x="valuePos(i)[0]" :y="valuePos(i)[1]" :text-anchor="valuePos(i)[2]" font-size="10.5" fill="#2f7a68">{{ percentText(v) }}</text>
      </g>
    </svg>
    <div class="radar-legend">
      <span class="lg-item"><i class="grp"></i>{{ label }}</span>
      <span v-if="hasRef" class="lg-item"><i class="all"></i>{{ refLabel }}</span>
    </div>
  </div>
</template>

<script>
import { radarPoly, radarPoint, radarLabelPos, radarValuePos } from '../analysis-helper';

// 雷达背景环（等比缩放的同心多边形比例）
const RADAR_RINGS = [0.25, 0.5, 0.75, 1];

export default {
  name: 'TeamRadarChart',
  props: {
    // 各轴维度名称
    dims: { type: Array, required: true },
    // 各轴取值（0~1 归一）
    values: { type: Array, required: true },
    // 主轴展示文案
    label: { type: String, default: '命中组' },
    // 参照多边形（0~1 归一），不传则不出虚线与图例
    refValues: { type: Array, default: null },
    refLabel: { type: String, default: '参照' },
    ariaLabel: { type: String, default: '维度雷达图' }
  },
  data() {
    return {
      rings: RADAR_RINGS
    };
  },
  computed: {
    axisCount() {
      return this.dims.length;
    },
    axisIndex() {
      return Array.from({ length: this.axisCount }, (_, i) => i);
    },
    hasRef() {
      return !!(this.refValues && this.refValues.length === this.axisCount);
    },
    grpPoly() {
      return radarPoly(this.values, this.axisCount);
    },
    refPoly() {
      return radarPoly(this.refValues, this.axisCount);
    }
  },
  methods: {
    point(i, v) {
      return radarPoint(i, v, this.axisCount);
    },
    polyOfScale(scale) {
      return radarPoly(scale, this.axisCount);
    },
    labelPos(i) {
      return radarLabelPos(i, this.axisCount);
    },
    valuePos(i) {
      return radarValuePos(i, this.axisCount);
    },
    percentText(v) {
      return `${Math.round(v * 100)}%`;
    }
  }
};
</script>

<style scoped>
.radar-legend .lg-item{display:inline-flex;align-items:center;gap:6px}
</style>
