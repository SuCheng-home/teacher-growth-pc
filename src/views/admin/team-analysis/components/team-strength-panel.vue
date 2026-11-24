<template>
  <!-- 强弱项与标杆：命中组平均分位最高/最低的维度 + 各维度组内第一 -->
  <div>
    <section v-if="!hasDimensionData" class="card">
      <div class="empty-tip">命中组暂无维度统计数据（教师 dimensionDataList 为空），请先生成本校教师的维度数据再查看强弱项。</div>
    </section>
    <template v-else>
      <div class="duo">
        <section class="card">
          <div class="card-head"><h2><i data-lucide="trending-up"></i>组内表现最强的维度</h2><span class="side">本组 {{ teacherList.length }} 人</span></div>
          <div class="chip-row">
            <template v-if="strongDims.length"><span v-for="d in strongDims" :key="'hi-' + d.key" class="chip hi">{{ d.title }} {{ d.avgRatio.toFixed(1) }}%</span></template>
            <span v-else class="chip">暂无</span>
          </div>
          <div class="note"><i data-lucide="info"></i><span>按命中组各维度平均分位排序，取最高的 {{ rankDimCount }} 项。</span></div>
        </section>
        <section class="card">
          <div class="card-head"><h2><i data-lucide="trending-down"></i>组内最薄弱的维度</h2><span class="side">本组 {{ teacherList.length }} 人</span></div>
          <div class="chip-row">
            <template v-if="weakDims.length"><span v-for="d in weakDims" :key="'lo-' + d.key" class="chip lo">{{ d.title }} {{ d.avgRatio.toFixed(1) }}%</span></template>
            <span v-else class="chip">暂无</span>
          </div>
          <div class="note"><i data-lucide="info"></i><span>按命中组各维度平均分位排序，取最低的 {{ rankDimCount }} 项，建议作为该群体的定向培养切入点。</span></div>
        </section>
      </div>

      <section class="card">
        <div class="card-head"><h2><i data-lucide="award"></i>最高维度与最薄弱维度</h2><span class="side">组内口径 · 附标杆教师</span></div>
        <div class="bench-dim-grid">
          <div>
            <div class="bench-dim-cap">平均分位最高的维度</div>
            <div class="bench-dim-main">「{{ bestDim.title }}」组内平均 {{ bestDim.avgRatio.toFixed(1) }}%</div>
            <div class="bench-dim-sub">该维度组内第一（{{ bestMark.score }} 分）：<b class="bench-dim-hl">{{ nameText(bestMark) }}</b></div>
          </div>
          <div>
            <div class="bench-dim-cap">平均分位最低的维度</div>
            <div class="bench-dim-main">「{{ worstDim.title }}」组内平均 {{ worstDim.avgRatio.toFixed(1) }}%</div>
            <div class="bench-dim-sub">该维度组内第一（{{ worstMark.score }} 分）：<b class="bench-dim-hl">{{ nameText(worstMark) }}</b></div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2><i data-lucide="trophy"></i>各维度组内标杆</h2><span class="side">并列第一全部列出</span></div>
        <div class="tbl-wrap">
          <el-table :data="benchmarks" empty-text="暂无标杆数据">
            <el-table-column label="维度" min-width="140">
              <template slot-scope="{ row }">
                <div class="item">
                  <b>{{ row.title }}</b>
                  <small>共 {{ row.names.length }} 人</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="标杆得分" width="120" align="right">
              <template slot-scope="{ row }">{{ row.names.length ? row.score : '—' }}</template>
            </el-table-column>
            <el-table-column label="组内第一（rankNo=1）" min-width="220">
              <template slot-scope="{ row }">{{ nameText(row) }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div class="note"><i data-lucide="shield-check"></i><span>校管理员查看教师个人明细将全程留痕。得分与名次均基于命中组内重算，更换筛选条件后组内标杆随之变化。</span></div>
      </section>
    </template>
  </div>
</template>

<script>
import { dimensionAggregate, dimensionBenchmarks } from '../analysis-helper';

// 强/弱项各取前 N 个维度
const RANK_DIM_COUNT = 3;
// 标杆教师默认展示的人数上限，超出折叠为「等 X 人」
const NAME_LIMIT = 3;
// 无人命中该维度时的占位
const PLACEHOLDER = '—';

export default {
  name: 'TeamStrengthPanel',
  props: {
    // 命中教师明细（statData.teacherList，含 dimensionDataList）
    teacherList: { type: Array, default: () => [] }
  },
  computed: {
    dimensions() {
      return dimensionAggregate(this.teacherList);
    },
    hasDimensionData() {
      return this.dimensions.length > 0;
    },
    rankDimCount() {
      return Math.min(RANK_DIM_COUNT, this.dimensions.length);
    },
    // 按平均分位从高到低排序的维度
    rankedDims() {
      return [...this.dimensions].sort((a, b) => b.avgRatio - a.avgRatio);
    },
    strongDims() {
      return this.rankedDims.slice(0, this.rankDimCount);
    },
    weakDims() {
      return this.rankedDims.slice(-this.rankDimCount).sort((a, b) => a.avgRatio - b.avgRatio);
    },
    bestDim() {
      return this.rankedDims[0] || {};
    },
    worstDim() {
      return this.rankedDims[this.rankedDims.length - 1] || {};
    },
    benchmarks() {
      return this.hasDimensionData ? dimensionBenchmarks(this.teacherList, this.dimensions) : [];
    },
    bestMark() {
      return this.markOf(this.bestDim);
    },
    worstMark() {
      return this.markOf(this.worstDim);
    }
  },
  methods: {
    markOf(dimension) {
      return this.benchmarks.find((mark) => mark.key === dimension.key) || { score: 0, names: [] };
    },
    nameText(mark) {
      const names = (mark && mark.names) || [];
      if (!names.length) return PLACEHOLDER;
      if (names.length <= NAME_LIMIT) return names.join('、');
      return `${names.slice(0, NAME_LIMIT).join('、')} 等 ${names.length} 人`;
    }
  }
};
</script>

<style scoped>
/* 类名避开全局 .bench-grid（growth-peer 三栏布局），仅本页两栏口径 */
.bench-dim-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.bench-dim-cap{font-size:11px;color:var(--muted);margin-bottom:6px}
.bench-dim-main{font-size:15px;color:var(--ink);font-weight:600}
.bench-dim-sub{font-size:11.5px;color:var(--muted);margin-top:6px}
.bench-dim-hl{color:var(--ink)}
</style>
