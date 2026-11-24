<template>
  <section id="sec-goal">
    <!-- 已设置愿景且有分析结果：目标锚点卡（门槛与材料分结论 + 待补缺口计数 + 关键缺口 + 补齐步骤） -->
    <div v-if="hasAnalysis" class="goal-card">
      <div class="goal-top">
        <div class="goal-ico"><i data-lucide="target"></i></div>
        <div class="goal-txt">
          <h2>
            <span>{{ visionTitle }}</span>
            <span v-if="standardClause" class="gtag">{{ standardClause }}</span>
          </h2>
          <p>{{ cfg.introPrefix }}<b v-for="(step, idx) in cfg.introSteps" :key="step">{{ step }}<template v-if="idx < cfg.introSteps.length - 1"> → </template></b>{{ gateClause }}<b>{{ scoreClause }}</b></p>
        </div>
        <div class="goal-score">
          <div class="n">{{ gapCount }}</div>
          <div class="l">{{ cfg.gapCountLabel }}</div>
        </div>
      </div>
      <template v-if="gaps.length">
        <div class="gap-hd" style="margin-top:15px">
          <i data-lucide="alert-circle"></i>{{ gapTitle }}
        </div>
        <div class="goal-gaps">
          <div v-for="(item, idx) in gaps" :key="'gap-' + idx" class="gap-card">
            <div class="gh"><i :data-lucide="item.icon"></i>{{ item.impact }}</div>
            <h4>{{ item.name }}<span class="lv" :class="item.level">{{ item.levelText }}</span></h4>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </template>
      <div v-if="nextSteps.length" class="gap-next">
        <div v-for="(item, idx) in nextSteps" :key="'step-' + idx" class="gn-item">
          <div class="gn-t">{{ item.period }}</div>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 未设置愿景：整卡替换为设置引导 -->
    <div v-else-if="!hasGoal" class="goal-empty">
      <div class="ge-ico"><i data-lucide="target"></i></div>
      <h3>{{ goalEmpty.title }}</h3>
      <p>{{ goalEmpty.desc }}</p>
      <a class="ge-btn" @click="goVision(goalEmpty.visionPath)"><i data-lucide="plus"></i>{{ goalEmpty.cta }}</a>
    </div>

    <!-- 已设置愿景但还没有成功分析结果：引导去成长愿景页发起分析 -->
    <div v-else class="goal-empty">
      <div class="ge-ico"><i data-lucide="target"></i></div>
      <h3>{{ analysisEmpty.title }}</h3>
      <p>{{ analysisEmpty.desc }}</p>
      <a class="ge-btn" @click="goVision(analysisEmpty.visionPath)"><i data-lucide="arrow-right"></i>{{ analysisEmpty.cta }}</a>
    </div>
  </section>
</template>

<script>
import { GAP } from '@/constants/qualification';
import {
  PORTRAIT_GOAL_ANCHOR,
  PORTRAIT_GOAL_EMPTY,
  PORTRAIT_ANALYSIS_EMPTY,
  PORTRAIT_GAP_FALLBACK
} from '@/constants/growth-portrait';

