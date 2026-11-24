<template>
  <!-- 成长愿景容器：本页只做状态编排（选中哪些愿景、当前目标、改动覆盖、时间戳），展示与计算全部下沉到子组件 -->
  <div>
    <!-- 页面抬头：标题与四步流程 -->
    <section class="page-heading">
      <div>
        <div class="eyebrow">GROWTH VISION · 成长愿景</div>
        <h1>成长愿景<span>定目标 → 资格预审 → 找差距 → 生成提升路径</span></h1>
      </div>
    </section>

    <!-- 已选愿景工作区：有目标时才渲染，否则走下方空状态 -->
    <div v-if="hasGoals" class="goal-content" id="goal-content">
      <!-- 目标卡列表：卡片本身承担切目标、添加、重新评估、删除四个入口 -->
      <vision-target-cards
        :goals="myGoals"
        :cur="cur"
        @add-goal="handleAddGoalBtn"
        @select="handleSelectTarget"
        @refresh-target="handleRefreshTarget"
        @delete="handleDeleteGoal"
      />
      <!-- AI 分析进行中：整块聚焦状态区，隐藏页签与四面板 -->
      <div v-if="analyzing" class="analysis-status">
        <div class="as-spinner"></div>
        <div class="as-title">AI 正在分析中</div>
        <div class="as-bar">
          <div class="as-track"><div class="as-fill" :style="{ width: (analysisProgress || 0) + '%' }"></div></div>
          <span class="as-pct">{{ analysisProgress || 0 }}%</span>
        </div>
        <div class="as-text">{{ analysisProgressText || '正在解读标准规则并比对档案数据，请稍候…' }}</div>
      </div>
      <!-- 分析完成：页签 + 四面板（v-show 切换保留面板内部展开态） -->
      <template v-else>
        <vision-tabs
          :active-tab="activeTab"
          :detail="analysisDetail"
          :structure="analysisStructure"
          :file-count="stdFileCount"
          @change="handleTabChange"
        />
        <div class="pane-host">
          <!-- 一、标准解读：规则概览 → 资格门槛与评分项逐条规则卡（全部数据来自 8.7 analysisStructure） -->
          <pane-doc
            v-show="activeTab === 'doc'"
            :structure="analysisStructure"
            :goal-id="curGoalId"
            @files-count="stdFileCount = $event"
          />
          <!-- 二、逐条比对：资格门槛与材料评分项两组逐条明细（数据全部来自 8.7 analysisStructure） -->
          <pane-cmp
            v-show="activeTab === 'cmp'"
            :structure="analysisStructure"
          />
          <!-- 三、差距汇总：按结论分支输出缺口与补齐路径（全部数据来自 8.7 analysisStructure） -->
          <pane-sum
            v-show="activeTab === 'sum'"
            :structure="analysisStructure"
          />
          <!-- 四、分析报告：结论与 AI 小结取自 8.7 analysisStructure，报告走接口生成 -->
          <pane-rpt
            v-show="activeTab === 'rpt'"
            :structure="analysisStructure"
            :goal-name="curGoalName"
            :pull-time="pullTime"
            :goal-key="cur"
            @toast="toast"
          />
        </div>
      </template>
    </div>

    <!-- 空状态：一个愿景未选时的首访引导 -->
    <empty-state v-else @add="handleOpenGoalModal" />

    <!-- 数据新鲜度条：根据分析状态展示不同内容（分析中显示进度、完成显示时点、无结果显示提示） -->
    <fresh-bar
      :pull-time="pullTime"
      :ana-time="anaTime"
      :stale="stale"
      :analyzing="analyzing"
      :progress-text="loadingText"
      @refresh="handleRefresh"
    />

    <!-- 愿景添加弹窗：拉取 goalOptions 展示可选标准，本地勾选后点「添加并分析」统一新增，成功后上抛最后新增的记录 id -->
    <goal-modal
      :visible="goalModalVisible"
      :my-list="myGoals"
      @close="handleGoalClose"
      @add-analyse="handleGoalAddAnalyse"
    />

    <!-- 评分项操作弹窗组：统一由 pane-cmp 上抛事件后在本容器打开；除模拟动作外，确认结果都回写 ov 并重算总分 -->
    <!-- 修改单项：改分 / 标记不适用 / 只记录取值说明 -->
    <edit-score-dialog
      :visible="editDialogVisible"
      :item="editItem"
      :target="currentTarget"
      :ov="ov"
      @confirm="handleEditConfirm"
      @close="editDialogVisible = false"
    />

    <!-- 剔除单项：写明理由后从总分中移除并留痕 -->
    <delete-score-dialog
      :visible="deleteDialogVisible"
      :item="deleteItem"
      :target="currentTarget"
      @confirm="handleDeleteConfirm"
      @close="deleteDialogVisible = false"
    />

    <!-- 重新取数：清掉本人改动，回到档案原始取值 -->
    <refetch-dialog
      :visible="refetchDialogVisible"
      :item="refetchItem"
      :target="currentTarget"
      :pull-time="pullTime"
      @confirm="handleRefetchConfirm"
      @close="refetchDialogVisible = false"
    />

    <!-- 轻提示：沿用原型 .mini-toast 样式，由 toast() 方法控制显隐 -->
    <div class="mini-toast" :class="{ on: toastVisible }">{{ toastMsg }}</div>
  </div>
