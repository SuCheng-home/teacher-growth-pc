// 同辈对标 · 维度分析设置：常量与纯函数工具
// 三级数据模型：维度（ai_peer_compare_dimension）→ 维度选项（ai_peer_compare_dimension_option）
// → 选项评分（ai_peer_compare_dimension_option_score）

// 通用开关取值：接口口径为字符串枚举，1=否，2=是
export const DIM_FLAG = {
  NO: 1,
  YES: 2
};

// 排名方式（rankType）：空串表示不排名
export const DIM_RANK_TYPE = {
  NONE: '',
  COUNT: 1,
  SCORE: 2
};

// 是否设置评分等级（hasScoreDj）
export const DIM_HAS_SCORE_DJ = {
  NO: 1,
  YES: 2
};

// 数据表名，仅用于页面底部数据模型说明展示
export const PEER_DIM_TABLE_NAMES = {
  dimension: 'ai_peer_compare_dimension',
  option: 'ai_peer_compare_dimension_option',
  score: 'ai_peer_compare_dimension_option_score'
};

// 档案指标查找：metrics 为 teacherIndexList 原始形状，name 即接口 indexName 标识
export function findMetricByName(metrics, indexName) {
  return metrics.find((metric) => metric.name === indexName) || null;
}

// 字段查找：teacherIndexList 原始形状中字段标识为 name（如 teacher_zhry_jb）
export function findMetricField(metric, fieldCode) {
  if (!metric) {
    return null;
  }
  return (metric.fields || []).find((field) => field.name === fieldCode) || null;
}

// 字段是否为可作评分编码的枚举字段（带候选项即可勾选）
export function isEnumField(field) {
  return !!(field && field.options && field.options.length);
}

// 字段是否为可过滤的时间字段
export function isDateField(field) {
  const typeKey = String((field && field.type) || '').toLowerCase();
  return typeKey === 'date' || typeKey === 'datetime';
}

// 字段是否为可作最高奖项取值的文本字段
export function isTextField(field) {
  const typeKey = String((field && field.type) || '').toLowerCase();
  return typeKey === 'input';
}

// 枚举取值 → 序号编码（接口 optionKey 缺失时按候选项顺序兜底），用于拼接 scoreCode
export function fieldOptionKeyOf(field, optionValue) {
  const options = (field && field.options) || [];
  const index = options.findIndex((option) => (option.value || option.name) === optionValue);
  if (index < 0) {
    return '';
  }
  const key = options[index].key;
  return key === undefined || key === null || key === '' ? String(index + 1) : String(key);
}

// 由选项配置实时生成「配置解读」分段文案：取数指标 → 时间过滤 → 计数方式 → 评分档位 → 最高奖项
export function buildOptionInterpretation(option, metrics) {
  const metric = findMetricByName(metrics, option.indexName);
  const parts = [];
  parts.push('取教师档案【' + (metric ? metric.label || metric.name : option.indexName) + '】记录');
  if (option.filterFieldCode && option.filterRecentYear) {
    const filterField = findMetricField(metric, option.filterFieldCode);
    parts.push('近' + option.filterRecentYear + '年（' + (filterField ? filterField.name : option.filterFieldCode) + '）');
  } else if (option.filterFieldCode) {
    parts.push('全部年份');
  }
  parts.push('按条数计数');
  const scoreFieldLabels = (option.scoreFieldNames || [])
    .map((scoreField) => {
      const field = findMetricField(metric, scoreField.code);
      return field ? field.name : scoreField.code;
    })
    .join('+');
  if (option.hasScoreDj === DIM_HAS_SCORE_DJ.YES) {
    const scoreList = option.scores || [];
    if (scoreList.length) {
      const gradeText = scoreList
        .map((item) => item.scoreCodeJson.map((detail) => detail.optionValue).join('') + item.score + '分')
        .join('/');
      parts.push('按【' + scoreFieldLabels + '】评分：' + gradeText);
    } else {
      parts.push('按【' + scoreFieldLabels + '】评分（档位待配置）');
    }
  }
  if (option.hasHighestJx === DIM_FLAG.YES && option.highestFieldCode) {
    const highestField = findMetricField(metric, option.highestFieldCode);
    parts.push('最高奖项取【' + (highestField ? highestField.name : option.highestFieldCode) + '】');
  }
  return parts;
}
