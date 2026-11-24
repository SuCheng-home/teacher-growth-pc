<template>
  <el-dialog
    :visible="visible"
    width="780px"
    top="6vh"
    custom-class="admin-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title">
      <div class="dlg-eyebrow">DIMENSION OPTION</div>
      <div class="dlg-title">{{ dialogTitle }}</div>
    </div>
    <p class="dlg-desc">所属维度：{{ dimensionTitle }}；按 ①~④ 四步配置该选项的取数口径与评分。</p>
    <el-form ref="optForm" :model="form" :rules="rules" label-position="top" size="small">
      <!-- ① 选择档案指标 -->
      <div class="pd-step">
        <div class="sh">
          <span class="no">1</span>
          <h4>选择档案指标</h4>
          <span class="side">编码由所选指标自动带出</span>
        </div>
        <div class="sdesc">指标即教师档案中的一类记录表（如「综合荣誉」存的是各级表彰记录）。选定指标后，后续的分类字段、过滤字段、评分字段都从该指标包含的字段中选取。</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="选项名称（optionName）" prop="optionName">
              <el-input v-model="form.optionName" placeholder="如：综合表彰" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序号（sortNo）">
              <el-input-number v-model="form.sortNo" :min="0" :step="10" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="档案指标（indexName）" prop="indexName">
              <el-select v-model="form.indexName" style="width:100%" @change="onIndexChange">
                <el-option
                  v-for="metric in archiveMetrics"
                  :key="metric.name"
                  :label="metric.label"
                  :value="metric.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指标名称（indexName）">
              <el-input :value="currentMetricLabel" readonly class="pd-readonly-input" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ② 数据过滤 -->
      <div class="pd-step">
        <div class="sh">
          <span class="no">2</span>
          <h4>数据过滤</h4>
        </div>
        <div class="sdesc">决定这个选项统计指标中的哪些记录。选项直接对应整个指标的记录，一般按时间字段限定近 N 年，统计时按符合条件的记录条数计数。</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="数据过滤字段">
              <el-select v-model="form.filterFieldCode" style="width:100%">
                <el-option label="不过滤" value="" />
                <el-option
                  v-for="field in dateFields"
                  :key="field.name"
                  :label="field.label || field.name"
                  :value="field.name"
                />
              </el-select>
              <!-- <div class="pd-fld-hint">一般为时间字段 sj</div> -->
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.filterFieldCode">
            <el-form-item label="过滤近 xx 年（filterRecentYear）">
              <el-input-number
                v-model="form.filterRecentYear"
                :min="1"
                :max="30"
                controls-position="right"
                placeholder="如 3，留空=不限年份"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- ③ 评分等级 -->
      <div class="pd-step">
        <div class="sh">
          <span class="no">3</span>
          <h4>评分等级</h4>
          <span class="side">分值编码 scoreCode 自动以 # 拼接</span>
        </div>
        <div class="sdesc">设置评分后，每条记录按其评分字段取值换算成分数（如级别＝国家级 → 30 分）。多个评分字段时，档位＝各字段取值的组合，编码以 # 连接各取值序号（如 1#2＝国家级一等奖）。</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否设置评分等级（hasScoreDj）">
              <el-select v-model="form.hasScoreDj" style="width:100%">
                <el-option v-for="item in flagOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="scoreEnabled" :span="12">
            <el-form-item label="评分等级字段（scoreFieldNames，可多选）">
              <div class="pd-sf-row">
                <label
                  v-for="field in enumFields"
                  :key="field.name"
                  class="pd-sf-chip"
                  :class="{ on: sfSel.indexOf(field.name) > -1 }"
                >
                  <input v-model="sfSel" type="checkbox" :value="field.name">{{ field.label || field.name }}（{{ field.name }}）
                </label>
                <span v-if="!enumFields.length" class="pd-sf-none">该指标暂无可作评分编码的枚举字段</span>
              </div>
              <div class="pd-fld-hint">勾选后在下方维护「取值组合 → 得分」</div>
            </el-form-item>
          </el-col>
        </el-row>
        <div v-if="scoreEnabled" class="pd-sc-wrap">
          <div class="pd-sc-bar">
            <span class="side">{{ scRows.length }} 档</span>
            <button class="btn sm" type="button" @click="addScoreRow">
              <i data-lucide="plus"></i>添加档位
            </button>
          </div>
          <!-- 评分字段动态增列，外层横向滚动容器避免列数多时挤压变形 -->
          <div v-if="scRows.length" class="pd-sc-scroll">
            <table class="pd-sc-tbl">
              <thead>
                <tr>
                  <th class="idx">#</th>
                  <th v-for="field in selectedScoreFields" :key="field.name">
                    {{ field.label || field.name }}（<span class="mono">{{ field.name }}</span>）
                  </th>
                  <th class="score">得分</th>
                  <th class="act">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in scRows" :key="rowIndex">
                  <td class="idx num">{{ rowIndex + 1 }}</td>
                  <td v-for="(field, colIndex) in selectedScoreFields" :key="field.name">
                    <select v-model="row.values[colIndex]">
                      <option value="">请选择…</option>
                      <option v-for="option in field.options" :key="option.key" :value="option.value">
                        {{ option.value }}
                      </option>
                    </select>
                  </td>
                  <td class="score"><input v-model="row.score" type="number" min="0" step="0.5"></td>
                  <td class="act">
                    <button class="op del" type="button" title="删除该行" @click="removeScoreRow(rowIndex)">
                      <i data-lucide="x"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="pd-empty">暂无档位，点「添加档位」新增；保存选项时一并写入评分表。</div>
          <details class="pd-json">
            <summary><i data-lucide="braces"></i>分值编码 JSON 预览（scoreCodeJson）</summary>
            <pre>{{ scoreJsonPreview }}</pre>
          </details>
        </div>
      </div>

      <!-- ④ 最高奖项 -->
      <div class="pd-step">
        <div class="sh">
          <span class="no">4</span>
          <h4>最高奖项</h4>
        </div>
        <div class="sdesc">当维度开启「有最高奖项」时，该选项从所选文本字段的记录取值中取最高一项（如荣誉名称「江苏省优秀教育工作者」），用于报告展示个人最高荣誉。</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否有最高奖项（hasHighestJx）">
              <el-select v-model="form.hasHighestJx" style="width:100%">
                <el-option v-for="item in flagOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.hasHighestJx === flag.YES" :span="12">
            <el-form-item label="最高奖项取值字段">
              <el-select v-model="form.highestFieldCode" style="width:100%">
                <el-option label="无文本字段" value="" />
                <el-option
                  v-for="field in textFields"
                  :key="field.name"
                  :label="field.label || field.name"
                  :value="field.name"
                />
              </el-select>
              <div class="pd-fld-hint">一般为名称类文本字段（如 rymc 荣誉名称）</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="pd-live">
        <i data-lucide="eye"></i>
        <span>实时配置解读：<span v-html="liveInterpretation"></span></span>
      </div>
    </el-form>
    <div slot="footer" class="dlg-foot">
      <span class="dlg-cnt">带 * 为必填</span>
      <el-button size="small" @click="$emit('close')">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm">
        <i data-lucide="save"></i>保存选项
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  DIM_FLAG,
  DIM_HAS_SCORE_DJ,
  findMetricByName,
  findMetricField,
  isEnumField,
  isDateField,
  isTextField,
  fieldOptionKeyOf,
  buildOptionInterpretation
} from '@/constants/peer-dim-analysis';