</template>

<script>
/* 共享数据与纯函数：容器只负责组装与事件派发；分析明细全部以接口真实数据驱动 */
import { TARGETS } from '@/constants/qualification';
import { visionTeacherGoalMyList, visionTeacherGoalCancel, visionAnalysisStart, visionAnalysisLatest, visionAnalysisResult, visionAnalysisDetail, visionAnalysisStructure } from '@/api/vision';
import { fmtTime } from '@/utils/format';
/* 页面级子组件：新鲜度条、目标卡、页签、空态、愿景弹窗 */
import FreshBar from './components/fresh-bar.vue';
import VisionTargetCards from './components/vision-target-cards.vue';
import VisionTabs from './components/vision-tabs.vue';
import EmptyState from './components/empty-state.vue';
import GoalModal from './components/goal-modal.vue';
/* 四个 Tab 面板（哑组件：props 下行、event 上行，自身不改业务状态） */
import PaneDoc from './components/pane-doc.vue';
import PaneCmp from './components/pane-cmp.vue';
import PaneSum from './components/pane-sum.vue';
import PaneRpt from './components/pane-rpt.vue';
/* 评分项操作弹窗组：修改 / 剔除 / 重新取数 */
import EditScoreDialog from './components/edit-score-dialog.vue';
import DeleteScoreDialog from './components/delete-score-dialog.vue';
import RefetchDialog from './components/refetch-dialog.vue';

/* AI 分析轮询间隔（毫秒）：发起分析后定时查询状态与结构，直到 isFinished=true */
const ANALYSIS_POLL_INTERVAL = 2000;

