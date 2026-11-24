<template>
  <!-- 同辈对标 · 全校分析容器：条件卡上抛查询条件，本页优先回显最近一次分析记录、否则发起统计并把 statData 分发给四个分析面板 -->
  <div class="team-analysis">
    <!-- 页面抬头 -->
    <section class="page-heading">
      <div>
        <div class="eyebrow">SCHOOL-LEVEL PEER BENCHMARK</div>
        <h1>同辈对标 · 全校分析<span>按条件圈定教师群体，做全校层面的结构与成长分析</span></h1>
      </div>
    </section>

    <!-- 选择同辈组合：维度取自档案字段绑定接口，卡片内部维护勾选与取值，命中人数与全校人数由统计结果回传 -->
    <team-condition-card :match-count="peerNum" :school-total="schoolTeacherNum" :compare-param="latestCompareParam" @condition-change="handleConditionChange" />

    <!-- 统计结果区：代码统计为同步返回，进页面先用最近一次对比记录回显，加载中由包裹层统一遮罩 -->
    <div v-loading="analyzing" :element-loading-text="loadingText">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.k" class="tab" :class="{ on: activeTab === t.k }" @click="activeTab = t.k">
          <i :data-lucide="t.icon"></i>{{ t.label }}
          <span v-if="t.k === 'list'" class="cnt num">{{ peerNum }}</span>
        </button>
      </div>

      <team-overview-panel v-show="activeTab === 'overview'"
        :summary="summary"
        :structure="structure"
        :peer-num="peerNum"
        :school-total="schoolTeacherNum" />
      <team-dims-panel v-show="activeTab === 'dims'"
        :teacher-list="teacherList"
        :dims="dims" />
      <team-strength-panel v-show="activeTab === 'strength'" :teacher-list="teacherList" />
      <team-list-panel v-show="activeTab === 'list'" :teacher-list="teacherList" :dims="dims" />
    </div>
  </div>
</template>

<script>
import { getSchoolCompareDataForAdmin, peerCompareRecordGetSchoolLatest } from '@/api/peer-setting';
import { num } from './analysis-helper';
import TeamConditionCard from './components/team-condition-card.vue';
import TeamOverviewPanel from './components/team-overview-panel.vue';
import TeamDimsPanel from './components/team-dims-panel.vue';
import TeamStrengthPanel from './components/team-strength-panel.vue';
import TeamListPanel from './components/team-list-panel.vue';

// 条件变化防抖间隔（毫秒）：合并短时间内的多次勾选/取值变化，避免重复统计
const TEAM_ANALYSIS_DEBOUNCE = 400;

export default {
  name: 'AdminTeamPeerAnalysis',
  components: {
    TeamConditionCard,
    TeamOverviewPanel,
    TeamDimsPanel,
    TeamStrengthPanel,
    TeamListPanel
  },
  data() {
    return {
      // 5.5 校管理员同辈对比统计结果（代码统计、同步返回）
      analyzing: false,
      statData: null,
      // 最近一次全校分析记录是否已回显：回显后跳过条件卡初始化的那次自动统计
      latestRecordShown: false,
      // 最近一次记录的条件快照，交由条件卡还原勾选与取值
      latestCompareParam: '',
      // 条件卡加载完维度会自动上抛一次条件，仅这一次由最近记录优先接管
      isFirstConditionEmit: true,
      // 待提交给统计接口的查询条件（由条件卡上抛）
      pendingCondition: null,
      peerNum: 0,
      schoolTeacherNum: 0,
      // 条件卡上抛的维度元信息：明细清单按此出档案列并做取值翻译
      dims: [],
      activeTab: 'overview',
      tabs: [
        { k: 'overview', label: '综合分析', icon: 'chart-no-axes-combined' },
        { k: 'dims', label: '维度对比', icon: 'bar-chart-3' },
        { k: 'strength', label: '强弱项与标杆', icon: 'target' },
        { k: 'list', label: '明细清单', icon: 'list' }
      ],
      debounceTimer: null
    };
  },
  computed: {
    summary() {
      return (this.statData && this.statData.summary) || [];
    },
    structure() {
      return (this.statData && this.statData.structure) || [];
    },
    teacherList() {
      return (this.statData && this.statData.teacherList) || [];
    },
    loadingText() {
      return '同辈对比统计中…';
    }
  },
  created() {
    // 进页面先回看本校最近一次全校对比记录，有记录直接回显，省掉一次重复统计
    this.fetchLatestRecord();
  },
  beforeDestroy() {
    // 页面销毁时清理防抖定时器，避免离开后继续请求
    clearTimeout(this.debounceTimer);
  },
  methods: {
    // 5-1.2 查询本校最近一次全校对比记录：只返回对比成功的一条，无记录时 data 为 null
    async fetchLatestRecord() {
      try {
        const { data } = await peerCompareRecordGetSchoolLatest();
        const statData = data && this.parseStatData(data.statData);
        if (!statData) return;
        // 记录比条件卡晚到时若统计已在途中，以本次实时统计结果为准，不回头覆盖
        if (this.analyzing) return;
        this.statData = statData;
        this.peerNum = num(data.peerNum);
        this.schoolTeacherNum = num(data.schoolTeacherNum);
        this.latestRecordShown = true;
        // 下抛条件快照：卡片据此把勾选与取值调成上次口径，避免「结果是上次的、勾选是默认的」
        this.latestCompareParam = data.compareParam || '';
      } catch (err) {
        // 记录查询失败静默：交由条件卡上抛的首次条件正常统计兜底
      }
    },
    // 条件卡上抛查询条件：防抖后统一发起统计，避免连续勾选造成的重复请求
    handleConditionChange({ queryCondition, dims }) {
      this.dims = dims;
      this.pendingCondition = queryCondition;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.analyzeByPendingCondition(), TEAM_ANALYSIS_DEBOUNCE);
    },
    // 条件卡初始化自动上抛的首次条件优先用最近记录回显，用户手动变更条件一律重新统计
    analyzeByPendingCondition() {
      if (this.isFirstConditionEmit) {
        this.isFirstConditionEmit = false;
        if (this.latestRecordShown) return;
      }
      if (!this.pendingCondition) return;
      this.fetchCompareData(this.pendingCondition);
    },
    // 获取校管理员同辈对比数据：命中组为空或综合分析指标未配置时由拦截器提示，本页回落空态
    async fetchCompareData(queryCondition) {
      this.analyzing = true;
      this.statData = null;
      this.peerNum = 0;
      this.schoolTeacherNum = 0;
      // 重新统计后结果已不代表历史记录，回显标记失效
      this.latestRecordShown = false;
      try {
        const { data } = await getSchoolCompareDataForAdmin({ queryCondition });
        this.analyzing = false;
        if (!data) return;
        this.peerNum = num(data.peerNum);
        this.schoolTeacherNum = num(data.schoolTeacherNum);
        this.statData = this.parseStatData(data.statData);
      } catch (err) {
        this.analyzing = false;
      }
    },
    // statData 正常为对象，兼容记录回看时的 JSON 字符串形态
    parseStatData(statData) {
      if (!statData) return null;
      if (typeof statData !== 'string') return statData;
      try {
        return JSON.parse(statData);
      } catch (err) {
        return null;
      }
    }
  }
};
</script>
