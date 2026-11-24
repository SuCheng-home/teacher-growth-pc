<template>
  <!-- 综合分析-六维雷达模块：纯展示，几何由工具函数派生 -->
  <div class="bench-col">
    <div class="radar-wrap">
      <svg id="peer-radar" viewBox="0 0 400 400" role="img" aria-label="同辈对标六维雷达图">
        <g>
          <polygon v-for="ratio in ringRatios" :key="'ring-' + ratio" :points="ringPoints(ratio)" fill="none" stroke="#e7ece8" stroke-width="1"/>
          <line v-for="(axis, index) in axisEnds" :key="'axis-' + index" :x1="centerX" :y1="centerY" :x2="axis.x" :y2="axis.y" stroke="#e7ece8" stroke-width="1"/>
          <polygon :points="medianPoints" fill="none" stroke="#bcc9be" stroke-width="1.5" stroke-dasharray="4 3"/>
          <polygon :points="valuePolygonPoints" fill="rgba(63,138,114,.15)" stroke="#3f8a72" stroke-width="2"/>
          <circle v-for="(node, index) in radarNodes" :key="'dot-' + index" :cx="node.vertex.x" :cy="node.vertex.y" r="3.4" fill="#3f8a72"/>
          <text v-for="(node, index) in radarNodes" :key="'name-' + index" :x="node.label.x" :y="node.label.y" :text-anchor="node.label.anchor" font-size="12" fill="#3a4a41" font-family="Microsoft YaHei">{{ node.name }}</text>
          <text v-for="(node, index) in radarNodes" :key="'pct-' + index" :x="node.valueLabel.x" :y="node.valueLabel.y" :text-anchor="node.valueLabel.anchor" font-size="10.5" fill="#2f7a68" font-family="Microsoft YaHei">前 {{ node.percentile }}%</text>
        </g>
      </svg>
    </div>
    <div class="radar-legend">
      <span style="display:inline-flex;align-items:center;gap:6px"><i class="mine"></i>我的发展分位</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><i class="ref"></i>组内中位 50%</span>
    </div>
  </div>
</template>

<script>
import {
  RADAR_RING_RATIOS,
  RADAR_CENTER_X,
  RADAR_CENTER_Y,
  GROUP_MEDIAN_RATIO,
  radarRingPoints,
  radarValuePolygonPoints,
  radarPoint,
  buildRadarModel
} from '@/utils/peer-benchmark';

export default {
  name: 'PeerRadarModule',
  props: {
    result: { type: Object, required: true }
  },
  data() {
    return {
      ringRatios: RADAR_RING_RATIOS,
      centerX: RADAR_CENTER_X,
      centerY: RADAR_CENTER_Y
    };
  },
  computed: {
    dimensions() {
      return this.result.dimensions || [];
    },
    values() {
      return this.result.values || [0, 0, 0, 0, 0, 0];
    },
    axisEnds() {
      return [0, 1, 2, 3, 4, 5].map(index => {
        const point = radarPoint(index, 1);
        return { x: +point[0].toFixed(1), y: +point[1].toFixed(1) };
      });
    },
    medianPoints() {
      return radarRingPoints(GROUP_MEDIAN_RATIO);
    },
    valuePolygonPoints() {
      return radarValuePolygonPoints(this.values);
    },
    radarNodes() {
      return buildRadarModel(this.dimensions);
    }
  },
  methods: {
    ringPoints(ratio) {
      return radarRingPoints(ratio);
    }
  }
};
</script>
