<template>
  <!-- 同辈对标容器：档案获取与勾选交互下沉到条件卡，本页仅编排分析结果展示 -->
  <div>
    <!-- 页面抬头 -->
    <section class="page-heading">
      <div>
        <div class="eyebrow">PEER BENCHMARK · 同辈对标</div>
        <h1>同辈对标<span>识别同辈条件，定位我在同辈中的位置</span></h1>
      </div>
    </section>

    <!-- 我的同辈条件 + 选择同辈组合：勾选交互下沉卡片内部，容器监听条件变化发起分析、监听最近记录直接回显 -->
    <peer-condition-card ref="peerConditionCard"
      @condition-change="handleConditionChange"
      @latest-record="handleLatestRecord" />

    <!-- 分析结果区：综合分析 + 标杆/AI 双栏，分析进行中由包裹层统一 loading 遮罩 -->
    <div v-loading="analyzing" :element-loading-text="loadingText">
      <!-- 综合分析：综合分位 + 六维雷达 + 强弱项，三模块各自独立、可被模拟测试单独引用 -->
      <section class="card">
        <div class="card-head">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>
            综合分析
          </h2>
          <span class="side">综合分位 · 六维雷达 · 强弱项</span>
        </div>
        <div class="bench-grid">
          <peer-rank-module :result="peerResult" />
          <peer-radar-module :result="peerResult" />
          <peer-strength-module :result="peerResult" />
        </div>
        <div class="privacy-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>
          对比全程匿名：不显示他人姓名、分项得分与档案原文，仅输出分位区间与强弱项
        </div>
        <!-- <div class="ai-cta">
          <div class="ai-cta-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg></div>
          <div class="ai-cta-text"><b>是否需要多问更多的数据？</b><span>想了解某项指标的依据、或对比更多维度，可让 AI 继续为你分析。</span></div>
          <button class="ai-cta-btn" @click="handleAskMore">AI 更多分析</button>
        </div> -->
      </section>

      <!-- 组内标杆参考 + 同辈 AI 分析：两模块各自独立、可被模拟测试单独引用 -->
      <div class="duo">
        <peer-benchmark-module :result="peerResult" />
        <peer-ai-summary-module :result="peerResult" />
      </div>
    </div>
  </div>
</template>

<script>
import { getPeerCompareDataForTh } from '@/api/peer-setting';
import { MIN_GROUP_SAMPLE_SIZE } from '@/constants/growth-peer';
import PeerConditionCard from './components/peer-condition-card.vue';
import PeerRankModule from './components/peer-rank-module.vue';
import PeerRadarModule from './components/peer-radar-module.vue';
import PeerStrengthModule from './components/peer-strength-module.vue';
import PeerBenchmarkModule from './components/peer-benchmark-module.vue';
import PeerAiSummaryModule from './components/peer-ai-summary-module.vue';

// 条件变化防抖间隔（毫秒）：合并短时间内的多次勾选变化，避免抖动式重复请求
const PEER_ANALYSIS_DEBOUNCE = 400;

export default {
  name: 'GrowthPeer',
  components: {
    PeerConditionCard,
    PeerRankModule,
    PeerRadarModule,
    PeerStrengthModule,
    PeerBenchmarkModule,
    PeerAiSummaryModule
  },
  data() {
    return {
      // 同辈对比数据（5.4 后端代码统计、同步返回）：由条件卡上抛的查询条件驱动拉取
      analyzing: false,
      peerCompareResult: null,
      // 组标签：与条件卡展示的勾选组合口径一致，供综合分位/AI 分析文案引用
      groupLabel: '',
      debounceTimer: null
    };
  },
  computed: {
    // 将后端统计结果 peerCompareResult 归一为各分析模块统一消费的 result 结构：
    // rank 为综合分位（前 X%）、values 为各维度分位比例（雷达图数据源）、强/弱项与维度明细透传
    peerResult() {
      const data = this.peerCompareResult;
      if (!data) {
        return {
          degrade: true,
          groupLabel: this.groupLabel,
          size: 0,
          rank: null,
          values: [],
          dimensions: [],
          strongDimensions: [],
          weakDimensions: []
        };
      }
      const dimensions = data.dimensions || [];
      return {
        degrade: false,
        groupLabel: this.groupLabel,
        size: data.peerNum || 0,
        // totalRatio 为「超过组内 X%」（自底向上分位），前 X% = 100 - totalRatio
        rank: 100 - (data.totalRatio || 0),
        values: dimensions.map(item => (item.ratio || 0) / 100),
        dimensions,
        strongDimensions: data.strongDimensions || [],
        weakDimensions: data.weakDimensions || []
      };
    },
    // 统计进行中的遮罩文案（后端代码统计为同步返回，仅短暂加载）
    loadingText() {
      return '同辈对比统计中…';
    }
  },
  beforeDestroy() {
    // 页面销毁时清理防抖定时器，避免离开后继续请求
    clearTimeout(this.debounceTimer);
  },
  methods: {
    // 条件卡勾选变化上抛查询条件：防抖后统一发起分析，避免拖动式重复请求
    handleConditionChange(queryCondition) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.startPeerAnalysis(queryCondition), PEER_ANALYSIS_DEBOUNCE);
    },
    // 发起同辈对比统计（5.4）：后端代码统计同步返回，样本不足提示、命中则取回 statData
    async startPeerAnalysis(queryCondition) {
      this.analyzing = true;
      this.peerCompareResult = null;
      // 捕获当前勾选组合的组标签，保证分析文案与条件卡口径一致
      this.groupLabel = this.$refs.peerConditionCard ? this.$refs.peerConditionCard.groupLabel : '';
      try {
        const { data } = await getPeerCompareDataForTh({ queryCondition });
        this.analyzing = false;
        if (!data) return;
        const peerNum = data.peerNum || 0;
        // statData 为后端代码统计结果（含综合分位/各维度分位/强弱项，雷达图数据源）
        this.peerCompareResult = data.statData || null;
        if (peerNum < MIN_GROUP_SAMPLE_SIZE) {
          this.$message.warning(`同辈样本不足（当前命中 ${peerNum} 人，至少 ${MIN_GROUP_SAMPLE_SIZE} 人），请放宽条件后重试`);
        }
      } catch (err) {
        this.analyzing = false;
        // 接口异常已由请求拦截器统一提示（如“未查询到维度统计数据”）
        console.error('获取同辈对比数据失败：', err);
      }
    },
    // 条件卡上抛最近一次对比记录（初始化时已有成功记录，无需重新发起分析）
    handleLatestRecord({ statData, peerNum }) {
      this.peerCompareResult = statData;
      // 同步组标签（与条件卡当前默认勾选保持一致）
      this.groupLabel = this.$refs.peerConditionCard ? this.$refs.peerConditionCard.groupLabel : '';
    },
    // 「AI 更多分析」入口：演示环境给出预设提问引导，口径与本页同辈组保持一致
    handleAskMore() {
      this.$alert(
        '可继续追问：我在和谁比、我差在哪、这个分位怎么理解。当前为演示预设问答，未接入大模型。',
        'AI 更多分析',
        { confirmButtonText: '知道了' }
      );
    }
  }
};
</script>
