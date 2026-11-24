// 校管理员 · 全校同辈对标：接口统计结果的纯计算工具层
// 数据来源为 5.5 getSchoolCompareDataForAdmin 的 statData（summary / structure / teacherList），本页不含任何本地演示数据
import { computedNumberRangeLabel } from '@/utils/archive';

// 数值维度下拉的区间档数（按绑定配置的「开始值 + 步长」连续切分）
const RANGE_BUCKET_COUNT = 8;

export function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

export function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// ---- 数值区间条件 ----
// 区间下拉展示文案：与接口结构分布的区段 label 写法一致（后端含头不含尾，展示为「20-24」）
export function rangeBucketLabel(dim, start) {
  return `${start}-${start + num(dim.step) - 1}`;
}

// 数值维度的区间下拉项：[{ start, label }]，start 作为选项值参与条件提交
export function rangeBucketsOf(dim) {
  const buckets = [];
  for (let i = 0; i < RANGE_BUCKET_COUNT; i++) {
    const start = num(dim.start) + num(dim.step) * i;
    buckets.push({ start, label: rangeBucketLabel(dim, start) });
  }
  return buckets;
}

// 区间条件提交值：与教师端同辈对比保持同一口径，按「下限~上限（含头不含尾）」匹配后端区段
export function rangeCriteriaLabel(dim, start) {
  return computedNumberRangeLabel(start, dim.start, dim.step);
}

// ---- 维度统计（teacherList[].dimensionDataList）----
// 维度数据的归组键：优先维度 id，缺失时退化为维度名称
function dimensionKey(item) {
  const id = item.dimensionId;
  return id === undefined || id === null || id === '' ? String(item.dimensionTitle) : String(id);
}

// 单个教师的维度数据映射（键与 dimensionAggregate 一致），供分组统计与明细行取分复用
export function dimensionDataMap(row) {
  const map = {};
  ((row && row.dimensionDataList) || []).forEach((item) => {
    map[dimensionKey(item)] = item;
  });
  return map;
}

// 命中组各维度统计：平均分位（超过组内 x%）；未生成维度统计的教师不计入
export function dimensionAggregate(teacherList) {
  const bucketMap = {};
  const bucketList = [];
  (teacherList || []).forEach((row) => {
    (row.dimensionDataList || []).forEach((item) => {
      const key = dimensionKey(item);
      if (!bucketMap[key]) {
        bucketMap[key] = { key, title: item.dimensionTitle || '未命名维度', ratios: [] };
        bucketList.push(bucketMap[key]);
      }
      bucketMap[key].ratios.push(num(item.ratio));
    });
  });
  return bucketList.map((bucket) => ({
    key: bucket.key,
    title: bucket.title,
    avgRatio: mean(bucket.ratios)
  }));
}

// 各维度组内标杆：rankNo=1 即为组内第一（并列同名次），维度统计缺失的教师不参与评选
export function dimensionBenchmarks(teacherList, dimensions) {
  return dimensions.map((dimension) => {
    const names = [];
    let score = 0;
    (teacherList || []).forEach((row) => {
      const item = (row.dimensionDataList || []).find((data) => dimensionKey(data) === dimension.key);
      if (!item || num(item.rankNo) !== 1) return;
      if (!names.length) score = num(item.score);
      names.push(row.userName || '未录入姓名');
    });
    return { key: dimension.key, title: dimension.title, score, names };
  });
}

// ---- 教师明细的档案取值 ----
// 明细行取值：档案 Map 可能按字段 name 平铺，也可能按指标名分组，两种形态都尝试
export function archiveValueOf(row, dim) {
  const archiveMap = (row && row.teacher) || {};
  if (archiveMap[dim.key] !== undefined) return archiveMap[dim.key];
  const indexData = archiveMap[dim.indexName];
  if (indexData && typeof indexData === 'object' && indexData[dim.key] !== undefined) {
    return indexData[dim.key];
  }
  const composedKey = `teacher_${dim.indexName}_${dim.key}`;
  return archiveMap[composedKey];
}

// 档案取值 → 展示文案：数组逐项翻译，枚举按候选项取文案，数值与文本原样
function archiveValueText(dim, rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === '') return '';
  const toText = (value) => {
    const matched = ((dim && dim.options) || []).find((option) => String(option.value) === String(value));
    return matched ? String(matched.label) : String(value);
  };
  return Array.isArray(rawValue) ? rawValue.map(toText).join('、') : toText(rawValue);
}

// 明细行的档案展示文案（取不到值返回空串，由调用方兜底占位符）
export function archiveTextOf(row, dim) {
  return archiveValueText(dim, archiveValueOf(row, dim));
}

