// afterValue中不需要处理的key
export const afterValueFilterKeys = [
  'dataId', 'createTime', '_allowDel', '_allowEdit', '_beanId', '_syncRemark'
]

// 字段Name数据拼接
export function computedTeacher(val = {}) {
  const obj = {}
  Object.keys(val).forEach((indexKey) => {
    const data = val[indexKey]
    if (Array.isArray(data)) {
      obj[`teacher_${indexKey}`] = data.map((row) => {
        const _row = {
          dataId: row.dataId
        }
        // 第三方同步来源信息字段
        if (Reflect.has(row, '_beanId')) {
          Reflect.set(_row, '_beanId', row._beanId)
          Reflect.set(_row, '_allowDel', row._allowDel)
          Reflect.set(_row, '_allowEdit', row._allowEdit)
          Reflect.set(_row, '_syncRemark', row._syncRemark)
        }
        Object.keys(row).forEach((key) => {
          if (!afterValueFilterKeys.includes(key)) {
            _row[`teacher_${indexKey}_${key}`] = row[key]
          }
        })
        return _row
      })
    } else {
      Object.keys(data).forEach((key) => {
        obj[`teacher_${indexKey}_${key}`] = data[key]
      })
    }
  })
  return obj
}




const baseFieldTypes = ['input', 'textarea', 'number', 'date', 'time'] // 基础类型字段
const rangeDataFields = ['dateRange', 'timeRange']
const hasOptionsField = ['select', 'radioGroup', 'checkboxGroup', 'mulSelect', 'choiceSelector']

/**
 * 按「开始值 + 步长」把连续数值归入对应的同辈区间并生成展示文案。
 * 区间以 [beginVal, beginVal + stepVal) 为最小桶，逐段右开递增。
 * @param {number|string} value - 字段原始数值
 * @param {number|string} beginVal - 区间开始值
 * @param {number|string} stepVal - 区间步长
 * @param {string} emptyStr - 空值或未配置区间时的占位
 * @returns {string}
 */
export function computedNumberRangeLabel(value, beginVal, stepVal, emptyStr = '-') {
  const numericValue = Number(value)
  const start = Number(beginVal)
  const step = Number(stepVal)
  if (isNaN(numericValue) || isNaN(start) || isNaN(step) || step <= 0) {
    return emptyStr
  }
  if (numericValue < start) {
    return `${start} 以下`
  }
  const bucketIndex = Math.floor((numericValue - start) / step)
  const lowerBound = start + bucketIndex * step
  const upperBound = lowerBound + step
  return `${lowerBound}~${upperBound}`
}

// 计算字段的值
export function computedFieldValue(field, val, emptyStr = '-') {
  if (val === '' || val === undefined || val === null) {
    return emptyStr
  }
  const compVal = typeof val === 'boolean'
    ? val
    : (val || field.value)
  const fieldType = field.type
  if (baseFieldTypes.includes(fieldType)) {
    return compVal || emptyStr
  } else if (hasOptionsField.includes(fieldType)) {
    const options = field.options
    if (!compVal || !compVal?.length) {
      return emptyStr
    }
    if (Array.isArray(compVal)) {
      const str = options.filter(o => compVal.includes(o.key))
        .map(o => o.value)
        .join('，')
      return str || emptyStr
    } else {
      const str = options.find(o => compVal === o.key)?.value
      return str || emptyStr
    }
  } else if (rangeDataFields.includes(fieldType)) {
    if (!compVal || !compVal.length) return emptyStr
    return `${compVal[0]} 至 ${compVal[1]}`
  } else if (fieldType === 'switch') {
    return compVal ? '开' : '关'
  } else if (fieldType === 'cityCascader') {
    const nameArr = compVal.map(i => i.split('__')[0])
    return field.attrs.showAllLevels
      ? nameArr.join(field.attrs.separator)
      : nameArr[nameArr.length - 1]
  } else if (fieldType === 'personnel') {
    return compVal.map(i => i.name).join('，')
  } else {
    return ''
  }
}
