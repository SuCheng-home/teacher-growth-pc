<template>
  <div class="pane" id="pane-rpt">
    <div v-if="!structure" class="stub-hint">暂无分析数据</div>
    <template v-else>
      <!-- 报告生成入口 -->
      <div class="rpt-cta">
        <span class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 14h2v4H9zM15 11v7"/></svg></span>
        <div class="rt2">
          <b>生成「{{ goalName }}」分析报告</b>
          <p>汇总本次资格判定、逐项得分、数据来源与主要缺口，生成可打印 / 可导出的报告，供本人与学校核对。</p>
        </div>
        <button
          class="gen-btn"
          type="button"
          :disabled="!canRpt || generating"
          :style="(!canRpt || generating) ? { opacity: 0.55, cursor: 'not-allowed' } : null"
          @click="onGenerate"
        >{{ generating ? '生成中…' : (canRpt ? (report ? '重新生成报告' : '生成分析报告') : '暂不生成') }}</button>
      </div>
      <!-- 报告内联展示区：生成即冻结快照，不走弹框 -->
      <div ref="host" class="rpt-host">
        <div v-if="report" class="rpt-bar" :class="{ stale: report.expired }">
          <span class="rb-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 7"/></svg>报告已生成</span>
          <span class="rb-t">生成于 {{ report.at }} · 依据档案 {{ report.pull }}{{ report.expired ? ' · 生成后档案又有变化，建议重新生成' : '' }}</span>
          <span class="rb-btns">
            <button class="rb-re" type="button" @click="onGenerate">重新生成</button>
            <button class="rb-print" type="button" @click="onPrint">打印 / 导出</button>
          </span>
        </div>
        <!-- 报告正文：接口回传结构化数据（非 HTML 片段），按原型四段结构由模板绘制 -->
        <div v-if="report" class="rpt">
          <div class="rpt-hd">
            <b>{{ rc.goalName || goalName }} · 资格预审与材料分分析报告</b>
            <div class="rpt-sub">
              {{ rc.teacherName || '—' }}<br>
              目标：{{ rc.goalName || goalName }}　|　对应标准：{{ rc.standardName || '—' }}<br>
              档案数据时点：{{ report.pull || '—' }}　|　报告生成于：{{ report.at }}
            </div>
          </div>
          <h4>一、材料分结论</h4>
          <!-- 结论 4（暂不具备申报资格）不出材料分，只如实说明 -->
          <p v-if="noScore">当前资格结论为「{{ rc.conclusionLabel || '暂不具备申报资格' }}」，本报告不输出材料分。</p>
          <p v-else>系统材料分 <b>{{ scoreText }}</b>{{ excludeNote }}。{{ changeNote }}</p>
          <template v-if="!noScore">
            <h4>二、逐项得分与数据来源</h4>
            <table>
              <thead><tr><th>评分项</th><th>满分</th><th>材料分</th><th>数据来源</th></tr></thead>
              <tbody>
                <tr v-for="(it, i) in itemRows" :key="i">
                  <td class="c1">{{ it.name }}</td>
                  <td>{{ it.full }}</td>
                  <td><b>{{ it.score }}</b></td>
                  <td>{{ it.source }}</td>
                </tr>
                <tr v-if="!itemRows.length"><td class="c1" colspan="4">本次分析暂无评分项明细。</td></tr>
              </tbody>
            </table>
          </template>
          <template v-if="excludedRows.length">
            <h4>被剔除的评分项</h4>
            <table>
              <thead><tr><th>评分项</th><th>原分值</th><th>剔除理由</th></tr></thead>
              <tbody>
                <tr v-for="(it, i) in excludedRows" :key="i">
                  <td class="c1">{{ it.name }}</td>
                  <td>{{ it.score }}</td>
                  <td>{{ it.reason }}</td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-if="editedRows.length">
            <h4>本人修改的项</h4>
            <table>
              <thead><tr><th>评分项</th><th>改动</th><th>理由</th></tr></thead>
              <tbody>
                <tr v-for="(it, i) in editedRows" :key="i">
                  <td class="c1">{{ it.name }}</td>
                  <td>{{ it.change }}</td>
                  <td>{{ it.reason }}</td>
                </tr>
              </tbody>
            </table>
          </template>
          <h4>三、主要缺口与下一步</h4>
          <ol style="margin:0;padding-left:20px">
            <li v-for="(g, i) in gapRows" :key="i"><b>{{ g.itemName }}</b>：{{ g.gap }} 分 —— {{ g.suggestion }}</li>
            <li v-for="(p, i) in fixRows" :key="'f' + i">{{ p }}</li>
            <li v-if="!gapRows.length && !fixRows.length">各评分项均已达标。</li>
          </ol>
          <div class="disclaimer"><b>免责说明</b>：本报告由系统按标准细则自动计分生成，仅供参考，不构成任何评审结论；资格判定由规则引擎逐条执行，非 AI 推断。最终以标准文件原文、档案原始记录与学校评审结论为准。如发现判定与档案不符，请先在电子档案袋修正数据，再回到本页点「重新拉取并分析」。</div>
        </div>
      </div>
      <!-- 系统说明 -->
      <div class="ai-read" style="margin-bottom:0;margin-top:14px">
        <b class="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 14h2v4H9zM15 11v7"/></svg>AI 分析小结</b>{{ aiSummary || '本次分析暂无小结。' }}
        <div style="font-size:11px;color:var(--muted);margin-top:8px">来源：规则引擎判定结果 + 档案材料统计（数据拉取于 {{ pullTime }}）· AI 仅解释不裁决{{ report ? ' · 报告生成于 ' + report.at : '' }}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { visionReportGenerate, visionReportLatest } from '@/api/vision';
