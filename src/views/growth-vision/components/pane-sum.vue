<template>
  <div class="pane" id="pane-sum">
    <div v-if="!hasData" class="stub-hint">暂无分析数据</div>
    <!-- 已达成：不输出材料分与差距分析 -->
    <template v-else-if="done">
      <div class="tl-lead sum">
        <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></span>
        <div>
          <b class="tl-t">该目标已达成</b>
          <p>本次分析结论为「该目标已达成」，{{ gateCount }} 条资格门槛均已满足。本档位无需申报，不输出材料分与差距分析。</p>
          <div class="tl-nums"><div><b class="g">{{ gateCount }}</b>条要求（已满足）</div></div>
        </div>
      </div>
      <div class="ai-read" style="margin-bottom:0">
        <b class="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>AI 分析小结</b>{{ aiSummary || '暂无分析小结。' }}
      </div>
    </template>
    <!-- 资格门槛未满足 / 未产出材料分：暂不输出材料分 -->
    <template v-else-if="!hasScore">
      <div class="tl-lead sum">
        <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></span>
        <div>
          <b class="tl-t">本档位资格门槛未满足，暂不输出材料分</b>
          <p>资格门槛中有 {{ gateNoCount }} 条不符合、{{ gateWaitCount }} 条待确认。资格门槛未通过时材料分不具参考意义，需先完成前置条件。</p>
          <div class="tl-nums">
            <div><b class="r">{{ gateNoCount }}</b>条不符合</div>
            <div><b class="w">{{ gateWaitCount }}</b>条待确认</div>
            <div><b>{{ gateOkCount }}</b>条符合</div>
          </div>
        </div>
      </div>
      <div v-if="fixList.length" class="fix-path" style="margin:0 0 15px">
        <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l10 18H2z"/><path d="M12 9v5M12 17v.5"/></svg>补齐路径（按顺序办理）</h3>
        <ol><li v-for="(fx, fi) in fixList" :key="fi" v-html="fx"></li></ol>
      </div>
      <div class="ai-read">
        <b class="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>AI 分析小结</b>{{ aiSummary || '暂无分析小结。' }}
      </div>
    </template>
    <!-- 汇总与差距 -->
    <template v-else>
      <div class="sum-top">
        <div class="big num">{{ scoreTotal }}<span v-if="scoreFull != null" class="of"> / {{ scoreFull }}</span></div>
        <div class="met">
          <b>系统材料分</b><br>
          口径：按标准细则自动计分，可在「逐条比对结果」页签核对每项数据来源
        </div>
        <div v-if="pct != null" class="score-bar" style="flex:1;min-width:140px"><i :style="{ width: pct + '%' }"></i></div>
      </div>
      <div class="tl-tail sum" style="margin:0 0 15px">
        <b class="tl-t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>差距概览</b>
        <ol>
          <li>材料分 <b>{{ scoreTotal }}{{ scoreFull != null ? ' / ' + scoreFull : '' }}</b><template v-if="gapRows.length">，尚有 <b>{{ gapRows.length }}</b> 项缺口、合计 <b>{{ gapSum }}</b> 分可补</template><template v-else>，已无缺口</template>。</li>
          <li v-if="gapRows.length">优先办理：<b>{{ gapRows[0].name }}</b>，补齐后可增加 <b>{{ -gapRows[0].gap }}</b> 分。</li>
        </ol>
      </div>
      <template v-if="gapRows.length">
        <div class="cat-band" style="margin-top:6px"><b>缺口排序（按分差从大到小）</b><span class="cl"></span></div>
        <div v-for="(r, i) in gapRows" :key="i" class="rank-row">
          <span class="rk">{{ i + 1 }}</span>
          <span class="nm">{{ r.name }}<div style="font-size:10.5px;color:var(--muted);margin-top:3px">{{ gapLabel(r.gapType) }} · {{ r.suggestion || '' }}</div></span>
          <span class="dl2">差 {{ -r.gap }} 分</span>
          <span class="gain">补齐后 +{{ -r.gap }} 分</span>
        </div>
      </template>
      <div v-else class="excl-note" style="border-color:#cfe0d6;background:#f4f8f5;color:#3f7a63">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6L9 17l-5-5"/></svg>
        <span>各评分项均已达标，无缺口。</span>
      </div>
      <div style="margin-top:15px">
        <div class="ai-read">
          <b class="t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>AI 分析小结</b>{{ aiSummary || '暂无分析小结。' }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { GAP } from '@/constants/qualification';

