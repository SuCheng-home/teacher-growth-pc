<template>
  <!-- 校级评选 · 本学期评选安排：活动名 + 截止时间 + 阶段状态小标签，数据取自活动申报列表接口 -->
  <section class="section eval-section">
    <div class="section-heading">
      <h2><i data-lucide="award"></i>校级评选 <span class="count">{{ rows.length }}</span></h2>
      <span class="text-button" @click="handleEvaluate">进入校级评选<i data-lucide="arrow-right"></i></span>
    </div>
    <div v-if="!rows.length" class="cp-empty">{{ loading ? '加载中…' : '暂无评选活动' }}</div>
    <div v-for="row in rows" :key="row.id" class="eval-item" @click="handleEvaluateReport(row)">
      <strong>{{ row.name }}</strong>
      <span class="eval-time">{{ row.time }}</span>
      <span class="st" :class="row.cls">{{ row.stage }}</span>
    </div>
  </section>
</template>

<script>
import { store } from 'auth-layout-zw'
import { evaluationReportList } from '@/api/evaluation';
import { EVAL_STATUS_TEXT } from '@/constants/growth-index';

/* 首页一次拉取的页容量：接口分页返回，超出容量不进首页评选清单 */
const EVAL_PAGE_SIZE = 20;

export default {
  name: 'GiEvalSection',
  data() {
    return {
      list: [],
      loading: false
    };
  },
  computed: {
    // 评选行：截止时间取申报结束日期（yyyy-MM-dd），状态按接口 status 映射文案与样式类
    rows() {
      return this.list.map((x) => {
        const [stage, cls] = EVAL_STATUS_TEXT[Number(x.status)] || EVAL_STATUS_TEXT[3];
        return {
          id: x.id,
          name: x.title || '—',
          time: x.endTime ? String(x.endTime).slice(0, 10) : '—',
          stage,
          cls
        };
      });
    }
  },
  created() {
    this.loadActivities();
  },
  methods: {
    handleEvaluate() {
      const url = store.getters.curRootUrl + 'evaluateSch/home'
      console.log('open url', url)
      window.open(url, '_blank');
    },
    handleEvaluateReport(row) {
      const key = encodeURIComponent(JSON.stringify({ pageType: 1 }));
      const url = store.getters.curRootUrl + `evaluateSch/activityMain/${row.id}/activityIndex/reportList?key=${key}`
      console.log('open url', url)
      window.open(url, '_blank');
    },
    // 拉取评选活动列表：草稿（status 0）尚未发布，不进教师端首页；接口异常空态兜底
    loadActivities() {
      this.loading = true;
      evaluationReportList({ pageNumber: 1, pageSize: EVAL_PAGE_SIZE }).then((res) => {
        const data = (res && res.data) || {};
        this.list = (data.records || []).filter((x) => Number(x.status) !== 0);
      }).catch(() => {
        /* 接口异常静默：空态展示，拦截器统一提示 */
      }).then(() => {
        this.loading = false;
      });
    }
  }
};
</script>