export default {
  name: 'GrowthVision',
  /* 局部注册：页面级组件 + 4 个 Tab 面板 + 4 个评分项弹窗 + AI 小助手 */
  components: {
    FreshBar,
    VisionTargetCards,
    VisionTabs,
    EmptyState,
    GoalModal,
    PaneDoc,
    PaneCmp,
    PaneSum,
    PaneRpt,
    EditScoreDialog,
    DeleteScoreDialog,
    RefetchDialog
  },
  data() {
    const now = fmtTime(new Date());
    return {
      /* ---------- 业务主状态 ---------- */
      myGoals: [], /* 我的愿景列表（AiVisionTeacherGoal 数组，来源 /visionTeacherGoal/myList） */
      cur: '', /* 当前选中愿景的记录 id，四个面板都以它为索引 */
      activeTab: 'doc', /* 当前面板：doc｜cmp｜sum｜rpt */
      ov: {}, /* 本人对评分项的改动覆盖 { [itemId]: { score, value, del, reason } }，参与总分重算 */
      /* ---------- 当前愿景最近一次成功分析的完整数据（detail 汇总 + structure 全量结构）---------- */
      curAnalysisId: '', /* 当前愿景对应的分析记录 id，detail/structure/报告接口均以它为索引 */
      analysisDetail: null, /* AiVisionAnalysis 汇总（conclusion/gateXxxCount/scoreTotal/scoreFull/aiSummary/fixPath 等） */
      analysisStructure: null, /* 分析结果全量结构 JSON（gates 按 group 分组、scoreItems 按 category 分组），驱动规则解读与差距汇总面板 */
      /* ---------- AI 分析轮询状态（发起分析后定时查询 8.2 进度，成功后拉取 8.3 详情与 8.7 全量结构）---------- */
      analyzing: false, /* 分析进行中标记：驱动面板区 v-loading 遮罩 */
      analysisProgress: 0, /* 阶段式进度百分比（0-100，来源 8.2 progress） */
      analysisProgressText: '', /* 当前阶段文案（来源 8.2 progressText） */
      pollTimer: null, /* 轮询计时器，在 cur 切换 / beforeDestroy 中清理 */
      /* ---------- 时间戳 ---------- */
      pullTime: now, /* 档案数据拉取时点（新鲜度条与报告页脚展示） */
      anaTime: '', /* 分析结果生成时点（空表示尚未有分析结果） */
      stale: false, /* 档案有更新的标记：接真实档案推送后置真，用于新鲜度条高亮与提示；本地改动不置位 */
      stdFileCount: 0, /* 评估标准原文文件数：由 pane-doc 按 goalId 拉取后上抛，供政策规则解读页签徽标展示 */
      goalModalVisible: false, /* 愿景添加弹窗显隐 */
      /* ---------- 四个评分项弹窗：显隐标记 + 当前操作对象（由 pane-cmp 上抛）---------- */
      editDialogVisible: false,
      editItem: null,
      deleteDialogVisible: false,
      deleteItem: null,
      refetchDialogVisible: false,
      refetchItem: null,
      /* ---------- 轻提示 ---------- */
      toastVisible: false,
      toastMsg: '',
      toastTimer: null /* 显隐计时器，在 beforeDestroy 中清理 */
    };
  },
  computed: {
    /* 当前目标定义（仅供尚未接入真实数据的操作弹窗兼容保留；cur 为真实记录 id 时返回 null） */
    currentTarget() {
      return this.cur && TARGETS[this.cur] ? TARGETS[this.cur] : null;
    },
    /* 是否已有愿景：决定渲染工作区还是空状态 */
    hasGoals() {
      return this.myGoals.length > 0;
    },
    /* 当前愿景目标名称：供分析报告标题使用（优先取汇总记录 goalName，回退愿景列表当前项） */
    curGoalName() {
      const d = this.analysisDetail || {};
      const rec = this.myGoals.find(item => String(item.id) === String(this.cur));
      return d.goalName || (rec && rec.goalName) || '';
    },
    /* 当前愿景的目标 id（AiVisionTeacherGoal.goalId）：供标准解读面板按 goalId 拉取评估标准文件 */
    curGoalId() {
      const rec = this.myGoals.find(item => String(item.id) === String(this.cur));
      return (rec && rec.goalId) || '';
    },
    /* 分析进行中遮罩文案：优先展示后端阶段式进度与提示（8.2 progressText/progress） */
    loadingText() {
      if (!this.analyzing) return '';
      const txt = this.analysisProgressText || 'AI 正在分析中，请稍候…';
      const pct = this.analysisProgress || 0;
      return txt + '（' + pct + '%）';
    }
  },
  mounted() {
    /* 进入页面拉取我的愿景列表 */
    this.loadMyGoals();
  },
  watch: {
    /* 切换当前愿景：停止上一愿景遗留的轮询，重置分析完整数据，重新拉取最近一次成功分析与全量结构（8.7） */
    cur() {
      this.stopAnalysisPoll();
      this.analyzing = false;
      this.resetAnalysisData();
      this.loadAnalysisData();
    }
  },
  methods: {
    /* 拉取我的愿景列表，并校正当前选中项（cur 失效时回退到第一条） */
    loadMyGoals() {
      return visionTeacherGoalMyList().then(res => {
        this.myGoals = (res && res.data) || [];
        if (!this.myGoals.some(item => item.id === this.cur)) {
          this.cur = this.myGoals.length ? this.myGoals[0].id : '';
        }
      }).catch(() => {
        this.myGoals = [];
        this.cur = '';
      });
    },

    /* 拉取当前愿景最近一次成功分析：用 8.4 latest 拿汇总与 analysisId，再拉 8.7 全量结构，
       供规则解读 / 逐条比对 / 差距汇总 / 页签徽标 / AI 助手消费；无成功记录且非“分析中”则直接发起 AI 分析 */
    loadAnalysisData() {
      if (!this.cur) return Promise.resolve();
      return visionAnalysisLatest(this.cur).then(res => {
        const analysis = (res && res.data) || null;
        const analysisId = analysis && (analysis.id || analysis.analysisId);
        if (!analysisId) {
          /* 当前卡片无最近一次成功分析且非“分析中(2)”：不管任何切入途径，直接发起 AI 分析 */
          const rec = this.myGoals.find(item => String(item.id) === String(this.cur));
          if (!rec || rec.analysisStatus !== 2) this.startAnalysis(this.cur);
          return null;
        }
        /* 已有分析结果：以 latest 记录作为 detail 汇总、同步 analysisId 与数据时点，并拉取 8.7 全量结构 */
        this.curAnalysisId = analysisId;
        this.analysisDetail = analysis;
        if (analysis.pullTime) this.pullTime = analysis.pullTime;
        if (analysis.analyzeTime) this.anaTime = analysis.analyzeTime;
        return this.loadAnalysisStructure(analysisId);
      }).catch(() => {
        this.analysisStructure = null;
      });
    },

    /* 重置当前愿景的分析完整数据（切换愿景 / 重新发起分析前调用，避免上一愿景数据残留） */
    resetAnalysisData() {
      this.curAnalysisId = '';
      this.analysisDetail = null;
      this.analysisStructure = null;
    },

    /* 拉取分析结果全量结构（8.7）：与标准骨架同构 JSON，填充 analysisStructure */
    loadAnalysisStructure(analysisId) {
      if (!analysisId) {
        this.analysisStructure = null;
        return Promise.resolve();
      }
      return visionAnalysisStructure(analysisId).then(res => {
        this.analysisStructure = this.parseStructure(res && res.data);
      }).catch(() => {
        this.analysisStructure = null;
      });
    },

    /* 结构数据容错解析：后端可能返回 JSON 字符串或已序列化对象，统一转为对象 */
    parseStructure(raw) {
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return null;
        }
      }
      return typeof raw === 'object' ? raw : null;
    },

    /* ============ 目标切换 / Tab / 数据时点 ============ */
    /* 卡片点击：切换当前愿景，四个面板联动刷新（cur 变化触发 watch → loadAnalysisData） */
    handleSelectTarget(record) {
      this.cur = record && record.id ? record.id : '';
    },
    /* 发起 AI 分析（异步）：拿到 analysisId 后进入轮询，直到 isFinished=true；异常由请求拦截器统一提示 */
    startAnalysis(teacherGoalId) {
      this.stopAnalysisPoll();
      this.resetAnalysisData();
      /* 重新分析后页签切回第一个（标准解读），与刷新后的展示焦点保持一致 */
      this.activeTab = 'doc';
      return visionAnalysisStart(teacherGoalId).then(res => {
        const analysisId = res && res.data && (res.data.analysisId || res.data.id);
        this.analyzing = true;
        this.analysisProgress = 0;
        this.analysisProgressText = '分析任务已创建，正在排队…';
        /* 列表先刷新为「分析中」；无 analysisId 时无法轮询，直接收起遮罩 */
        this.loadMyGoals();
        if (analysisId) {
          this.pollAnalysisResult(analysisId);
        } else {
          this.analyzing = false;
        }
      }).catch(() => {
        this.analyzing = false;
      });
    },
    /* 轮询分析进度（8.2）：递归 setTimeout，未完成继续下一轮；结束后按状态刷新或提示失败 */
    pollAnalysisResult(analysisId) {
      this.pollTimer = setTimeout(() => {
        visionAnalysisResult(analysisId).then(res => {
          const data = (res && res.data) || null;
          if (!data) { this.analyzing = false; return; }
          if (typeof data.progress === 'number') this.analysisProgress = data.progress;
          if (data.progressText) this.analysisProgressText = data.progressText;
          if (!data.isFinished) { this.pollAnalysisResult(analysisId); return; }
          this.analyzing = false;
          /* status：1分析中 2成功 3失败 */
          if (data.status === 3) {
            this.toast(data.errorMsg || 'AI 分析失败，请稍后重试');
            this.loadMyGoals();
            return;
          }
          if (data.status === 2) {
            this.toast('AI 分析完成');
            /* 成功：拉取 8.3 详情回写数据时点，再刷新列表与 8.7 全量结构 */
            this.loadAnalysisDetail(analysisId);
            this.loadMyGoals().then(() => this.loadAnalysisData());
          }
        }).catch(() => {
          this.analyzing = false;
        });
      }, ANALYSIS_POLL_INTERVAL);
    },
    /* 拉取分析记录详情（8.3）：回写汇总（含数据时点/结论/AI 小结），并拉取 8.7 全量结构 */
    loadAnalysisDetail(analysisId) {
      if (analysisId) this.curAnalysisId = analysisId;
      return visionAnalysisDetail(analysisId).then(res => {
        const d = (res && res.data) || null;
        if (!d) return;
        this.analysisDetail = d;
        if (d.pullTime) this.pullTime = d.pullTime;
        if (d.analyzeTime) this.anaTime = d.analyzeTime;
        this.stale = false;
      }).catch(() => {}).then(() => this.loadAnalysisStructure(analysisId));
    },
    /* 停止轮询并清空计时器 */
    stopAnalysisPoll() {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    },
    /* 页签切换：只记 activeTab，面板内部展开态由 v-show 保留 */
    handleTabChange(tab) {
      this.activeTab = tab;
    },
    /* 新鲜度条「重新拉取并分析」：对当前愿景重新发起 AI 分析并进入轮询 */
    handleRefresh() {
      if (!this.cur) return;
      this.startAnalysis(this.cur);
    },
    /* 卡片「重新评估」：二次确认后对当前愿景重新发起 AI 分析并轮询 */
    async handleRefreshTarget(record) {
      const name = record ? record.goalName : '';
      try {
        await this.$confirm('<p>确认重新评估吗？</p><p style="margin-top:8px">将按最新档案数据重算「' + name + '」的分析结果。</p>', '重新评估', {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        });
      } catch (e) {
        return;
      }
      /* 重新评估即重新发起 AI 分析并轮询；分析完成后由 pollAnalysisResult 统一刷新时点与明细 */
      this.startAnalysis(record.id);
    },

    /* ============ 愿景添加弹窗 ============ */
    /* 打开添加弹窗（卡片「添加我的成长愿景」与空状态引导两处共用） */
    openPicker() {
      this.goalModalVisible = true;
    },
    /* 目标卡「添加我的成长愿景」 */
    handleAddGoalBtn() {
      this.openPicker();
    },
    /* 空状态引导按钮 */
    handleOpenGoalModal() {
      this.openPicker();
    },
    /* 弹窗「添加并分析」：新增已完成，关闭弹窗、刷新列表并切到最后新增的愿景 */
    async handleGoalAddAnalyse(newId) {
      this.goalModalVisible = false;
      await this.loadMyGoals();
      if (!newId) return;
      /* 切到最后新增的愿景：cur 变化触发 loadAnalysisData，无最近分析则自动发起 AI 分析 */
      this.cur = newId;
    },
    /* 关闭弹窗 */
    handleGoalClose() {
      this.goalModalVisible = false;
    },
    /* 卡片三点菜单「删除」：确认后调 cancel 接口并刷新列表 */
    async handleDeleteGoal(record) {
      const name = record ? record.goalName : '';
      try {
        await this.$confirm('确定删除愿景「' + name + '」吗？删除后该愿景的分析与数据时点将一并清除。', '删除愿景', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        });
      } catch (e) {
        return;
      }
      try {
        await visionTeacherGoalCancel(record.id);
        await this.loadMyGoals();
      } catch (err) {
        /* 接口异常由请求拦截器统一提示 */
      }
    },

    /* ============ 评分项操作弹窗 ============ */
    /* 以下方法成对出现：handleXxx 由操作入口上抛事件后打开弹窗，handleXxxConfirm 接收回写并 toast */
    /* 打开修改弹窗（改分 / 不适用 / 记录取值说明） */
    handleEditScore(item) {
      this.editItem = item;
      this.editDialogVisible = true;
    },
    /* 按弹窗回传的 kind 写入 ov：none 标删除、score 改分值、其余只记取值 */
    handleEditConfirm(payload) {
      if (!payload || !payload.id) { this.editDialogVisible = false; return; }
      const entry = { reason: payload.reason };
      if (payload.kind === 'none') entry.del = true;
      else if (payload.kind === 'score') entry.score = payload.score;
      else entry.value = payload.value;
      this.$set(this.ov, payload.id, entry);
      this.editDialogVisible = false;
      if (payload.kind === 'none') this.toast('已标记「' + payload.name + '」为不适用，总分已重算');
      else if (payload.kind === 'score') this.toast('已修改「' + payload.name + '」分值，总分已重算');
      else this.toast('已记录「' + payload.name + '」的取值说明');
    },
    /* 打开剔除弹窗 */
    handleDeleteScore(item) {
      this.deleteItem = item;
      this.deleteDialogVisible = true;
    },
    /* 确认剔除：仅标 del 并留痕，不删档案原始数据 */
    handleDeleteConfirm(payload) {
      if (payload && payload.id) {
        this.$set(this.ov, payload.id, { del: true, reason: payload.reason || '' });
        this.toast('已剔除「' + payload.name + '」，总分已重算');
      }
      this.deleteDialogVisible = false;
    },
    /* 打开重新取数弹窗 */
    handleRefetch(item) {
      this.refetchItem = item;
      this.refetchDialogVisible = true;
    },
    /* 确认重新取数：删除该项 ov 改动，回到档案原值 */
    handleRefetchConfirm(payload) {
      if (payload && payload.id) {
        this.$delete(this.ov, payload.id);
        this.toast('已按 ' + this.pullTime.slice(5, 16) + ' 的档案重新取数「' + payload.name + '」，手工修改已清除');
      }
      this.refetchDialogVisible = false;
    },

    /* ============ 档案袋跳转（演示占位，正式环境接真实路由或文件服务） ============ */
    /* 差距项「去档案袋补录」：由 pane-cmp 门槛行的「去补录」按钮上抛，取 fix 或要求文本作名称 */
    handleGotoArchive(item) {
      const name = typeof item === 'string' ? item : ((item && (item.fix || item.c)) || '');
      this.$alert('演示：跳转电子档案袋补录「' + name + '」，保存后资格预审自动重判。', '提示', { confirmButtonText: '关闭' });
    },

    /* ============ 轻提示 ============ */
    /* 展示一条 toast 并在 2.4s 后自动收起；连续调用时重置计时器 */
    toast(msg) {
      this.toastMsg = msg;
      this.toastVisible = true;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 2400);
    }
  },
  /* 页面销毁：清理尚未到时的 toast 与轮询计时器，避免卸载后继续请求或回写响应式数据 */
  beforeDestroy() {
    clearTimeout(this.toastTimer);
    this.stopAnalysisPoll();
  }
};
</script>
