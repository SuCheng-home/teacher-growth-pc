<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">SCORE TIERS</div>
        <h1>分数段类型设置</h1>
      </div>
      <div class="bar">
        <button class="btn sm primary" type="button" @click="openCreate"><i data-lucide="plus"></i>新增类型</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>本页定义教师画像<b>综合指数（0–100）</b>与<b>教师类型</b>的映射：画像头部按命中档位显示「档位N：类型名称」，徽章颜色取档位配置色。命中规则为<b>按下限降序取第一个「综合指数 ≥ 下限」的档位</b>；上限可空＝无上限（最高档留空，显示「X 分及以上」），启用档位下限<b>不允许重复</b>；综合指数未命中任何档位时回退到下限最低的档位。</span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="medal"></i>类型档位列表</h2>
        <span class="side">{{ listSummary }}</span>
      </div>
      <div class="tbl-wrap">
        <el-table
          v-loading="loading"
          :data="sortedList"
          empty-text="还没有类型档位，点右上角「新增类型」。"
          style="width:100%"
        >
          <el-table-column label="档位" width="90">
            <template slot-scope="{ row }">
              <span class="st-num">档位 {{ row.levelNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="教师类型" min-width="170">
            <template slot-scope="{ row }">
              <div class="item">
                <b class="st-name">
                  <span class="st-dot" :style="{ background: row.color || defaultBadgeColor }"></span>{{ row.typeName }}
                </b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="分数段" width="140">
            <template slot-scope="{ row }">
              <span class="st-num">{{ formatScope(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型特征" min-width="220">
            <template slot-scope="{ row }">{{ row.typeDesc || '—' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="95">
            <template slot-scope="{ row }">
              <span class="tag" :class="isEnabled(row) ? 'ok' : 'mut'">{{ isEnabled(row) ? '启用' : '停用' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="190" fixed="right">
            <template slot-scope="{ row }">
              <div class="ops st-ops">
                <button
                  class="op"
                  :class="isEnabled(row) ? 'op-disable' : 'op-enable'"
                  type="button"
                  @click="toggleEnable(row)"
                >{{ isEnabled(row) ? '停用' : '启用' }}</button>
                <button class="op op-edit" type="button" @click="openEdit(row)">编辑</button>
                <button class="op op-delete" type="button" @click="removeType(row)">删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="warn-note" style="margin:14px 0 0">
        <i data-lucide="triangle-alert"></i>
        <span><b>校验</b>：保存时校验分数段下限必填且取值 0–100、启用档位下限不重复、上限（若填写）须大于下限；档位数不限，建议 3–7 档。类型名称将直接展示在教师画像头部，避免出现评审结论性用词。</span>
      </div>
    </div>

    <score-type-dialog
      :visible="dialogVisible"
      :record="dialogRecord"
      :records="list"
      :saving="saving"
      @close="dialogVisible = false"
      @confirm="saveType"
    />
  </div>
</template>

<script>
/* 页面级子组件：新增/编辑类型档位弹窗 */
import ScoreTypeDialog from './components/score-type-dialog.vue';
import {
  profileScoreTypeSetDelete,
  profileScoreTypeSetList,
  profileScoreTypeSetSave,
  profileScoreTypeSetUpdateEnable
} from '@/api/profile-score-type';
import {
  DEFAULT_BADGE_COLOR,
  IS_ENABLE,
  formatScoreScope
} from '@/constants/profile-score-type';

export default {
  name: 'AdminPortraitScoreType',
  components: {
    ScoreTypeDialog
  },
  data() {
    return {
      // 档位列表来自设置页接口（含停用），按 minScore 降序
      list: [],
      loading: false,
      saving: false,
      dialogVisible: false,
      dialogRecord: null,
      defaultBadgeColor: DEFAULT_BADGE_COLOR
    };
  },
  computed: {
    // 命中按分数段下限降序，列表顺序与命中顺序保持一致
    sortedList() {
      return this.list.slice().sort((a, b) => Number(b.minScore) - Number(a.minScore));
    },
    enabledCount() {
      return this.list.filter((item) => this.isEnabled(item)).length;
    },
    listSummary() {
      return this.list.length + ' 档 · 启用 ' + this.enabledCount + ' 档 · 按下限降序命中，未命中回退下限最低档';
    }
  },
  created() {
    this.loadList();
  },
  methods: {
    // 区间文案：上限为空时显示「X 分及以上」
    formatScope(record) {
      return formatScoreScope(record);
    },
    isEnabled(record) {
      return Number(record.isEnable) === IS_ENABLE.ENABLE;
    },
    async loadList() {
      this.loading = true;
      try {
        const res = await profileScoreTypeSetList();
        this.list = (res && res.data) || [];
      } catch (err) {
        // 异常提示由请求拦截器统一给出，列表置空避免展示过期数据
        this.list = [];
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.dialogRecord = null;
      this.dialogVisible = true;
    },
    openEdit(record) {
      this.dialogRecord = record;
      this.dialogVisible = true;
    },
    // 新增与编辑共用同一个保存接口：带 id 为编辑，否则新增
    async saveType(payload) {
      this.saving = true;
      try {
        await profileScoreTypeSetSave(payload);
        this.showToast((payload.id ? '已保存「' : '已新增「') + payload.typeName + '」');
        this.dialogVisible = false;
        this.loadList();
      } catch (err) {
        // 保存失败保持弹窗可重试，错误提示由请求拦截器给出
      } finally {
        this.saving = false;
      }
    },
    // 启停直接落库：停用后画像端不再命中该档位
    async toggleEnable(record) {
      const nextIsEnable = this.isEnabled(record) ? IS_ENABLE.DISABLE : IS_ENABLE.ENABLE;
      if (nextIsEnable === IS_ENABLE.DISABLE && this.enabledCount <= 1) {
        this.showToast('至少保留一个启用档位', 'warning');
        return;
      }
      try {
        await profileScoreTypeSetUpdateEnable(record.id, nextIsEnable);
        const isEnabled = nextIsEnable === IS_ENABLE.ENABLE;
        // 启用为正向结果给 success，停用属于警示性操作给 warning
        this.showToast('「' + record.typeName + '」已' + (isEnabled ? '启用' : '停用'), isEnabled ? 'success' : 'warning');
        this.loadList();
      } catch (err) {
        // 状态未变更时不改动列表，错误提示由请求拦截器给出
      }
    },
    async removeType(record) {
      try {
        await this.$confirm('确定删除档位「' + record.typeName + '」吗？删除后画像端将不再命中该档位。', '删除档位', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        });
      } catch (err) {
        return;
      }
      try {
        await profileScoreTypeSetDelete(record.id);
        this.showToast('已删除「' + record.typeName + '」', 'success');
        this.loadList();
      } catch (err) {
        // 删除失败列表保持原样，错误提示由请求拦截器给出
      }
    },
    showToast(message, type = 'success') {
      this.$message({ message, type, duration: 2000 });
    }
  }
};
</script>

<style scoped>
/* 操作列按动作结果着色：启用/编辑为品牌绿、停用为警示黄、删除为警示红 */
.st-ops .op-enable,
.st-ops .op-edit {
  color: var(--green);
  border-color: #cfe0d6;
}

.st-ops .op-enable:hover,
.st-ops .op-edit:hover {
  background: var(--hi-bg);
  border-color: var(--green);
}

.st-ops .op-disable {
  color: var(--wait);
  border-color: #f0e2c6;
}

.st-ops .op-disable:hover {
  background: var(--wait-bg);
  border-color: var(--wait);
}

.st-ops .op-delete {
  color: var(--no);
  border-color: #ecc9bd;
}

.st-ops .op-delete:hover {
  background: var(--no-bg);
  border-color: var(--no);
}

/* 档位与分数段列：数字等宽，避免不同档位宽度跳动 */
.st-num {
  font-variant-numeric: tabular-nums;
}

/* 教师类型前的徽章色块，取档位配置色 */
.st-name {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.st-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
</style>
