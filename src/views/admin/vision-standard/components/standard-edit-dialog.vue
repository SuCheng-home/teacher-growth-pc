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
      <div class="dlg-eyebrow">STANDARD</div>
      <div class="dlg-title">{{ isEdit ? '编辑标准' : '新建标准' }}</div>
    </div>
    <p class="dlg-desc">标准＝某分类下某目标对应的评比细则文件。绑定后即可在下方 AI 工作台生成提示词。</p>
    <el-form ref="standardForm" :model="form" :rules="rules" label-position="top" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="分类" prop="categoryCode">
            <el-select v-model="form.categoryCode" style="width:100%" @change="handleCategoryChange">
              <el-option v-for="categoryOption in categoryOptions" :key="categoryOption.code" :label="categoryOption.name" :value="categoryOption.code" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标" prop="goalId">
            <el-select v-model="form.goalId" style="width:100%" placeholder="选择目标">
              <el-option v-for="goalOption in goalOptions" :key="goalOption.id" :label="goalOption.goalName" :value="goalOption.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="标准名称" prop="standardName">
        <el-input v-model="form.standardName" placeholder="如：教师岗位基本任职条件评分细则（9级）" />
      </el-form-item>
      <el-form-item label="评比文件" prop="compareFileList">
        <FileUploader
          :key="compareParams.bizCode"
          v-model="form.compareFileList"
          mode="attachment"
          :params="compareParams"
          :accept="COMPARE_FILE_ACCEPT"
          :max-count="1"
          tip="上传该标准的评比细则文件，作为 AI 提示词生成的依据"
        >
          <el-button size="small" icon="el-icon-upload2">上传文件</el-button>
        </FileUploader>
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
      <el-button size="small" type="primary" :loading="saving" @click="onConfirm">保存标准</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDictList } from '@/api/common';
import { visionStandardSave, visionStandardGoalOptions } from '@/api/vision';
import { createDefaultStandardForm, STANDARD_ENABLE, STANDARD_ENABLE_OPTIONS } from '@/constants/vision-standard';
import bizEnroll from '@/utils/bizEnroll';
import FileUploader from 'auth-zw-components/vue/FileUploader';

// 愿景分类字典常量 ID（与愿景分类管理页同源）
const VISION_CATEGORY_CONSTANT_ID = '113702';

// 上传业务标识（bizEnroll 注册表键名）
const COMPARE_BIZ_MARK = 'teacherGrowth-vision-compare-file';

// 评比细则文件允许的后缀
const COMPARE_FILE_ACCEPT = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf'];

