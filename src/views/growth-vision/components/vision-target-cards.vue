<template>
  <section class="card">
    <div class="card-head">
      <h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>我的发展愿景
      </h2>
      <button class="add-goal" type="button" @click="$emit('add-goal')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>添加我的成长愿景
      </button>
    </div>
    <div class="target-row" id="targets">
      <!-- 我的愿景卡片列表（来源：/visionTeacherGoal/myList） -->
      <div
        v-for="(item, idx) in goals"
        :key="item.id || idx"
        class="target"
        :class="{ on: item.id === cur }"
      >
        <div class="t-more">
          <button
            class="t-more-btn"
            type="button"
            aria-label="更多操作"
            :class="{ on: openMenuIdx === idx }"
            @click.stop="toggleMenu(idx)"
          >⋯</button>
          <div v-show="openMenuIdx === idx" class="t-more-menu">
            <button type="button" @click.stop="handleDelete(item)">删除</button>
          </div>
        </div>
        <button class="target-main" type="button" @click="$emit('select', item)">
          <b>{{ item.goalName }}</b>
          <small>{{ subtitleOf(item) }}</small>
          <span class="state" :class="stateOf(item).cls"><i></i>{{ stateOf(item).text }}</span>
        </button>
        <div class="t-foot">
          <span class="t-time" :title="'上次评估时间：' + timeOf(item)"><span v-html="iconClock"></span><i>评估于 {{ shortTime(timeOf(item)) }}</i></span>
          <button class="t-act primary" type="button" @click="$emit('refresh-target', item)">重新评估</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ICON_CLOCK } from '@/constants/qualification';

/* 分析状态枚举 → 卡片角标（样式类 + 文案），对应 myList.analysisStatus */
const ANALYSIS_STATUS = {
  1: { cls: 'wait', text: '待分析' },
  2: { cls: 'wait', text: '分析中' },
  3: { cls: 'ok', text: '已完成' },
  4: { cls: 'no', text: '分析失败' }
};

export default {
  name: 'VisionTargetCards',
  props: {
    /* 我的愿景列表（AiVisionTeacherGoal 数组） */
    goals: { type: Array, default: () => [] },
    /* 当前选中记录的 id */
    cur: { type: String, default: '' }
  },
  data() {
    return {
      iconClock: ICON_CLOCK,
      /* 当前展开三点菜单的卡片索引（同时只开一个） */
      openMenuIdx: -1
    };
  },
  mounted() {
    /* 点击空白处收起三点菜单 */
    document.addEventListener('click', this.closeMenu);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
  },
  methods: {
    toggleMenu(idx) {
      this.openMenuIdx = this.openMenuIdx === idx ? -1 : idx;
    },
    closeMenu() {
      this.openMenuIdx = -1;
    },
    handleDelete(item) {
      this.closeMenu();
      this.$emit('delete', item);
    },
    /* 副标题：分类 · 所选评比标准口径 */
    subtitleOf(item) {
      return [item.categoryName, item.standardName].filter(Boolean).join(' · ');
    },
    /* 评估时点：优先最近分析完成时间，其次档案拉取时点 */
    timeOf(item) {
      return item.lastAnalysisTime || item.pullTime || '';
    },
    shortTime(t) {
      return String(t || '').slice(5, 16);
    },
    stateOf(item) {
      return ANALYSIS_STATUS[item.analysisStatus] || { cls: 'wait', text: '' };
    }
  }
};
</script>
