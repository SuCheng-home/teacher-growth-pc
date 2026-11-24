<template>
  <!-- 中部区：左侧「上报我的档案 + 近一年新增成果」上下堆叠，右侧「我的修改记录」内滚表格 -->
  <section class="mid-area">
    <div class="mid-left">
      <div class="mid-card batch-card">
        <div class="mc-head">
          <span class="mc-ico"><i data-lucide="clipboard-list"></i></span>
          <h3>上报我的档案</h3>
          <span v-if="batch" class="mc-tip"><i data-lucide="refresh-cw"></i>{{ batchSync }}</span>
          <span v-if="batch" class="st run">进行中</span>
        </div>
        <template v-if="batch">
          <div class="bc-name">{{ batch.title }}</div>
          <div class="bc-time"><span>填报时间</span><b>{{ batch.teacherReportStartTime }} 至 {{ batch.teacherReportEndTime }}</b></div>
          <button class="bc-btn" type="button" @click="handleReportTask"><i data-lucide="square-pen"></i>填报</button>
        </template>
        <div v-else class="cp-empty">{{ batchLoading ? '加载中…' : '暂无进行中的档案填报批次' }}</div>
      </div>
      <div class="mid-card year-new">
        <div class="mc-head">
          <span class="mc-ico sky"><i data-lucide="sprout"></i></span>
          <h3>近一年新增成果</h3>
        </div>
        <div class="yn-val">{{ yearNewCount }}<i>项</i></div>
      </div>
    </div>
    <div class="record-panel">
      <div class="rec-head">
        <h3><i data-lucide="history"></i>我的修改记录</h3>
        <span class="rec-counts">
          <span class="c-run">待审 <b>{{ statusInfo.pendingNum }}</b></span>
          <span class="c-back">被退回 <b>{{ statusInfo.backNum }}</b></span>
        </span>
        <a class="text-button" @click="handleMoreRecord">更多<i data-lucide="chevrons-right"></i></a>
      </div>
      <div class="rec-scroll">
        <table class="rec-table">
          <thead>
            <tr><th>模块名称</th><th>申请时间</th><th>修改值</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="r.code || i">
              <td class="rm rt">{{ moduleName(r) }}</td>
              <td class="rt">{{ timeText(r) }}</td>
              <td class="rv">{{ valueText(r) }}</td>
              <td class="rs" :class="statusOf(r).cls" :title="r.approvalDescribe || ''">{{ statusOf(r).text }}</td>
            </tr>
            <tr v-if="!records.length && !recLoading"><td class="rt" colspan="4">{{ recEmptyText }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script>
import { store } from 'auth-layout-zw'
import { YEAR_NEW_COUNT } from '@/constants/growth-index';
import { computedFieldValue } from '@/utils/archive'
import { teacherArchiveRecordPage, teacherStatusNum, teacherArchiveTaskMyTaskPage } from '@/api/archives';

/* 自动同步说明（卡片固定文案，非接口字段） */
const BATCH_SYNC = '自动同步至区档案';
/* 批次查询页容量：与参考项目 myTask/list 同口径一次拉全，前端筛进行中 */
const BATCH_PAGE_SIZE = 200;

/* 审批状态 → [文案, 样式类]：1 待审批 / 2 通过 / 3 退回 / 其余无需审批 */
const APPROVAL_STATUS = { 1: ['待审批', 'run'], 2: ['通过', 'ok'], 3: ['退回', 'back'] };
/* 操作类型前缀与参考项目同口径 */
const OP_TYPE_TEXT = { modify: '【修改】', add: '【新增】', delete: '【删除】' };
/* 首页表格只取最近几条，与参考项目首页 pageSize 一致 */
const RECORD_PAGE_SIZE = 5;

export default {
  name: 'GiMidArea',
  data() {
    return {
      /* 上报档案批次：取当前时间处于填报区间内的最新一条任务 */
      batch: null,
      batchLoading: true,
      batchSync: BATCH_SYNC,
      yearNewCount: YEAR_NEW_COUNT,
      /* 我的修改记录：接口驱动（record/page 首屏 + myStatusNum 状态计数） */
      records: [],
      statusInfo: { pendingNum: 0, passNum: 0, backNum: 0 },
      recLoading: true,
      recFailed: false
    };
  },
  computed: {
    /* 空态文案：区分接口异常与确实无记录 */
    recEmptyText() {
      return this.recFailed ? '记录加载失败' : '暂无修改记录';
    }
  },
  created() {
    this.loadBatch();
    this.loadRecords();
    this.loadStatusNum();
  },
  methods: {
    handleReportTask() {
      const url = store.getters.curRootUrl + 'teacherArchivesSchNew/myTask/index?taskCode=' + this.batch.code
      console.log('open url', url)
      window.open(url, '_blank');
    },
    handleMoreRecord() {
      const url = store.getters.curRootUrl + 'teacherArchivesSchNew/myRecord'
      console.log('open url', url)
      window.open(url, '_blank');
    },
    /* 拉取填报任务并取进行中批次：同参考口径由起止时间判定，多条命中时取开始时间最新的一条 */
    loadBatch() {
      teacherArchiveTaskMyTaskPage({ currentPage: 1, pageSize: BATCH_PAGE_SIZE }).then((res) => {
        const rows = ((res && res.data) || {}).rows || [];
        const now = Date.now();
        const running = rows.filter((t) => this.isRunning(t, now));
        running.sort((a, b) => this.ts(b.teacherReportStartTime) - this.ts(a.teacherReportStartTime));
        this.batch = running[0] || null;
      }).catch(() => {
        /* 接口异常静默：卡片展示空态，拦截器统一提示 */
      }).then(() => {
        this.batchLoading = false;
      });
    },
    /* 时间解析：Windows Safari 对 'yyyy-MM-dd HH:mm:ss' 返回 NaN，统一换斜杠后解析 */
    ts(s) {
      return s ? new Date(String(s).replace(/-/g, '/')).getTime() : NaN;
    },
    /* 进行中判定：当前时间处于起止区间内（含端点） */
    isRunning(t, now) {
      const start = this.ts(t.teacherReportStartTime);
      const end = this.ts(t.teacherReportEndTime);
      if (isNaN(start) || isNaN(end)) return false;
      return now >= start && now <= end;
    },
    /* 拉取最近修改记录：与参考项目同参数口径（不传 userCode，后端按登录态识别） */
    loadRecords() {
      teacherArchiveRecordPage({ currentPage: 1, pageSize: RECORD_PAGE_SIZE }).then((res) => {
        const data = (res && res.data) || {};
        this.records = data.rows || [];
      }).catch(() => {
        this.recFailed = true;
      }).then(() => {
        this.recLoading = false;
      });
    },
    /* 状态计数：待审/退回直接取接口统计，不再由首屏行数推导 */
    loadStatusNum() {
      teacherStatusNum().then((res) => {
        Object.assign(this.statusInfo, (res && res.data) || {});
      }).catch(() => {
        /* 接口异常静默：计数保持 0，拦截器统一提示 */
      });
    },
    /* 模块名称：对象指标取字段标签，其余取指标标签 */
    moduleName(r) {
      const idx = r.index || {};
      if (idx.type === 'objectform') return (idx.field && idx.field.label) || '—';
      return idx.label || '—';
    },
    /* 申请时间：精确到分钟 */
    timeText(r) {
      return String(r.createTime || '').substring(0, 16) || '—';
    },
    /* 修改值：操作前缀 + 指标类型展示（复杂/附件/图片只报类型，简单字段取值） */
    valueText(r) {
      const idx = r.index || {};
      const prefix = OP_TYPE_TEXT[r.operationType] || '';
      let val = '';
      if (idx.type === 'arrayform') val = '一条记录';
      else if (idx.type === 'file') val = '附件';
      else if (idx.type === 'license') val = '图片';
      else if (r.afterValue && typeof r.afterValue === 'object') val = '一条记录';
      else val = r.afterValue == null ? '' : computedFieldValue(r.index.field, r.afterValue);
      return (prefix + val) || '—';
    },
    /* 审批状态：文案与样式类；无需审批用默认灰色 */
    statusOf(r) {
      const [text, cls] = APPROVAL_STATUS[Number(r.approvalStatus)] || ['无需审批', ''];
      return { text, cls };
    },
    go(path) {
      this.$router.push(path);
    }
  }
};
</script>
