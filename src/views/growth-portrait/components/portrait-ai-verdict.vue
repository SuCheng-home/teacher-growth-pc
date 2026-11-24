<template>
  <!-- ④ AI 综合研判：结论导语 + 达标/缺口双列 + 补齐路径（全部取自最近成功分析结果） -->
  <section v-show="enabled" id="sec-ai">
    <div class="card">
      <div class="sec-eyebrow">{{ cfg.eyebrow }}</div>
      <h2 class="sec-h"><i :data-lucide="cfg.icon"></i>{{ cfg.title }}</h2>
      <div class="sec-sub">{{ cfg.sub }}</div>

      <div v-if="!hasGoal" class="goal-empty">
        <!-- 未设置愿景：引导去设置 -->
        <div class="ge-ico"><i data-lucide="target"></i></div>
        <h3>{{ goalEmpty.title }}</h3>
        <p>{{ goalEmpty.desc }}</p>
        <a class="ge-btn" @click="goVision(goalEmpty.visionPath)"><i data-lucide="plus"></i>{{ goalEmpty.cta }}</a>
      </div>
      <div v-else-if="!structure" class="goal-empty">
        <!-- 已设置愿景但还没有成功分析结果 -->
        <div class="ge-ico"><i data-lucide="sparkles"></i></div>
        <h3>{{ analysisEmpty.title }}</h3>
        <p>{{ analysisEmpty.desc }}</p>
        <a class="ge-btn" @click="goVision(analysisEmpty.visionPath)"><i data-lucide="arrow-right"></i>{{ analysisEmpty.cta }}</a>
      </div>

      <template v-else>
        <div class="ai-verdict" style="margin-top:12px">
          <div class="verdict-lead">
            <div class="ico"><i :data-lucide="cfg.leadIcon"></i></div>
            <div>
              <h3>{{ leadTitle }}</h3>
              <p>{{ leadText }}</p>
            </div>
          </div>
          <div class="verdict-cols">
            <div class="verdict-col">
              <h4><i :data-lucide="cfg.okIcon" style="color:#2f7a68"></i>{{ cfg.okTitle }}</h4>
              <ul>
                <li v-for="(item, idx) in okItems" :key="'ok-' + idx"><i></i>{{ item }}</li>
              </ul>
            </div>
            <div class="verdict-col">
              <h4><i :data-lucide="cfg.gapIcon" style="color:#c06a3a"></i>{{ cfg.gapTitle }}</h4>
              <ul>
                <li v-for="(item, idx) in gapItems" :key="'gap-' + idx"><i></i>{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="main-line">
          <i data-lucide="target"></i>
          <div>
            <b>{{ cfg.mainTitle }}</b>
            <p>{{ mainText }}</p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script>
import {
  PORTRAIT_AI_VERDICT,
  PORTRAIT_GOAL_EMPTY,
  PORTRAIT_ANALYSIS_EMPTY,
  PORTRAIT_CONCLUSION_TEXT,
  PORTRAIT_GAP_FALLBACK,
  PORTRAIT_GATE_JUDGE_TEXT
} from '@/constants/growth-portrait';

export default {
  name: 'PortraitAiVerdict',
  props: {
    /* 段落是否显示（父组件按 frame.sections.ai 传入） */
    enabled: { type: Boolean, default: true },
    /* 我的愿景列表（AiVisionTeacherGoal 数组），用于标题取目标名与未设置愿景的空态 */
    goals: { type: Array, default: () => [] },
    /* 最近成功分析结果结构（来源 8.7 analysisStructure）：双列清单与补齐路线的唯一数据源 */
    structure: { type: Object, default: null }
  },
  data() {
    return {
      cfg: PORTRAIT_AI_VERDICT,
      goalEmpty: PORTRAIT_GOAL_EMPTY,
      analysisEmpty: PORTRAIT_ANALYSIS_EMPTY
    };
  },
  computed: {
    // 是否已设置成长愿景
    hasGoal() {
      return this.goals.length > 0;
    },
    // 当前对照的愿景目标名
    goalName() {
      return (this.goals.length && this.goals[0].goalName) || '';
    },
    // 资格门槛条目（展平 gates）
    gateEntries() {
      const list = [];
      ((this.structure && this.structure.gates) || []).forEach(group => {
        (group.entries || []).forEach(entry => list.push(entry));
      });
      return list;
    },
    // 评分项条目（展平 scoreItems）
    scoreEntries() {
      const list = [];
      ((this.structure && this.structure.scoreItems) || []).forEach(group => {
        (group.entries || []).forEach(entry => list.push(entry));
      });
      return list;
    },
    // 门槛判定计数：优先取结构 sumStat.gateStat，缺省按条目 judge 统计
    gateStat() {
      const stat = this.structure && this.structure.sumStat && this.structure.sumStat.gateStat;
      if (stat) return stat;
      return {
        ok: this.gateEntries.filter(entry => entry.judge === 'pass').length,
        wait: this.gateEntries.filter(entry => entry.judge === 'pending').length,
        no: this.gateEntries.filter(entry => entry.judge === 'fail').length
      };
    },
    // 门槛条数：优先取结构汇总计数 gateTotal
    gateTotal() {
      const count = this.structure && this.structure.gateTotal;
      return count != null ? count : this.gateEntries.length;
    },
    // 评分项缺口：按分差从大到小（未拿满即缺口）
    gapRows() {
      return this.scoreEntries
        .filter(entry => entry.score != null && entry.fullScore != null && entry.score < entry.fullScore)
        .map(entry => ({ ...entry, lack: entry.fullScore - entry.score }))
        .sort((a, b) => b.lack - a.lack);
    },
    // 缺口合计可补分
    gapSum() {
      return this.gapRows.reduce((sum, row) => sum + row.lack, 0);
    },
    // 分析结论文案（1已达成 2具备申报资格 3待确认 4暂不具备）
    conclusionText() {
      return PORTRAIT_CONCLUSION_TEXT[Number(this.structure.conclusion)] || PORTRAIT_CONCLUSION_TEXT[3];
    },
    // 导语标题：距目标「XX」：具备申报资格
    leadTitle() {
      return '距目标「' + (this.goalName || '—') + '」：' + this.conclusionText;
    },
    // 导语正文：优先用 AI 小结，缺失时按门槛与材料分计数生成
    leadText() {
      const summary = (this.structure && this.structure.summary) || '';
      if (summary) return summary;
      const stat = this.gateStat;
      const total = this.structure.scoreTotal;
      const full = this.structure.scoreFull;
      const scoreText = total != null && full != null ? '材料分 ' + total + ' / ' + full : '本次分析未产出材料分';
      return '资格门槛 ' + this.gateTotal + ' 条：符合 ' + (stat.ok || 0) + ' 条、待确认 ' + (stat.wait || 0) + ' 条、不符合 ' + (stat.no || 0) + ' 条；' + scoreText + '，' + this.gapRows.length + ' 项评分缺口合计 ' + this.gapSum + ' 分。';
    },
    // 达标项：已符合的资格门槛 + 已拿满的评分项
    okItems() {
      const items = [];
      if (Number(this.structure.conclusion) === 1) {
        items.push('本次分析结论为该目标已达成，' + this.gateTotal + ' 条资格门槛均已满足');
      }
      this.gateEntries
        .filter(entry => entry.judge === 'pass')
        .forEach(entry => items.push(entry.checkItem + '：' + (entry.teacherValue || PORTRAIT_GATE_JUDGE_TEXT.pass)));
      this.scoreEntries
        .filter(entry => entry.score != null && entry.fullScore != null && entry.score >= entry.fullScore)
        .forEach(entry => items.push(entry.itemName + '：已拿满 ' + entry.fullScore + ' 分'));
      const limit = items.slice(0, this.cfg.okLimit);
      return limit.length ? limit : [this.cfg.noOkText];
    },
    // 缺口项：不符合/待确认的资格门槛 + 未拿满的评分项
    gapItems() {
      const items = [];
      this.gateEntries
        .filter(entry => entry.judge === 'fail' || entry.judge === 'pending')
        .forEach(entry => {
          const judgeText = PORTRAIT_GATE_JUDGE_TEXT[entry.judge] || PORTRAIT_GATE_JUDGE_TEXT.pending;
          items.push(entry.checkItem + '（' + judgeText + '）：' + (entry.fixSuggestion || entry.requirement || '待补齐'));
        });
      this.gapRows.forEach(row => items.push(row.itemName + ' 差 ' + row.lack + ' 分：' + (row.suggestion || PORTRAIT_GAP_FALLBACK)));
      const limit = items.slice(0, this.cfg.gapLimit);
      return limit.length ? limit : [this.cfg.noGapText];
    },
    // 补齐路径（结构 fixPath，兼容字符串 / 对象数组）
    fixList() {
      const fixPath = (this.structure && this.structure.fixPath) || [];
      if (!Array.isArray(fixPath)) return [];
      return fixPath
        .map(item => (typeof item === 'string' ? item : ((item && (item.text || item.content)) || '')))
        .filter(Boolean);
    },
    // 路线正文：补齐路径按顺序拼接，缺失时给兜底说明
    mainText() {
      return this.fixList.length ? this.fixList.join('；') : this.cfg.noFixText;
    }
  },
  methods: {
    // 空态入口：跳「成长愿景」设置目标或发起分析
    goVision(path) {
      this.$router.push(path || '/growth/vision');
    }
  }
};
</script>
