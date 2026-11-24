/**
 * 分数段类型设置页常量（教师画像综合指数 → 教师类型映射，数据表 ai_profile_score_type_set）
 */

// 综合指数取值范围：0–100
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

// 启用状态：1启用 2停用，与画像指标绑定等画像设置页口径一致
export const IS_ENABLE = {
  ENABLE: 1,
  DISABLE: 2
};

export const IS_ENABLE_OPTIONS = [
  { value: IS_ENABLE.ENABLE, label: '启用' },
  { value: IS_ENABLE.DISABLE, label: '停用' }
];

// 徽章默认配色：新增档位未选色时使用
export const DEFAULT_BADGE_COLOR = '#245f51';

/**
 * 新增/编辑档位的空表单，字段名与接口请求体一一对应
 * @param {number} nextLevelNo - 档位序号，新增时默认排在已有档位之后
 * @returns {Object}
 */
export function createDefaultScoreTypeForm(nextLevelNo = 1) {
  return {
    id: '',
    typeName: '',
    levelNo: nextLevelNo,
    minScore: 80,
    maxScore: 90,
    typeDesc: '',
    color: DEFAULT_BADGE_COLOR,
    isEnable: IS_ENABLE.ENABLE
  };
}

/**
 * 上限归一化：空值统一为 null，表示无上限（最高档留空）
 * @param {*} maxScore - 表单或接口取值
 * @returns {number|null}
 */
export function normalizeScoreMax(maxScore) {
  if (maxScore === '' || maxScore === null || maxScore === undefined) return null;
  const maxValue = Number(maxScore);
  return isFinite(maxValue) ? maxValue : null;
}

/**
 * 分数段区间文案：上限为空时显示「X 分及以上」
 * @param {Object} record - 含 minScore / maxScore 的档位配置
 * @returns {string}
 */
export function formatScoreScope(record) {
  const maxScore = normalizeScoreMax(record.maxScore);
  const minScore = Number(record.minScore);
  return maxScore === null ? minScore + ' 分及以上' : minScore + ' ~ ' + maxScore + ' 分';
}
