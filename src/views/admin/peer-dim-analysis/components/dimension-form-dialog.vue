<template>
  <el-dialog
    :visible="visible"
    width="600px"
    top="8vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">DIMENSION</div>
      <div class="dlg-title">{{ isEdit ? '编辑维度' : '新增维度' }}</div>
    </div>
    <p class="dlg-desc">维度是同辈对比报告中的一个分析板块，按排序号从小到大展示。</p>
    <el-form ref="dimForm" :model="form" :rules="rules" label-position="top" size="small">
      <el-form-item label="维度名称（title）" prop="title">
        <el-input v-model="form.title" placeholder="如：综合荣誉" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="是否有最高奖项（hasHighestJx）">
            <el-select v-model="form.hasHighestJx" style="width:100%">
              <el-option v-for="item in flagOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否排名（isRank）">
            <el-select v-model="form.isRank" style="width:100%" @change="onRankChange">
              <el-option v-for="item in flagOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="排名方式（rankType）">
            <el-select v-model="form.rankType" :disabled="form.isRank !== flag.YES" style="width:100%">
              <el-option label="次数" :value="rankType.COUNT" />
              <el-option label="得分" :value="rankType.SCORE" />
            </el-select>
            <div class="pd-fld-hint">仅当「是否排名＝是」时可选</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序号（sortNo）">
            <el-input-number v-model="form.sortNo" :min="0" controls-position="right" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dlg-foot">
      <span class="dlg-cnt">带 * 为必填</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">
        <i data-lucide="save"></i>保存维度
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DIM_FLAG, DIM_RANK_TYPE } from '@/constants/peer-dim-analysis';

export default {
  name: 'DimensionFormDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的维度记录，为空表示新增
    record: { type: Object, default: null },
    // 新增时的默认排序号（现有维度最大排序号 + 10）
    nextSortNo: { type: Number, default: 1 }
  },
  data() {
    return {
      flag: DIM_FLAG,
      rankType: DIM_RANK_TYPE,
      flagOptions: [
        { value: DIM_FLAG.NO, label: '否' },
        { value: DIM_FLAG.YES, label: '是' }
      ],
      form: {
        title: '',
        hasHighestJx: DIM_FLAG.NO,
        isRank: DIM_FLAG.YES,
        rankType: DIM_RANK_TYPE.SCORE,
        sortNo: 1
      },
      rules: {
        title: [{ required: true, message: '请填写维度名称', trigger: 'blur' }]
      }
    };
  },
  computed: {
    isEdit() {
      return !!this.record;
    }
  },
  watch: {
    // 弹窗以 v-if 渲染，每次打开都是新建组件、visible 初始即为 true，需 immediate 才能在创建时回显
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.fillForm();
          this.$nextTick(() => {
            this.$refs.dimForm.clearValidate();
          });
        }
      }
    }
  },
  methods: {
    fillForm() {
      const record = this.record;
      // 枚举常量已改为 number，后端可能返回字符串，统一转 Number 以保证 el-select 能命中选项回显
      const hasHighestJx = record ? Number(record.hasHighestJx) || DIM_FLAG.NO : DIM_FLAG.NO;
      const isRank = record ? Number(record.isRank) || DIM_FLAG.YES : DIM_FLAG.YES;
      // rankType 的 NONE 为 ''（不排名），COUNT/SCORE 为 number；仅在有值时转 Number，否则保留 NONE 默认
      const rawRankType = record ? record.rankType : DIM_RANK_TYPE.SCORE;
      const rankType = rawRankType === '' || rawRankType === null || rawRankType === undefined
        ? DIM_RANK_TYPE.NONE
        : Number(rawRankType) || DIM_RANK_TYPE.NONE;
      this.form = {
        title: record ? record.title : '',
        hasHighestJx,
        isRank,
        rankType,
        sortNo: record ? record.sortNo : this.nextSortNo
      };
      this.syncRankType();
    },
    // 关闭排名时清空排名方式；开启排名且未选择时默认按次数
    onRankChange() {
      this.syncRankType();
    },
    syncRankType() {
      if (this.form.isRank !== DIM_FLAG.YES) {
        this.form.rankType = DIM_RANK_TYPE.NONE;
      } else if (!this.form.rankType) {
        this.form.rankType = DIM_RANK_TYPE.COUNT;
      }
    },
    handleConfirm() {
      this.$refs.dimForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.$emit('confirm', { ...this.form, title: this.form.title.trim() });
      });
    }
  }
};
</script>
