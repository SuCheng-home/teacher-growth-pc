<template>
  <div v-if="visible" class="goal-mask" id="goal-mask">
    <div class="goal-modal">
      <div class="gm-head">
        <button class="gm-close" type="button" title="关闭" aria-label="关闭" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="eyebrow">ADD GOAL</div>
        <h3>添加我的成长愿景</h3>
        <p>按分类列出可选目标的评比标准（口径）；每个分类只能选一个标准、不同分类可各选一个，勾选后点底部「添加并分析」统一新增；已添加过的标准显示为「已添加」且不可重复添加，如需移除请在对应愿景卡片上删除。</p>
      </div>
      <div class="gm-body ft">
        <div class="add-area">
          <div v-if="loading" class="add-t">正在加载可选目标…</div>
          <div v-else-if="!groupList.length" class="add-t">暂无可选的目标标准</div>
          <div v-else class="add-groups">
            <div v-for="grp in groupList" :key="grp.categoryCode" class="add-g">
              <span class="add-gt">{{ grp.categoryName }}</span>
              <div class="add-chips">
                <button
                  v-for="std in grp.standards"
                  :key="std.id"
                  class="add-chip"
                  :class="{ added: isAdded(std), picked: isPicked(std) }"
                  type="button"
                  :disabled="isAdded(std) || submitting"
                  :title="isAdded(std) ? '已在我的愿景中' : (isPicked(std) ? '点击取消选择' : '点击选择')"
                  @click="chipClick(std)"
                >
                  <span class="ac-h"><span class="ac-n">{{ std.goalName }}</span><i v-if="isAdded(std)">已添加</i><i v-else-if="isPicked(std)">待添加</i></span>
                  <span v-if="std.standardName" class="ac-v">{{ std.standardName }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="gm-foot">
        <span class="cnt">{{ pendingIds.length ? '已选 ' + pendingIds.length + ' 个待添加愿景' : '尚未选择愿景' }}</span>
        <button class="gm-confirm" type="button" :disabled="submitting || !pendingIds.length" @click="handleAddAndAnalyse">{{ submitting ? '添加中…' : '添加并分析' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { visionTeacherGoalGoalOptions, visionTeacherGoalAdd } from '@/api/vision';

export default {
  name: 'GoalModal',
  props: {
    visible: { type: Boolean, default: false },
    /* 我的愿景列表（AiVisionTeacherGoal 数组）：用于标记已添加的标准 */
    myList: { type: Array, default: () => [] }
  },
  data() {
    return {
      /* 可选目标标准列表（AiVisionStandard 数组） */
      options: [],
      loading: false,
      /* 本地暂存的待添加标准 id（String）：勾选只改此集合，点「添加并分析」时才真正调新增接口 */
      pendingIds: [],
      /* 最后一次成功新增的愿景记录 id：上抛给父组件用于切换卡片并发起分析 */
      lastAddedId: '',
      /* 新增提交中标记：防重复点击 */
      submitting: false
    };
  },
  computed: {
    /* 按分类分组，保持接口返回的分类/目标/标准顺序 */
    groupList() {
      const map = {};
      const order = [];
      this.options.forEach(std => {
        const code = std.categoryCode || '';
        if (!map[code]) {
          map[code] = { categoryCode: code, categoryName: std.categoryName || '未分类', standards: [] };
          order.push(code);
        }
        map[code].standards.push(std);
      });
      return order.map(code => map[code]);
    }
  },
  watch: {
    visible(val) {
      /* 每次打开重置勾选与新增进度，避免上次残留影响本次选择 */
      if (val) {
        this.pendingIds = [];
        this.lastAddedId = '';
        this.loadOptions();
      }
    }
  },
  methods: {
    /* 拉取可选目标标准列表（打开弹窗时刷新，达成情况可能变化） */
    loadOptions() {
      this.loading = true;
      visionTeacherGoalGoalOptions().then(res => {
        this.options = (res && res.data) || [];
      }).catch(() => {
        this.options = [];
      }).then(() => {
        this.loading = false;
      });
    },
    /* 标准对应的已选记录（按 standardId 匹配） */
    recordOf(std) {
      return this.myList.find(item => String(item.standardId) === String(std.id));
    },
    isAdded(std) {
      return !!this.recordOf(std);
    },
    /* 是否已本地勾选（待添加） */
    isPicked(std) {
      return this.pendingIds.indexOf(String(std.id)) > -1;
    },
    /* 点选：只本地勾选/取消；同一分类下单选（改选会自动取消同类其它勾选），不同分类可各选一个 */
    chipClick(std) {
      if (this.submitting || this.isAdded(std)) return;
      const id = String(std.id);
      const idx = this.pendingIds.indexOf(id);
      if (idx > -1) {
        this.pendingIds.splice(idx, 1);
        return;
      }
      /* 同一分类（categoryCode）下先移除已勾选的其它标准，保证同类单选 */
      const code = std.categoryCode || '';
      this.pendingIds = this.pendingIds.filter(pid => {
        const opt = this.options.find(o => String(o.id) === pid);
        return !opt || (opt.categoryCode || '') !== code;
      });
      this.pendingIds.push(id);
    },
    /* 添加并分析：将勾选且尚未添加的标准一次性批量提交（已添加项被过滤），取最后新增的记录 id 上抛父组件切卡并发起分析 */
    handleAddAndAnalyse() {
      if (this.submitting || !this.pendingIds.length) return;
      /* 仅取已勾选且尚未添加的标准，拼成后端批量接口需要的「目标+标准」组合数组 */
      const combos = this.options
        .filter(std => this.isPicked(std) && !this.isAdded(std))
        .map(std => ({ goalId: std.goalId, standardId: std.id }));
      if (!combos.length) { this.$emit('close'); return; }
      this.submitting = true;
      visionTeacherGoalAdd(combos).then(res => {
        this.submitting = false;
        /* 批量响应为写入后的记录数组，取最后一条的 id 作为切卡与发起分析的目标 */
        const list = (res && res.data) || [];
        const last = Array.isArray(list) ? list[list.length - 1] : list;
        this.lastAddedId = last && last.id ? String(last.id) : '';
        this.$emit('add-analyse', this.lastAddedId);
      }).catch(() => {
        this.submitting = false;
        /* 接口异常由请求拦截器统一提示；批量整体失败时无新增记录，仅通知父组件刷新并关闭 */
        this.$emit('add-analyse', '');
      });
    }
  }
};
</script>