export default {
  name: 'StandardEditDialog',
  components: { FileUploader },
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的标准记录（AiVisionStandard），为空表示新增
    record: { type: Object, default: null }
  },
  data() {
    return {
      // 分类下拉候选，弹窗内部通过字典接口自取：[{ code, name }]
      categoryOptions: [],
      // 目标下拉候选，按当前分类通过接口获取：[AiVisionGoal]
      goalOptions: [],
      // 保存接口的提交中标记，驱动页脚按钮 loading
      saving: false,
      // 是否启用单选选项
      enableOptions: STANDARD_ENABLE_OPTIONS,
      form: createDefaultStandardForm(),
      // 上传业务参数，弹窗打开时经 bizEnroll 按记录 id / 随机 ID 重新生成
      compareParams: bizEnroll(COMPARE_BIZ_MARK),
      // 模板内引用常量
      COMPARE_FILE_ACCEPT,
      rules: {
        categoryCode: [{ required: true, message: '请选择分类', trigger: 'change' }],
        goalId: [{ required: true, message: '请选择目标', trigger: 'change' }],
        standardName: [{ required: true, whitespace: true, message: '请输入标准名称', trigger: 'blur' }],
        // 评比文件必填：空数组不通过 array 类型的 required 校验
        compareFileList: [{ type: 'array', required: true, message: '请上传评比文件', trigger: 'change' }]
      }
    };
  },
  computed: {
    isEdit() {
      return !!(this.record && this.record.id);
    }
  },
  created() {
    this.loadCategoryOptions();
  },
  watch: {
    // 上传组件不走 el-form 的 change 事件冒泡，上传成功后手动触发校验以清除错误提示
    'form.compareFileList'(list) {
      if (list.length && this.$refs.standardForm) {
        this.$refs.standardForm.validateField('compareFileList');
      }
    },
    visible(val) {
      if (!val) return;
      this.form = this.record ? this.buildFormFromRecord(this.record) : createDefaultStandardForm();
      // 新增态默认选中第一个分类，并加载其目标候选
      if (!this.record) {
        this.form.categoryCode = this.categoryOptions.length ? this.categoryOptions[0].code : '';
      }
      this.initUploadContext();
      this.loadGoalOptions();
      this.$nextTick(() => {
        if (this.$refs.standardForm) this.$refs.standardForm.clearValidate();
      });
    }
  },
  methods: {
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
    // 目标候选按当前分类从接口获取
    loadGoalOptions() {
      if (!this.form.categoryCode) {
        this.goalOptions = [];
        return;
      }
      visionStandardGoalOptions({ categoryCode: this.form.categoryCode }).then((res) => {
        this.goalOptions = (res && res.data) || [];
      }).catch(() => {
        this.goalOptions = [];
      });
    },
    // 换分类后原目标不再匹配，清空待重新选择并刷新候选
    handleCategoryChange() {
      this.form.goalId = '';
      this.loadGoalOptions();
    },
    buildFormFromRecord(record) {
      return {
        id: record.id,
        categoryCode: record.categoryCode || '',
        goalId: record.goalId || '',
        standardName: record.standardName || '',
        // 启用状态缺省（历史数据未返回）按启用处理
        isEnable: Number(record.isEnable) || STANDARD_ENABLE.YES,
        // 后端存的是 FileJson 数组字符串，回填为上传组件的展示列表
        compareFileList: this.parseFileJsonList(record.compareFile)
      };
    },
    // 弹窗打开时初始化上传上下文：bizCode 携带主键保证各标准隔离，:key 变化触发上传实例重建
    initUploadContext() {
      const mainId = (this.record && this.record.id) || '';
      this.compareParams = bizEnroll(COMPARE_BIZ_MARK, mainId);
    },
    // 解析后端字符串为 FileJson 列表：空值或非 JSON 数组一律按未上传处理
    parseFileJsonList(str) {
      if (!str) return [];
      try {
        const list = JSON.parse(str);
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },
    // 提交序列化：空列表存空字符串，保证后端按 compareFile 是否为空判定状态
    serializeFileJsonList(list) {
      return list.length ? JSON.stringify(list) : '';
    },
    onConfirm() {
      this.$refs.standardForm.validate((valid) => {
        if (!valid) return;
        this.submitStandard();
      });
    },
    // 新增与编辑共用保存接口，成功后通知父组件刷新列表并关闭弹框
    submitStandard() {
      const payload = this.buildPayload();
      this.saving = true;
      visionStandardSave(payload).then(() => {
        this.$message({ type: 'success', message: (payload.id ? '已保存标准：' : '已新建标准：') + payload.standardName, duration: 2000 });
        this.$emit('saved', payload);
        this.$emit('close');
      }).catch(() => {
        // 接口异常由请求拦截器统一提示，此处保持弹窗可重试
      }).then(() => {
        this.saving = false;
      });
    },
    // 组装提交数据：categoryName/goalName 由后端按 goalId 补齐，新增态不带 id
    buildPayload() {
      const payload = {
        categoryCode: this.form.categoryCode,
        goalId: this.form.goalId,
        standardName: String(this.form.standardName).trim(),
        isEnable: this.form.isEnable,
        compareFile: this.serializeFileJsonList(this.form.compareFileList)
      };
      if (this.form.id) payload.id = this.form.id;
      return payload;
    }
  }
};
</script>

<style scoped>
.el-form-item .image-uploader {
  width: 100%;
}
</style>
