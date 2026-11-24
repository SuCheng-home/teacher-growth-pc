<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">PEER COMPARE · DIMENSION CONFIG</div>
        <h1>维度分析设置<span>配置对比维度、维度选项与评分等级三级数据</span></h1>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>三级数据层层相扣：<b>①建维度</b>（对比报告中的一个分析板块）→ <b>②挂选项</b>（维度下的统计口径，绑定教师档案指标）→ <b>③配评分</b>（「字段取值组合 → 得分」的分值表，编码以 # 拼接）。选项卡片下方的灰字「配置解读」由配置实时生成，保存后同步刷新，可据此快速核对取数口径。<b>所有新增/编辑/删除实时保存到服务器</b>，删除维度会级联删除其选项与评分。</span>
    </div>

    <!-- 上下结构：维度卡片整行选择 / 下方展示选中维度与选项 -->
    <div v-loading="loading || optionsLoading" class="pd-master">
      <section class="pd-pane">
        <div class="pd-pane-head">
          <h2><i data-lucide="layers"></i>维度</h2>
          <span class="side">{{ sortedDims.length }} 个维度</span>
          <button class="btn sm primary pd-add-btn" type="button" @click="openDimDialog(null)">
            <i data-lucide="plus"></i>新增维度
          </button>
        </div>
        <div class="pd-dim-list">
          <button
            v-for="(dim) in sortedDims"
            :key="dim.id"
            class="pd-dim-card"
            :class="{ sel: dim.id === currentDimId }"
            type="button"
            @click="selectDim(dim.id)"
          >
            <div class="nm">
              <i data-lucide="layers"></i><span class="ttl">{{ dim.title }}</span>
            </div>
            <div class="meta">
              <span v-if="dim.isRank === flag.YES" class="tag ok">排名·{{ dim.rankType === rankType.COUNT ? '按次数' : '按得分' }}</span>
              <span v-else class="tag mut">不排名</span>
              <span v-if="dim.hasHighestJx === flag.YES" class="tag wt">最高奖项</span>
              <!-- <span class="tag bl num">{{ dim.options.length }} 选项</span> -->
              <span class="ord num">排序{{ dim.sortNo }}</span>
            </div>
          </button>
          <div v-if="!sortedDims.length" class="pd-empty pd-dim-empty">暂无维度，点右上角「新增维度」创建第一个分析板块。</div>
        </div>
      </section>

      <section class="pd-pane pd-detail">
        <template v-if="currentDim">
          <div class="pd-detail-head">
            <div class="row1">
              <h3>{{ currentDim.title }}</h3>
              <div class="ops2">
                <button class="btn sm" type="button" @click="openDimDialog(currentDim)">
                  <i data-lucide="pencil"></i>编辑维度
                </button>
                <button class="btn sm danger" type="button" @click="removeDim(currentDim)">
                  <i data-lucide="trash-2"></i>删除
                </button>
              </div>
            </div>
            <div class="tags">
              <span class="lb">维度口径</span>
              <span v-if="currentDim.isRank === flag.YES" class="tag ok">
                排名 · {{ currentDim.rankType === rankType.COUNT ? '按次数' : '按得分' }}（rankType={{ currentDim.rankType }}）
              </span>
              <span v-else class="tag mut">不排名</span>
              <span v-if="currentDim.hasHighestJx === flag.YES" class="tag wt">维度级最高奖项</span>
              <span v-else class="tag mut">无最高奖项</span>
              <span class="tag bl num">排序号 {{ currentDim.sortNo }}</span>
              <!-- <span class="tag mut mono">id={{ currentDim.id }}</span> -->
            </div>
          </div>
          <div class="pd-opt-list">
            <div class="pd-opt-head">
              <i data-lucide="git-branch"></i>维度选项
              <span class="side">共 {{ currentDim.options.length }} 项 · 每项一张卡片，灰字为配置解读</span>
              <button class="btn sm primary pd-add-btn" type="button" @click="openOptionDialog(null, false)">
                <i data-lucide="plus"></i>新增选项
              </button>
            </div>
            <div v-for="option in sortedCurrentOptions" :key="option.id" class="pd-opt-card">
              <div class="r1">
                <b>{{ option.optionName }}</b>
                <span class="ord num">排序 {{ option.sortNo }}</span>
                <div class="ops">
                  <button
                    v-if="option.hasScoreDj === hasScoreDj.YES"
                    class="op pr"
                    type="button"
                    @click="openOptionDialog(option, true)"
                  ><i data-lucide="star"></i>评分配置</button>
                  <button v-else class="op dis" type="button" title="该选项未设置评分等级">
                    <i data-lucide="star"></i>评分配置
                  </button>
                  <button class="op" type="button" @click="openOptionDialog(option, false)">
                    <i data-lucide="pencil"></i>编辑
                  </button>
                  <button class="op del" type="button" @click="removeOption(option)">
                    <i data-lucide="trash-2"></i>删除
                  </button>
                </div>
              </div>
              <div class="pd-opt-read">
                <i data-lucide="file-search"></i>
                <span v-html="interpretationHtml(option)"></span>
              </div>
              <div class="pd-opt-tags" v-html="optionTagsHtml(option)"></div>
            </div>
            <div v-if="!currentDim.options.length" class="pd-empty">该维度暂无选项，点「新增选项」挂上统计口径。</div>
          </div>
        </template>
        <div v-else class="pd-empty pd-detail-empty">请在上方选择一个维度，或点「新增维度」。</div>
      </section>
    </div>

    <div class="pd-note">
      <i data-lucide="info"></i>
      <span>数据模型：一级维度 <span class="pe-key mono">{{ tableNames.dimension }}</span>（title / showContent / hasHighestJx / isRank / rankType / sortNo）；二级选项 <span class="pe-key mono">{{ tableNames.option }}</span>（绑定指标 indexName、过滤 sj + filterRecentYear、评分 scoreFieldNames、最高奖项）；三级评分 <span class="pe-key mono">{{ tableNames.score }}</span>（scoreCode / scoreCodeJson / score）。删除维度级联删除其选项与评分。</span>
    </div>

    <dimension-form-dialog
      v-if="dimDialogVisible"
      :visible="dimDialogVisible"
      :record="dimDialogRecord"
      :next-sort-no="nextDimSortNo"
      @close="dimDialogVisible = false"
      @confirm="saveDim"
    />
    <option-form-dialog
      v-if="optionDialogVisible"
      :visible="optionDialogVisible"
      :record="optionDialogRecord"
      :dimension="currentDim"
      :score-mode="optionDialogScoreMode"
      @close="optionDialogVisible = false"
      @confirm="saveOption"
    />
  </div>
