<template>
  <div class="pane" id="pane-doc">
    <div v-if="!hasData" class="stub-hint">暂无分析数据</div>
    <template v-else>
      <!-- 总：规则概览 + 关键数字 -->
      <div class="tl-lead doc">
        <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg></span>
        <div>
          <b class="tl-t">{{ done ? '该目标已达成' : '标准适用规则说明' }}</b>
          <p>{{ leadBody }}</p>
          <div class="tl-nums">
            <template v-if="done">
              <div><b>{{ gateCount }}</b>条要求（已全部满足）</div>
            </template>
            <template v-else>
              <div><b>{{ gateCount }}</b>条资格门槛</div>
              <div><b>{{ scoreCount }}</b>个评分项</div>
              <div v-if="scoreFull != null"><b>{{ scoreFull }}</b>材料分满分</div>
              <div v-if="scoreTotal != null"><b :class="scoreFull != null && scoreTotal < scoreFull ? 'w' : 'g'">{{ scoreTotal }}</b>当前材料分</div>
            </template>
          </div>
        </div>
      </div>
      <!-- 评估文件：标准关联的原文文件列表，支持逐份下载 -->
      <div v-if="stdFiles.length" class="dl-bar">
        <div class="dl-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/></svg>
          <b>评估文件</b>
          <span class="cnt">共 {{ stdFiles.length }} 份</span>
        </div>
        <div class="dl-list">
          <div v-for="(f, i) in stdFiles" :key="i" class="dl-item">
            <span class="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/></svg></span>
            <span class="fn">《{{ f.fileName }}》</span>
            <!-- <span class="dt" :class="{ guide: f.fileType === 'guide' }">{{ fileTypeLabel(f.fileType) }}</span> -->
            <button type="button" class="dl-go" @click="downloadFile(f)">下载</button>
          </div>
        </div>
        <!-- <div class="dl-foot">
          <a>查看标准库<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        </div> -->
      </div>
      <!-- 分：资格门槛与评分项逐条规则卡、补齐路径统一由 rule-render 按 AI JSON 结构（8.7 analysisStructure）驱动 -->
      <rule-render :data="structure" />
      <!-- 总：小结需本人办理的事项 -->
      <div class="tl-tail doc">
        <b class="tl-t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>需本人办理事项：共 {{ fixPath.length }} 项</b>
        <ol v-if="fixPath.length">
          <li v-for="(item, i) in fixPath" :key="i">{{ item }}</li>
          <li>其余各项由系统自动读取档案计分，或由学校教务处、评审组分别提供，本人只需核对结果。</li>
        </ol>
        <ol v-else>
          <li v-if="done">该目标已达成，暂无待办事项。如需调整目标，可点上方目标卡「编辑」。</li>
          <li v-else>本档位材料分由系统自动读取，当前无需额外操作；请先按上方补齐路径处理资格门槛。</li>
        </ol>
      </div>
    </template>
  </div>
</template>

<script>
import { mixin } from 'auth-layout-zw';
import { visionStandardList } from '@/api/vision';
import RuleRender from '@/components/rule-render';

/* 评估文件展示标签：按来源字段归类——compareFile→score 评分标准｜attachment→guide 指导文件 */
const FILE_TYPE_LABEL = { score: '评分标准', notice: '评选通知', guide: '指导文件' };

