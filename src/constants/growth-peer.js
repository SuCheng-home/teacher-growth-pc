/**
 * 同辈对标页面常量
 * 口径：六维分位与「成长首页」「我的画像」同源，本页仅做组内相对位置展示。
 * 同辈条件与组合维度均由 peerBindList 接口动态获取，不再内置演示常量。
 */

// 发展六维名称（雷达图纵轴，按顺时针自正上方起排列）
export const DEVELOPMENT_DIMENSIONS = [
  '教学实践',
  '教研科研',
  '德育工作',
  '示范引领',
  '管理履职',
  '专业研修'
];

// 选择方式：单选（互斥切换）／多选（复选叠加）
export const PEER_SELECT_MODE = {
  SINGLE: 'single',
  MULTI: 'multi'
};

// 六维基线分位：与成长首页、我的画像同源（89/65/86/71/75/75）
export const SELF_PERCENTILE_BASE = [0.89, 0.65, 0.86, 0.71, 0.75, 0.75];

// 放宽到「同学科」大组时的分位，按 −14 个百分点收敛，避免多处各写一套
export const WIDE_GROUP_PERCENTILE = SELF_PERCENTILE_BASE.map(
  value => Math.max(0.30, Math.round((value - 0.14) * 100) / 100)
);

// 综合分位降级阈值：组内人数少于该值时不输出分位
export const MIN_GROUP_SAMPLE_SIZE = 5;
