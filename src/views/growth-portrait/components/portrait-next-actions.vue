<template>
  <!-- ⑤ 下一步动作：可执行入口卡，卡片正文按最近成功分析结果生成，点击跳转对应业务页 -->
  <section v-show="enabled" id="sec-use">
    <div class="card">
      <div class="sec-eyebrow">{{ cfg.eyebrow }}</div>
      <h2 class="sec-h"><i :data-lucide="cfg.icon"></i>{{ cfg.title }}</h2>
      <div class="sec-sub">{{ cfg.sub }}</div>

      <div v-if="!hasGoal" class="goal-empty">
        <!-- 未设置愿景：引导去设置 -->
        <div class="ge-ico"><i data-lucide="route"></i></div>
        <h3>{{ goalEmpty.title }}</h3>
        <p>{{ goalEmpty.desc }}</p>
        <a class="ge-btn" @click="go(goalEmpty.visionPath)"><i data-lucide="plus"></i>{{ goalEmpty.cta }}</a>
      </div>
      <div v-else-if="!structure" class="goal-empty">
        <!-- 已设置愿景但还没有成功分析结果 -->
        <div class="ge-ico"><i data-lucide="route"></i></div>
        <h3>{{ analysisEmpty.title }}</h3>
        <p>{{ analysisEmpty.desc }}</p>
        <a class="ge-btn" @click="go(analysisEmpty.visionPath)"><i data-lucide="arrow-right"></i>{{ analysisEmpty.cta }}</a>
      </div>

      <div v-else class="use-grid" style="margin-top:12px">
        <div v-for="card in cards" :key="card.key" class="use-card">
          <div class="uh">
            <div class="ico"><i :data-lucide="card.icon"></i></div>
            <h4>{{ card.title }}</h4>
          </div>
          <p><template v-for="(seg, idx) in parseSegs(card.text)"><b v-if="seg.bold" :key="idx">{{ seg.text }}</b><span v-else :key="idx + '1'">{{ seg.text }}</span></template></p>
          <a class="go" @click="go(card.path)">{{ card.cta }}<i data-lucide="arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  PORTRAIT_NEXT_ACTIONS,
  PORTRAIT_GOAL_EMPTY,
  PORTRAIT_ANALYSIS_EMPTY,
  parseRichSegments
} from '@/constants/growth-portrait';

export default {
  name: 'PortraitNextActions',
  props: {
    /* 段落是否显示（父组件按 frame.sections.use 传入） */
    enabled: { type: Boolean, default: true },
    /* 我的愿景列表（AiVisionTeacherGoal 数组），用于标题取目标名与未设置愿景的空态 */
    goals: { type: Array, default: () => [] },
    /* 最近成功分析结果结构（来源 8.7 analysisStructure）：卡片正文的唯一数据源 */
    structure: { type: Object, default: null }
  },
  data() {
    return {
      cfg: PORTRAIT_NEXT_ACTIONS,
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
    // 补齐路径（结构 fixPath，兼容字符串 / 对象数组）
    fixList() {
      const fixPath = (this.structure && this.structure.fixPath) || [];
      if (!Array.isArray(fixPath)) return [];
      return fixPath
        .map(item => (typeof item === 'string' ? item : ((item && (item.text || item.content)) || '')))
        .filter(Boolean);
    },
    // 入口卡：正文按 key 由分析结果生成，标题 / 入口文案 / 路由仍取自常量
    cards() {
      return this.cfg.cards.map(card => ({ ...card, text: this.textOf(card.key) }));
    }
  },
  methods: {
    // 卡片正文的 **粗体** 分段
    parseSegs(text) {
      return parseRichSegments(text);
    },
    // 按卡片类型生成正文：资格门槛概况 / 缺口排序 / 待办清单 / 同辈对照
    textOf(key) {
      if (key === 'gate') return this.gateText();
      if (key === 'gap') return this.gapText();
      if (key === 'todo') return this.todoText();
      return this.cfg.peerText;
    },
    // 资格门槛概况
    gateText() {
      const stat = this.gateStat;
      return '本次对照「' + (this.goalName || '我的愿景') + '」的资格门槛共 ' + this.gateTotal + ' 条：**符合 ' + (stat.ok || 0) + ' 条、待确认 ' + (stat.wait || 0) + ' 条、不符合 ' + (stat.no || 0) + ' 条**，另有 ' + this.scoreEntries.length + ' 个材料评分项。';
    },
    // 缺口排序：优先展示分差最大的评分项
    gapText() {
      const total = this.structure.scoreTotal;
      const full = this.structure.scoreFull;
      const scoreText = total != null && full != null ? '材料分 **' + total + ' / ' + full + '**，' : '';
      if (!this.gapRows.length) return scoreText + '各评分项均已达标，**当前没有分值缺口**，保持现有节奏即可。';
      const top = this.gapRows[0];
      return scoreText + '**' + this.gapRows.length + ' 项缺口合计 ' + this.gapSum + ' 分**可补；优先补「' + top.itemName + '」（差 ' + top.lack + ' 分）。';
    },
    // 待办清单：取补齐路径前两项作为顺序提示
    todoText() {
      if (!this.fixList.length) return '本次分析未给出需本人办理的事项，其余各项由系统读取档案自动计分。';
      const head = this.fixList.slice(0, 2).join(' → ');
      const more = this.fixList.length > 2 ? ' 等 **' + this.fixList.length + ' 项**' : '';
      return '补齐路径共 **' + this.fixList.length + ' 项**：' + head + more + '，按顺序办理即可。';
    },
    // 入口跳转：跳到本项目已迁移的对应页面
    go(path) {
      this.$router.push(path || '/growth/vision');
    }
  }
};
</script>
