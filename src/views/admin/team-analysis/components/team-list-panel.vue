<template>
  <!-- 明细清单：命中教师的档案取值与组内各维度得分/名次/分位（数据全部来自统计接口返回的 teacherList） -->
  <section v-if="listRows.length" class="card">
    <div class="card-head"><h2><i data-lucide="list"></i>命中教师明细</h2><span class="side">{{ teacherList.length }} 人</span></div>
    <div class="tbl-wrap">
      <el-table :data="listRows" empty-text="当前条件下没有命中的教师。">
        <el-table-column label="姓名" min-width="100">
          <template slot-scope="{ row }">
            <div class="item">
              <b>{{ row.name }}</b>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(dim, di) in dims"
          :key="'col-' + dim.key"
          :label="dim.label"
          min-width="120"
        >
          <template slot-scope="{ row }">{{ row.archives[di] }}</template>
        </el-table-column>
        <el-table-column
          v-for="(dimension, ci) in dimensions"
          :key="'cold-' + dimension.key"
          :label="dimension.title"
          min-width="120"
          align="right"
        >
          <template slot-scope="{ row }">
            <b>{{ row.dimensions[ci].score }}</b>
            <small class="dm-sub">第 {{ row.dimensions[ci].rank }} 名 · 超过 {{ row.dimensions[ci].ratio }}%</small>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="teacherList.length > page.pageSize" class="card-foot">
      <el-pagination
        small
        layout="prev, pager, next"
        :current-page="page.currentPage"
        :page-size="page.pageSize"
        :total="teacherList.length"
        @current-change="handlePageChange"
      />
    </div>
    <div class="note"><i data-lucide="shield-check"></i><span>列取自本次命中组涉及的绑定指标档案字段；维度列为该教师在命中组内的得分、名次与分位（超过组内 xx% 的人）。校管理员查看个人明细将全程留痕。</span></div>
  </section>
  <section v-else class="card"><div class="empty-tip">当前条件下没有命中的教师。</div></section>
</template>

<script>
import { dimensionAggregate, dimensionDataMap, archiveValueOf, archiveTextOf } from '../analysis-helper';
import { computedFieldValue } from '@/utils/archive';

// 单页行数：明细为本地分页（接口一次返回命中组全量）
const PAGE_SIZE = 20;
// 空值占位符
const PLACEHOLDER = '—';

export default {
  name: 'TeamListPanel',
  props: {
    // 命中教师明细（statData.teacherList：原始档案数据 + dimensionDataList）
    teacherList: { type: Array, default: () => [] },
    // 可勾选的同辈维度：决定明细表展示哪些档案字段列
    dims: { type: Array, default: () => [] }
  },
  data() {
    return {
      page: { currentPage: 1, pageSize: PAGE_SIZE }
    };
  },
  computed: {
    dimensions() {
      return dimensionAggregate(this.teacherList);
    },
    // 全量明细行：档案列按维度顺序取值，维度列按聚合顺序取分
    allRows() {
      return this.teacherList.map((row) => {
        const dataMap = dimensionDataMap(row);
        return {
          name: row.userName || PLACEHOLDER,
          archives: this.dims.map((dim) => this.archiveCellText(row, dim)),
          dimensions: this.dimensions.map((dimension) => {
            const item = dataMap[dimension.key];
            if (!item) return { score: PLACEHOLDER, rank: PLACEHOLDER, ratio: PLACEHOLDER };
            return {
              score: item.score,
              rank: item.rankNo === undefined || item.rankNo === null ? PLACEHOLDER : item.rankNo,
              ratio: item.ratio === undefined || item.ratio === null ? PLACEHOLDER : Number(item.ratio).toFixed(1)
            };
          })
        };
      });
    },
    listRows() {
      const start = (this.page.currentPage - 1) * this.page.pageSize;
      return this.allRows.slice(start, start + this.page.pageSize);
    }
  },
  watch: {
    // 命中组变化后回到首行，避免停留在越界页码
    teacherList() {
      this.page.currentPage = 1;
    }
  },
  methods: {
    handlePageChange(currentPage) {
      this.page.currentPage = currentPage;
    },
    // 档案列取值：复用档案库 computedFieldValue 按字段类型渲染（枚举翻译、日期区间、开关、城市级联等），
    // 字段元信息缺失或类型未覆盖时回退到原有候选项翻译，最后兜底占位符
    archiveCellText(row, dim) {
      if (dim.field) {
        const text = computedFieldValue(dim.field, archiveValueOf(row, dim), PLACEHOLDER);
        if (text) return text;
      }
      return archiveTextOf(row, dim) || PLACEHOLDER;
    }
  }
};
</script>

<style scoped>
/* 分页靠右，与管理端列表页保持一致 */
.card-foot{display:flex;justify-content:flex-end;margin-top:14px}
/* 维度单元格：得分为主、名次与分位为辅，两行紧凑排布 */
.dm-sub{display:block;font-size:10px;color:var(--muted)}
</style>
