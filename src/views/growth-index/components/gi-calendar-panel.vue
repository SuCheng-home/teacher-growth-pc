<template>
  <!-- 大事件日历：数据来自教师发展大事件分页接口（后台发布同源），状态由后端按起止时间自动判定 -->
  <section class="calendar-panel">
    <div class="cp-head">
      <h2><i data-lucide="calendar-days"></i>学校教师发展大事件</h2>
      <span class="tag muted">{{ headNote }}</span>
    </div>
    <div ref="yearList" class="year-list">
      <div v-if="!rows.length" class="cp-empty">{{ loading ? '加载中…' : '暂无大事件' }}</div>
      <div
        v-for="row in rows"
        :key="row.id"
        class="year-row"
        :class="[`is-${row.stCls}`, row.cur ? 'cur' : '']"
      >
        <span class="yr-m">{{ row.m }}</span>
        <span class="yst" :class="row.stCls">{{ row.stLabel }}</span>
        <span class="yr-n evt-link" @click="openDetail(row.id)">{{ row.name }}</span>
        <span class="tag" :class="row.typeCls">{{ row.typeLabel }}</span>
      </div>
    </div>
    <div class="cp-foot"><i data-lucide="info"></i>来源：学校教师发展大事件发布；具体时间以学校正式通知为准</div>
    <!-- 大事件详情弹框：点标题打开，按 id 自拉详情 -->
    <gi-event-dialog :visible="detailVisible" :event-id="detailId" @close="detailVisible = false" />
  </section>
</template>

<script>
import { eventPageList } from '@/api/event';
import { EVENT_STATUS_TEXT } from '@/constants/growth-index';
import GiEventDialog from './gi-event-dialog.vue';

/* 首页日历一次拉取较大页容量：接口按开始时间先后正序返回，超出容量不进首页时间线 */
const EVENT_PAGE_SIZE = 50;

export default {
  name: 'GiCalendarPanel',
  components: { GiEventDialog },
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      /* 详情弹框：打开标记与当前事件 id */
      detailVisible: false,
      detailId: ''
    };
  },
  computed: {
    /* 面板头注释：事件总件数（接口回传 total） */
    headNote() {
      return `共 ${this.total} 件`;
    },
    // 大事件按接口顺序展开为行；「进行中」的高亮定位由 cur 标记
    rows() {
      return this.list.map((e) => {
        const [stLabel, stCls] = EVENT_STATUS_TEXT[Number(e.status)] || EVENT_STATUS_TEXT[1];
        return {
          id: e.id,
          m: this.monthOf(e.eventStartTime),
          name: e.title || '—',
          stLabel,
          stCls,
          typeLabel: e.categoryName || '—',
          typeCls: 'muted',
          cur: Number(e.status) === 2
        };
      });
    }
  },
  created() {
    this.loadEvents();
  },
  methods: {
    /* 打开详情弹框：行 id 必存在（接口回传），兼容缺失时不响应 */
    openDetail(id) {
      if (!id) return;
      this.detailId = id;
      this.detailVisible = true;
    },
    /* 拉取大事件列表：仅取首屏较大页，接口异常空态兜底 */
    loadEvents() {
      this.loading = true;
      eventPageList({ currentPage: 1, pageSize: EVENT_PAGE_SIZE }).then((res) => {
        const data = (res && res.data) || {};
        this.list = data.records || [];
        this.total = data.total || 0;
        this.$nextTick(this.scrollToCurrent);
      }).catch(() => {
        /* 接口异常静默：空态展示，拦截器统一提示 */
      }).then(() => {
        this.loading = false;
      });
    },
    /* '2026-09-01 …' → '9月'；无开始时间兜底占位 */
    monthOf(s) {
      const parts = String(s || '').split('-');
      return parts.length >= 2 ? `${parseInt(parts[1], 10)}月` : '—';
    },
    // 默认滚动定位到「进行中」的行（无进行中行则保持顶部）
    scrollToCurrent() {
      const list = this.$refs.yearList;
      if (!list) return;
      const rows = Array.from(list.children);
      const idx = rows.findIndex((r) => r.classList.contains('cur'));
      if (idx > 0 && rows[0]) list.scrollTop = rows[idx].offsetTop - rows[0].offsetTop;
    }
  }
};
</script>
