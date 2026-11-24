<template>
  <div class="pe-cond">
    <!-- 多选枚举 -->
    <el-select
      v-if="isMultiEnum"
      class="pe-cond-val"
      :value="multipleValue"
      multiple
      clearable
      filterable
      :placeholder="placeholder"
      @change="$emit('change-value', $event)"
    >
      <el-option v-for="option in fieldOptions" :key="option.key" :label="option.value" :value="option.key" />
    </el-select>

    <!-- 日期区间 -->
    <el-date-picker
      v-else-if="isDateRange"
      class="pe-cond-val"
      :value="rangeValue"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :value-format="dateFormat"
      @change="$emit('change-value', $event)"
    />

    <!-- 时间区间 -->
    <el-time-picker
      v-else-if="isTimeRange"
      class="pe-cond-val"
      :value="rangeValue"
      is-range
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      :value-format="timeFormat"
      @change="$emit('change-value', $event)"
    />

    <!-- 单选枚举 -->
    <el-select
      v-else-if="isSingleEnum"
      class="pe-cond-val"
      :value="conditionValue"
      clearable
      filterable
      :placeholder="placeholder"
      @change="$emit('change-value', $event)"
    >
      <el-option v-for="option in fieldOptions" :key="option.key" :label="option.value" :value="option.key" />
    </el-select>

    <!-- 数值 -->
    <el-input-number
      v-else-if="isNumber"
      class="pe-cond-val"
      :value="numberValue"
      :min="fieldAttrs.min"
      :max="fieldAttrs.max"
      :step="stepValue"
      controls-position="right"
      @change="$emit('change-value', $event)"
    />

    <!-- 日期 -->
    <el-date-picker
      v-else-if="isDate"
      class="pe-cond-val"
      :value="conditionValue"
      :type="datePickerType"
      :format="dateFormat"
      :value-format="dateFormat"
      :placeholder="placeholder"
      @change="$emit('change-value', $event)"
    />

    <!-- 时间 -->
    <el-time-picker
      v-else-if="isTime"
      class="pe-cond-val"
      :value="conditionValue"
      :format="timeFormat"
      :value-format="timeFormat"
      :placeholder="placeholder"
      @change="$emit('change-value', $event)"
    />

    <!-- 开关 -->
    <el-switch
      v-else-if="isSwitch"
      class="pe-cond-val"
      :value="conditionValue === true || conditionValue === 'true'"
      @change="$emit('change-value', $event)"
    />

    <!-- 文本与其余类型 -->
    <el-input
      v-else
      class="pe-cond-val"
      :value="conditionValue"
      :placeholder="placeholder"
      @input="$emit('change-value', $event)"
    />
  </div>
</template>

<script>
import { isNumberFieldType } from '@/constants/peer-setting';

// 单选枚举类型
const SINGLE_ENUM_TYPES = ['select', 'radiogroup', 'choiceselector'];
// 多选枚举类型
const MULTI_ENUM_TYPES = ['checkboxgroup', 'mulselect'];
// 区间类型
const DATE_RANGE_TYPES = ['daterange', 'datetimerange'];
const TIME_RANGE_TYPES = ['timerange'];

export default {
  name: 'FieldConditionInput',
  props: {
    // 指标字段类型，决定条件值的录入控件
    fieldType: { type: String, default: '' },
    // 枚举类型的候选项，形如 [{ key, value }]
    fieldOptions: { type: Array, default: () => [] },
    // 字段扩展属性（min / max / step / placeholder）
    fieldAttrs: { type: Object, default: () => ({}) },
    // 用于占位文案的字段名称
    fieldLabel: { type: String, default: '' },
    // 条件值
    conditionValue: { type: [String, Number, Boolean, Array], default: '' }
  },
  computed: {
    fieldTypeKey() {
      return String(this.fieldType || '').toLowerCase();
    },
    isSingleEnum() {
      return SINGLE_ENUM_TYPES.indexOf(this.fieldTypeKey) > -1;
    },
    isMultiEnum() {
      return MULTI_ENUM_TYPES.indexOf(this.fieldTypeKey) > -1;
    },
    isDateRange() {
      return DATE_RANGE_TYPES.indexOf(this.fieldTypeKey) > -1;
    },
    isTimeRange() {
      return TIME_RANGE_TYPES.indexOf(this.fieldTypeKey) > -1;
    },
    isNumber() {
      return isNumberFieldType(this.fieldType);
    },
    isDate() {
      return this.fieldTypeKey === 'date' || this.fieldTypeKey === 'datetime';
    },
    isTime() {
      return this.fieldTypeKey === 'time';
    },
    isSwitch() {
      return this.fieldTypeKey === 'switch';
    },
    // 日期类控件的粒度与格式取自字段扩展属性，缺省按“日”处理
    datePickerType() {
      const comType = String(this.fieldAttrs.comType || '').toLowerCase();
      if (comType && comType.indexOf('range') < 0) return comType;
      return this.fieldTypeKey === 'datetime' ? 'datetime' : 'date';
    },
    dateFormat() {
      if (this.fieldAttrs.format) return this.fieldAttrs.format;
      return this.datePickerType === 'datetime' ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
    },
    timeFormat() {
      return this.fieldAttrs.format || 'HH:mm:ss';
    },
    multipleValue() {
      if (Array.isArray(this.conditionValue)) return this.conditionValue;
      if (this.conditionValue === '' || this.conditionValue === null) return [];
      return String(this.conditionValue).split(',');
    },
    // 区间选择器只接受数组，接口回传的逗号拼接字符串需要拆回
    rangeValue() {
      if (this.conditionValue === '' || this.conditionValue === null) return null;
      if (Array.isArray(this.conditionValue)) return this.conditionValue;
      const rangeList = String(this.conditionValue).split(',');
      return rangeList.length === 2 ? rangeList : null;
    },
    numberValue() {
      const numericValue = Number(this.conditionValue);
      return isNaN(numericValue) ? undefined : numericValue;
    },
    stepValue() {
      return this.fieldAttrs.step || 1;
    },
    placeholder() {
      if (this.fieldAttrs.placeholder) return this.fieldAttrs.placeholder;
      if (!this.fieldLabel) return '请输入条件值';
      const isChooser = this.isSingleEnum || this.isMultiEnum || this.isDate || this.isTime || this.isSwitch;
      return '请' + (isChooser ? '选择' : '输入') + this.fieldLabel;
    }
  }
};
</script>
