<template>
  <el-dialog
    :visible="visible"
    width="560px"
    top="8vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">FIELD BINDING</div>
      <div class="dlg-title">{{ dialogTitle }}</div>
    </div>
    <p class="dlg-desc">{{ dialogDesc }}</p>
    <el-form ref="bindForm" :model="form" :rules="rules" label-position="top" size="small">
      <el-form-item label="档案字段" :prop="isEdit ? '' : 'indexFieldName'">
        <el-cascader
          v-if="!isEdit"
          v-model="fieldPath"
          :options="indexOptions"
          :props="cascaderProps"
          style="width:100%"
          placeholder="选择指标下的档案字段"
          @change="onFieldPathChange"
        />
        <el-input v-else :value="form.indexLabel + ' / ' + form.indexFieldLabel" disabled />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="显示名称" prop="peerShowLabel">
            <el-input v-model="form.peerShowLabel" :placeholder="showLabelPlaceholder" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="搜索名称">
            <el-input v-model="form.peerSearchLabel" placeholder="默认与显示名称一致" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="排序值" prop="sortNo">
            <el-input-number v-model="form.sortNo" :step="1" controls-position="right" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用范围">
            <el-select v-model="form.useScope" style="width:100%">
              <el-option
                v-for="scopeOption in useScopeOptions"
                :key="scopeOption.value"
                :label="scopeOption.label"
                :value="scopeOption.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="showOptionRange" label="选项取值范围">
        <el-checkbox-group v-model="optionRangeKeys" class="pe-optrange">
          <el-checkbox
            v-for="fieldOption in currentFieldOptions"
            :key="fieldOption.key"
            :label="fieldOption.key"
          >{{ fieldOption.value }}</el-checkbox>
        </el-checkbox-group>
        <div class="pe-hint">不勾选表示不限制，筛选时可使用该字段的全部选项。</div>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="是否作为隐藏条件">
            <el-switch
              class="pe-switchfield"
              :value="isFieldHidden"
              inactive-text="否"
              active-text="是"
              @change="toggleIsShow"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否默认使用">
            <el-checkbox v-model="defaultUseChecked">默认选中</el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="isHiddenCondition" label="隐藏条件值" prop="defaultVal">
        <field-condition-input
          :field-type="form.indexFieldType"
          :field-options="currentFieldOptions"
          :field-attrs="currentFieldAttrs"
          :field-label="form.indexFieldLabel"
          :condition-value="form.defaultVal"
          @change-value="handleConditionValueChange"
        />
      </el-form-item>
      <el-form-item v-if="isSchoolMode" label="是否开启综合分析">
        <el-switch
          v-model="form.isComprehensive"
          :active-value="1"
          :inactive-value="0"
          inactive-text="否"
          active-text="是"
          @change="onComprehensiveToggle"
        />
      </el-form-item>
      <template v-if="isComprehensiveOn">
        <el-form-item label="综合分析名称" prop="comprehensiveName">
          <el-input v-model="form.comprehensiveName" placeholder="默认与绑定字段名称一致" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="分析方式" prop="comprehensiveType">
              <el-select v-model="form.comprehensiveType" style="width:100%">
                <el-option
                  v-for="typeOption in comprehensiveTypeOptions"
                  :key="typeOption.value"
                  :label="typeOption.label"
                  :value="typeOption.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分析条件">
              <el-select
                v-model="comprehensiveConditionKeys"
                multiple
                collapse-tags
                style="width:100%"
                placeholder="不选择表示全部选项参与分析"
              >
                <el-option
                  v-for="fieldOption in currentFieldOptions"
                  :key="fieldOption.key"
                  :label="fieldOption.value"
                  :value="fieldOption.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      <el-row v-if="isNumberField" :gutter="16">
        <el-col :span="12">
          <el-form-item label="开始值">
            <el-input-number v-model="form.beginVal" :min="0" controls-position="right" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="步长">
            <el-input-number v-model="form.stepVal" :min="1" controls-position="right" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dlg-foot">
      <span class="dlg-cnt">带 * 为必填</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button size="small" type="primary" :loading="saving" @click="onConfirm">{{ submitText }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FieldConditionInput from './field-condition-input.vue';
import {
  FIELD_DIALOG_MODE,
  IS_SHOW,
  IS_DEFAULT_USE,
  IS_COMPREHENSIVE,
  COMPREHENSIVE_TYPE_OPTIONS,
  USE_SCOPE_OPTIONS,
  createDefaultBindForm,
  isNumberFieldType,
  parseOptionRange,
  stringifyOptionRange
} from '@/constants/peer-setting';

const DIALOG_TEXT = {
  [FIELD_DIALOG_MODE.PEER]: {
    addTitle: '添加同辈条件字段',
    editTitle: '编辑同辈条件字段',
    showLabelPlaceholder: '教师端条件标签展示文案',
    desc: '从教师档案的对象数据字段中选择字段，配置教师端的显示名称、搜索名称与排序；数字类型可配置开始值与步长，把连续值切成同辈区间。'
  },
  [FIELD_DIALOG_MODE.SCHOOL]: {
    addTitle: '添加全校筛选维度',
    editTitle: '编辑全校筛选维度',
    showLabelPlaceholder: '默认与字段名称一致',
    desc: '从教师档案的对象数据字段中选择一个维度，配置其在管理端的显示名称与排序；数字类型可配置开始值与步长切成区间。关闭「对校管理员开放」后，该维度保留配置但不再出现在全校分析中。'
  }
};

export default {
  name: 'FieldBindDialog',
  components: { FieldConditionInput },
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的字段记录，为空表示新增
    record: { type: Object, default: null },
    // 档案指标列表（父级已按指标→字段层级组好，并过滤掉已使用的字段）
    indexOptions: { type: Array, default: () => [] },
    mode: { type: String, default: FIELD_DIALOG_MODE.PEER },
    saving: { type: Boolean, default: false }
  },
  data() {
    return {
      // 级联选中路径：[指标 name, 字段 name]
      fieldPath: [],
      // el-cascader 会往该对象写入自身默认值，不能冻结
      cascaderProps: { value: 'name', label: 'label', children: 'fields', expandTrigger: 'hover' },
      form: createDefaultBindForm(),
      rules: {
        indexFieldName: [{ required: true, message: '请选择档案字段', trigger: 'change' }],
        peerShowLabel: [{ required: true, whitespace: true, message: '请输入显示名称', trigger: 'blur' }],
        sortNo: [{ required: true, type: 'number', message: '请输入排序值', trigger: 'blur' }],
        defaultVal: [{ required: true, message: '请设置隐藏条件值', trigger: 'change' }],
        comprehensiveName: [{ required: true, whitespace: true, message: '请输入综合分析名称', trigger: 'blur' }]
      },
      // 综合分析方式的下拉选项（模板消费常量需挂到实例上）
      comprehensiveTypeOptions: COMPREHENSIVE_TYPE_OPTIONS
    };
  },
  computed: {
    isPeerMode() {
      return this.mode === FIELD_DIALOG_MODE.PEER;
    },
    // 综合分析只在全校筛选维度场景开放
    isSchoolMode() {
      return this.mode === FIELD_DIALOG_MODE.SCHOOL;
    },
    isEdit() {
      return !!(this.record && this.record.id);
    },
    isNumberField() {
      return isNumberFieldType(this.form.indexFieldType);
    },
    isFieldHidden() {
      return this.form.isShow !== IS_SHOW.SHOW;
    },
    // 只在同辈场景且字段被隐藏时需要录入条件值
    isHiddenCondition() {
      return this.isPeerMode && this.isFieldHidden;
    },
    // 当前字段在档案指标里的原始节点（取枚举选项与 min/max/step 等扩展属性）
    currentField() {
      const indexItem = this.indexOptions.find((item) => item.name === this.form.indexName);
      if (!indexItem) return {};
      return (indexItem.fields || []).find((field) => field.name === this.form.indexFieldName) || {};
    },
    currentFieldOptions() {
      return this.currentField.options || [];
    },
    currentFieldAttrs() {
      return this.currentField.attrs || {};
    },
    // 使用范围的可选项随绑定场景变化，「通用」为两种场景共有
    useScopeOptions() {
      return USE_SCOPE_OPTIONS[this.mode] || USE_SCOPE_OPTIONS[FIELD_DIALOG_MODE.PEER];
    },
    // 选项范围只用于限制全校筛选维度的下拉选项，仅拥有候选项的字段可配置
    showOptionRange() {
      return (this.form.useScope === 0 || this.form.useScope === 2) && this.currentFieldOptions.length > 0;
    },
    // 勾选框与接口 isDefaultUse（1=是，2=否）互转
    defaultUseChecked: {
      get() {
        return Number(this.form.isDefaultUse) === IS_DEFAULT_USE.YES;
      },
      set(isChecked) {
        this.form.isDefaultUse = isChecked ? IS_DEFAULT_USE.YES : IS_DEFAULT_USE.NO;
      }
    },
    // 选项范围在界面是候选项 key 数组，存回 form 时还原为接口的 JSON 数组字符串
    optionRangeKeys: {
      get() {
        return parseOptionRange(this.form.optionRange).map((option) => option.key);
      },
      set(optionKeyList) {
        this.form.optionRange = stringifyOptionRange(optionKeyList, this.currentFieldOptions);
      }
    },
    // 是否开启综合分析（接口取值 1=开启，0=不开启）
    isComprehensiveOn() {
      return Number(this.form.isComprehensive) === IS_COMPREHENSIVE.YES;
    },
    // 综合分析条件与选项范围同构：界面是候选项 key 数组，存回 form 时为 key-value JSON 数组字符串
    comprehensiveConditionKeys: {
      get() {
        return parseOptionRange(this.form.comprehensiveCondition).map((option) => option.key);
      },
      set(optionKeyList) {
        this.form.comprehensiveCondition = stringifyOptionRange(optionKeyList, this.currentFieldOptions);
      }
    },
    dialogTitle() {
      const text = DIALOG_TEXT[this.mode] || DIALOG_TEXT[FIELD_DIALOG_MODE.PEER];
      return this.isEdit ? text.editTitle : text.addTitle;
    },
    dialogDesc() {
      const text = DIALOG_TEXT[this.mode] || DIALOG_TEXT[FIELD_DIALOG_MODE.PEER];
      return text.desc;
    },
    showLabelPlaceholder() {
      const text = DIALOG_TEXT[this.mode] || DIALOG_TEXT[FIELD_DIALOG_MODE.PEER];
      return text.showLabelPlaceholder;
    },
    submitText() {
      if (this.isPeerMode && this.isEdit) return '保存修改';
      return this.isPeerMode ? '确认添加' : '添加维度';
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.form = this.record ? { ...createDefaultBindForm(), ...this.record } : createDefaultBindForm();
      this.fieldPath = [];
      this.$nextTick(() => {
        if (this.$refs.bindForm) this.$refs.bindForm.clearValidate();
      });
    }
  },
  methods: {
    onFieldPathChange(pathList) {
      const field = this.findSelectedField(pathList);
      if (!field) return;
      const indexItem = this.indexOptions.find((item) => item.name === pathList[0]);
      const fieldLabel = field.label || field.name;
      this.form.indexType = indexItem.type || '';
      this.form.indexName = indexItem.name || '';
      this.form.indexCode = indexItem.code || '';
      this.form.indexLabel = indexItem.label || indexItem.name || '';
      this.form.indexFieldName = field.name || '';
      this.form.indexFieldCode = field.code || '';
      this.form.indexFieldLabel = fieldLabel;
      this.form.indexFieldType = field.type || '';
      this.form.peerShowLabel = fieldLabel;
      this.form.peerSearchLabel = fieldLabel;
      // 换字段后旧条件值与选项范围和新字段不再匹配，清空待重新录入
      this.form.defaultVal = '';
      this.form.optionRange = '';
      // 分析条件同样随字段候选项失效；分析名称默认跟随新字段
      this.form.comprehensiveCondition = '';
      if (this.isComprehensiveOn) this.form.comprehensiveName = fieldLabel;
      if (this.$refs.bindForm) {
        this.$refs.bindForm.clearValidate('indexFieldName');
        this.$refs.bindForm.clearValidate('peerShowLabel');
        this.$refs.bindForm.clearValidate('peerSearchLabel');
      }
    },
    // 开启综合分析时，分析名称默认取绑定字段的 label
    onComprehensiveToggle(comprehensiveVal) {
      if (Number(comprehensiveVal) === IS_COMPREHENSIVE.YES && !this.form.comprehensiveName) {
        this.form.comprehensiveName = this.form.indexFieldLabel;
      }
    },
    // 按级联路径取到选中的字段节点
    findSelectedField(pathList) {
      if (!pathList || pathList.length < 2) return null;
      const indexItem = this.indexOptions.find((item) => item.name === pathList[0]);
      if (!indexItem) return null;
      return (indexItem.fields || []).find((field) => field.name === pathList[1]) || null;
    },
    toggleIsShow() {
      this.form.isShow = this.form.isShow === IS_SHOW.SHOW ? IS_SHOW.HIDE : IS_SHOW.SHOW;
    },
    handleConditionValueChange(conditionValue) {
      this.form.defaultVal = conditionValue;
      // 自定义组件不会被 el-form-item 的事件监听到，录入后主动清除错误态
      if (this.$refs.bindForm) this.$refs.bindForm.clearValidate('defaultVal');
    },
    onConfirm() {
      this.$refs.bindForm.validate((valid) => {
        if (!valid) return;
        this.$emit('confirm', this.buildFieldPayload(), this.mode);
      });
    },
    // 组装提交数据：无 id 时不传，非数值类型不带开始值与步长，不适用的配置项不提交
    buildFieldPayload() {
      const fieldPayload = { ...this.form };
      if (!fieldPayload.peerSearchLabel) fieldPayload.peerSearchLabel = fieldPayload.peerShowLabel;
      if (!fieldPayload.id) delete fieldPayload.id;
      if (!isNumberFieldType(fieldPayload.indexFieldType)) {
        delete fieldPayload.beginVal;
        delete fieldPayload.stepVal;
      }
      // 隐藏条件值只在字段被设为隐藏条件时生效，多选以逗号拼接
      if (!this.isHiddenCondition) {
        delete fieldPayload.criteriaType;
        delete fieldPayload.defaultVal;
      } else if (Array.isArray(fieldPayload.defaultVal)) {
        fieldPayload.defaultVal = fieldPayload.defaultVal.join(',');
      }
      if (!this.showOptionRange) delete fieldPayload.optionRange;
      // 综合分析关闭时不提交名称、方式与条件；同辈场景没有该配置，同样不提交
      if (!this.isSchoolMode || !this.isComprehensiveOn) {
        delete fieldPayload.comprehensiveName;
        delete fieldPayload.comprehensiveType;
        delete fieldPayload.comprehensiveCondition;
      }
      return fieldPayload;
    }
  }
};
</script>
