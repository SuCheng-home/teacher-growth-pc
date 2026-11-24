<template>
  <div class="rl">
    <div class="rl-hd">
      <span class="no">{{ index + 1 }}</span>
      <span class="nm">{{ title }}</span>
      <span class="rt">
        <span v-if="type === 'gate' && judge" class="src-chip" :class="judgeCls">{{ judge | judgeFilter }}</span>
        <span v-if="type === 'score'" class="num" style="font-size:11.5px;color:var(--muted)">满分 {{ entry.fullScore != null ? entry.fullScore : '—' }}</span>
      </span>
    </div>
    <div class="rl-bd">
      <!-- 资格门槛字段 -->
      <template v-if="type === 'gate'">
        <div v-if="entry.requirement" class="rl-row">
          <span class="k p">标准要求</span>
          <span>{{ entry.requirement }}</span>
        </div>
        <div v-if="entry.standardBasis" class="rl-row">
          <span class="k o">标准原文</span>
          <span>{{ entry.standardBasis }}</span>
        </div>
        <div v-if="entry.teacherValue" class="rl-row">
          <span class="k a">教师实际</span>
          <span>{{ entry.teacherValue }}</span>
        </div>
        <div v-if="entry.archiveBasis" class="rl-row">
          <span class="k a">档案依据</span>
          <span>{{ entry.archiveBasis }}</span>
        </div>
        <div v-if="entry.fixSuggestion" class="rl-row">
          <span class="k h">补齐建议</span>
          <span>{{ entry.fixSuggestion }}</span>
        </div>
      </template>

      <!-- 材料评分项字段 -->
      <template v-else>
        <div v-if="entry.scoreRule" class="rl-row">
          <span class="k p">计分规则</span>
          <span>{{ entry.scoreRule }}</span>
        </div>
        <div v-if="entry.howToScore" class="rl-row">
          <span class="k o">如何计分</span>
          <span>{{ entry.howToScore }}</span>
        </div>
        <div v-if="standardTextList.length" class="rl-row">
          <span class="k o">标准原文</span>
          <span>
            <div v-for="(st, si) in standardTextList" :key="si" class="rl-row__sub">
              <b v-if="st.itemKey">{{ st.itemKey }}：</b>{{ st.text }}
            </div>
          </span>
        </div>
        <div v-if="entry.plainRule" class="rl-row">
          <span class="k a">通俗解读</span>
          <span>{{ entry.plainRule }}</span>
        </div>
        <div v-if="entry.dataSource" class="rl-row">
          <span class="k a">数据来源</span>
          <span>{{ entry.dataSource | dataSourceFilter }}{{ entry.dataSourceFrom ? '（' + entry.dataSourceFrom + '）' : '' }}</span>
        </div>
        <div v-if="entry.teacherAction" class="rl-row">
          <span class="k h">教师行动</span>
          <span><b>{{ entry.teacherAction | actionTypeFilter }}</b>{{ entry.actionTip ? '：' + entry.actionTip : '' }}</span>
        </div>
        <div v-if="entry.suggestion" class="rl-row">
          <span class="k h">差距建议</span>
          <span>{{ entry.suggestion }}</span>
        </div>
        <!-- 本次得分 -->
        <div class="rl-row">
          <span class="k h">本次得分</span>
          <span>
            <b v-if="entry.score != null">{{ entry.score }} 分</b>
            <template v-else>—</template>
            <template v-if="entry.gapType">（{{ entry.gapType | gapTypeFilter }}）</template>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
/* 规则条目卡：按 type 区分渲染 gate（资格门槛）或 score（材料评分项）条目 */
const JUDGE_CHIP_MAP = {
  'pass': 'auto',
  'fail': 'tbd',
  'pending': 'pick'
};

export default {
  name: 'RuleItem',
  filters: {
    judgeFilter(judge) {
      const map = {
        pass: '符合',
        pending: '待确认',
        fail: '不符合'
      }
      return map[judge] || '';
    },
    actionTypeFilter(val) {
      // confirm确认归类 pick勾选档案记录 fill补录材料 none无需办理 / 动作提示
      const map = {
        confirm: '确认归类',
        pick: '勾选档案记录',
        fill: '补录材料',
        none: '无需办理'
      };
      return map[val] || '';
    },
    gapTypeFilter(val) {
      // done已达标 num数量不足 level级别不足 miss缺失材料 quality学校提供 window时间窗 tbd待确认
      const map = {
        'done': '已达标',
        'num': '数量不足',
        'level': '级别不足',
        'miss': '缺失材料',
        'quality': '学校提供',
        'window': '时间窗',
        'tbd': '待确认'
      };
      return map[val] || '';
    },
    dataSourceFilter(val) {
      // auto自动取数 auto2自动归类需确认 pick从档案选取 fill需补录 school学校提供 sum合计行 tbd待定
      const map = {
        auto: '自动取数',
        auto2: '自动归类需确认',
        pick: '从档案选取',
        fill: '需补录',
        school: '学校提供',
        teacher: '教师提供',
        self: '自评',
        sum: '合计行',
        tbd: '待定'
      };
      return map[val] || '';
    }
  },
  props: {
    // 'gate' | 'score'
    type: { type: String, required: true },
    entry: { type: Object, required: true },
    index: { type: Number, default: 0 }
  },
  computed: {
    title() {
      return this.type === 'gate' ? this.entry.checkItem : this.entry.itemName;
    },
    judge() {
      return this.entry.judge || '';
    },
    judgeCls() {
      return JUDGE_CHIP_MAP[this.judge] || 'tbd';
    },
    standardTextList() {
      return Array.isArray(this.entry.standardText) ? this.entry.standardText : [];
    }
  }
};
</script>

<style scoped>
.rl-row__sub {
  line-height: 1.7;
}
</style>
