/**
 * 画像指标绑定设置页常量（/teacherDevelop/aiAnalysis/profileIndexBind）
 */

// 绑定类型：1骨干教师 2职称 3岗位 4学科 5教龄 6任职任教 7班主任 8指导学生获奖 9竞赛/获奖 10政治面貌
export const BIND_TYPE_OPTIONS = [
  { value: 1, label: '骨干教师' },
  { value: 2, label: '专业技术职称' },
  { value: 3, label: '专业技术岗位' },
  { value: 4, label: '主教学科' },
  { value: 5, label: '教龄' },
  { value: 6, label: '任职任教' },
  { value: 7, label: '班主任工作' },
  { value: 8, label: '指导学生获奖' },
  { value: 9, label: '竞赛/获奖' },
  { value: 10, label: '政治面貌' }
];

// 所属模块：1基础信息 2基础数据 3能力业绩 4辐射引领 5发展阶段
export const MODULE_OPTIONS = [
  { value: 1, label: '基础信息' },
  { value: 2, label: '基础数据' },
  { value: 3, label: '能力业绩' },
  { value: 4, label: '辐射引领' },
  { value: 5, label: '发展阶段' }
];

// 比较方式：1计数 2最大值 3去重计数 4直取值/最新值（arrayform 按时间轴字段取最新记录）
export const COMPARE_METHOD_OPTIONS = [
  { value: 1, label: '计数（人次/条数）' },
  { value: 2, label: '最大值（数值字段）' },
  { value: 3, label: '去重计数' },
  { value: 4, label: '直取值 / 最新值' }
];

// 列表「比较方式」列的标签配色
export const COMPARE_METHOD_TAG_CLS = {
  1: 'bl',
  2: 'ok',
  3: 'wt',
  4: 'ok'
};

// 启用状态：1启用 2停用
export const IS_ENABLE = {
  ENABLE: 1,
  DISABLE: 2
};

export const IS_ENABLE_OPTIONS = [
  { value: IS_ENABLE.ENABLE, label: '启用' },
  { value: IS_ENABLE.DISABLE, label: '停用' }
];

// 指标形式：objectform 字段对象 / arrayform 记录数组
export const INDEX_TYPE_TEXT = {
  objectform: '对象表单，直接取字段值',
  arrayform: '数组表单，可计数 / 去重 / 按时间轴取最新记录'
};

// 展示槽位以「直接取值 / 取最新记录」为主，新增默认落在该口径上
const DEFAULT_COMPARE_METHOD = 4;
const DEFAULT_SORT_NO = 10;

/**
 * 枚举取值 → 中文文案
 * @param {Array} optionList - 形如 [{ value, label }] 的枚举
 * @param {string|number} value - 接口取值
 * @returns {string} 未命中时返回空串
 */
export function resolveOptionLabel(optionList, value) {
  const matched = (optionList || []).find((option) => String(option.value) === String(value));
  return matched ? matched.label : '';
}

/**
 * 新增绑定配置的空表单，字段名与接口请求体一一对应
 * @returns {Object}
 */
export function createDefaultBindForm() {
  return {
    id: '',
    bindType: '',
    moduleCode: '',
    slotCode: '',
    showLabel: '',
    indexName: '',
    indexType: '',
    indexFieldName: '',
    compareMethod: DEFAULT_COMPARE_METHOD,
    compareFieldName: '',
    timeFieldName: '',
    // 选项范围：限定展示口径的选项集合，JSON 数组字符串形如 [{ key, value }]
    fieldScopeOptions: '',
    // 特殊选项 key 集合，逗号分隔（如特级教师口径）
    specialOptionKeys: '',
    unitLabel: '',
    sortNo: DEFAULT_SORT_NO,
    isEnable: IS_ENABLE.ENABLE
  };
}

/**
 * 扩展统计配置的空表单：界面按字段分项录入，提交时序列化为 statConfig JSON 字符串
 * @returns {Object}
 */
export function createDefaultStatConfigForm() {
  return {
    // 最新值排序字段（arrayform 取最新记录时的排序依据）
    latestBy: '',
    // 多值拼接符
    join: '',
    // 计数过滤条件，形如 字段码=选项value
    filter: '',
    // 去重计数使用的去重键
    dedupKey: '',
    // 选项值按数值处理（选项存 key、实际按数字比较时开启）
    numericFromOption: false
  };
}

/**
 * statConfig JSON 字符串 → 分项表单，解析失败按空配置处理
 * @param {string} statConfig - 接口存盘扩展配置
 * @returns {Object} 形如 createDefaultStatConfigForm() 的结构
 */
export function parseStatConfig(statConfig) {
  const statConfigForm = createDefaultStatConfigForm();
  if (!statConfig) return statConfigForm;
  let parsedConfig = {};
  try {
    parsedConfig = JSON.parse(statConfig) || {};
  } catch (err) {
    return statConfigForm;
  }
  return {
    latestBy: parsedConfig.latestBy || '',
    join: parsedConfig.join || '',
    filter: parsedConfig.filter || '',
    dedupKey: parsedConfig.dedupKey || '',
    numericFromOption: Boolean(parsedConfig.numericFromOption)
  };
}

