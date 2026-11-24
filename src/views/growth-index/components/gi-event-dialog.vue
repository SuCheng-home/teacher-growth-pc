<template>
  <el-dialog
    :visible="visible"
    width="560px"
    top="8vh"
    custom-class="gi-event-dialog"
    :close-on-click-modal="false"
    append-to-body
    @close="$emit('close')"
  >
    <div slot="title" class="ed-title">{{ (detail && detail.title) || '大事件详情' }}</div>
    <div v-loading="loading" class="ed-body">
      <div class="ed-row">
        <span class="ed-k">状态</span>
        <span class="ed-v"><em class="ed-st" :class="statusCls">{{ statusText }}</em></span>
      </div>
      <div class="ed-row">
        <span class="ed-k">起止时间</span>
        <span class="ed-v">{{ timeText }}</span>
      </div>
      <div class="ed-row">
        <span class="ed-k">所属分类</span>
        <span class="ed-v">{{ (detail && detail.categoryName) || '—' }}</span>
      </div>
      <div class="ed-row">
        <span class="ed-k">所属学年</span>
        <span class="ed-v">{{ (detail && detail.termYear) || '—' }}</span>
      </div>
      <!-- 内容为富文本 HTML（后台 RichTextEditor 产出）；历史纯文本无标签同样正常展示 -->
      <div class="ed-content" v-html="richContent"></div>
    </div>
  </el-dialog>
</template>

<script>
/* 大事件详情弹框：按 id 自拉 eventDetail（1.4），数据与生命周期组件内自持 */
import { eventDetail } from '@/api/event';
import { EVENT_STATUS_TEXT } from '@/constants/growth-index';

export default {
  name: 'GiEventDialog',
  props: {
    visible: { type: Boolean, default: false },
    /* 大事件 id：visible 转 true 且 id 变化时重新拉取详情 */
    eventId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      detail: null,
      loading: false
    };
  },
  computed: {
    /* 状态文案与样式类：与首页日历共用 EVENT_STATUS_TEXT 口径 */
    statusText() {
      return this.statusPair[0];
    },
    statusCls() {
      return this.statusPair[1];
    },
    statusPair() {
      const st = this.detail && Number(this.detail.status);
      if (EVENT_STATUS_TEXT[st]) return EVENT_STATUS_TEXT[st];
      /* 详情接口（1.4）返回原始对象、可能不带列表接口自动计算的 status：按起止时间同口径兜底推导 */
      return EVENT_STATUS_TEXT[this.inferStatus()] || ['—', 'done'];
    },
    /* 起止时间：只展示日粒度，与后台管理列表同口径 */
    timeText() {
      const d = this.detail || {};
      const fmt = (s) => (s ? String(s).slice(0, 10) : '');
      const start = fmt(d.eventStartTime);
      const end = fmt(d.eventEndTime);
      if (start && end) return start + ' 至 ' + end;
      return start || end || '—';
    },
    /* 富文本正文：空内容给灰字占位，避免弹框开天窗 */
    richContent() {
      const c = (this.detail && this.detail.content) || '';
      return String(c).trim() ? c : '<span class="ed-none">暂无内容说明</span>';
    }
  },
  watch: {
    visible(val) {
      if (val && this.eventId) this.loadDetail();
    }
  },
  methods: {
    /* 状态兜底推导：结束时间早于当前＝1 已结束，开始时间晚于当前＝3 未开始，否则＝2 进行中 */
    inferStatus() {
      const d = this.detail || {};
      /* Windows Safari 对 'yyyy-MM-dd HH:mm:ss' 解析为 NaN，统一换斜杠后解析 */
      const ts = (s) => (s ? new Date(String(s).replace(/-/g, '/')).getTime() : NaN);
      const start = ts(d.eventStartTime);
      if (isNaN(start)) return 0;
      const end = ts(d.eventEndTime);
      const now = Date.now();
      if (!isNaN(end) && end < now) return 1;
      if (start > now) return 3;
      return 2;
    },
    /* 拉取详情：每次打开重新请求，保证后台编辑后回显最新 */
    loadDetail() {
      this.loading = true;
      this.detail = null;
      eventDetail(this.eventId).then((res) => {
        this.detail = (res && res.data) || null;
      }).catch(() => {
        /* 接口异常静默：弹框保持空详情，拦截器统一提示 */
      }).then(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .gi-event-dialog{border-radius:6px}
::v-deep .gi-event-dialog .el-dialog__header{padding:14px 18px 12px;border-bottom:1px solid #eef1ed}
::v-deep .gi-event-dialog .el-dialog__body{padding:14px 18px 18px}
.ed-title{font-size:15px;font-weight:600;color:#2c3a33;line-height:1.5;padding-right:24px}
.ed-body{min-height:120px}
.ed-row{display:flex;gap:12px;font-size:12.5px;line-height:1.9;border-bottom:1px dashed #f0f3f0}
.ed-row .ed-k{flex-shrink:0;width:64px;color:#8b9a8e}
.ed-row .ed-v{flex:1;min-width:0;color:#3c4b42}
.ed-st{flex-shrink:0;font-style:normal;font-size:11px;border-radius:3px;padding:1px 8px;background:#eef1ef;color:#9aa59c}
.ed-st.doing{background:#e7f1ec;color:#2f7a68;font-weight:700}
.ed-st.todo{background:#edf3f7;color:#7191b3}
.ed-content{margin-top:12px;font-size:12.5px;line-height:1.8;color:#55635a;word-break:break-all;max-height:320px;overflow-y:auto}
.ed-content ::v-deep img{max-width:100%}
.ed-content ::v-deep .ed-none{color:#9aa59c}
</style>
