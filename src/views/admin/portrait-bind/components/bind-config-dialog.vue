<template>
  <el-dialog
    :visible="visible"
    width="820px"
    top="8vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">PROFILE INDEX BIND</div>
      <div class="dlg-title">{{ isEdit ? '编辑绑定配置' : '新增绑定配置' }}</div>
    </div>
    <p class="dlg-desc">槽位＝教师画像原型上的一个展示位置；指标绑定决定该槽位从哪个档案指标取数，统计配置决定按什么口径汇总。</p>
    <el-form ref="bindForm" :model="form" :rules="rules" label-position="top" size="small">
      <div class="pb-sec">基本信息<small>槽位与展示</small></div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="绑定类型" prop="bindType">
            <el-select v-model="form.bindType" placeholder="请选择绑定类型" style="width:100%">
              <el-option v-for="item in bindTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属模块" prop="moduleCode">
            <el-select v-model="form.moduleCode" placeholder="请选择所属模块" style="width:100%">
              <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="槽位标识 slotCode">
            <el-input v-model="form.slotCode" placeholder="如：mainSubject / backbone / awardNum" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示名称 showLabel" prop="showLabel">
            <el-input v-model="form.showLabel" placeholder="画像上的槽位文案，如：主教学科" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="展示单位 unitLabel">
            <el-input v-model="form.unitLabel" placeholder="如：年 / 次 / 篇 / 项，可留空" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序号 sortNo">
            <el-input-number v-model="form.sortNo" :step="10" :min="0" controls-position="right" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="启用状态 isEnable">
            <el-select v-model="form.isEnable" style="width:100%">
              <el-option v-for="item in enableOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="pb-sec">指标绑定<small>选择指标后联动指标字段</small></div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="选择指标 indexName" prop="indexName">
            <el-select
              v-model="form.indexName"
              filterable
              placeholder="请选择档案指标"
              style="width:100%"
              @change="onIndexChange"
            >
              <el-option
                v-for="indexItem in indexOptions"
                :key="indexItem.name"
                :label="indexItem.label || indexItem.name"
                :value="indexItem.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="指标类型 indexType">
            <div class="pt-ro">{{ indexTypeText }}</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16"> -->
        <el-col :span="12">
          <el-form-item label="选择指标字段 indexFieldName" prop="indexFieldName">
            <el-select
              v-model="form.indexFieldName"
              filterable
              placeholder="请选择指标字段"
              style="width:100%"
              @change="onFieldChange"
            >
              <el-option
                v-for="field in indexFieldOptions"
                :key="field.name"
                :label="(field.label || field.name) + '（' + field.name + '）'"
                :value="field.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="字段全编码">
            <div class="pt-ro mono">{{ fieldFullCode }}</div>
          </el-form-item>
        </el-col> -->
      </el-row>

      <div class="pb-sec">统计配置<small>取数口径与选项范围</small></div>
      <el-form-item label="比较方式 compareMethod">
        <el-radio-group v-model="form.compareMethod" class="pb-radio-row">
          <el-radio v-for="item in compareMethodOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="数据比较字段 compareFieldName">
            <el-select v-model="form.compareFieldName" clearable placeholder="默认取绑定字段" style="width:100%">
              <el-option
                v-for="field in indexFieldOptions"
                :key="field.name"
                :label="(field.label || field.name) + '（' + field.name + '）'"
                :value="field.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="时间轴字段 timeFieldName">
            <el-select v-model="form.timeFieldName" clearable placeholder="不按时间分组" style="width:100%">
              <el-option
                v-for="field in indexFieldOptions"
                :key="field.name"
                :label="field.label"
                :value="field.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="字段数据选项范围 fieldScopeOptions">
        <div class="pb-chk-list">
          <el-checkbox-group v-if="scopeOptionList.length" v-model="fieldScopeKeys" class="pe-optrange">
            <el-checkbox v-for="option in scopeOptionList" :key="option.key" :label="option.key">{{ option.value }}</el-checkbox>
          </el-checkbox-group>
          <span v-else class="pe-hint">当前字段无候选项：仅 select / mulSelect / radioGroup / checkboxGroup 类字段可限定选项范围。</span>
        </div>
        <div class="pe-hint">勾选项用于展示时 key → value 转换；不勾选表示不限制。</div>
      </el-form-item>
      <el-form-item label="特殊选项 key specialOptionKeys">
        <el-input v-model="form.specialOptionKeys" placeholder="逗号分隔，如：teji" />
      </el-form-item>
      <!-- <div class="pb-sub">
        <span>扩展统计配置 statConfig</span>
        <small>分项录入，保存时序列化为 JSON 字符串；留空不写入</small>
      </div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="最新值排序字段 latestBy">
            <el-input v-model="statForm.latestBy" placeholder="如：sjxq（按该字段取最新记录）" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="多值拼接符 join">
            <el-input v-model="statForm.join" placeholder="如：、" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="计数过滤 filter">
            <el-input v-model="statForm.filter" placeholder="字段码=选项value，如：hjlb=指导学生" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="去重键 dedupKey">
            <el-input v-model="statForm.dedupKey" placeholder="如：nd（同值只计一次）" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="选项值按数值处理 numericFromOption">
        <el-switch
          v-model="statForm.numericFromOption"
          class="pe-switchfield"
          inactive-text="否"
          active-text="是"
        />
        <span class="pe-hint pb-inline-hint">开启后选项 key 按数字比较（用于最大值 / 计数类口径）。</span>
      </el-form-item> -->
    </el-form>
    <span slot="footer" class="dlg-foot">
      <span class="dlg-cnt">带 * 为必填，仅保存至当前登录学校的配置</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button size="small" type="primary" :loading="saving" @click="onConfirm">{{ isEdit ? '保存修改' : '保存配置' }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  BIND_TYPE_OPTIONS,
  MODULE_OPTIONS,
  COMPARE_METHOD_OPTIONS,
  IS_ENABLE_OPTIONS,
  INDEX_TYPE_TEXT,
  createDefaultBindForm,
  createDefaultStatConfigForm,
  parseFieldScopeOptions,
  parseStatConfig,
  stringifyFieldScopeOptions,
  stringifyStatConfig
} from '@/constants/profile-index-bind';