/**
 * 分项表单 → statConfig JSON 字符串，未填写的项不写入
 * @param {Object} statConfigForm - 扩展配置表单
 * @returns {string} 全部为空时返回空串
 */
export function stringifyStatConfig(statConfigForm) {
  const form = statConfigForm || {};
  const statConfig = {};
  const appendText = (key) => {
    const value = String(form[key] == null ? '' : form[key]).trim();
    if (value) statConfig[key] = value;
  };
  appendText('latestBy');
  appendText('join');
  appendText('filter');
  appendText('dedupKey');
  if (form.numericFromOption) statConfig.numericFromOption = true;
  return Object.keys(statConfig).length ? JSON.stringify(statConfig) : '';
}

/**
 * 选项范围 JSON 字符串 → 候选项数组，解析失败按「未限制选项」处理
 * @param {string} fieldScopeOptions - 接口存储的 JSON 数组字符串
 * @returns {Array} 形如 [{ key, value }]
 */
export function parseFieldScopeOptions(fieldScopeOptions) {
  if (!fieldScopeOptions) return [];
  try {
    const optionList = JSON.parse(fieldScopeOptions);
    return Array.isArray(optionList) ? optionList : [];
  } catch (err) {
    return [];
  }
}

/**
 * 勾选的候选项 key → 选项范围 JSON 字符串，保留字段候选项的 key-value 结构
 * @param {Array} optionKeyList - 勾选的候选项 key
 * @param {Array} fieldOptions - 字段候选项，形如 [{ key, value }]
 * @returns {string} 未勾选任何项时返回空串，表示不限制
 */
export function stringifyFieldScopeOptions(optionKeyList, fieldOptions) {
  const selectedList = (fieldOptions || []).filter((option) => {
    return (optionKeyList || []).some((key) => String(key) === String(option.key));
  });
  return selectedList.length ? JSON.stringify(selectedList) : '';
}

// 比较方式的数值常量（与 COMPARE_METHOD_OPTIONS 的 value 一一对应）
export const COMPARE_METHOD = {
  COUNT: 1,
  MAX: 2,
  DISTINCT: 3,
  LATEST: 4
};

// 多值字段（mulSelect）的默认拼接符
const DEFAULT_JOIN = '、';

/**
 * 按字段名取值：档案已经 computedTeacher 扁平化，字段名即 key
 * @param {Object} rowData - 对象表单 / 单条记录
 * @param {string} fieldName - 字段名
 * @returns {*} 未命中时返回 undefined
 */
function pickFieldValue(rowData, fieldName) {
  return rowData && fieldName ? rowData[fieldName] : undefined;
}

/**
 * 选项 key → 展示 value：按 fieldScopeOptions 转换，未配置选项范围时原样返回
 * @param {*} value - 字段原始取值（数组按 mulSelect 多值处理）
 * @param {Object} bind - 绑定配置
 * @param {string} join - 多值拼接符
 * @returns {string}
 */
function resolveOptionText(value, bind, join) {
  const optionList = parseFieldScopeOptions(bind.fieldScopeOptions);
  const toOptionValue = (optionKey) => {
    const matched = optionList.find((option) => String(option.key) === String(optionKey));
    return matched ? matched.value : optionKey;
  };
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined && item !== '')
      .map(toOptionValue)
      .join(join);
  }
  if (value === null || value === undefined) return '';
  return String(toOptionValue(value));
}

/**
 * 命中「特殊选项 key」的槽位按特殊口径展示（如特级教师）
 * @param {*} rawValue - 字段原始取值
 * @param {string} specialOptionKeys - 逗号分隔的特殊选项 key
 * @returns {boolean}
 */
function isSpecialOption(rawValue, specialOptionKeys) {
  if (!specialOptionKeys) return false;
  const keyList = String(specialOptionKeys).split(',').map((key) => key.trim()).filter(Boolean);
  const valueList = Array.isArray(rawValue) ? rawValue : [rawValue];
  return valueList.some((item) => keyList.some((key) => key === String(item)));
}

/**
 * 计数过滤：按「字段码=选项value 或 字段码=key」筛选记录
 * @param {Array} rows - 指标记录
 * @param {Object} bind - 绑定配置
 * @param {string} filterText - 形如 hjlb=指导学生
 * @param {string} join - 多值拼接符
 * @returns {Array}
 */
function filterRows(rows, bind, filterText, join) {
  const separatorIndex = filterText.indexOf('=');
  if (separatorIndex < 0) return rows;
  const filterField = filterText.slice(0, separatorIndex).trim();
  const filterValue = filterText.slice(separatorIndex + 1).trim();
  return rows.filter((rowData) => {
    const rawValue = pickFieldValue(rowData, filterField);
    return String(rawValue) === filterValue || resolveOptionText(rawValue, bind, join) === filterValue;
  });
}

/**
 * 槽位统一输出：数值型拼 unitLabel，枚举型按选项转 value
 * @param {Object} slotBase - 槽位公共字段
 * @param {*} rawValue - 计算结果
 * @param {Object} bind - 绑定配置
 * @param {string} join - 多值拼接符
 * @returns {Object|null} 空值返回 null（该槽位不渲染）
 */
