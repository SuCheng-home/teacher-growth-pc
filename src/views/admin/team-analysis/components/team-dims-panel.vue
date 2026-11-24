<template>
  <!-- 维度对比：命中组各维度平均分位 + 维度雷达 + 按档案维度分组的得分热力 -->
  <div>
    <section v-if="!hasDimensionData" class="card">
      <div class="empty-tip">命中组暂无维度统计数据（教师 dimensionDataList 为空），请先生成本校教师的维度数据再查看维度对比。</div>
    </section>
    <template v-else>
      <div class="duo2">
        <section class="card">
          <div class="card-head"><h2><i data-lucide="bar-chart-3"></i>各维度组内平均分位</h2><span class="side">绿＝高于本组整体平均，黄＝低于</span></div>
          <div v-for="dim in dimensions" :key="'dim-' + dim.key" class="bar">
            <span :title="dim.title">{{ dim.title }}</span>
            <div class="track"><div class="fill" :style="dimBarStyle(dim)"></div></div>
            <b>{{ dim.avgRatio.toFixed(1) }}<small>%</small></b>
          </div>
          <div class="note"><i data-lucide="info"></i><span>分位口径：组内严格小于本人得分的人数 ÷ 命中教师总数 × 100，即「超过组内 xx% 的人」；条形右侧为本组该维度的平均分位。</span></div>
        </section>
        <section class="card">
          <div class="card-head"><h2><i data-lucide="radar"></i>维度分位雷达</h2><span class="side">共 {{ dimensions.length }} 个维度</span></div>
          <team-radar-chart :dims="dimensionTitles" :values="dimensionRadarVals" label="本组平均分位" aria-label="命中组各维度平均分位雷达" />
        </section>
      </div>

      <section v-if="groupDim" class="card">
        <div class="card-head">
          <h2><i data-lucide="grid-3x3"></i>分组 × 维度 平均得分热力</h2>
          <span class="side">
            分组维度
            <el-select v-model="groupDimKey" size="mini" class="grp-sel">
              <el-option v-for="dim in groupDimOptions" :key="dim.key" :label="dim.label" :value="dim.key" />
            </el-select>
          </span>
        </div>
        <div class="tbl-wrap">
          <el-table :data="heatRows" empty-text="暂无分组数据">
            <el-table-column :label="groupDim.label" min-width="140">
              <template slot-scope="{ row }">
                <div class="item">
                  <b>{{ row.label }}</b>
                  <small>{{ row.count }} 人</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(dim, di) in dimensions"
              :key="'col-' + dim.key"
              :label="dim.title"
              min-width="110"
            >
              <template slot-scope="{ row }">
                <span class="hm" :style="{ background: row.cells[di].bg }"></span> {{ row.cells[di].text }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="note"><i data-lucide="info"></i><span>颜色越深表示该分组在该维度的平均得分越高（以全部分组中的最高均值为参照）；分组取值取自命中教师的档案数据。</span></div>
      </section>
    </template>
  </div>
</template>

<script>
import { mean, dimensionAggregate, groupScoreRows } from '../analysis-helper';
import TeamRadarChart from './team-radar-chart.vue';

// 维度条形高于/低于本组整体平均分位时的填充色
const FILL_ABOVE = '#3f8a72';
const FILL_BELOW = '#c9a05a';
// 雷达分位下限裁剪：0 分位仍保留可见的轴心距离
const RADAR_MIN = 0.05;

export default {
  name: 'TeamDimsPanel',
  components: {
    TeamRadarChart
  },
  props: {
    // 命中教师明细（statData.teacherList，含 dimensionDataList）
    teacherList: { type: Array, default: () => [] },
    // 可勾选的同辈维度：分组热力按其中的枚举维度分组
    dims: { type: Array, default: () => [] }
  },
  data() {
    return {
      // 分组维度为本面板自身展示状态，默认取首个枚举维度
      groupDimKey: ''
    };
  },
  computed: {
    dimensions() {
      return dimensionAggregate(this.teacherList);
    },
    hasDimensionData() {
      return this.dimensions.length > 0;
    },
    // 本组各维度平均分位的整体均值，作条形颜色参照
    overallRatio() {
      return mean(this.dimensions.map((dim) => dim.avgRatio));
    },
    dimensionTitles() {
      return this.dimensions.map((dim) => dim.title);
    },
    dimensionRadarVals() {
      return this.dimensions.map((dim) => Math.max(RADAR_MIN, dim.avgRatio / 100));
    },
    groupDimOptions() {
      return this.dims.filter((dim) => dim.type === 'enum');
    },
    groupDim() {
      return this.groupDimOptions.find((dim) => dim.key === this.groupDimKey) || null;
    },
    heatRows() {
      return this.groupDim ? groupScoreRows(this.teacherList, this.groupDim, this.dimensions) : [];
    }
  },
  watch: {
    // 条件卡上抛的维度变化后校准分组维度：默认取首个枚举维度，当前选中项失效时回落
    dims: {
      immediate: true,
      handler() {
        const exists = this.groupDimOptions.some((dim) => dim.key === this.groupDimKey);
        if (!exists) {
          this.groupDimKey = this.groupDimOptions.length ? this.groupDimOptions[0].key : '';
        }
      }
    }
  },
  methods: {
    dimBarStyle(dim) {
      return {
        width: `${dim.avgRatio.toFixed(1)}%`,
        background: dim.avgRatio >= this.overallRatio ? FILL_ABOVE : FILL_BELOW
      };
    }
  }
};
</script>

<style scoped>
.card-head .side .grp-sel{width:140px;margin-left:8px}
</style>
