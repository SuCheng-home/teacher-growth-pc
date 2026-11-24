<template>
  <!-- 选择同辈组合：维度取自「同辈对标设置」的档案字段绑定接口，勾选态与取值由卡片自持，上抛拼装好的查询条件 -->
  <section v-loading="loading" class="card">
    <div class="card-head">
      <h2><i data-lucide="sliders-horizontal"></i>选择同辈组合</h2>
      <span class="side">勾选条件并选定取值后自动统计 · 不选取值表示该条件不限制，全部取消即按全校口径统计</span>
    </div>
    <div class="filters">
      <button v-for="dim in dims" :key="dim.key" class="fcond" :class="{ on: checked[dim.key] }" @click="toggleCond(dim)">
        <span class="tick"></span>{{ dim.label }}
      </button>
    </div>
    <div v-if="!loading && !dims.length" class="empty-tip">暂无可勾选的同辈维度，请先到「同辈对标设置 · 全校同辈对标」添加可筛选维度。</div>
    <div class="value-row">
      <label v-for="dim in activeDims" :key="'v-' + dim.key" class="value-item">
        <span class="vl">{{ dim.label }}</span>
        <el-select v-model="values[dim.key]" @change="emitChange">
          <!-- 取值不再提供「全部」不限制项：勾选维度即按候选项首项圈定条件 -->
          <!-- <el-option :label="'全部' + dim.label" :value="''" /> -->
          <template v-if="dim.type === 'enum'">
            <el-option v-for="opt in dim.options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </template>
          <template v-else>
            <el-option v-for="bucket in bucketsOf(dim)" :key="bucket.start" :label="bucket.label" :value="bucket.start" />
          </template>
        </el-select>
      </label>
    </div>
    <div class="scope-bar">
      <span class="grp">{{ scopeLabel }}</span>
      <span class="n num">{{ matchCount }} 人</span>
      <span v-if="schoolPct" class="pct">占全校 {{ schoolPct }}%</span>
      <!-- <button class="btn-reset" @click="resetAll">
        <i data-lucide="rotate-ccw"></i>重置
      </button> -->
    </div>
  </section>
</template>

<script>
import { peerBindList } from '@/api/peer-setting';
import {
  USE_SCOPE,
  IS_DEFAULT_USE,
  isBindRecordShown,
  isNumberFieldType,
  parseOptionRange
} from '@/constants/peer-setting';
import { num, rangeBucketsOf, rangeBucketLabel, rangeCriteriaLabel } from '../analysis-helper';

// 数值维度未配置步长时的兜底步长（与设置页新建绑定的默认值一致）
const DEFAULT_RANGE_STEP = 5;
// 查询条件的匹配运算符：与教师端同辈对比保持一致，条件值按「等于」圈定
const CRITERIA_TYPE_EQ = 'eq';
// 档案字段所在的指标类型：同辈条件均取档案表单数据
const CRITERIA_INDEX_TYPE = 'objectform';

