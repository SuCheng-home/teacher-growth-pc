<template>
  <!-- 综合分析：命中人数与开启综合分析的绑定指标汇总（占比/平均值/最大值）+ 各绑定指标结构分布 -->
  <div>
    <section v-if="!hasData" class="card">
      <div class="empty-tip">当前条件下没有命中的教师，请到上方放宽筛选条件后重试。</div>
    </section>
    <template v-else>
      <section class="card">
        <div class="stat-row">
          <div class="stat">
            <div class="k"><i data-lucide="users"></i>命中教师</div>
            <div class="v">{{ peerNum }}<small> 人</small></div>
            <div class="d">{{ schoolTotal ? `占全校 ${schoolTotal} 人的 ${pctOf(peerNum)}%` : '全校教师总数待统计' }}</div>
          </div>
          <div v-for="(item, i) in summary" :key="'sum-' + i" class="stat">
            <div class="k">
              <img v-if="item.icon" class="sum-ico" :src="item.icon" alt="">
              <i v-else :data-lucide="typeIcon(item.comprehensiveType)"></i>
              {{ item.name }}
            </div>
            <div class="v">{{ valueMain(item) }}<small v-if="valueUnit(item)">{{ valueUnit(item) }}</small></div>
            <div class="d">{{ descText(item) }}</div>
          </div>
        </div>
        <div v-if="!summary.length" class="empty-tip">未查询到开启综合分析的绑定指标，请先到「同辈对标设置 · 全校同辈对标」开启综合分析。</div>
        <div class="note"><i data-lucide="info"></i><span>口径：命中组由上方「选择同辈组合」圈定；汇总统计仅覆盖开启综合分析的绑定指标，全校总数排除后勤人员、仅在岗。</span></div>
      </section>

      <div class="duo">
        <section v-for="(item, si) in structureCards" :key="'st-' + si" class="card">
          <div class="card-head">
            <h2>
              <img v-if="item.icon" class="sum-ico" :src="item.icon" alt="">
              <i v-else data-lucide="chart-no-axes-combined"></i>{{ item.name }}
            </h2>
            <span class="side">{{ item.totalNum }} 人</span>
          </div>
          <team-bar-list v-if="item.entries.length" :entries="item.entries" />
          <div v-else class="empty-tip">暂无分布数据。</div>
          <div v-if="item.seg" class="note"><i data-lucide="info"></i><span>区段统计：按绑定配置的开始值与步长连续分段（含 0 人区段），仅统计落在配置范围内的数值。</span></div>
        </section>
      </div>
    </template>
  </div>
</template>

<script>
import { num, isSegStructure, structureEntries } from '../analysis-helper';
import TeamBarList from './team-bar-list.vue';

// 综合分析方式：1=占比，2=平均值，3=最大值
const COMPREHENSIVE_TYPE = {
  RATIO: 1,
  AVERAGE: 2,
  MAX: 3
};
// 未配置图标时按统计方式兜底的 lucide 图标
const TYPE_ICON = {
  [COMPREHENSIVE_TYPE.RATIO]: 'percent',
  [COMPREHENSIVE_TYPE.AVERAGE]: 'calculator',
  [COMPREHENSIVE_TYPE.MAX]: 'trending-up'
};
// 无有效样本时接口返回 null，界面统一占位
const PLACEHOLDER = '—';

export default {
  name: 'TeamOverviewPanel',
  components: {
    TeamBarList
  },
  props: {
    // 综合分析统计（statData.summary）
    summary: { type: Array, default: () => [] },
    // 结构分布（statData.structure）
    structure: { type: Array, default: () => [] },
    // 命中教师数
    peerNum: { type: Number, default: 0 },
    // 全校教师总数（排除后勤、仅在岗）
    schoolTotal: { type: Number, default: 0 }
  },
  computed: {
    hasData() {
      return this.peerNum > 0;
    },
    // 结构分布卡片数据：接口区段条目按升序输出、普通分布按人数倒序，条形宽度统一按本组最大值归一
    structureCards() {
      return this.structure.map((item) => ({
        name: item.name,
        icon: item.icon,
        totalNum: item.totalNum,
        seg: isSegStructure(item),
        entries: structureEntries(item)
      }));
    }
  },
  methods: {
    pctOf(n) {
      if (!this.schoolTotal) return '0.0';
      return (n / this.schoolTotal * 100).toFixed(1);
    },
    typeOf(item) {
      return num(item.comprehensiveType);
    },
    typeIcon(comprehensiveType) {
      return TYPE_ICON[num(comprehensiveType)] || 'sparkles';
    },
    valueMain(item) {
      if (item.value === null || item.value === undefined) return PLACEHOLDER;
      return String(item.value);
    },
    valueUnit(item) {
      return this.typeOf(item) === COMPREHENSIVE_TYPE.RATIO ? ' %' : '';
    },
    descText(item) {
      const type = this.typeOf(item);
      if (type === COMPREHENSIVE_TYPE.RATIO) {
        return `${num(item.matchNum)} 人 / ${num(item.totalNum)} 人`;
      }
      if (type === COMPREHENSIVE_TYPE.MAX) {
        return `最大值 · 有效样本 ${num(item.validNum)} 人`;
      }
      return `平均值 · 有效样本 ${num(item.validNum)} 人`;
    }
  }
};
</script>

<style scoped>
/* 指标自带 logo：与同位置 lucide 图标等尺寸，避免撑高统计卡与卡头 */
.sum-ico{width:14px;height:14px;border-radius:3px;object-fit:contain}
.card-head .sum-ico{width:16px;height:16px}
</style>