export default {
  name: 'PortraitGoalAnchor',
  props: {
    /* 我的愿景列表（AiVisionTeacherGoal 数组，来源 /visionTeacherGoal/myList） */
    goals: { type: Array, default: () => [] },
    /* 最近成功分析结果结构（来源 8.7 analysisStructure）：缺口计数、关键缺口与补齐步骤的唯一数据源 */
    structure: { type: Object, default: null }
  },
  data() {
    return {
      cfg: PORTRAIT_GOAL_ANCHOR,
      goalEmpty: PORTRAIT_GOAL_EMPTY,
      analysisEmpty: PORTRAIT_ANALYSIS_EMPTY
    };
  },
  computed: {
    // 是否已设置成长愿景
    hasGoal() {
      return this.goals.length > 0;
    },
    // 有分析结构才渲染锚点卡，否则走空态分支
    hasAnalysis() {
      return this.hasGoal && !!this.structure;
    },
    // 首项目标：标题与标准口径取它
    firstGoal() {
      return this.goals.length ? this.goals[0] : null;
    },
    // 标题：对照你的愿景：一级教师 等 2 项
    visionTitle() {
      if (!this.firstGoal) return '';
      const suffix = this.goals.length > 1 ? ' 等 ' + this.goals.length + ' 项' : '';
      return '对照你的愿景：' + (this.firstGoal.goalName || '—') + suffix;
    },
    // 标准口径标注：愿景所选的评比标准名
    standardClause() {
      const name = this.firstGoal && this.firstGoal.standardName;
      return name ? '标准口径「' + name + '」' : '';
    },
    // 资格门槛条目（展平 gates，组名回填到条目便于展示）
    gateEntries() {
      const list = [];
      ((this.structure && this.structure.gates) || []).forEach(group => {
        (group.entries || []).forEach(entry => list.push({ ...entry, groupName: entry.groupName || group.group }));
      });
      return list;
    },
    // 评分项条目（展平 scoreItems，分类名回填到条目便于缺口卡展示）
    scoreEntries() {
      const list = [];
      ((this.structure && this.structure.scoreItems) || []).forEach(group => {
        (group.entries || []).forEach(entry => list.push({ ...entry, categoryName: entry.categoryName || group.category }));
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
    // 待补缺口总数：门槛不符合 + 门槛待确认 + 评分项缺口
    gapCount() {
      return (this.gateStat.no || 0) + (this.gateStat.wait || 0) + this.gapRows.length;
    },
    // 基本条件结论（资格门槛口径）
    gateClause() {
      const stat = this.gateStat;
      return '资格门槛 ' + this.gateTotal + ' 条：符合 ' + (stat.ok || 0) + ' 条、待确认 ' + (stat.wait || 0) + ' 条、不符合 ' + (stat.no || 0) + ' 条；';
    },
    // 业绩条件结论（材料分口径）
    scoreClause() {
      if (Number(this.structure.conclusion) === 1) return '本次分析结论为该目标已达成，无需再补评分缺口。';
      const total = this.structure.scoreTotal;
      const full = this.structure.scoreFull;
      const head = total != null && full != null ? '材料分 ' + total + ' / ' + full : '本次分析未产出材料分';
      return this.gapRows.length
        ? head + '，尚有 ' + this.gapRows.length + ' 项缺口、合计 ' + this.gapSum + ' 分可补。'
        : head + '，各评分项均已达标。';
    },
    // 关键缺口标题：按实际缺口条数生成
    gapTitle() {
      return '关键缺口 · 影响目标达成的前 ' + this.gaps.length + ' 项';
    },
    // 关键缺口卡：取缺口分差最大的前 N 项评分项
    gaps() {
      const icons = this.cfg.gapIcons;
      return this.gapRows.slice(0, this.cfg.gapLimit).map((row, idx) => ({
        icon: icons[idx % icons.length],
        impact: [row.categoryName, GAP[row.gapType]].filter(Boolean).join(' · ') || '评分缺口',
        name: row.itemName || '未命名评分项',
        level: row.lack >= 3 ? 'hi' : 'mid',
        levelText: '差 ' + row.lack + ' 分',
        desc: row.suggestion || row.actionTip || row.plainRule || PORTRAIT_GAP_FALLBACK
      }));
    },
    // 补齐步骤：优先取结构 fixPath，缺省按门槛补齐建议生成
    nextSteps() {
      const fixPath = (this.structure && this.structure.fixPath) || [];
      const steps = Array.isArray(fixPath)
        ? fixPath.map(item => (typeof item === 'string' ? item : ((item && (item.text || item.content)) || ''))).filter(Boolean)
        : [];
      if (steps.length) return steps.map((desc, idx) => ({ period: '第 ' + (idx + 1) + ' 步', desc }));
      return this.gateEntries
        .filter(entry => entry.judge !== 'pass' && entry.fixSuggestion)
        .map((entry, idx) => ({ period: '门槛 ' + (idx + 1), desc: entry.checkItem + '：' + entry.fixSuggestion }));
    }
  },
  methods: {
    // 空态入口：跳「成长愿景」维护目标或发起分析
    goVision(path) {
      this.$router.push(path || '/growth/vision');
    }
  }
};
</script>
