<template>
  <el-dialog
    :visible="visible"
    width="760px"
    top="8vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">SCORE TYPE</div>
      <div class="dlg-title">{{ isEdit ? '编辑类型' : '新增类型' }}</div>
    </div>
    <p class="dlg-desc">每条 = 一个分数段档位。档位序号 1 为最高档，画像显示「档位N：类型名称」；上限可空＝无上限（最高档留空，显示「X 分及以上」），命中按下限降序取第一个「指数 ≥ 下限」的档位。</p>
    <el-form ref="typeForm" :model="form" :rules="rules" label-position="top" size="small">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="教师类型名称" prop="typeName">
            <el-input v-model="form.typeName" placeholder="如：骨干教师" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="档位序号（1 最高）" prop="levelNo">
            <el-input-number v-model="form.levelNo" :min="1" :step="1" controls-position="right" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="分数段下限（含）" prop="minScore">
            <el-input-number
              v-model="form.minScore"
              :min="scoreMin"
              :max="scoreMax"
              :step="1"
              controls-position="right"
              style="width:100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分数段上限（不含，留空＝无上限）" prop="maxScore">
            <el-input-number
              v-model="form.maxScore"
              :min="1"
              :max="scoreMax"
              :step="1"
              controls-position="right"
              placeholder="最高档可留空"
              style="width:100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="类型特征描述">
        <el-input v-model="form.typeDesc" placeholder="如：市级骨干储备，发展势能强" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="徽章展示颜色">
            <el-color-picker v-model="form.color" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="form.isEnable" style="width:100%">
              <el-option v-for="item in enableOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dlg-foot">
      <span class="dlg-cnt">带 * 为必填，仅保存至当前登录学校的配置</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button size="small" type="primary" :loading="saving" @click="onConfirm">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  DEFAULT_BADGE_COLOR,
  IS_ENABLE,
  IS_ENABLE_OPTIONS,
  SCORE_MAX,
  SCORE_MIN,
  createDefaultScoreTypeForm,
  normalizeScoreMax
} from '@/constants/profile-score-type';

export default {
  name: 'ScoreTypeDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的档位配置，为空表示新增
    record: { type: Object, default: null },
    // 现有档位列表：启用档位的分数段下限不允许重复，需要跨档位校验
    records: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false }
  },
  data() {
    return {
      form: createDefaultScoreTypeForm(),
      enableOptions: IS_ENABLE_OPTIONS,
      scoreMin: SCORE_MIN,
      scoreMax: SCORE_MAX,
      rules: {}
    };
  },
  computed: {
    isEdit() {
      return !!(this.record && this.record.id);
    }
  },
  created() {
    // 校验规则依赖表单与现有档位做交叉校验，故在 created 中构建
    this.rules = {
      typeName: [{ required: true, whitespace: true, message: '请输入教师类型名称', trigger: 'blur' }],
      levelNo: [{ required: true, message: '请输入档位序号', trigger: 'change' }],
      minScore: [
        { required: true, message: '请填写分数段下限', trigger: 'change' },
        { validator: this.validateMinScore, trigger: 'change' }
      ],
      maxScore: [{ validator: this.validateMaxScore, trigger: 'change' }]
    };
  },
  watch: {
    visible(value) {
      if (!value) return;
      // 新增档位的序号默认排在已有档位之后；编辑回填时上限空值按「无上限」展示
      this.form = this.record
        ? { ...createDefaultScoreTypeForm(), ...this.record, maxScore: normalizeScoreMax(this.record.maxScore) }
        : createDefaultScoreTypeForm(this.records.length + 1);
      this.$nextTick(() => {
        if (this.$refs.typeForm) this.$refs.typeForm.clearValidate();
      });
    }
  },
  methods: {
    validateMinScore(rule, value, callback) {
      const minScore = Number(value);
      if (!isFinite(minScore) || minScore < SCORE_MIN || minScore > SCORE_MAX) {
        callback(new Error('分数段下限必填且取值须在 0–100 内'));
        return;
      }
      // 启用档位的下限重复会导致命中规则出现歧义，保存前拦下
      const isDuplicated = this.records.some((item) => (
        item.id !== this.form.id
        && Number(item.isEnable) === IS_ENABLE.ENABLE
        && Number(this.form.isEnable) === IS_ENABLE.ENABLE
        && Number(item.minScore) === minScore
      ));
      if (isDuplicated) {
        callback(new Error('分数段下限与已有启用档位重复，请调整'));
        return;
      }
      callback();
    },
    validateMaxScore(rule, value, callback) {
      // 留空表示无上限，仅最高档如此设置
      if (normalizeScoreMax(value) === null) {
        callback();
        return;
      }
      const maxScore = Number(value);
      if (maxScore > SCORE_MAX) {
        callback(new Error('分数段上限取值须在 0–100 内'));
        return;
      }
      if (!(maxScore > Number(this.form.minScore))) {
        callback(new Error('上限须大于下限（最高档可留空）'));
        return;
      }
      callback();
    },
    onConfirm() {
      this.$refs.typeForm.validate((valid) => {
        if (!valid) return;
        this.$emit('confirm', this.buildPayload());
      });
    },
    // 组装提交数据：无 id 不传，空上限统一为 null 表示无上限
    buildPayload() {
      const normalizeText = (value) => String(value == null ? '' : value).trim();
      const payload = {
        typeName: normalizeText(this.form.typeName),
        levelNo: Number(this.form.levelNo) || 1,
        minScore: Number(this.form.minScore),
        maxScore: normalizeScoreMax(this.form.maxScore),
        typeDesc: normalizeText(this.form.typeDesc),
        color: this.form.color || DEFAULT_BADGE_COLOR,
        isEnable: Number(this.form.isEnable)
      };
      if (this.form.id) payload.id = this.form.id;
      return payload;
    }
  }
};
</script>

<style scoped>
/* 徽章色块与相邻下拉框垂直居中对齐 */
.el-color-picker {
  vertical-align: middle;
}
</style>
