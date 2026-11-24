<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">AI AUDIT &amp; USAGE</div>
        <h1>对话审计与用量</h1>
      </div>
      <div class="bar">
        <button class="btn sm" type="button" @click="exportDetail"><i data-lucide="download"></i>导出明细</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span><b>全量留痕</b>：谁、何时、问了什么、答了什么、命中哪个接口 / 知识库 / 提示词版本、耗时、token、会话 id、是否被引导跳转。<b>教师删除会话后只计数、不保存内容</b>；<b>查看明细本身也留痕</b>。本页为演示样本。</span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="sigma"></i>总量</h2>
        <span class="side">最近 {{ list.length }} 条演示问答 · token 按人 / 角色 / 日 / 月汇总</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="summaryRows" :show-header="false" empty-text="暂无汇总数据">
          <el-table-column prop="k" width="230">
            <template slot-scope="{ row }">
              <div class="item"><b>{{ row.k }}</b></div>
            </template>
          </el-table-column>
          <el-table-column prop="v" align="right">
            <template slot-scope="{ row }"><span class="aa-num">{{ row.v }}</span></template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="users"></i>按角色汇总</h2>
        <span class="side">点表头排序：角色 / 问答数 / 合计 token</span>
      </div>
      <div class="tbl-wrap">
        <el-table
          :data="roleRows"
          :default-sort="{ prop: 'tt', order: 'descending' }"
          empty-text="暂无数据"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="role" label="角色" min-width="140" sortable="custom">
            <template slot-scope="{ row }"><b>{{ row.role }}</b></template>
          </el-table-column>
          <el-table-column prop="n" label="问答数" min-width="120" align="right" sortable="custom">
            <template slot-scope="{ row }"><span class="aa-num">{{ row.n }}</span></template>
          </el-table-column>
          <el-table-column prop="ti" label="输入 token" min-width="140" align="right" sortable="custom">
            <template slot-scope="{ row }"><span class="aa-num">{{ row.ti }}</span></template>
          </el-table-column>
          <el-table-column prop="to" label="输出 token" min-width="140" align="right" sortable="custom">
            <template slot-scope="{ row }"><span class="aa-num">{{ row.to }}</span></template>
          </el-table-column>
          <el-table-column prop="tt" label="合计 token" min-width="140" align="right" sortable="custom">
            <template slot-scope="{ row }"><b class="aa-num">{{ row.tt }}</b></template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="scroll-text"></i>对话明细</h2>
        <span class="side">最近 {{ list.length }} 条 · 运维审计</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="list" empty-text="暂无对话明细">
          <el-table-column label="时间" width="150">
            <template slot-scope="{ row }"><span class="mono">{{ row.t }}</span></template>
          </el-table-column>
          <el-table-column label="用户（角色）" width="120">
            <template slot-scope="{ row }">{{ row.role }}</template>
          </el-table-column>
          <el-table-column label="问题" min-width="200">
            <template slot-scope="{ row }">
              <div class="item"><b>{{ row.q }}</b></div>
            </template>
          </el-table-column>
          <el-table-column label="回答摘要" min-width="280">
            <template slot-scope="{ row }"><span class="aa-answer">{{ row.a }}</span></template>
          </el-table-column>
          <el-table-column label="命中来源" min-width="190">
            <template slot-scope="{ row }"><small>{{ row.hit }}</small></template>
          </el-table-column>
          <el-table-column label="耗时" width="90" align="right">
            <template slot-scope="{ row }"><span class="aa-num">{{ row.ms }}ms</span></template>
          </el-table-column>
          <el-table-column label="token 入 / 出 / 合计" width="160" align="right">
            <template slot-scope="{ row }">
              <span class="aa-num">{{ row.ti }} / {{ row.to }} / <b>{{ row.ti + row.to }}</b></span>
            </template>
          </el-table-column>
          <el-table-column label="会话 id" width="150">
            <template slot-scope="{ row }"><span class="mono">{{ row.sid }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="170" fixed="right">
            <template slot-scope="{ row }">
              <div class="ops">
                <span v-if="row.jump" class="tag bl">已引导跳转 · {{ row.jump }}</span>
                <button v-else class="op" type="button" @click="viewDetail(row)">查看</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="doc-note">涉及他人数据的越权查询已被行级权限在网关挡掉，不会进入会话；<b>本页不展示任何教师姓名</b>。</div>
    </div>
  </div>
</template>

<script>
import { AI_AUDIT, AI_AUDIT_DEL } from '../admin-data';

export default {
  name: 'AdminAiAudit',
  data() {
    return {
      list: AI_AUDIT.map((a) => ({ ...a })),
      del: AI_AUDIT_DEL,
      sortKey: 'tt',
      sortDir: -1
    };
  },
  computed: {
    sumTI() {
      return this.list.reduce((s, a) => s + a.ti, 0);
    },
    sumTO() {
      return this.list.reduce((s, a) => s + a.to, 0);
    },
    // 总量卡片按「指标 / 取值」两列展示，用行数据驱动 el-table
    summaryRows() {
      return [
        { k: '问答条数', v: this.list.length },
        { k: '输入 token / 输出 token', v: this.sumTI + ' / ' + this.sumTO },
        { k: '合计 token', v: this.sumTI + this.sumTO },
        { k: '已删除会话（仅计数 · 内容不保存）', v: this.del }
      ];
    },
    roleRows() {
      const map = {};
      this.list.forEach((a) => {
        if (!map[a.role]) map[a.role] = { role: a.role, n: 0, ti: 0, to: 0, tt: 0 };
        map[a.role].n += 1;
        map[a.role].ti += a.ti;
        map[a.role].to += a.to;
        map[a.role].tt += a.ti + a.to;
      });
      const arr = Object.values(map);
      const k = this.sortKey;
      arr.sort((x, y) => {
        if (k === 'role') return x.role.localeCompare(y.role, 'zh') * this.sortDir;
        return (x[k] - y[k]) * this.sortDir;
      });
      return arr;
    }
  },
  methods: {
    // el-table 表头排序：prop 与 roleRows 的字段同名，直接回写排序状态
    handleSortChange({ prop, order }) {
      if (!order) {
        this.sortKey = 'tt';
        this.sortDir = -1;
        return;
      }
      this.sortKey = prop;
      this.sortDir = order === 'ascending' ? 1 : -1;
    },
    viewDetail(a) {
      this.showToast('演示：查看会话 ' + a.sid + ' 明细（查看行为已留痕）');
    },
    exportDetail() {
      this.showToast('演示：导出对话明细 CSV');
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>

<style scoped>
.aa-num {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* 回答摘要为长文本，限制单列宽度避免横向溢出 */
.aa-answer {
  display: inline-block;
  max-width: 320px;
  word-break: break-word;
}
</style>
