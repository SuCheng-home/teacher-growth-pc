<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">VISION CATEGORY</div>
        <h1>愿景分类管理</h1>
      </div>
      <div class="bar">
        <button class="btn sm primary" type="button" @click="openAdd"><i data-lucide="plus"></i>添加目标</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>分类对应教师端「成长愿景」的可选方向，目标按<b>排序值</b>从小到大展示。<b>前置条件</b>是晋升台阶（如「市优秀青年教师」须先获「区优秀青年教师」或「区学科带头人」），标「标准待补」的目标教师端显示「标准待发布」。</span>
    </div>

    <div v-for="categoryGroup in categoryGroupList" :key="categoryGroup.categoryCode" class="card">
      <div class="card-head">
        <h2><i data-lucide="award"></i>{{ categoryGroup.categoryName }}</h2>
        <span class="side">{{ categoryGroup.goals.length }} 个目标</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="categoryGroup.goals" empty-text="暂无目标">
          <el-table-column label="目标" min-width="180">
            <template slot-scope="{ row }">
              <div class="item"><b>{{ row.goalName }}</b></div>
            </template>
          </el-table-column>
          <el-table-column label="排序值" width="90" align="right">
            <template slot-scope="{ row }"><span class="vc-num">{{ row.sortNo }}</span></template>
          </el-table-column>
          <el-table-column label="前置条件" min-width="200">
            <template slot-scope="{ row }">
              <span class="pre-cell">{{ row.preGoalNames }}</span>
              <span v-if="!row.preGoalNames || !row.preGoalNames.length" class="tag mut">无</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template slot-scope="{ row }">
              <span class="tag" :class="goalStatusTagCls(row.status)">{{ goalStatusText(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="启用" width="90">
            <template slot-scope="{ row }">
              <span class="tag" :class="goalEnableTagCls(row.isEnable)">{{ goalEnableText(row.isEnable) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template slot-scope="{ row }">
              <div class="ops">
                <button class="op" type="button" @click="openEdit(row)">编辑</button>
                <button class="op" type="button" @click="removeGoal(row)">删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div v-if="!loading && !categoryGroupList.length" class="card">
      <div class="tbl-wrap">
        <el-table :data="[]" empty-text="暂无愿景分类" />
      </div>
    </div>

    <goal-edit-dialog
      :visible="dialog.visible"
      :record="dialog.record"
      :goal-options="goalOptions"
      @close="dialog.visible = false"
      @saved="handleGoalSaved"
    />
  </div>
</template>

<script>
import GoalEditDialog from './components/goal-edit-dialog.vue';
import { visionCategoryGoalList, visionCategoryDeleteGoal } from '@/api/vision';
import { GOAL_STATUS, GOAL_STATUS_TAG_CLS, GOAL_STATUS_TEXT, GOAL_ENABLE, GOAL_ENABLE_TAG_CLS, GOAL_ENABLE_TEXT } from '@/constants/vision-category';

export default {
  name: 'VisionCategory',
  components: { GoalEditDialog },
  data() {
    return {
      // 愿景目标分组：[{ categoryCode, categoryName, goalCount, goals: [AiVisionGoal] }]
      categoryGroupList: [],
      loading: false,
      dialog: { visible: false, record: null }
    };
  },
  computed: {
    // 全部目标扁平列表，供弹窗「前置条件」按分类筛选候选
    goalOptions() {
      return this.categoryGroupList.reduce((acc, group) => acc.concat(group.goals || []), []);
    }
  },
  created() {
    this.loadGoalList();
  },
  methods: {
    loadGoalList() {
      this.loading = true;
      visionCategoryGoalList().then((res) => {
        this.categoryGroupList = (res && res.data) || [];
      }).catch(() => {
        this.categoryGroupList = [];
      }).then(() => {
        this.loading = false;
      });
    },
    goalStatusText(status) {
      return GOAL_STATUS_TEXT[Number(status)] || GOAL_STATUS_TEXT[GOAL_STATUS.NORMAL];
    },
    goalStatusTagCls(status) {
      return GOAL_STATUS_TAG_CLS[Number(status)] || GOAL_STATUS_TAG_CLS[GOAL_STATUS.NORMAL];
    },
    // 启用文案：历史数据未返回 isEnable 时按启用显示
    goalEnableText(isEnable) {
      return GOAL_ENABLE_TEXT[Number(isEnable)] || GOAL_ENABLE_TEXT[GOAL_ENABLE.YES];
    },
    goalEnableTagCls(isEnable) {
      return GOAL_ENABLE_TAG_CLS[Number(isEnable)] || GOAL_ENABLE_TAG_CLS[GOAL_ENABLE.YES];
    },
    openAdd() {
      this.dialog.record = null;
      this.dialog.visible = true;
    },
    openEdit(goal) {
      this.dialog.record = goal;
      this.dialog.visible = true;
    },
    // 弹窗内部完成保存后回调：关闭弹窗并刷新列表
    handleGoalSaved() {
      this.dialog.visible = false;
      this.loadGoalList();
    },
    async removeGoal(goal) {
      try {
        await this.$confirm('删除目标「' + goal.goalName + '」？', '删除目标', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        });
      } catch (err) {
        return;
      }
      try {
        await visionCategoryDeleteGoal(goal.id);
        this.showToast('已删除目标：' + goal.goalName);
        this.loadGoalList();
      } catch (err) {
        // 删除失败保持原列表，错误提示由请求拦截器给出
      }
    },
    showToast(message) {
      this.$message({ message, duration: 2000 });
    }
  }
};
</script>

<style scoped>
/* 前置条件为晋升台阶原文，字号小于正文，与既有视觉保持一致 */
.pre-cell {
  font-size: 11.5px;
  color: var(--body);
}

.vc-num {
  font-variant-numeric: tabular-nums;
}
</style>