export default {
  name: 'TeamConditionCard',
  props: {
    // 当前条件命中的教师人数（取自分析接口 peerNum），保证口径栏与下方分析面板一致
    matchCount: { type: Number, default: 0 },
    // 全校教师总数（分析接口 schoolTeacherNum，排除后勤、仅在岗），未就绪时不展示占比
    schoolTotal: { type: Number, default: 0 },
    // 最近一次对比记录的条件快照（compareParam）：维度就绪后按它还原勾选与取值，口径栏随之对齐
    compareParam: { type: [String, Object], default: '' }
  },
  watch: {
    // 记录比维度接口后到时补一次还原（无可见维度时无需还原）
    compareParam(val) {
      if (!val || !this.dims.length) return;
      this.applyLatestRecord();
      this.emitChange();
    }
  },
  data() {
    return {
      // 可勾选维度：由档案字段绑定接口下发并归一为卡片内部统一结构
      dims: [],
      // 隐藏条件（isShow=2）：不在本页开放勾选，但按设置页配置的条件值参与命中组圈定
      hiddenDims: [],
      checked: {},
      values: {},
      loading: false
    };
  },
  computed: {
    activeDims() {
      return this.dims.filter((dim) => this.checked[dim.key]);
    },
    schoolPct() {
      if (!this.schoolTotal) return '';
      return (this.matchCount / this.schoolTotal * 100).toFixed(1);
    },
    scopeLabel() {
      if (!this.activeDims.length) return '全校教师';
      return this.activeDims.map((dim) => {
        const value = this.values[dim.key];
        if (value === '' || value === undefined || value === null) return dim.label;
        const shown = dim.type === 'range' ? rangeBucketLabel(dim, value) : this.enumLabel(dim, value);
        return `${dim.label}「${shown}」`;
      }).join(' · ');
    }
  },
  created() {
    this.getBindList();
  },
  methods: {
    // 全校同辈维度：useScope=2 取「通用 + 仅校管理员」的绑定字段，隐藏条件单独留存
    async getBindList() {
      this.loading = true;
      try {
        const res = await peerBindList({ useScope: USE_SCOPE.ADMIN_ONLY });
        const bindList = (res && res.data) || [];
        this.dims = bindList.filter(isBindRecordShown).map((record) => this.normalizeDim(record));
        this.hiddenDims = bindList.filter((record) => !isBindRecordShown(record)).map((record) => this.normalizeDim(record));
      } catch (err) {
        // 接口异常已由请求拦截器统一提示，此处按无可用维度处理并展示引导文案
        this.dims = [];
        this.hiddenDims = [];
      } finally {
        this.loading = false;
      }
      this.initConditionState();
      // 有最近记录时先按上次条件覆写默认勾选，再上抛，保证口径栏与回显的分析结果一致
      this.applyLatestRecord();
      // 维度与默认勾选就绪后立即上抛一次，容器据此发起首次统计（无维度时即为全校口径）
      this.emitChange();
    },
    // 绑定记录 → 卡片维度：数值类型按「开始值 + 步长」切区间，其余按枚举候选项出下拉
    normalizeDim(record) {
      const isNumber = isNumberFieldType(record.indexFieldType);
      const fieldMeta = this.resolveFieldMeta(record);
      return {
        key: record.indexFieldName,
        label: record.peerSearchLabel || record.indexFieldLabel || record.indexFieldName,
        type: isNumber ? 'range' : 'enum',
        start: num(record.beginVal),
        step: num(record.stepVal) || DEFAULT_RANGE_STEP,
        isDefault: num(record.isDefaultUse) === IS_DEFAULT_USE.YES,
        // 隐藏条件在设置页录入的条件值（多选为逗号拼接串）
        hiddenValue: record.defaultVal === undefined || record.defaultVal === null ? '' : record.defaultVal,
        indexName: fieldMeta.indexName,
        fieldType: fieldMeta.fieldType,
        fieldLabel: fieldMeta.fieldLabel,
        // 档案库原始字段节点（type/options/attrs），明细清单用 computedFieldValue 渲染取值
        field: fieldMeta.field && fieldMeta.field.name ? fieldMeta.field : null,
        options: isNumber ? [] : this.resolveOptions(record, fieldMeta.field)
      };
    },
    // 档案字段元信息：查询条件需要指标 name、字段 type 与 label，均从档案指标 store 归集
    resolveFieldMeta(record) {
      const fieldList = this.$store.getters.teacherIndexFieldList || [];
      const field = fieldList.find((item) => item.name === record.indexFieldName) || {};
      const indexList = field.indexCode ? (this.$store.getters.teacherIndexList || []) : [];
      const index = indexList.find((item) => item.code === field.indexCode) || {};
      return {
        field,
        indexName: index.name || record.indexName || '',
        fieldType: field.type || record.indexFieldType || '',
        fieldLabel: field.label || record.indexFieldLabel || ''
      };
    },
    // 枚举候选项：绑定记录限定的取值范围优先，其次取档案字段候选项；两者都没配则只提供「全部」（不限制取值）
    resolveOptions(record, field) {
      const rangedList = parseOptionRange(record.optionRange);
      if (rangedList.length) return this.toOptionList(rangedList);
      return this.toOptionList((field && field.options) || []);
    },
    // 平台候选项统一为 { key, value }：key 作提交值、value 作展示文案
    toOptionList(optionList) {
      return optionList.map((option) => ({ value: option.key, label: option.value }));
    },
    initConditionState() {
      const checked = {};
      const values = {};
      this.dims.forEach((dim) => {
        checked[dim.key] = dim.isDefault;
        // 默认勾选的维度要带上具体取值，取候选项首项
        values[dim.key] = this.firstOptionOf(dim);
      });
      this.checked = checked;
      this.values = values;
    },
    // 维度的首个候选取值：数值维度取第一个区段下限，枚举维度取第一个候选项
    firstOptionOf(dim) {
      if (dim.type === 'range') {
        const buckets = this.bucketsOf(dim);
        return buckets.length ? buckets[0].start : '';
      }
      return dim.options.length ? dim.options[0].value : '';
    },
    enumLabel(dim, value) {
      const matched = dim.options.find((option) => String(option.value) === String(value));
      return matched ? matched.label : value;
    },
    // 还原上次对比条件：compareParam 为记录里存的条件快照（JSON 串或对象），只处理可见维度，隐藏条件仍按设置页配置自动附加
    applyLatestRecord() {
      if (!this.compareParam) return;
      let conditions = null;
      try {
        const param = typeof this.compareParam === 'string' ? JSON.parse(this.compareParam) : this.compareParam;
        // 快照既可能是 CustomQueryQO 本体，也可能只包了一层 queryCondition，两者都取 conditions
        const queryCondition = (param && param.queryCondition) || param || {};
        conditions = queryCondition.conditions;
      } catch (err) {
        // 历史条件快照解析失败：保持默认勾选，不影响分析结果回显
        return;
      }
      if (!Array.isArray(conditions)) return;
      const checked = {};
      const values = {};
      this.dims.forEach((dim) => {
        const hit = conditions.find((item) => item && item.fieldName === dim.key);
        checked[dim.key] = !!hit;
        values[dim.key] = hit ? this.resolveRecordValue(dim, hit.value) : '';
      });
      this.checked = checked;
      this.values = values;
    },
    // 记录提交值 → 下拉选中值：数值维度按区段文案反查区间下限，枚举维度按候选项原值匹配
    resolveRecordValue(dim, value) {
      if (value === '' || value === undefined || value === null) return this.firstOptionOf(dim);
      if (dim.type === 'range') {
        const bucket = this.bucketsOf(dim).find((item) => rangeCriteriaLabel(dim, item.start) === String(value));
        return bucket ? bucket.start : this.firstOptionOf(dim);
      }
      const matched = dim.options.find((option) => String(option.value) === String(value));
      return matched ? matched.value : this.firstOptionOf(dim);
    },
    bucketsOf(dim) {
      return rangeBucketsOf(dim);
    },
    toggleCond(dim) {
      this.checked[dim.key] = !this.checked[dim.key];
      // 勾选即默认选中第一个候选取值，取消勾选清空
      this.values[dim.key] = this.checked[dim.key] ? this.firstOptionOf(dim) : '';
      this.emitChange();
    },
    resetAll() {
      this.dims.forEach((dim) => { this.checked[dim.key] = false; this.values[dim.key] = ''; });
      this.emitChange();
    },
    // 单条查询条件：数值维度提交「下限~上限」区段文案，其余提交字段原始取值
    buildCriteria(dim, value) {
      return {
        criteriaType: CRITERIA_TYPE_EQ,
        queryType: 'criteria',
        indexName: dim.indexName,
        indexType: CRITERIA_INDEX_TYPE,
        fieldType: dim.fieldType,
        fieldName: dim.key,
        fieldLabel: dim.fieldLabel,
        value
      };
    },
    // CustomQueryQO.queryCondition：管理员视角不传 cardId，勾选条件与隐藏条件按 and 求交圈定命中组
    getQueryCondition() {
      const conditions = [];
      this.activeDims.forEach((dim) => {
        const value = this.values[dim.key];
        if (value === '' || value === undefined || value === null) return;
        conditions.push(this.buildCriteria(dim, dim.type === 'range' ? rangeCriteriaLabel(dim, value) : value));
      });
      this.hiddenDims.forEach((dim) => {
        if (dim.hiddenValue === '' || dim.hiddenValue === null) return;
        const value = dim.type === 'range' ? rangeCriteriaLabel(dim, num(dim.hiddenValue)) : dim.hiddenValue;
        conditions.push(this.buildCriteria(dim, value));
      });
      return { conditionType: 'and', queryType: 'condition', conditions };
    },
    // 上抛查询条件与维度元信息（dims 供明细清单出列、取值翻译复用）
    emitChange() {
      this.$emit('condition-change', {
        queryCondition: this.getQueryCondition(),
        dims: this.dims
      });
    }
  }
};
</script>