import { fmtTime } from '@/utils/format';

export default {
  name: 'PaneRpt',
  props: {
    /* 分析结果全量结构（来源 8.7 analysisStructure）：结论 conclusion 与 AI 小结 summary 均取自顶层 */
    structure: { type: Object, default: null },
    /* 目标名称（非分析数据，由容器按当前愿景下传） */
    goalName: { type: String, default: '' },
    pullTime: { type: String, default: '' },
    /* 当前愿景记录 id（AiVisionTeacherGoal.id）：报告生成接口入参，并按此 key 缓存各目标报告 */
    goalKey: { type: [String, Number], default: '' }
  },
  data() {
    return {
      /* 报告快照缓存（记录 id → { data 报告结构化数据, at, pull, expired }），本次会话内自持 */
      reportsMap: {},
      /* 报告生成中标记，防重复点击 */
      generating: false
    };
  },
  computed: {
    /* 已达成结论不出报告，其余只要有成功分析记录即可生成 */
    canRpt() {
      return !!this.structure && Number(this.structure.conclusion) !== 1;
    },
    /* AI 分析小结：取结构顶层 summary */
    aiSummary() {
      return (this.structure && this.structure.summary) || '';
    },
    /* 当前目标已生成的报告快照 */
    report() {
      return this.reportsMap[this.goalKey] || null;
    },
    /* 报告正文数据（接口 reportContent 结构化对象） */
    rc() {
      return (this.report && this.report.data) || {};
    },
    /* 结论 4（暂不具备申报资格）：后端不出材料分，报告隐藏分数与逐项得分段 */
    noScore() {
      return Number(this.rc.conclusion) === 4;
    },
    /* 材料分结论：总分 / 满分（满分为空只报总分） */
    scoreText() {
      const full = this.rc.scoreFull;
      return full ? `${this.rc.scoreTotal} / ${full}` : `${this.rc.scoreTotal}`;
    },
    /* 不含人工评审等口径备注（后端 scoreExcludeNote，空则不展示） */
    excludeNote() {
      return this.rc.scoreExcludeNote ? `（${this.rc.scoreExcludeNote}）` : '';
    },
    /* 改动留痕说明：与原型报告口径一致 */
    changeNote() {
      const ed = (this.rc.editedItems || []).length;
      const del = (this.rc.excludedItems || []).length;
      return (ed || del) ? `已按本人改动重算：改动 ${ed} 项、剔除 ${del} 项。` : '本页未做任何改动。';
    },
    /* 逐项得分行（9.3 itemDetails）：材料分取有效得分 validScore（修改分优先），回落 AI 得分 */
    itemRows() {
      return (this.rc.itemDetails || []).map((it) => ({
        name: it.itemName || '—',
        full: it.fullScore != null ? it.fullScore : '原文未设',
        score: it.validScore != null ? it.validScore : (it.score != null ? it.score : '—'),
        source: it.dataSource || '—'
      }));
    },
    /* 被剔除的评分项留痕（9.3 excludedItems）：原分值 = AI 原得分 score */
    excludedRows() {
      return (this.rc.excludedItems || []).map((it) => ({
        name: it.itemName || '—',
        score: it.score != null ? it.score : '—',
        reason: it.reason || '—'
      }));
    },
    /* 本人修改的项留痕（9.3 editedItems）：改动描述 取值→overrideValue / 分值→overrideScore */
    editedRows() {
      return (this.rc.editedItems || []).map((it) => ({
        name: it.itemName || '—',
        change: ((it.overrideValue ? '取值→' + it.overrideValue : '') + (it.overrideScore != null && it.overrideScore !== '' ? '分值→' + it.overrideScore : '')) || '—',
        reason: it.reason || '—'
      }));
    },
    /* 主要缺口（9.3 gaps）：[评分项：分差（负数） —— 建议]，后端已按缺口大小排序 */
    gapRows() {
      return (this.rc.gaps || []).map((g) => ({
        itemName: g.itemName || '—',
        gap: g.gap != null ? g.gap : '—',
        suggestion: g.suggestion || ''
      }));
    },
    /* 下一步：无量化缺口条目时回落补齐路径文案 */
    fixRows() {
      return this.gapRows.length ? [] : (this.rc.fixPath || []).filter(Boolean);
    }
  },
  watch: {
    /* 切换愿景目标时回显该目标最新快照（immediate 覆盖首次挂载；已缓存目标不重复拉） */
    goalKey: {
      immediate: true,
      handler() {
        this.loadLatest();
      }
    }
  },
  methods: {
    /* 生成报告（9.1）：接口同步调用 AI，回写当前 goalKey 的报告快照；轻提示由容器 mini-toast 展示 */
    onGenerate() {
      if (!this.canRpt || this.generating || !this.goalKey) return;
      this.generating = true;
      visionReportGenerate(this.goalKey).then(res => {
        const r = (res && res.data) || null;
        const content = this.parseReportContent(r && r.reportContent);
        if (!content) {
          this.$emit('toast', '报告生成失败，请稍后重试');
          return;
        }
        this.$set(this.reportsMap, this.goalKey, {
          data: content,
          at: r.generateTime || fmtTime(new Date()),
          pull: r.pullTime || this.pullTime,
          expired: false
        });
        this.$emit('toast', '已生成分析报告，可打印 / 导出');
        this.$nextTick(() => {
          if (this.$refs.host) this.$refs.host.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }).catch(() => {
        /* 接口异常由请求拦截器统一提示 */
      }).then(() => {
        this.generating = false;
      });
    },
    /* 报告正文容错解析：正常为结构化对象；历史 HTML 快照解析失败返回 null，由调用方兜底 */
    parseReportContent(raw) {
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) || null;
        } catch (e) {
          return null;
        }
      }
      return typeof raw === 'object' ? raw : null;
    },
    /* 初始化回显（9.2）：按当前愿景查最新快照；历史 HTML 快照解析为空时不回显，重新生成后即为结构化报告 */
    loadLatest() {
      if (!this.goalKey || this.reportsMap[this.goalKey]) return;
      visionReportLatest(this.goalKey).then(res => {
        const r = (res && res.data) || null;
        if (!r) return;
        const content = this.parseReportContent(r.reportContent);
        if (!content || !Object.keys(content).length) return;
        this.$set(this.reportsMap, this.goalKey, {
          data: content,
          at: r.generateTime || '',
          pull: r.pullTime || content.pullTime || this.pullTime,
          expired: !!r.expired
        });
      }).catch(() => {
        /* 无快照/接口异常静默：不影响页签正常展示与手动生成 */
      });
    },
    /* 打印 / 导出：直接调用浏览器打印，靠 @media print 只出报告本体 */
    onPrint() {
      const node = this.$refs.host && this.$refs.host.querySelector('.rpt');
      if (!node) return;
      window.print();
    }
  }
};
</script>
