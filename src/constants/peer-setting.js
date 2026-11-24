/**
 * 同辈对标设置页常量
 */

// 二级页签
export const SUB_TAB = {
  PERSONAL: 'personal',
  SCHOOL: 'school'
};

// 档案字段选择弹窗的使用场景
export const FIELD_DIALOG_MODE = {
  PEER: 'peer',
  SCHOOL: 'school'
};

// 数值类型字段的各种写法，仅数值类型字段需要配置开始值与步长值；类型列直接展示接口原始取值（number、select、date 等）
const NUMBER_FIELD_TYPE_LIST = ['number', 'int', 'integer', 'float', 'double', 'decimal', '数字'];

// 档案字段绑定的是否显示：1=显示，2=隐藏（隐藏时作为查询条件，需设置条件值）
export const IS_SHOW = {
  SHOW: 1,
  HIDE: 2
};

// 使用范围：0=通用，1=仅教师个人使用，2=仅校管理员使用
export const USE_SCOPE = {
  COMMON: 0,
  TEACHER_ONLY: 1,
  ADMIN_ONLY: 2
};

// 两种绑定场景各自可选的使用范围：「通用」共有，另一项随场景而变
export const USE_SCOPE_OPTIONS = {
  [FIELD_DIALOG_MODE.PEER]: [
    { value: USE_SCOPE.COMMON, label: '通用' },
    { value: USE_SCOPE.TEACHER_ONLY, label: '仅教师使用' }
  ],
  [FIELD_DIALOG_MODE.SCHOOL]: [
    { value: USE_SCOPE.COMMON, label: '通用' },
    { value: USE_SCOPE.ADMIN_ONLY, label: '仅校管理员使用' }
  ]
};

// 是否默认使用：1=是，2=否
export const IS_DEFAULT_USE = {
  YES: 1,
  NO: 2
};

// 是否开启综合分析：1=开启，0=不开启
export const IS_COMPREHENSIVE = {
  YES: 1,
  NO: 0
};

// 综合分析方式：1=占比，2=平均值，3=最大值
export const COMPREHENSIVE_TYPE = {
  RATIO: 1,
  AVERAGE: 2,
  MAX: 3
};

// 综合分析方式的下拉选项
export const COMPREHENSIVE_TYPE_OPTIONS = [
  { value: COMPREHENSIVE_TYPE.RATIO, label: '占比' },
  { value: COMPREHENSIVE_TYPE.AVERAGE, label: '平均值' },
  { value: COMPREHENSIVE_TYPE.MAX, label: '最大值' }
];

// 使用范围 → 列表展示文案
export const USE_SCOPE_LABEL = {
  [USE_SCOPE.COMMON]: '通用',
  [USE_SCOPE.TEACHER_ONLY]: '仅教师个人使用',
  [USE_SCOPE.ADMIN_ONLY]: '仅校管理员使用'
};

// 隐藏条件固定使用「等于」，取值口径与表单筛选保持一致
const CONDITION_CRITERIA_EQ = '=';

// 接口存量运算符取值 → 中文文案
const CRITERIA_NAME_MAP = {
  '=': '等于',
  '<>': '不等于',
  like: '模糊',
  '>': '大于',
  '>=': '大于等于',
  '<': '小于',
  '<=': '小于等于'
};

/**
 * 判断档案指标字段是否为数值类型
 * @param {string} indexFieldType - 接口返回的指标字段类型
 * @returns {boolean}
 */
export function isNumberFieldType(indexFieldType) {
  return NUMBER_FIELD_TYPE_LIST.indexOf(String(indexFieldType || '').toLowerCase()) > -1;
}

/**
 * 绑定记录在教师端是否显示，接口未返回 isShow 时按默认的显示处理
 * @param {Object} bindRecord - AiPeerCompareArchiveBind 记录
 * @returns {boolean}
 */
export function isBindRecordShown(bindRecord) {
  return Number(bindRecord && bindRecord.isShow) !== IS_SHOW.HIDE;
}

/**
 * 运算符取值 → 中文文案
 * @param {string} criteriaType - 接口返回的运算符取值
 * @returns {string}
 */
