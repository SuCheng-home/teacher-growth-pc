<template>
  <!-- 成长愿景：实取 7.3 我的愿景列表。形态参考原型「chips 总览 + 逐目标行式列表 + 概括评价」，不含原型按类别预置的阶梯行 -->
  <section class="section growth-section">
    <div class="section-heading">
      <h2><i data-lucide="route"></i>成长愿景</h2>
      <router-link class="text-button" :to="visionRoute">进入成长愿景<i data-lucide="arrow-right"></i></router-link>
    </div>

    <!-- 空态与内容区一律用 v-show 切换：图标由全局 lucide 观察者把 <i> 整个换成 <svg>，
         Vue 的虚拟 DOM 对此毫不知情，用 v-if 换分支时旧图标节点会脱离 vdom，
         patch 错位、游离 svg 残留、整块列表被吞（故这里绝不销毁重建） -->
    <div v-show="!has && loadError" class="vision-empty">
      <i data-lucide="triangle-alert"></i>
      <div>
        <b>愿景数据加载失败</b>
        <span>网络或服务异常，暂无法展示我的愿景，请稍后重试。</span>
      </div>
      <button class="vm-btn" type="button" @click="loadVision()">重新加载</button>
    </div>
    <div v-show="!has && !loadError" class="vision-empty">
      <i data-lucide="circle-dashed"></i>
      <div>
        <b>{{ loading ? '正在加载成长愿景…' : '暂未设置成长愿景' }}</b>
        <span>设置后，系统按你选定的目标做资格预审与差距分析。</span>
      </div>
      <router-link class="vm-btn" :to="visionRoute">添加我的成长愿景</router-link>
    </div>

    <div v-show="has">
      <!-- 顶部总览：按目标去重的愿景标签 + 管理入口 -->
      <!-- <div class="vision-chips">
        <span class="vc-label">我的愿景</span>
        <span v-for="chip in chips" :key="chip.key" class="vc" :class="{ alt: chip.honor }">
          <i :data-lucide="chip.honor ? 'star' : 'graduation-cap'"></i>{{ chip.name }}
        </span>
        <router-link class="vc-link" :to="visionRoute"><i data-lucide="pencil"></i>管理</router-link>
      </div> -->

      <!-- 逐目标行：当前任职 → 愿景目标，下方标注所选标准与分析状态 -->
      <div class="vision-list">
        <div v-for="row in visionRows" :key="row.key" class="vision-row">
          <div class="vr-head">
            <strong>{{ row.goalName }}</strong>
            <span>{{ row.categoryName }}</span>
          </div>
          <div class="vr-path">
            <span class="current">{{ row.cur }}</span>
            <i data-lucide="move-right"></i>
            <span class="next">{{ row.goalName }}</span>
            <span class="vr-tag">我的愿景</span>
          </div>
          <div class="vr-note">{{ row.note }}</div>
        </div>
      </div>

      <!-- 概括评价：按已选愿景记录的分析状态计数，只报事实、不判优劣 -->
      <div class="vision-summary">
        <i data-lucide="list-checks"></i>
        <b class="vs-label">概括评价</b>
        <span class="vs-text">
          已选愿景 <b>{{ summary.total }}</b> 条：<b>{{ summary.done }}</b> 条已完成分析<template v-if="summary.running">、<b>{{ summary.running }}</b> 条分析中</template><template v-if="summary.pending">、<b>{{ summary.pending }}</b> 条待分析</template><template v-if="summary.failed">、<b>{{ summary.failed }}</b> 条分析失败</template>
        </span>
      </div>
    </div>

    <div class="section-footnote"><i data-lucide="info"></i>资格以对应年度文件及完整档案核验为准</div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';
import { computedFieldValue } from '@/utils/archive'
import { visionTeacherGoalMyList } from '@/api/vision';
import { VISION_ROUTE } from '@/constants/growth-index';

/* 已选愿景 analysisStatus → 文案（1 待分析 2 分析中 3 已完成 4 失败，与成长愿景页卡片角标同口径） */
const VISION_ANALYSIS_TEXT = { 1: '待分析', 2: '分析中', 3: '已完成分析', 4: '分析失败' };