export default {
  name: 'OptionFormDialog',
  props: {
    visible: { type: Boolean, default: false },
    // 编辑时传入的选项记录，为空表示新增
    record: { type: Object, default: null },
    // 所属维度对象，用于弹窗说明与新增时的排序号推导
    dimension: { type: Object, default: null },
    // 评分配置入口打开时，滚动定位到评分档位区
    scoreMode: { type: Boolean, default: false }
  },
  data() {
    return {
      flag: DIM_FLAG,
      flagOptions: [
        { value: DIM_FLAG.NO, label: '否' },
        { value: DIM_FLAG.YES, label: '是' }
      ],
      form: {
        optionName: '',
        sortNo: 1,
        indexName: '',
        filterFieldCode: '',
        filterRecentYear: undefined,
        hasScoreDj: DIM_HAS_SCORE_DJ.NO,
        hasHighestJx: DIM_FLAG.NO,
        highestFieldCode: ''
      },
      // 已勾选的评分字段编码
      sfSel: [],
      // 评分档位草稿：values=各评分字段取值数组，score=得分
      scRows: [],
      rules: {
        optionName: [{ required: true, message: '请填写选项名称', trigger: 'blur' }],
        indexName: [{ required: true, message: '请选择档案指标', trigger: 'change' }]
      }
    };
  },
  computed: {
    // 档案指标字典（数组记录型），弹窗内部直读 store 指标字典，无需父级传入
    archiveMetrics() {
      const indexList = this.$store.getters.teacherIndexList || [];
      return indexList
        .filter((indexItem) => indexItem.type === 'arrayform')
    },
    dimensionTitle() {
      return (this.dimension && this.dimension.title) || '';
    },
    isEdit() {
      return !!this.record;
    },
    dialogTitle() {
      if (!this.isEdit) {
        return '新增选项';
      }
      return this.scoreMode ? '评分配置 · ' + this.record.optionName : '编辑选项';
    },
    currentMetric() {
      return findMetricByName(this.archiveMetrics, this.form.indexName);
    },
    currentMetricLabel() {
      return (this.currentMetric && this.currentMetric.name) || '';
    },
    metricFields() {
      return (this.currentMetric && this.currentMetric.fields) || [];
    },
    dateFields() {
      return this.metricFields.filter(isDateField);
    },
    enumFields() {
      return this.metricFields.filter(isEnumField);
    },
    textFields() {
      return this.metricFields.filter(isTextField);
    },
    scoreEnabled() {
      return this.form.hasScoreDj === DIM_HAS_SCORE_DJ.YES;
    },
    // 已勾选评分字段对应的字典节点（保持勾选顺序）
    selectedScoreFields() {
      return this.sfSel.map((code) => findMetricField(this.currentMetric, code)).filter(Boolean);
    },
    scoreJsonPreview() {
      // 预览只保留接口口径的三个字段，去除校验用辅助键
      return JSON.stringify(
        this.buildDraftScores(true).map((item) => ({
          scoreCode: item.scoreCode,
          scoreCodeJson: item.scoreCodeJson,
          score: item.score
        })),
        null,
        2
      );
    },
    liveInterpretation() {
      const parts = buildOptionInterpretation(
        {
          indexName: this.form.indexName,
          filterFieldCode: this.form.filterFieldCode,
          filterRecentYear: this.form.filterRecentYear || '',
          hasScoreDj: this.form.hasScoreDj,
          scoreFieldNames: this.sfSel.map((code) => ({ code })),
          hasHighestJx: this.form.hasHighestJx,
          highestFieldCode: this.form.highestFieldCode,
          scores: this.buildDraftScores(false)
        },
        this.archiveMetrics
      );
      return parts.map((part) => this.escapeHtml(part)).join('<span class="sep">→</span>');
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
            this.$refs.optForm.clearValidate();
            if (this.scoreMode) {
              const wrap = this.$el && this.$el.querySelector('.pd-sc-wrap');
              if (wrap) {
                wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          });
        }
      }
    },
    // 取消勾选评分字段时同步裁剪各档位多余取值
    sfSel() {
      const count = this.sfSel.length;
      this.scRows.forEach((row) => {
        if (row.values.length !== count) {
          row.values = row.values.slice(0, count).concat(new Array(Math.max(0, count - row.values.length)).fill(''));
        }
      });
      if (!count) {
        this.scRows = [];
      }
    }
  },
  methods: {
    fillForm() {
      const record = this.record;
      // 枚举常量已改为 number，后端可能返回字符串，统一转 Number 以保证 el-select 能命中选项回显
      const hasScoreDj = record ? Number(record.hasScoreDj) || DIM_HAS_SCORE_DJ.NO : DIM_HAS_SCORE_DJ.NO;
      const hasHighestJx = record ? Number(record.hasHighestJx) || DIM_FLAG.NO : DIM_FLAG.NO;
      this.form = {
        optionName: record ? record.optionName : '',
        sortNo: record ? record.sortNo : 1,
        indexName: record ? record.indexName : (this.archiveMetrics.length ? this.archiveMetrics[0].name : ''),
        filterFieldCode: record ? record.filterFieldCode || '' : '',
        filterRecentYear: record && record.filterRecentYear ? record.filterRecentYear : undefined,
        hasScoreDj,
        hasHighestJx,
        highestFieldCode: record ? record.highestFieldCode || '' : ''
      };
      this.sfSel = record ? (record.scoreFieldNames || []).map((item) => item.code) : [];
      this.scRows = record && hasScoreDj === DIM_HAS_SCORE_DJ.YES
        ? (record.scores || []).map((item) => ({
          values: item.scoreCodeJson.map((detail) => detail.optionValue),
          score: item.score
        }))
        : [];
    },
    // 切换指标后原字段选择可能已失效，统一重置
    onIndexChange() {
      this.form.filterFieldCode = '';
      this.form.highestFieldCode = '';
      this.sfSel = [];
      this.scRows = [];
    },
    addScoreRow() {
      if (!this.sfSel.length) {
        this.$message({ message: '请先勾选评分字段', duration: 2000 });
        return;
      }
      this.scRows.push({ values: this.sfSel.map(() => ''), score: '' });
    },
    removeScoreRow(index) {
      this.scRows.splice(index, 1);
    },
    // 汇总草稿档位为接口口径的评分数组；strict=true 时输出 JSON 预览（含未填完整的行）
    buildDraftScores(strict) {
      if (!this.scoreEnabled) {
        return [];
      }
      return this.scRows.reduce((list, row) => {
        const emptyRow = row.values.every((value) => !value) && (row.score === '' || row.score === null);
        if (!strict && emptyRow) {
          return list;
        }
        const scoreCodeJson = this.selectedScoreFields.map((field, index) => ({
          fieldCode: field.code,
          fieldName: field.name,
          optionKey: fieldOptionKeyOf(field, row.values[index]),
          optionValue: row.values[index] || ''
        }));
        const scoreValue = row.score === '' || row.score === null || !isFinite(Number(row.score))
          ? (strict ? null : '')
          : Number(row.score);
        return list.concat([{
          scoreCode: scoreCodeJson.map((detail) => detail.optionKey).join('#'),
          scoreCodeJson,
          score: scoreValue,
          _complete: scoreCodeJson.every((detail) => detail.optionValue) && scoreValue !== ''
        }]);
      }, []);
    },
    handleConfirm() {
      this.$refs.optForm.validate((valid) => {
        if (!valid) {
          return;
        }
        const scores = this.validateScores();
        if (!scores) {
          return;
        }
        const highestEnabled = this.form.hasHighestJx === DIM_FLAG.YES;
        const highestFieldCode = highestEnabled ? this.form.highestFieldCode : '';
        this.$emit('confirm', {
          optionName: this.form.optionName.trim(),
          indexName: this.form.indexName,
          filterFieldCode: this.form.filterFieldCode,
          filterRecentYear: this.form.filterRecentYear || '',
          hasScoreDj: this.form.hasScoreDj,
          scoreFieldNames: this.scoreEnabled
            ? this.sfSel.map((name) => ({ code: name, codeField: name }))
            : [],
          hasHighestJx: highestEnabled ? DIM_FLAG.YES : DIM_FLAG.NO,
          highestFieldCode,
          sortNo: Number(this.form.sortNo) || 0,
          scores: scores.map((item) => ({
            scoreCode: item.scoreCode,
            scoreCodeJson: item.scoreCodeJson,
            score: item.score
          }))
        });
      });
    },
    // 保存前校验档位完整性与编码唯一性，通过返回档位数组，否则提示并返回 null
    validateScores() {
      if (!this.scoreEnabled) {
        return [];
      }
      if (!this.sfSel.length) {
        this.$message({ message: '已设置评分等级，请至少勾选一个评分字段', duration: 2000 });
        return null;
      }
      const drafts = this.buildDraftScores(false);
      const seenCodes = {};
      for (let i = 0; i < drafts.length; i++) {
        const item = drafts[i];
        if (!item._complete) {
          this.$message({ message: '第 ' + (i + 1) + ' 行评分字段取值或得分未填写完整', duration: 2000 });
          return null;
        }
        if (seenCodes[item.scoreCode]) {
          this.$message({ message: '分值编码「' + item.scoreCode + '」重复', duration: 2000 });
          return null;
        }
        seenCodes[item.scoreCode] = true;
      }
      return drafts;
    },
    escapeHtml(value) {
      return String(value === null || value === undefined ? '' : value)
        .replace(/[&<>"']/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[char]);
    }
  }
};
</script>