export default {
  name: 'BindConfigDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的绑定配置记录，为空表示新增
    record: { type: Object, default: null },
    saving: { type: Boolean, default: false }
  },
  data() {
    return {
      form: createDefaultBindForm(),
      // 扩展统计配置的分项表单，保存时再序列化为 statConfig 字符串
      statForm: createDefaultStatConfigForm(),
      // 模板消费的枚举需挂到实例上
      bindTypeOptions: BIND_TYPE_OPTIONS,
      moduleOptions: MODULE_OPTIONS,
      compareMethodOptions: COMPARE_METHOD_OPTIONS,
      enableOptions: IS_ENABLE_OPTIONS,
      rules: {
        bindType: [{ required: true, message: '请选择绑定类型', trigger: 'change' }],
        moduleCode: [{ required: true, message: '请选择所属模块', trigger: 'change' }],
        showLabel: [{ required: true, whitespace: true, message: '请输入显示名称', trigger: 'blur' }],
        indexName: [{ required: true, message: '请选择指标', trigger: 'change' }],
        indexFieldName: [{ required: true, message: '请选择指标字段', trigger: 'change' }]
      }
    };
  },
  computed: {
    isEdit() {
      return !!(this.record && this.record.id);
    },
    // 档案指标字典来自 store（路由守卫已加载），本页不重复请求 /teacherIndex 接口
    indexOptions() {
      return this.$store.getters.teacherIndexList || [];
    },
    selectedIndex() {
      return this.indexOptions.find((indexItem) => indexItem.name === this.form.indexName) || null;
    },
    indexTypeText() {
      if (!this.form.indexType) return '—';
      return this.form.indexType + ' · ' + (INDEX_TYPE_TEXT[this.form.indexType] || '');
    },
    indexFieldOptions() {
      return (this.selectedIndex && this.selectedIndex.fields) || [];
    },
    currentField() {
      return this.indexFieldOptions.find((field) => field.name === this.form.indexFieldName) || null;
    },
    fieldFullCode() {
      return this.form.indexFieldName || '—';
    },
    // 选项范围的可勾选项取自当前指标字段的候选项
    scopeOptionList() {
      return (this.currentField && this.currentField.options) || [];
    },
    // 界面是候选项 key 数组，存回 form 时为 key-value JSON 数组字符串
    fieldScopeKeys: {
      get() {
        return parseFieldScopeOptions(this.form.fieldScopeOptions).map((option) => option.key);
      },
      set(optionKeyList) {
        this.form.fieldScopeOptions = stringifyFieldScopeOptions(optionKeyList, this.scopeOptionList);
      }
    }
  },
  watch: {
    visible(value) {
      if (!value) return;
      this.form = this.record ? { ...createDefaultBindForm(), ...this.record } : createDefaultBindForm();
      // 扩展配置按字段回填，存量 JSON 解析失败时按空配置展示
      this.statForm = parseStatConfig(this.record && this.record.statConfig);
      this.$nextTick(() => {
        if (this.$refs.bindForm) this.$refs.bindForm.clearValidate();
      });
    }
  },
  methods: {
    // 切换指标后字段、比较字段、时间字段与选项范围都要按新指标重建
    onIndexChange() {
      this.form.indexType = (this.selectedIndex && this.selectedIndex.type) || this.form.indexType;
      this.form.indexFieldName = '';
      this.form.compareFieldName = '';
      this.form.timeFieldName = '';
      this.form.fieldScopeOptions = '';
      this.clearValidate(['indexFieldName', 'compareFieldName', 'timeFieldName']);
    },
    // 换字段后原选项范围与新字段的候选项不再匹配，清空待重新勾选
    onFieldChange() {
      this.form.fieldScopeOptions = '';
    },
    clearValidate(propList) {
      if (!this.$refs.bindForm) return;
      propList.forEach((prop) => this.$refs.bindForm.clearValidate(prop));
    },
    onConfirm() {
      this.$refs.bindForm.validate((valid) => {
        if (!valid) return;
        this.$emit('confirm', this.buildPayload());
      });
    },
    // 组装提交数据：无 id 不传，短编码 indexCode 等由后端按前缀派生，前端只提交 name
    buildPayload() {
      const normalizeText = (value) => String(value == null ? '' : value).trim();
      const payload = {
        bindType: Number(this.form.bindType),
        moduleCode: Number(this.form.moduleCode),
        slotCode: normalizeText(this.form.slotCode),
        showLabel: normalizeText(this.form.showLabel),
        indexName: this.form.indexName,
        indexType: this.form.indexType,
        indexFieldName: this.form.indexFieldName,
        compareMethod: Number(this.form.compareMethod),
        compareFieldName: this.form.compareFieldName || '',
        timeFieldName: this.form.timeFieldName || '',
        fieldScopeOptions: this.form.fieldScopeOptions || '',
        specialOptionKeys: normalizeText(this.form.specialOptionKeys),
        unitLabel: normalizeText(this.form.unitLabel),
        statConfig: stringifyStatConfig(this.statForm),
        sortNo: Number(this.form.sortNo) || 0,
        isEnable: Number(this.form.isEnable)
      };
      if (this.form.id) payload.id = this.form.id;
      return payload;
    }
  }
};
</script>

