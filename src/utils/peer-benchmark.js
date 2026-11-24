/**
 * 同辈对标计算与雷达图几何纯函数
 * 逻辑与 peer_v3.0_20260927.html 的 compute / buildRadar / renderStrength / aiText / benchText 逐条对齐，
 * 全部为无副作用纯函数，供 growth-peer 容器与子组件复用。
 */
import {
  SELF_PERCENTILE_BASE,
  WIDE_GROUP_PERCENTILE,
  MIN_GROUP_SAMPLE_SIZE
} from '@/constants/growth-peer';

// 综合分位收敛时按固定优先级计数的维度（不含默认「同学科」）
const COUNTED_FIELD_KEYS = ['headteacher', 'tenure', 'age', 'gender', 'title', 'grade'];

// 组内中位基准线（雷达虚线圈，代表 50%）
export const GROUP_MEDIAN_RATIO = 0.5;

// 雷达图几何参数（与原型 viewBox 400×400 对齐）
export const RADAR_CENTER_X = 200;
export const RADAR_CENTER_Y = 206;
export const RADAR_RADIUS = 126;
export const RADAR_RING_RATIOS = [0.25, 0.5, 0.75, 1];

// 六维标签与数值标注的锚点位置：[x, y, text-anchor]
const DIMENSION_LABEL_POINTS = [
  [200, 64, 'middle'],
  [334, 140, 'start'],
  [334, 276, 'start'],
  [200, 358, 'middle'],
  [66, 276, 'end'],
  [66, 140, 'end']
];
const DIMENSION_VALUE_POINTS = [
  [200, 80, 'middle'],
  [334, 156, 'start'],
  [334, 292, 'start'],
  [200, 374, 'middle'],
  [66, 292, 'end'],
  [66, 156, 'end']
];


/** 计算雷达图上第 index 个维度、比例 ratio 的坐标点。 */
export function radarPoint(index, ratio) {
  const angle = (Math.PI / 180) * (-90 + index * 60);
  return [
    RADAR_CENTER_X + Math.cos(angle) * RADAR_RADIUS * ratio,
    RADAR_CENTER_Y + Math.sin(angle) * RADAR_RADIUS * ratio
  ];
}

/** 生成某一比例环（网格 / 中位基准）的多边形 points 字符串。 */
export function radarRingPoints(ratio) {
  return [0, 1, 2, 3, 4, 5]
    .map(index => radarPoint(index, ratio).map(coord => coord.toFixed(1)).join(','))
    .join(' ');
}

/** 生成「我的发展分位」数据多边形的 points 字符串（values 为各轴 0~1 分位比例）。 */
export function radarValuePolygonPoints(values) {
  return [0, 1, 2, 3, 4, 5]
    .map(index => radarPoint(index, values[index] || 0).map(coord => coord.toFixed(1)).join(','))
    .join(' ');
}

/** 输出各维度数据点坐标与标签文本，供模板 v-for 声明式渲染（维度驱动：dimensionTitle 为轴名、ratio 为分位） */
export function buildRadarModel(dimensions) {
  return (dimensions || []).map((dim, index) => {
    const ratio = (dim.ratio || 0) / 100;
    const vertex = radarPoint(index, ratio);
    return {
      name: dim.dimensionTitle,
      percentile: (100 - (dim.ratio || 0)).toFixed(1),
      vertex: { x: +vertex[0].toFixed(1), y: +vertex[1].toFixed(1) },
      label: { x: DIMENSION_LABEL_POINTS[index][0], y: DIMENSION_LABEL_POINTS[index][1], anchor: DIMENSION_LABEL_POINTS[index][2] },
      valueLabel: { x: DIMENSION_VALUE_POINTS[index][0], y: DIMENSION_VALUE_POINTS[index][1], anchor: DIMENSION_VALUE_POINTS[index][2] }
    };
  });
}

/** 生成「同辈 AI 分析」正文文案：强/弱项与综合分位均来自后端统计结果。 */
export function buildPeerSummary(result) {
  if (result.degrade) {
    return `当前组合「${result.groupLabel}」组内共 ${result.size} 人，样本过少，分位不稳定，暂不输出综合分位。建议减少条件放宽组内样本后再看对比。`;
  }
  const strengths = (result.strongDimensions || []).join('、');
  const weaknesses = (result.weakDimensions || []).join('、');
  const rank = result.rank == null ? '' : result.rank.toFixed(1);
  return `在「${result.groupLabel}」组（共 ${result.size} 人）中，你位于前 ${rank}%。${strengths ? strengths + ' 强于组内多数' : ''}${weaknesses ? '；' + weaknesses + ' 弱于组内多数' : ''}。`;
}

/** 生成「组内标杆参考」文案：以个人较弱维度对应的组内最高奖项为标杆（topAwardName 为空则不展示）。 */
export function buildBenchmarkReference(result) {
  if (result.degrade) return '组内样本不足，暂不提供标杆参考。';
  const weakSet = result.weakDimensions || [];
  const refs = (result.dimensions || [])
    .filter(dim => weakSet.includes(dim.dimensionTitle) && dim.topAwardName)
    .map(dim => `「${dim.dimensionTitle}」组内标杆最高 ${dim.topScore} 分、代表奖项「${dim.topAwardName}」`);
  if (!refs.length) return '组内暂无可参考的标杆奖项记录。';
  return `${refs.join('；')}。可参考其成果材料组织方式。`;
}
