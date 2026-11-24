<template>
  <!-- 画像总览（球员卡）：综合发展指数 + 荣誉徽章 + 六维属性条，优先用接口六维统计渲染，无数据时回落设计稿静态演示数值 -->
  <section id="sec-card">
    <div class="player-card">
      <div class="pc-top">
        <div class="pc-avatar">{{ nameInitial }}<span>{{ profile.subject }}</span></div>
        <div class="pc-id">
          <h2>{{ teacherName }} <!-- <span class="pos">{{ profile.subjectLabel }}</span> --></h2>
          <!-- <div class="meta">{{ schoolLine }}</div> -->
        </div>
        <div class="pc-ovr">
          <div class="n">{{ overallIndex }}</div>
          <div class="l">{{ card.overallLabel }}</div>
          <!-- <div class="tag">{{ card.typeTag }}</div> -->
        </div>
      </div>
      <!-- <div class="pc-badges">
        <span v-for="item in card.badges" :key="item.icon + item.text" class="badge">
          <i :data-lucide="item.icon"></i>{{ item.text }}
        </span>
      </div> -->
      <div class="pc-attrs">
        <div v-for="item in attrs" :key="item.name" class="attr">
          <span class="an">{{ item.name }}</span>
          <div class="ab"><i :class="'v-' + tierOf(item.score)" :style="{ width: item.score + '%' }"></i></div>
          <span class="av">{{ item.score }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { PORTRAIT_PLAYER_CARD, PORTRAIT_TEACHER_PROFILE, scoreTier } from '@/constants/growth-portrait';

export default {
  name: 'PortraitPlayerCard',
  props: {
    /* 教师姓名（取自鉴权 store，姓氏用于球员卡头像） */
    teacherName: { type: String, default: '' },
    /* 六维统计（getDimensionStat 的 data）：{ dimensions:[{ dimensionTitle, score, topScore }], totalScore, totalTopScore } */
    dimStat: { type: Object, default: null }
  },
  data() {
    return {
      card: PORTRAIT_PLAYER_CARD,
      profile: PORTRAIT_TEACHER_PROFILE
    };
  },
  computed: {
    // 六维属性条：接口维度名取 dimensionTitle，得分按 score/topScore 归一为百分比；无接口数据回落静态演示值
    attrs() {
      const dimensions = (this.dimStat && this.dimStat.dimensions) || [];
      if (!dimensions.length) return this.card.attrs;
      return dimensions.map(item => ({
        name: item.dimensionTitle,
        score: this.normalizeScore(item.score, item.topScore)
      }));
    },
    // 综合发展指数：总分/总分母归一后取整；无接口数据回落静态演示值
    overallIndex() {
      if (!this.dimStat || !this.dimStat.dimensions) return this.card.overallIndex;
      const { totalScore, totalTopScore } = this.dimStat;
      return totalTopScore ? this.normalizeScore(totalScore, totalTopScore) : 0;
    },
    // 头像取姓名首字（中文姓）
    nameInitial() {
      return this.teacherName ? this.teacherName.charAt(0) : '—';
    },
    // meta 行：学校 · 发展阶段 · 教龄 · 职称
    schoolLine() {
      const { school, stage, teachYears, title } = this.profile;
      return school + ' · ' + stage + ' · 教龄 ' + teachYears + ' 年 · ' + title;
    }
  },
  methods: {
    // 得分归一：score/topScore 换算为 0~100 整数百分比（分母无效时归 0）
    normalizeScore(score, topScore) {
      const value = Number(score) || 0;
      const top = Number(topScore) || 0;
      return top > 0 ? Math.round((value / top) * 100) : 0;
    },
    // 分数档位 → 进度条配色类名（v-elite / v-good / v-mid / v-low）
    tierOf(score) {
      return scoreTier(score);
    }
  }
};
</script>