function buildSlotValue(slotBase, rawValue, bind, join) {
  if (rawValue === null || rawValue === undefined || rawValue === '') return null;
  const isNumeric = typeof rawValue === 'number';
  const text = isNumeric
    ? (slotBase.unitLabel ? rawValue + ' ' + slotBase.unitLabel : String(rawValue))
    : resolveOptionText(rawValue, bind, join);
  if (!text) return null;
  return {
    ...slotBase,
    value: rawValue,
    text,
    isSpecial: isSpecialOption(rawValue, bind.specialOptionKeys)
  };
}

/**
 * 单个绑定配置 → 槽位展示值（按 compareMethod 取数）
 * @param {Object} bind - 绑定配置
 * @param {Object} teacherArchive - computedTeacher 处理后的教师档案（字段全名 → 值）
 * @returns {Object|null}
 */
function resolveProfileSlot(bind, teacherArchive) {
  const archive = teacherArchive || {};
  const statConfig = parseStatConfig(bind.statConfig);
  const join = statConfig.join || DEFAULT_JOIN;
  const slotBase = {
    slotCode: bind.slotCode || '',
    bindType: bind.bindType,
    showLabel: bind.showLabel || '',
    unitLabel: bind.unitLabel || ''
  };

  // objectform：扁平档案以字段全名为 key，直接取值
  if (bind.indexType === 'objectform') {
    return buildSlotValue(slotBase, archive[bind.indexFieldName], bind, join);
  }

  // arrayform：记录数组以指标名为 key
  const indexData = archive[bind.indexName];
  const rows = Array.isArray(indexData) ? indexData : [];
  if (!rows.length) return null;

  const compareMethod = Number(bind.compareMethod);
  // 直取值 / 最新值：按时间轴字段排序取末条（学期 key 字符串序即时间序）
  if (compareMethod === COMPARE_METHOD.LATEST) {
    const timeField = bind.timeFieldName || statConfig.latestBy;
    const sortedRows = timeField
      ? rows.slice().sort((prevRow, nextRow) => {
        const prevKey = String(pickFieldValue(prevRow, timeField));
        const nextKey = String(pickFieldValue(nextRow, timeField));
        return prevKey.localeCompare(nextKey);
      })
      : rows;
    const latestRow = sortedRows[sortedRows.length - 1] || null;
    const rawValue = latestRow ? pickFieldValue(latestRow, bind.indexFieldName) : null;
    return buildSlotValue(slotBase, rawValue, bind, join);
  }

  // 计数：可带 statConfig.filter 条件过滤
  if (compareMethod === COMPARE_METHOD.COUNT) {
    const matchedRows = statConfig.filter ? filterRows(rows, bind, statConfig.filter, join) : rows;
    return buildSlotValue(slotBase, matchedRows.length, bind, join);
  }

  // 最大值：选项数值字段取 key 的数值
  if (compareMethod === COMPARE_METHOD.MAX) {
    const compareField = bind.compareFieldName || bind.indexFieldName;
    const numberList = rows
      .map((rowData) => parseFloat(pickFieldValue(rowData, compareField)))
      .filter((number) => !isNaN(number));
    return buildSlotValue(slotBase, numberList.length ? Math.max(...numberList) : null, bind, join);
  }

  // 去重计数：按 compareFieldCode / dedupKey 去重后计数
  if (compareMethod === COMPARE_METHOD.DISTINCT) {
    const dedupField = bind.compareFieldName || statConfig.dedupKey || bind.indexFieldName;
    const distinctKeys = rows.map((rowData) => String(pickFieldValue(rowData, dedupField)));
    return buildSlotValue(slotBase, new Set(distinctKeys).size, bind, join);
  }

  return null;
}

/**
 * getProfile 返回的绑定配置 + 教师档案 → 各槽位展示值
 * 约定：只输出启用中的绑定、按 sortNo 升序（对象键序即渲染顺序）、空值槽位不输出
 * @param {Array} bindList - getProfile 的 bindList
 * @param {Object} teacherArchive - teacherData.teacher 经 computedTeacher 扁平化后的档案对象
 * @returns {Object} 形如 { [slotCode]: { slotCode, bindType, showLabel, unitLabel, value, text, isSpecial } }
 */
export function buildProfileSlots(bindList, teacherArchive) {
  const archive = teacherArchive || {};
  const enabledList = (bindList || [])
    .filter((bind) => Number(bind.isEnable) !== IS_ENABLE.DISABLE)
    .sort((prevBind, nextBind) => Number(prevBind.sortNo || 0) - Number(nextBind.sortNo || 0));
  const profileSlots = {};
  enabledList.forEach((bind) => {
    const slot = resolveProfileSlot(bind, archive);
    if (!slot) return;
    // 未配置槽位标识时按绑定类型兜底，保证原型固定槽位仍能取到值
    profileSlots[bind.slotCode || 'bindType' + bind.bindType] = slot;
  });
  return profileSlots;
}