export function resolveCriteriaName(criteriaType) {
  return CRITERIA_NAME_MAP[criteriaType] || CRITERIA_NAME_MAP[CONDITION_CRITERIA_EQ];
}

/**
 * 条件值 → 界面文案，枚举值按字段候选项翻译成中文
 * @param {string|number|boolean|Array} conditionValue - 条件值，多选用逗号拼接
 * @param {Array} fieldOptions - 字段候选项，形如 [{ key, value }]
 * @returns {string} 取不到值时返回空串
 */
export function resolveConditionValueText(conditionValue, fieldOptions) {
  const optionList = fieldOptions || [];
  const toOptionLabel = (optionValue) => {
    const matched = optionList.find((option) => String(option.key) === String(optionValue));
    return matched ? matched.value : optionValue;
  };
  if (Array.isArray(conditionValue)) {
    return conditionValue.map(toOptionLabel).join('、');
  }
  if (typeof conditionValue === 'boolean') {
    return conditionValue ? '是' : '否';
  }
  if (conditionValue === '' || conditionValue === null || conditionValue === undefined) {
    return '';
  }
  // 接口回传的逗号拼接多选值逐项翻译后再拼接
  return String(conditionValue).split(',').map((item) => String(toOptionLabel(item))).join('、');
}

/**
 * 选项范围 JSON 字符串 → 候选项数组，取不到或解析失败时返回空数组（空数组表示不限制选项）
 * @param {string} optionRange - 接口存储的候选项 JSON 数组字符串，形如 [{ key, value }]
 * @returns {Array}
 */
export function parseOptionRange(optionRange) {
  if (!optionRange) return [];
  try {
    const optionList = JSON.parse(optionRange);
    return Array.isArray(optionList) ? optionList : [];
  } catch (err) {
    // 脏数据按未限制选项处理，不阻断表单
    return [];
  }
}

/**
 * 勾选的候选项 key 列表 → 选项范围 JSON 字符串，保留字段候选项的 key-value 结构
 * @param {Array} optionKeyList - 勾选的候选项 key
 * @param {Array} fieldOptions - 字段候选项，形如 [{ key, value }]
 * @returns {string} 未勾选任何项时返回空串，表示不限制
 */
export function stringifyOptionRange(optionKeyList, fieldOptions) {
  const optionList = fieldOptions || [];
  const selectedList = optionList.filter((option) => {
    return (optionKeyList || []).some((key) => String(key) === String(option.key));
  });
  return selectedList.length ? JSON.stringify(selectedList) : '';
}

/**
 * 同辈条件字段绑定的表单初始值，字段名与接口 AiPeerCompareArchiveBind 一一对应
 * @returns {Object} 一条新建绑定记录的空表单
 */
export function createDefaultBindForm() {
  return {
    id: '',
    indexType: '',
    indexName: '',
    indexCode: '',
    indexLabel: '',
    indexFieldName: '',
    indexFieldCode: '',
    indexFieldLabel: '',
    indexFieldType: '',
    peerShowLabel: '',
    peerSearchLabel: '',
    isShow: IS_SHOW.SHOW,
    // 隐藏条件下的运算符与绑定字段值（仅 isShow=2 时提交）
    criteriaType: CONDITION_CRITERIA_EQ,
    defaultVal: '',
    useScope: USE_SCOPE.COMMON,
    isDefaultUse: IS_DEFAULT_USE.NO,
    // 选项范围：限定指标下拉项的 JSON 数组字符串，形如 [{ key, value }]
    optionRange: '',
    // 综合分析：开启后按方式（占比/平均值/最大值）汇总，条件为字段候选项的 JSON 数组字符串
    isComprehensive: IS_COMPREHENSIVE.NO,
    comprehensiveName: '',
    comprehensiveType: COMPREHENSIVE_TYPE.RATIO,
    comprehensiveCondition: '',
    // 图标（logo 地址）
    icon: '',
    sortNo: 1,
    beginVal: 0,
    stepVal: 5
  };
}
