<template>
  <!-- ③ 同辈对比：按每个同辈条件单独圈定的可比组，逐组展示六维雷达（我的分位 vs 组内中位）+ 高于/持平/低于三段结论 -->
  <div v-show="enabled">
    <section v-for="(group, gi) in groups" :key="gi" :id="'sec-peer-' + gi">
      <div class="card">
        <div class="sec-eyebrow">{{ cfg.eyebrow }}</div>
        <h2 class="sec-h"><i :data-lucide="cfg.icon"></i>{{ cfg.title }} · {{ group.name }}</h2>
        <div class="sec-sub">{{ group.label }} · 组内 {{ group.peerNum }} 人 · 分位示意，非官方评分，不排名</div>
        <div class="peer-grid" style="margin-top:12px">
          <div>
            <div class="radar-wrap">
              <svg viewBox="0 0 400 400" role="img" :aria-label="'同辈对比雷达图 · ' + group.name">
                <polygon v-for="ratio in ringRatios" :key="'ring-' + ratio" :points="ringPoints(ratio)" fill="none" stroke="#e6ece6" stroke-width="1"/>
                <line v-for="(axis, index) in axisEnds" :key="'axis-' + index" :x1="centerX" :y1="centerY" :x2="axis.x" :y2="axis.y" stroke="#eef1ee" stroke-width="1"/>
                <polygon :points="medianPoints" fill="none" stroke="#bac8b7" stroke-width="1.5" stroke-dasharray="3 3"/>
                <polygon :points="minePoints(group)" fill="rgba(116,155,117,.15)" stroke="#4d7a5f" stroke-width="2"/>
                <circle v-for="(node, index) in radarNodes(group)" :key="'dot-' + index" :cx="node.vertex.x" :cy="node.vertex.y" r="3" fill="#4d7a5f"/>
                <text v-for="(node, index) in radarNodes(group)" :key="'label-' + index" :x="node.label.x" :y="node.label.y" :text-anchor="node.label.anchor" font-size="10" fill="#83927f" font-family="Microsoft YaHei">{{ node.name }}</text>
              </svg>
            </div>
            <div class="legend">
              <span class="m"><i></i>{{ cfg.legend[0].text }}</span>
              <span class="r"><i></i>{{ cfg.legend[1].text }}</span>
            </div>
          </div>
          <div class="peer-notes">
            <div v-for="note in notesFor(group)" :key="note.lead" class="peer-note">
              <i :data-lucide="note.icon"></i>
              <span><b>{{ note.lead }}</b>{{ note.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { PORTRAIT_PEER_REF } from '@/constants/growth-portrait';
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

// 分位差定位阈值（百分点）：与「同辈对比报告」口径一致，维度分位高于/低于组内中位（50%）达该值才判高/低
const POS_THRESHOLD = 3;
// 三段结论桶：与 cfg.notes 顺序（高于 / 持平 / 低于）对应
const NOTE_BUCKETS = [
  { key: 'up', clause: ' 高于可比组中位，是相对优势项，可作为申报主线。' },
  { key: 'flat', clause: ' 与可比组中位基本持平，稳中有升。' },
  { key: 'down', clause: ' 低于可比组中位，是需优先投入的维度。' }
];

export default {
  name: 'PortraitPeerRef',
  props: {
    /* 段落是否显示（父组件按 frame.sections.peer 传入） */
    enabled: { type: Boolean, default: true },
    /* 同辈对比分组（父容器拆分条件、逐组调对比接口取回）：每项 { name, label, peerNum, totalRatio, dimensions } */
    groups: { type: Array, default: () => [] }
  },
  data() {
    return {
      cfg: PORTRAIT_PEER_REF,
      ringRatios: RADAR_RING_RATIOS,
      centerX: RADAR_CENTER_X,
      centerY: RADAR_CENTER_Y
    };
  },
  computed: {
    // 六条轴端点（几何固定六轴，与 peer-radar-module 同源）
    axisEnds() {
      return [0, 1, 2, 3, 4, 5].map(index => {
        const point = radarPoint(index, 1);
        return { x: +point[0].toFixed(1), y: +point[1].toFixed(1) };
      });
    },
    // 组内中位基准线圈（固定 50% 分位）
    medianPoints() {
      return radarRingPoints(GROUP_MEDIAN_RATIO);
    }
  },
  methods: {
    ringPoints(ratio) {
      return radarRingPoints(ratio);
    },
    // 各维度分位（ratio 为「超过组内 X%」，÷100 得 0~1 比例）作为雷达顶点比例
    valuesFor(group) {
      return (group.dimensions || []).map(dim => Math.max(0.04, (dim.ratio || 0) / 100));
    },
    minePoints(group) {
      return radarValuePolygonPoints(this.valuesFor(group));
    },
    // 雷达轴名/顶点/标签坐标由维度数据派生（dimensionTitle 为轴名、ratio 为分位）
    radarNodes(group) {
      return buildRadarModel(group.dimensions || []);
    },
    // 高于/持平/低于三段结论：按各维度分位与组内中位（50%）的分位差归档，维度名动态拼接
    notesFor(group) {
      const names = { up: [], flat: [], down: [] };
      (group.dimensions || []).forEach(dim => {
        const diff = Math.round((dim.ratio || 0) - 50);
        const bucket = diff >= POS_THRESHOLD ? 'up' : (diff <= -POS_THRESHOLD ? 'down' : 'flat');
        names[bucket].push(dim.dimensionTitle);
      });
      return NOTE_BUCKETS.map((bucket, i) => {
        const note = this.cfg.notes[i] || {};
        const list = names[bucket.key];
        return {
          icon: note.icon || 'minus',
          lead: note.lead || '',
          text: list.length ? `${list.join('、')}${bucket.clause}` : '该定位下暂无维度。'
        };
      });
    }
  }
};
</script>
