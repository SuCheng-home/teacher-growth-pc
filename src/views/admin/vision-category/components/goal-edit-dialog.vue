<template>
  <el-dialog
    :visible="visible"
    width="640px"
    top="8vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">GOAL</div>
      <div class="dlg-title">{{ isEdit ? '编辑目标' : '添加目标' }}</div>
    </div>
    <p class="dlg-desc">目标＝教师端成长愿景里的一条可选愿景。排序值越小越靠前；前置条件从本分类已有目标中选择（可多选，表示「或」关系）。</p>
    <el-form ref="goalForm" :model="form" :rules="rules" label-position="top" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="档案字段" prop="fieldName">
            <el-cascader
              v-model="fieldPath"
              :options="indexOptions"
              :props="cascaderProps"
              style="width:100%"
              placeholder="选择教师档案指标下的字段"
              @change="onFieldPathChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字段选项" prop="goalOptionKey">
            <el-select v-model="form.goalOptionKey" style="width:100%" @change="handleGoalOptionChange">
              <el-option v-for="option in currentFieldOptions"
                :key="option.key"
                :label="option.value"
                :value="option.key"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="目标名称" prop="goalName">
        <el-input v-model="form.goalName" placeholder="如：市优秀青年教师" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属分类" prop="categoryCode">
            <el-select v-model="form.categoryCode" style="width:100%" @change="handleCategoryChange">
              <el-option v-for="categoryOption in categoryOptions" :key="categoryOption.code" :label="categoryOption.name" :value="categoryOption.code" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序值" prop="sortNo">
            <el-input v-model.number="form.sortNo" type="number" min="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="前置条件（可多选，表示「或」关系）">
        <el-select v-model="form.preGoalIds" multiple style="width:100%" placeholder="选择同分类下的前置目标">
          <el-option v-for="preGoalOption in preGoalOptions" :key="preGoalOption.id" :label="preGoalOption.goalName" :value="preGoalOption.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" style="width:100%">
          <el-option v-for="statusOption in statusOptions" :key="statusOption.value" :label="statusOption.label" :value="statusOption.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否启用">
        <el-radio-group v-model="form.isEnable">
          <el-radio v-for="enableOption in enableOptions" :key="enableOption.value" :label="enableOption.value">{{ enableOption.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dlg-foot">
      <span class="dlg-cnt">带 * 为必填</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button size="small" type="primary" :loading="saving" @click="onConfirm">保存目标</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDictList } from '@/api/common';
import { visionCategorySaveGoal } from '@/api/vision';
import { GOAL_STATUS, GOAL_STATUS_OPTIONS, GOAL_ENABLE, GOAL_ENABLE_OPTIONS, createDefaultGoalForm } from '@/constants/vision-category';

// 愿景分类字典常量 ID
const VISION_CATEGORY_CONSTANT_ID = '113702';

export default {
  name: 'GoalEditDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的目标记录（AiVisionGoal），为空表示新增
    record: { type: Object, default: null },
    // 前置条件候选来源：全部分类下的目标扁平列表 [{ id, goalName, categoryCode }]
    goalOptions: { type: Array, default: () => [] }
  },
  data() {
    return {
      optionsFieldType: ['select', 'mulSelect', 'radioGroup', 'checkboxGroup'],
      // 分类下拉候选，弹窗内部通过字典接口自取：[{ code, name }]
      categoryOptions: [],
      // 保存接口的提交中标记，驱动页脚按钮 loading
      saving: false,
      statusOptions: GOAL_STATUS_OPTIONS,
      enableOptions: GOAL_ENABLE_OPTIONS,
      // 级联选中路径：[指标 name, 字段 name]
      fieldPath: [],
      // el-cascader 会往该对象写入自身默认值，不能冻结
      cascaderProps: { value: 'name', label: 'label', children: 'fields', expandTrigger: 'hover' },
      form: createDefaultGoalForm(),
      rules: {
        categoryCode: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
        sortNo: [{ required: true, type: 'number', message: '请输入排序值', trigger: 'blur' }],
        goalName: [{ required: true, whitespace: true, message: '请输入目标名称', trigger: 'blur' }],
        fieldName: [{ required: true, message: '请选择档案字段', trigger: 'change' }],
        goalOptionKey: [{ required: true, message: '请选择档案字段选项', trigger: 'change' }]
      }
    };
  },
  computed: {
    isEdit() {
      return !!(this.record && this.record.id);
    },
    // 档案指标级联选项：仅取对象表单类指标，二级为其字段
    indexOptions() {
      return this.$store.getters.teacherIndexList.reduce((p, c) => {
        if (c.type === 'objectform') {
          const fields = (c.fields || []).filter((field) => this.optionsFieldType.includes(field.type));
          if (fields.length) {
            p.push({ ...c, fields });
          }
        }
        return p;
      }, [])
    },
    // 前置条件候选：仅同分类下的其他目标，排除自身
    preGoalOptions() {
      return this.goalOptions.filter(
        (goalOption) =>
          goalOption.categoryCode === this.form.categoryCode &&
          String(goalOption.id) !== String(this.form.id)
      );
    },
    currentFieldOptions() {
      if (!this.form.fieldName) return [];
      const field = this.$store.getters.teacherIndexFieldList.find((item) => item.name === this.form.fieldName) || {};
      return field.options || [];
    },
  },
  created() {
    this.loadCategoryOptions();
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.form = this.record ? this.buildFormFromRecord(this.record) : createDefaultGoalForm();
      // 编辑态用记录的指标/字段名回填级联选中路径，新增态清空
      this.fieldPath = this.record && this.record.fieldName
        ? [this.record.indexName, this.record.fieldName]
        : [];
      // 新增态默认选中第一个分类
      if (!this.record && this.categoryOptions.length) {
        this.form.categoryCode = this.categoryOptions[0].code;
      }
      this.$nextTick(() => {
        if (this.$refs.goalForm) this.$refs.goalForm.clearValidate();
      });
    }
  },
  methods: {
    handleGoalOptionChange() {
      const option = this.currentFieldOptions.find((item) => item.key === this.form.goalOptionKey) || {};
      this.form.goalOptionValue = option.value || '';
      this.form.goalName = this.form.goalOptionValue;
    },
    // 分类字典项字段兼容：编码 / 名称
    loadCategoryOptions() {
      getDictList(VISION_CATEGORY_CONSTANT_ID).then((res) => {
        const dictList = (res && res.data) || [];
        this.categoryOptions = dictList.map((item) => ({
          code: item.code ?? item.value ?? item.dictValue ?? item.constantValue ?? item.dictCode ?? '',
          name: item.name ?? item.label ?? item.dictName ?? item.categoryName ?? ''
        }));
      }).catch(() => {
        this.categoryOptions = [];
      });
    },
    buildFormFromRecord(record) {
      return {
        id: record.id,
        categoryCode: record.categoryCode || '',
        categoryName: record.categoryName || '',
        goalName: record.goalName || '',
        sortNo: Number(record.sortNo) || 0,
        preGoalIds: this.normalizeIdList(record.preGoalIds),
        indexName: record.indexName || '',
        indexLabel: record.indexLabel || '',
        fieldName: record.fieldName || '',
        fieldCode: record.fieldCode || '',
        fieldLabel: record.fieldLabel || '',
        goalOptionKey: record.goalOptionKey || '',
        goalOptionValue: record.goalOptionValue || '',
        status: Number(record.status) || GOAL_STATUS.NORMAL,
        // 启用状态缺省（历史数据未返回）按启用处理
        isEnable: Number(record.isEnable) || GOAL_ENABLE.YES
      };
    },
    // 前置条件 id 兼容数组与逗号拼接字符串两种回传形态
    normalizeIdList(value) {
      if (Array.isArray(value)) return [...value];
      if (value === '' || value === null || value === undefined) return [];
      return String(value).split(',').map((id) => id.trim()).filter(Boolean);
    },
    // 换分类后原前置条件与新分类不再匹配，清空待重新选择
    handleCategoryChange() {
      this.form.preGoalIds = [];
    },
    // 级联选择档案字段：回填指标与字段的 name/code/label
    onFieldPathChange(pathList) {
      const indexItem = this.indexOptions.find((item) => item.name === pathList[0]) || {};
      const field = (indexItem.fields || []).find((item) => item.name === pathList[1]) || {};
      this.form.indexName = indexItem.name || '';
      this.form.indexLabel = indexItem.label || indexItem.name || '';
      this.form.fieldName = field.name || '';
      this.form.fieldCode = field.code || '';
      this.form.fieldLabel = field.label || field.name || '';
      this.form.goalOptionKey = '';
      this.form.goalOptionValue = '';
      // 级联赋值不会触发 el-form-item 校验事件，选中后主动清除必填错误态
      if (this.$refs.goalForm) this.$refs.goalForm.clearValidate('fieldName');
    },
    onConfirm() {
      this.$refs.goalForm.validate((valid) => {
        if (!valid) return;
        this.submitGoal();
      });
    },
    // 新增与编辑共用保存接口，成功后通知父组件刷新列表并关闭弹框
    submitGoal() {
      const payload = this.buildPayload();
      this.saving = true;
      visionCategorySaveGoal(payload).then(() => {
        this.$message({ type: 'success', message: (payload.id ? '已保存目标：' : '已添加目标：') + payload.goalName, duration: 2000 });
        this.$emit('saved', payload);
        this.$emit('close');
      }).catch(() => {
        // 接口异常由请求拦截器统一提示，此处保持弹窗可重试
      }).then(() => {
        this.saving = false;
      });
    },
    // 组装提交数据：categoryName 依所选分类回填，新增态不带 id
    buildPayload() {
      const matchedCategory = this.categoryOptions.find((option) => option.code === this.form.categoryCode) || {};
      const payload = {
        categoryCode: this.form.categoryCode,
        categoryName: matchedCategory.name || this.form.categoryName || '',
        goalName: String(this.form.goalName).trim(),
        sortNo: Number(this.form.sortNo) || 0,
        preGoalIds: this.form.preGoalIds.join(','),
        indexName: this.form.indexName,
        indexLabel: this.form.indexLabel,
        fieldName: this.form.fieldName,
        fieldCode: this.form.fieldCode,
        fieldLabel: this.form.fieldLabel,
        goalOptionKey: this.form.goalOptionKey,
        goalOptionValue: this.form.goalOptionValue,
        status: this.form.status,
        isEnable: this.form.isEnable
      };
      payload.preGoalNames = this.preGoalOptions.filter(i => this.form.preGoalIds.includes(i.id))
        .map(i => i.goalName)
        .join(' 或 ');
      if (this.form.id) payload.id = this.form.id;
      return payload;
    }
  }
};
</script>