/* 结论代码：1已达成 2具备申报资格 3待确认 4暂不具备 */
export default {
  name: 'PaneSum',
  props: {
    /* 分析结果全量结构（来源 8.7 analysisStructure）：{ conclusion, gateTotal, scoreTotal, scoreFull, fixPath, summary, sumStat:{ conclusionLabel, gateStat }, gates, scoreItems }，所有展示数据均取自这里 */
    structure: { type: Object, default: null }
  },
  computed: {
    hasData() {
      return !!this.structure;
    },
    done() {
      return !!this.structure && Number(this.structure.conclusion) === 1;
    },
    /* 评分项条目（展平 scoreItems） */
    scoreEntries() {
      const list = [];
      ((this.structure && this.structure.scoreItems) || []).forEach(c => (c.entries || []).forEach(e => list.push(e)));
      return list;
    },
    /* 是否产出材料分：存在评分项且结构汇总有分值 */
    hasScore() {
      return !this.done && this.scoreEntries.length > 0 && this.scoreTotal != null;
    },
    gateCount() {
      const c = this.structure && this.structure.gateTotal;
      return c != null ? c : this.gateEntriesFlat.length;
    },
    /* 门槛条目（展平 gates） */
    gateEntriesFlat() {
      const list = [];
      ((this.structure && this.structure.gates) || []).forEach(g => (g.entries || []).forEach(e => list.push(e)));
      return list;
    },
    /* 门槛判定计数：优先取结构 sumStat.gateStat（ok/wait/no），缺省按 gates 条目 judge 统计 */
    gateStat() {
      const ss = this.structure && this.structure.sumStat;
      return (ss && ss.gateStat) || null;
    },
    gateNoCount() {
      const s = this.gateStat;
      return s && s.no != null ? s.no : this.gateEntriesFlat.filter(e => e.judge === 'fail').length;
    },
    gateWaitCount() {
      const s = this.gateStat;
      return s && s.wait != null ? s.wait : this.gateEntriesFlat.filter(e => e.judge === 'pending').length;
    },
    gateOkCount() {
      const s = this.gateStat;
      return s && s.ok != null ? s.ok : this.gateEntriesFlat.filter(e => e.judge === 'pass').length;
    },
    scoreTotal() {
      return this.structure ? this.structure.scoreTotal : null;
    },
    scoreFull() {
      return this.structure ? this.structure.scoreFull : null;
    },
    pct() {
      const t = this.scoreTotal;
      const f = this.scoreFull;
      return (t != null && f) ? Math.min(100, t / f * 100).toFixed(1) : null;
    },
    /* 补齐路径：取结构 fixPath，兼容字符串/数组/对象数组 */
    fixList() {
      let fp = (this.structure && this.structure.fixPath) || [];
      if (typeof fp === 'string') {
        try { fp = JSON.parse(fp); } catch (e) { fp = fp ? [fp] : []; }
      }
      if (!Array.isArray(fp)) fp = [];
      return fp.map(x => (typeof x === 'string' ? x : ((x && (x.text || x.content)) || ''))).filter(Boolean);
    },
    /* 缺口行：评分项中 score < fullScore 者，按分差升序（缺口最大在前） */
    gapRows() {
      return this.scoreEntries
        .filter(e => e.score != null && e.fullScore != null && (e.score - e.fullScore) < 0)
        .map(e => ({ name: e.itemName, gap: e.score - e.fullScore, gapType: e.gapType, suggestion: e.suggestion }))
        .sort((a, b) => a.gap - b.gap);
    },
    gapSum() {
      return this.gapRows.reduce((a, r) => a - r.gap, 0);
    },
    /* AI 分析小结：取结构顶层 summary */
    aiSummary() {
      return (this.structure && this.structure.summary) || '';
    }
  },
  methods: {
    gapLabel(type) {
      return GAP[type] || '—';
    }
  }
};
</script>