<style scoped>
/* 弹窗内的分组小标题：左侧绿线 + 右侧补充说明 */
.pb-sec {
  font-size: 14px;
  color: var(--ink);
  font-weight: 600;
  border-left: 3px solid var(--green);
  padding-left: 9px;
  margin: 6px 0 12px;
}

.pb-sec:first-child {
  margin-top: 0;
}

.pb-sec small {
  font-weight: 400;
  color: var(--muted);
  margin-left: 8px;
}

/* 比较方式：外框与分组标题同宽，选项换行排列 */
.pb-radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 9px 12px;
  width: 100%;
  line-height: 22px;
}

.pb-radio-row .el-radio {
  margin-right: 0;
}

/* 字段选项范围：候选项换行排列，空态提示与勾选区等高展示 */
.pb-chk-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 38px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 12px;
  width: 100%;
}

.pb-chk-list .pe-hint {
  margin-top: 0;
}

/* 扩展统计配置的次级标题：与一级分组标题错开层级 */
.pb-sub {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 8px;
  margin: 2px 0 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--line);
  color: var(--ink);
  font-weight: 600;
}

.pb-sub small {
  font-weight: 400;
  color: var(--muted);
}

/* 开关右侧的口径说明，与开关本体同一行 */
.pb-inline-hint {
  margin-top: 0;
  margin-left: 10px;
}
</style>