export default {
  name: 'PaneDoc',
  components: { RuleRender },
  props: {
    /* 分析结果全量结构（来源 8.7 analysisStructure）：{ conclusion, gateTotal, scoreTotal, scoreFull, fixPath, gates, scoreItems }，所有展示数据均取自这里 */
    structure: { type: Object, default: null },
    /* 当前愿景目标 id（AiVisionTeacherGoal.goalId）：评估文件按此调接口获取 */
    goalId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      /* 评估文件：按 goalId 拉取评估标准上传的标准文件 */
      stdFiles: []
    };
  },
  computed: {
    /* 是否已有可渲染的分析数据：结构缺失即视为无数据 */
    hasData() {
      return !!this.structure;
    },
    /* 已达成结论（conclusion=1） */
    done() {
      return !!this.structure && Number(this.structure.conclusion) === 1;
    },
    /* 门槛条目（展平 gates） */
    gateEntries() {
      const list = [];
      ((this.structure && this.structure.gates) || []).forEach(g => (g.entries || []).forEach(e => list.push(e)));
      return list;
    },
    /* 评分项条目（展平 scoreItems） */
    scoreEntries() {
      const list = [];
      ((this.structure && this.structure.scoreItems) || []).forEach(c => (c.entries || []).forEach(e => list.push(e)));
      return list;
    },
    /* 资格门槛条数：优先取结构汇总计数 gateTotal，缺省按结构条目数 */
    gateCount() {
      const c = this.structure && this.structure.gateTotal;
      return c != null ? c : this.gateEntries.length;
    },
    /* 评分项个数：按结构条目数 */
    scoreCount() {
      return this.scoreEntries.length;
    },
    scoreFull() {
      return this.structure ? this.structure.scoreFull : null;
    },
    scoreTotal() {
      return this.structure ? this.structure.scoreTotal : null;
    },
    leadBody() {
      if (this.done) {
        return `本次分析结论为「该目标已达成」，${this.gateCount} 条资格门槛均已满足，无需申报。以下逐条列明标准规则原文，供对照更高目标时参考。`;
      }
      return `本次分析的申报条件分为两部分：资格门槛 ${this.gateCount} 条，任一条件不符合即不具备申报资格；材料评分项共 ${this.scoreCount} 项。资格门槛由系统读取本人档案记录自动判定，不计入材料分。以下逐条列明规则说明与标准原文。`;
    },
    /* 需本人办理事项：接口返回的补齐路径列表（fixPath: string[]） */
    fixPath() {
      return (this.structure && Array.isArray(this.structure.fixPath)) ? this.structure.fixPath : [];
    }
  },
  watch: {
    /* 目标切换：按新 goalId 重新拉取评估标准文件 */
    goalId: {
      immediate: true,
      handler() {
        this.loadStdFiles();
      }
    }
  },
  methods: {
    /* 按 goalId 拉取该目标下评估标准上传的标准文件：compareFile→评分标准、attachment→指导文件 */
    loadStdFiles() {
      if (!this.goalId) {
        this.stdFiles = [];
        this.$emit('files-count', 0);
        return;
      }
      visionStandardList({ goalId: this.goalId }).then(res => {
        const standards = (res && res.data) || [];
        const files = [];
        standards.forEach(std => {
          this.parseFileJsonList(std.compareFile).forEach(f => files.push(Object.assign({}, f, { fileType: 'score' })));
          this.parseFileJsonList(std.attachment).forEach(f => files.push(Object.assign({}, f, { fileType: 'guide' })));
        });
        /* 按附件 key（或文件名）去重，仅保留有文件名的条目 */
        const seen = {};
        this.stdFiles = files.filter(f => f.fileName).filter(f => {
          const key = f.attachmentKey || f.url || f.fileName;
          if (seen[key]) return false;
          seen[key] = 1;
          return true;
        });
        /* 上抛原文份数供页签徽标展示 */
        this.$emit('files-count', this.stdFiles.length);
      }).catch(() => {
        this.stdFiles = [];
        this.$emit('files-count', 0);
      });
    },
    /* 后端文件字段为 FileJson 数组字符串：解析为列表，空值或非数组按未上传处理 */
    parseFileJsonList(str) {
      if (!str) return [];
      try {
        const list = JSON.parse(str);
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },
    fileTypeLabel(fileType) {
      return FILE_TYPE_LABEL[fileType] || FILE_TYPE_LABEL.guide;
    },
    /* 按附件 key 换取下载地址后新窗口下载 */
    downloadFile(f) {
      const key = f.attachmentKey || f.url;
      if (!key) return;
      window.open(mixin.getDownloadUrlByAttachmentKey(key));
    }
  }
};
</script>