// ---- 结构分布（statData.structure）----
// 结构项是否区段统计：接口仅对配置了开始值与步长的字段返回 segType=1
export function isSegStructure(structureItem) {
  return Number(structureItem && structureItem.segType) === 1;
}

// 结构项分布条目 → 条形列表条目 [取值, 人数, 占比%]
export function structureEntries(structureItem) {
  return ((structureItem && structureItem.items) || []).map((item) => [
    String(item.label === undefined || item.label === '' ? '未填' : item.label),
    num(item.num),
    num(item.pct)
  ]);
}

// 热力单元格背景色（0~1 归一值越高颜色越深）
function heat(v) {
  const h = Math.round(120 - 100 * Math.min(0.96, v));
  return `hsl(150 ${h > 60 ? 45 : 30}% ${30 + 40 * Math.min(0.96, v)}%)`;
}

// 按档案维度取值分组，统计每组各维度平均得分（人数从多到少，空值归为「未填」）
export function groupScoreRows(teacherList, dim, dimensions) {
  const scoreMaps = (teacherList || []).map((row) => {
    const dataMap = dimensionDataMap(row);
    const scores = {};
    Object.keys(dataMap).forEach((key) => { scores[key] = num(dataMap[key].score); });
    return scores;
  });
  const groupMap = {};
  const groupList = [];
  (teacherList || []).forEach((row, index) => {
    const label = archiveTextOf(row, dim) || '未填';
    if (!groupMap[label]) {
      groupMap[label] = { label, entries: [] };
      groupList.push(groupMap[label]);
    }
    groupMap[label].entries.push(scoreMaps[index]);
  });
  groupList.sort((a, b) => b.entries.length - a.entries.length);
  // 先算各组均值并取全局最大值作热力参照，颜色只表达组与组之间的相对高低
  const groupRows = groupList.map((group) => {
    let maxAvg = 0;
    const values = dimensions.map((dimension) => {
      const scores = group.entries.map((scoreMap) => scoreMap[dimension.key]).filter((v) => v !== undefined);
      if (!scores.length) return null;
      const avg = mean(scores);
      if (avg > maxAvg) maxAvg = avg;
      return avg;
    });
    return { label: group.label, count: group.entries.length, values, maxAvg };
  });
  const topAvg = groupRows.reduce((max, row) => Math.max(max, row.maxAvg), 0);
  return groupRows.map((row) => ({
    label: row.label,
    count: row.count,
    cells: row.values.map((value) => {
      if (value === null) return { text: '—', bg: '' };
      return { text: value.toFixed(1), bg: heat(topAvg ? value / topAvg : 0) };
    })
  }));
}

// ---- 雷达几何（轴数由维度数量决定，中心 200,206，半径 126）----
const CX = 200;
const CY = 206;
const R = 126;
// 标签与数值标注相对最外环的偏移
const RADAR_LABEL_OFFSET = 34;
const RADAR_VALUE_OFFSET = 18;

function radarAngle(i, axisCount) {
  return Math.PI / 180 * (-90 + (360 / axisCount) * i);
}

// 标注水平锚点：正上/正下居中对齐，其余按左右方向对齐
function radarAnchor(cosValue) {
  if (Math.abs(cosValue) < 0.3) return 'middle';
  return cosValue > 0 ? 'start' : 'end';
}

export function radarPoint(i, v, axisCount) {
  const angle = radarAngle(i, axisCount);
  return [CX + Math.cos(angle) * R * v, CY + Math.sin(angle) * R * v];
}

// 等比 v 或逐轴取值的正多边形 points 字符串
export function radarPoly(valOrArr, axisCount) {
  return Array.from({ length: axisCount }, (_, i) => {
    const v = Array.isArray(valOrArr) ? valOrArr[i] : valOrArr;
    return radarPoint(i, v, axisCount).map((n) => n.toFixed(1)).join(',');
  }).join(' ');
}

// 各轴维度名标注坐标 [x, y, text-anchor]
export function radarLabelPos(i, axisCount) {
  const angle = radarAngle(i, axisCount);
  const cosValue = Math.cos(angle);
  return [
    CX + cosValue * (R + RADAR_LABEL_OFFSET),
    CY + Math.sin(angle) * (R + RADAR_LABEL_OFFSET) + 4,
    radarAnchor(cosValue)
  ];
}

// 各轴数值标注坐标 [x, y, text-anchor]
export function radarValuePos(i, axisCount) {
  const angle = radarAngle(i, axisCount);
  const cosValue = Math.cos(angle);
  return [
    CX + cosValue * (R + RADAR_VALUE_OFFSET),
    CY + Math.sin(angle) * (R + RADAR_VALUE_OFFSET) + 4,
    radarAnchor(cosValue)
  ];
}