export default {
  name: 'GiVisionSection',
  props: {
    // 当前教师档案数据
    archiveData: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      visionRoute: VISION_ROUTE,
      records: [],
      loading: true,
      loadError: false
    };
  },
  computed: {
    ...mapGetters(['teacherIndexFieldList']),
    has() {
      return !this.loading && this.records.length > 0;
    },
    // 愿景分组：一条接口记录＝目标×标准，按目标归并为一行
    groups() {
      const list = [];
      const map = {};
      this.records.forEach((r) => {
        const key = String(r.goalId != null ? r.goalId : r.id);
        if (!map[key]) {
          map[key] = { key, records: [], standards: [] };
          list.push(map[key]);
        }
        map[key].records.push(r);
        if (r.standardName && map[key].standards.indexOf(r.standardName) < 0) map[key].standards.push(r.standardName);
      });
      return list;
    },
    // 顶部 chips：目标名 + 该目标下所选标准条数
    chips() {
      return this.groups.map((g) => {
        const head = g.records[0];
        const name = this.goalNameOf(head);
        const more = g.records.length > 1 ? ' ×' + g.records.length : '';
        return { key: g.key, name: name + more, honor: /称号|骨干/.test(head.categoryName || '') };
      });
    },
    // 行式列表：当前任职 → 愿景目标 · 标准与分析状态
    visionRows() {
      return this.groups.map((g) => {
        const head = g.records[0];
        return {
          key: g.key,
          goalName: this.goalNameOf(head),
          categoryName: head.categoryName || '未分类',
          cur: this.getNowPost(head),
          note: this.noteOf(g)
        };
      });
    },
    // 概括评价：按接口记录（目标×标准）逐条统计 analysisStatus
    summary() {
      const count = (st) => this.records.filter((r) => Number(r.analysisStatus) === st).length;
      const done = count(3);
      return {
        total: this.records.length,
        done,
        running: count(2),
        pending: this.records.length - done - count(2) - count(4),
        failed: count(4)
      };
    }
  },
  created() {
    this.loadVision();
  },
  // 容器无 keep-alive，仅缓存场景生效：从愿景页管理返回时静默刷新，避免展示旧数据
  activated() {
    if (this.has) this.loadVision({ silent: true });
  },
  methods: {
    // silent：刷新失败时保留已展示数据，不清卡
    loadVision(opts) {
      const silent = !!(opts && opts.silent);
      if (!silent) this.loading = true;
      return visionTeacherGoalMyList().then((res) => {
        const data = (res && res.data) || [];
        data.forEach(r => {
          const field = this.teacherIndexFieldList.find(f => f.name === r.bindFieldName);
          r.bindField = field
        })
        this.records = data;
        this.loadError = false;
      }).catch(() => {
        if (!silent) this.records = [];
        this.loadError = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    // 目标名优先，接口未回填时回落标准名→分类名，保证不渲染成空块
    goalNameOf(r) {
      return r.goalName || r.standardName || r.categoryName || '未命名愿景';
    },
    // 「当前」侧：按分类名取对应任职字段，取不到如实显示占位
    getNowPost(row) {
      return computedFieldValue(row.bindField, this.archiveData[row.bindFieldName])
    },
    // 注释行：所选标准（多条并列）· 分析状态（多条去重）· 最近分析时间
    noteOf(g) {
      const states = [];
      let lastTime = '';
      g.records.forEach((r) => {
        const text = VISION_ANALYSIS_TEXT[Number(r.analysisStatus)] || '待分析';
        if (states.indexOf(text) < 0) states.push(text);
        if (r.lastAnalysisTime && r.lastAnalysisTime > lastTime) lastTime = r.lastAnalysisTime;
      });
      const done = g.records.filter((r) => Number(r.analysisStatus) === 3).length;
      let stateText = states.join(' / ');
      // 分析时间取 yyyy-MM-dd HH:mm 粒度（与成长愿景页卡片时间口径一致）
      if (done && lastTime) stateText += ' · ' + String(lastTime).slice(0, 16);
      return [g.standards.join(' / '), stateText].filter(Boolean).join(' · ');
    }
  }
};
</script>
