/**
 * 标准管理页常量
 */

// 标准状态：1=已上传评比文件（提示词待配置），2=标准待补（无评比文件），3=已配置（三提示词齐全）
export const STANDARD_STATUS = {
  PENDING_PROMPT: 1,
  WAIT_FILE: 2,
  CONFIGURED: 3
};

// 状态 → 列表标签样式类
export const STANDARD_STATUS_TAG_CLS = {
  [STANDARD_STATUS.PENDING_PROMPT]: 'mut',
  [STANDARD_STATUS.WAIT_FILE]: 'wt',
  [STANDARD_STATUS.CONFIGURED]: 'ok'
};

// 状态 → 列表标签文案
export const STANDARD_STATUS_TEXT = {
  [STANDARD_STATUS.PENDING_PROMPT]: '待配置',
  [STANDARD_STATUS.WAIT_FILE]: '标准待补',
  [STANDARD_STATUS.CONFIGURED]: '已配置'
};

// 启用状态：1=启用，2=停用（默认 1）
export const STANDARD_ENABLE = {
  YES: 1,
  NO: 2
};

// 启用状态 → 列表标签样式类
export const STANDARD_ENABLE_TAG_CLS = {
  [STANDARD_ENABLE.YES]: 'ok',
  [STANDARD_ENABLE.NO]: 'mut'
};

// 启用状态 → 列表标签文案
export const STANDARD_ENABLE_TEXT = {
  [STANDARD_ENABLE.YES]: '启用',
  [STANDARD_ENABLE.NO]: '停用'
};

// 启用状态单选选项（表单用）
export const STANDARD_ENABLE_OPTIONS = [
  { value: STANDARD_ENABLE.YES, label: '启用' },
  { value: STANDARD_ENABLE.NO, label: '停用' }
];

/**
 * 标准表单初始值，字段名与接口 AiVisionStandard 一一对应
 * @returns {Object} 一条新建标准的空表单
 */
export function createDefaultStandardForm() {
  return {
    id: '',
    categoryCode: '',
    goalId: '',
    standardName: '',
    // 是否启用：1=启用，2=停用，默认启用
    isEnable: STANDARD_ENABLE.YES,
    // UI 辅助字段：已上传的 FileJson 列表（非接口字段，提交时序列化进 compareFile 字符串）
    compareFileList: []
  };
}
