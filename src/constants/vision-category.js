/**
 * 愿景分类管理页常量
 */

// 目标状态：1=正常（已有标准），2=标准待补（口径与标准管理模块保持一致）
export const GOAL_STATUS = {
  NORMAL: 1,
  WAIT: 2
};

// 状态 → 列表标签样式类
export const GOAL_STATUS_TAG_CLS = {
  [GOAL_STATUS.NORMAL]: 'ok',
  [GOAL_STATUS.WAIT]: 'wt'
};

// 状态 → 列表标签文案
export const GOAL_STATUS_TEXT = {
  [GOAL_STATUS.NORMAL]: '正常',
  [GOAL_STATUS.WAIT]: '标准待补'
};

// 状态下拉选项
export const GOAL_STATUS_OPTIONS = [
  { value: GOAL_STATUS.NORMAL, label: '正常（有标准）' },
  { value: GOAL_STATUS.WAIT, label: '标准待补' }
];

// 启用状态：1=启用，2=停用（默认 1，口径与标准管理模块保持一致）
export const GOAL_ENABLE = {
  YES: 1,
  NO: 2
};

// 启用状态 → 列表标签样式类
export const GOAL_ENABLE_TAG_CLS = {
  [GOAL_ENABLE.YES]: 'ok',
  [GOAL_ENABLE.NO]: 'mut'
};

// 启用状态 → 列表标签文案
export const GOAL_ENABLE_TEXT = {
  [GOAL_ENABLE.YES]: '启用',
  [GOAL_ENABLE.NO]: '停用'
};

// 启用状态单选选项（表单用）
export const GOAL_ENABLE_OPTIONS = [
  { value: GOAL_ENABLE.YES, label: '启用' },
  { value: GOAL_ENABLE.NO, label: '停用' }
];

/**
 * 愿景目标表单初始值，字段名与接口 AiVisionGoal 一一对应
 * @returns {Object} 一条新建目标的空表单
 */
export function createDefaultGoalForm() {
  return {
    id: '',
    categoryCode: '',
    categoryName: '',
    goalName: '',
    sortNo: 1,
    // 前置条件目标 id 列表（同分类下其他目标，多选表示「或」关系）
    preGoalIds: [],
    // 档案字段绑定：目标值取自该指标字段对应的选项值
    indexName: '',
    indexLabel: '',
    fieldName: '',
    fieldCode: '',
    fieldLabel: '',
    status: GOAL_STATUS.NORMAL,
    // 是否启用：1=启用，2=停用，默认启用
    isEnable: GOAL_ENABLE.YES,
    goalOptionKey: '',
    goalOptionValue: ''
  };
}