</template>

<script>
/* 页面级子组件：维度表单弹窗、选项表单弹窗（步骤化配置 + 内嵌评分表） */
import DimensionFormDialog from './components/dimension-form-dialog.vue';
import OptionFormDialog from './components/option-form-dialog.vue';
import {
  DIM_FLAG,
  DIM_RANK_TYPE,
  DIM_HAS_SCORE_DJ,
  PEER_DIM_TABLE_NAMES,
  findMetricByName,
  findMetricField,
  buildOptionInterpretation
} from '@/constants/peer-dim-analysis';
import {
  peerDimList,
  peerDimSave,
  peerDimDelete,
  peerDimOptionList,
  peerDimOptionSave,
  peerDimOptionDelete
} from '@/api/peer-dim-analysis';

export default {
  name: 'AdminPeerDimAnalysis',
  components: {
    DimensionFormDialog,
    OptionFormDialog
  },
  data() {
    return {
      flag: DIM_FLAG,
      rankType: DIM_RANK_TYPE,
      hasScoreDj: DIM_HAS_SCORE_DJ,
      tableNames: PEER_DIM_TABLE_NAMES,
      // 三级配置树：维度列表来自接口，选项与评分在选中维度时按需加载
      loading: false,
      optionsLoading: false,
      dimSaving: false,
      optionSaving: false,
      dims: [],
      currentDimId: null,
      dimDialogVisible: false,
      dimDialogRecord: null,
      optionDialogVisible: false,
      optionDialogRecord: null,
      optionDialogScoreMode: false
    };
  },
  computed: {
    sortedDims() {
      return this.dims.slice().sort((a, b) => a.sortNo - b.sortNo);
    },
    currentDim() {
      return this.dims.find((dim) => dim.id === this.currentDimId) || null;
    },
    sortedCurrentOptions() {
      if (!this.currentDim) {
        return [];
      }
      return this.currentDim.options.slice().sort((a, b) => a.sortNo - b.sortNo);
    },
    // 弹窗内指标下拉数据源：档案指标（数组记录型），来自教师档案指标字典 teacherIndexList
    archiveMetrics() {
      const indexList = this.$store.getters.teacherIndexList || [];
      return indexList
        .filter((indexItem) => indexItem.type === 'arrayform')
    },
    nextDimSortNo() {
      return this.dims.length ? Math.max(...this.dims.map((dim) => dim.sortNo)) + 10 : 10;
    }
  },
  created() {
    this.$store.dispatch('initIndexList');
    this.loadDims();
  },
  methods: {
    selectDim(id) {
      if (String(this.currentDimId) === String(id)) {
        return;
      }
      this.currentDimId = id;
      this.loadOptions(id);
    },
    findMetric(indexName) {
      return findMetricByName(this.archiveMetrics, indexName);
    },
    interpretationHtml(option) {
      const parts = buildOptionInterpretation(option, this.archiveMetrics);
      return parts.map((part) => this.escapeHtml(part)).join('<span class="sep">→</span>');
    },
    optionTagsHtml(option) {
      const metric = this.findMetric(option.indexName);
      const tags = [];
      tags.push('<span class="tag bl">指标 ' + this.escapeHtml(metric ? (metric.label || metric.name) : option.indexName) +
        ' · <span class="mono">' + this.escapeHtml(option.indexName) + '</span></span>');
      if (option.filterFieldCode && option.filterRecentYear) {
        tags.push('<span class="tag wt">近 ' + option.filterRecentYear + ' 年</span>');
      }
      tags.push('<span class="tag mut">数量计算</span>');
      if (option.hasScoreDj === DIM_HAS_SCORE_DJ.YES) {
        const names = (option.scoreFieldNames || [])
          .map((scoreField) => {
            const field = findMetricField(metric, scoreField.code);
            return field ? field.name : scoreField.code;
          })
          .join('+');
        tags.push('<span class="tag ok">评分 ' + this.escapeHtml(names) + ' · ' + (option.scores || []).length + ' 档</span>');
      } else {
        tags.push('<span class="tag mut">不评分</span>');
      }
      if (option.hasHighestJx === DIM_FLAG.YES && option.highestFieldCode) {
        const field = findMetricField(metric, option.highestFieldCode);
        tags.push('<span class="tag wt">最高奖项 ' + this.escapeHtml(field ? field.name : option.highestFieldCode) + '</span>');
      }
      return tags.join('');
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
    },
    /* ---------------- 数据加载与模型映射 ---------------- */
    // 拉取维度列表（withOption=1 附带选项，但不含评分明细，评分在选中维度时按 12.4 补拉）
    async loadDims(preferId) {
      this.loading = true;
      try {
        const res = await peerDimList({ withOption: 1 });
        const list = (res && res.data) || [];
        this.dims = list.map((item) => this.mapDimFromApi(item));
      } catch (err) {
        // 加载失败提示由请求拦截器统一给出
      } finally {
        this.loading = false;
      }
      const keepId = preferId !== undefined ? preferId : this.currentDimId;
      this.currentDimId = keepId && this.dims.some((dim) => String(dim.id) === String(keepId))
        ? keepId
        : (this.sortedDims.length ? this.sortedDims[0].id : null);
      if (this.currentDimId) {
        await this.loadOptions(this.currentDimId);
      }
    },
    // 拉取指定维度的选项列表（含 scoreList 评分明细），回填到该维度的 options
    async loadOptions(dimensionId) {
      if (!dimensionId) {
        return;
      }
      this.optionsLoading = true;
      try {
        const res = await peerDimOptionList({ dimensionId });
        const list = (res && res.data) || [];
        const dim = this.dims.find((item) => String(item.id) === String(dimensionId));
        if (dim) {
          dim.options = list.map((option) => this.mapOptionFromApi(option));
        }
      } catch (err) {
        // 加载失败提示由请求拦截器统一给出
      } finally {
        this.optionsLoading = false;
      }
    },
    // 接口 flag 为 int（1/2），枚举常量也是 number，加载时统一转数字兜底空值
    toFlag(value, defaultFlag) {
      return value === null || value === undefined || value === '' ? defaultFlag : Number(value);
    },
    toRankType(value) {
      return value === null || value === undefined || value === '' ? DIM_RANK_TYPE.NONE : Number(value);
    },
    mapDimFromApi(item) {
      return {
        id: item.id,
        title: item.title,
        showContent: item.showContent || '',
        hasHighestJx: this.toFlag(item.hasHighestJx, DIM_FLAG.NO),
        isRank: this.toFlag(item.isRank, DIM_FLAG.YES),
        rankType: this.toRankType(item.rankType),
        sortNo: Number(item.sortNo) || 0,
        options: (item.optionList || []).map((option) => this.mapOptionFromApi(option))
      };
    },
    mapOptionFromApi(option) {
      // 字段标识统一用档案字段全名（如 teacher_zhry_jb），与 teacherIndexList 的 field.name 对齐，不再拆分/拼接指标前缀
      const scoreFieldNames = String(option.scoreFieldNames || '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ code: name, codeField: name }));
      const rawHighest = option.highestFieldCode || '';
      return {
        id: option.id,
        dimensionId: option.dimensionId,
        optionName: option.optionName,
        indexName: option.indexName || '',
        filterFieldCode: option.filterFieldCode || '',
        filterFieldName: option.filterFieldName || '',
        filterRecentYear: option.filterRecentYear === null || option.filterRecentYear === undefined || option.filterRecentYear === '' ? '' : Number(option.filterRecentYear),
        hasScoreDj: this.toFlag(option.hasScoreDj, DIM_HAS_SCORE_DJ.NO),
        scoreFieldNames,
        hasHighestJx: this.toFlag(option.hasHighestJx, DIM_FLAG.NO),
        highestFieldCode: rawHighest,
        highestFieldName: option.highestFieldName || '',
        highestFieldLabel: option.highestFieldLabel || '',
        sortNo: Number(option.sortNo) || 0,
        scores: (option.scoreList || []).map((score) => this.mapScoreFromApi(score))
      };
    },
    mapScoreFromApi(score) {
      let scoreCodeJson = score.scoreCodeJson;
      if (typeof scoreCodeJson === 'string') {
        try {
          scoreCodeJson = JSON.parse(scoreCodeJson);
        } catch (err) {
          scoreCodeJson = [];
        }
      }
      return {
        id: score.id,
        scoreCode: score.scoreCode,
        scoreCodeJson: scoreCodeJson || [],
        score: score.score
      };
    },
    // 页面维度模型 → 接口 12.2 入参
    buildDimPayload(dimForm) {
      const ranked = dimForm.isRank === DIM_FLAG.YES;
      return {
        id: dimForm.id || undefined,
        title: dimForm.title,
        // 弹窗已不再提供展示内容编辑：编辑时保留维度原有 showContent，新增时为空
        showContent: dimForm.showContent !== undefined ? dimForm.showContent : ((this.dimDialogRecord && this.dimDialogRecord.showContent) || ''),
        hasHighestJx: Number(dimForm.hasHighestJx),
        isRank: Number(dimForm.isRank),
        rankType: ranked ? Number(dimForm.rankType) : null,
        sortNo: Number(dimForm.sortNo) || 0
      };
    },
    // 页面选项模型 → 接口 12.5 入参（评分明细先删后插，随选项一并提交）
    buildOptionPayload(optionForm) {
      const metric = this.findMetric(optionForm.indexName);
      const indexName = optionForm.indexName || '';
      const highestFieldCode = optionForm.highestFieldCode || '';
      const filterField = optionForm.filterFieldCode ? findMetricField(metric, optionForm.filterFieldCode) : null;
      const highestField = highestFieldCode ? findMetricField(metric, highestFieldCode) : null;
      return {
        id: optionForm.id || undefined,
        dimensionId: this.currentDimId,
        optionName: optionForm.optionName,
        indexName,
        filterFieldCode: optionForm.filterFieldCode || '',
        filterFieldName: optionForm.filterFieldName || (filterField ? filterField.name : ''),
        filterRecentYear: optionForm.filterRecentYear ? Number(optionForm.filterRecentYear) : null,
        hasScoreDj: Number(optionForm.hasScoreDj) || null,
        scoreFieldNames: (optionForm.scoreFieldNames || [])
          .map((item) => item.codeField || item.code)
          .join(','),
        hasHighestJx: Number(optionForm.hasHighestJx),
        highestFieldCode,
        highestFieldName: highestFieldCode,
        highestFieldLabel: highestField ? (highestField.label || highestField.name) : '',
        sortNo: Number(optionForm.sortNo) || 0,
        scoreList: (optionForm.scores || []).map((score) => ({
          id: score.id || undefined,
          scoreCode: score.scoreCode,
          scoreCodeJson: JSON.stringify(score.scoreCodeJson || []),
          score: score.score
        }))
      };
    },
    /* ---------------- 维度增删改 ---------------- */
    openDimDialog(record) {
      this.dimDialogRecord = record || null;
      this.dimDialogVisible = true;
    },
    async saveDim(dimForm) {
      if (this.dimSaving) {
        return;
      }
      const isEdit = !!this.dimDialogRecord;
      const payload = this.buildDimPayload({ ...dimForm, id: isEdit ? this.dimDialogRecord.id : undefined });
      this.dimSaving = true;
      try {
        await peerDimSave(payload);
        this.showToast(isEdit ? '维度已更新' : '维度已新增');
        this.dimDialogVisible = false;
        if (isEdit) {
          await this.loadDims(this.currentDimId);
        } else {
          // 新增接口不返回 id，刷新后按标题定位到新维度
          await this.loadDims(null);
          const created = this.dims.filter((dim) => dim.title === dimForm.title).pop();
          if (created) {
            this.currentDimId = created.id;
            await this.loadOptions(created.id);
          }
        }
      } catch (err) {
        // 保存失败保持弹窗可重试，错误提示由请求拦截器给出
      } finally {
        this.dimSaving = false;
      }
    },
    async removeDim(dim) {
      const optionCount = dim.options.length;
      try {
        await this.$confirm(
          '其下 ' + optionCount + ' 个选项及全部评分等级配置将一并删除，不可恢复。',
          '删除维度「' + dim.title + '」？',
          { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
        );
      } catch (err) {
        return;
      }
      try {
        await peerDimDelete(dim.id);
        this.showToast('维度已删除');
        await this.loadDims(null);
      } catch (err) {
        // 删除失败列表保持原样，错误提示由请求拦截器给出
      }
    },
    /* ---------------- 选项增删改 ---------------- */
    openOptionDialog(record, scoreMode) {
      if (!this.currentDim) {
        this.showToast('请先选择或新增一个维度');
        return;
      }
      this.optionDialogRecord = record || null;
      this.optionDialogScoreMode = !!scoreMode;
      this.optionDialogVisible = true;
    },
    async saveOption(optionForm) {
      if (!this.currentDim || this.optionSaving) {
        return;
      }
      const isEdit = !!this.optionDialogRecord;
      const payload = this.buildOptionPayload({ ...optionForm, id: isEdit ? this.optionDialogRecord.id : undefined });
      this.optionSaving = true;
      try {
        await peerDimOptionSave(payload);
        const scoreCount = (optionForm.scores || []).length;
        this.showToast(isEdit
          ? (optionForm.hasScoreDj === DIM_HAS_SCORE_DJ.YES ? '选项已更新（评分 ' + scoreCount + ' 档）' : '选项已更新')
          : '选项已新增');
        this.optionDialogVisible = false;
        await this.loadOptions(this.currentDimId);
      } catch (err) {
        // 保存失败保持弹窗可重试，错误提示由请求拦截器给出
      } finally {
        this.optionSaving = false;
      }
    },
    async removeOption(option) {
      const scoreCount = (option.scores || []).length;
      try {
        await this.$confirm(
          '其下 ' + scoreCount + ' 条评分等级将一并删除，不可恢复。',
          '删除选项「' + option.optionName + '」？',
          { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
        );
      } catch (err) {
        return;
      }
      try {
        await peerDimOptionDelete(option.id);
        this.showToast('选项已删除');
        await this.loadOptions(this.currentDimId);
      } catch (err) {
        // 删除失败列表保持原样，错误提示由请求拦截器给出
      }
    },
    showToast(message) {
      this.$message({ message, duration: 2000 });
    }
  }
};
</script>
