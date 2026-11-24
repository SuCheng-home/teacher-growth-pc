<template>
  <div class="pane" id="pane-cmp">
    <div v-if="loading" class="stub-hint">正在加载逐条比对结果…</div>
    <div v-else-if="!hasData" class="stub-hint">暂无逐条比对数据</div>
    <template v-else>
      <!-- 一、资格门槛逐条比对（数据来源：8.7 analysisStructure 的 gates，按 group 分组） -->
      <div v-if="gates.length" class="cmp-sec">
        <div class="cmp-h">
          <span class="cmp-n">1</span>
          <b>资格门槛逐条比对（{{ gateCount }} 条）</b>
          <span class="cmp-s">系统自动判定·任一条件不符合即不具备申报资格</span>
        </div>
        <div v-for="(group, gi) in gates" :key="'gg' + gi" class="cmp-group">
          <div class="cat-band">
            <b>{{ group.group || '资格门槛' }}</b>
            <span class="cl"></span>
          </div>
          <div class="table-scroll">
            <table class="cmp-table cmp-table-gate">
              <thead><tr><th>条件</th><th>标准要求</th><th>本人档案情况</th><th>判定</th><th>数据来源</th><th>办理方式</th></tr></thead>
              <tbody>
                <tr
                  v-for="row in gateRows(group, gi)"
                  :key="row.key"
                  :class="row.isBasis ? 'row-basis' : (row.item.judge === 'pass' ? '' : 'row-gate-warn')"
                  v-show="!row.isBasis || isExpanded(row.bk)"
                >
                  <template v-if="!row.isBasis">
                    <td class="c1">{{ row.item.checkItem }}</td>
                    <td class="gate-req">{{ row.item.requirement || '—' }}</td>
                    <td class="gate-val">{{ row.item.teacherValue || '—' }}</td>
                    <td>
                      <span class="g-judge" :class="row.item.judge || 'pending'">
                        <svg v-if="row.item.judge === 'pass'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
                        {{ judgeLabel(row.item.judge) }}
                      </span>
                    </td>
                    <td><span class="g-src">系统自动判定</span></td>
                    <td class="ops">
                      <div class="row-ops2">
                        <span v-if="row.item.judge === 'pass'" class="noop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>无需办理</span>
                        <span v-else-if="row.item.fixSuggestion" class="g-act">{{ row.item.fixSuggestion }}</span>
                        <button class="op" type="button" @click="toggleBasis(row.bk)">{{ isExpanded(row.bk) ? '收起' : '依据' }}</button>
                      </div>
                    </td>
                  </template>
                  <td v-else colspan="6">
                    <div class="basis-box">
                      <div v-if="row.item.standardBasis" class="bb-item"><span class="tag s">标准原文</span><span>{{ row.item.standardBasis }}</span></div>
                      <div v-if="row.item.archiveBasis" class="bb-item"><span class="tag a">档案依据</span><span>{{ row.item.archiveBasis }}</span></div>
                      <div v-if="row.item.fixSuggestion" class="bb-item"><span class="tag o">补齐建议</span><span>{{ row.item.fixSuggestion }}</span></div>
                      <div v-if="recordRows(row.item.records).list.length" class="bb-item">
                        <span class="tag a">支撑记录</span>
                        <!-- 记录为动态中文键对象，按字段并集渲染成小表格 -->
                        <table class="bb-rec">
                          <thead>
                            <tr>
                              <th v-for="col in recordRows(row.item.records).cols" :key="col">{{ col }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(rc, ri) in recordRows(row.item.records).list" :key="'gr' + ri">
                              <td v-for="col in recordRows(row.item.records).cols" :key="col">{{ rc[col] }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 二、材料评分项逐条比对（数据来源：8.7 analysisStructure 的 scoreItems，按 category 分组） -->
      <div v-if="scoreItems.length" class="cmp-sec" :class="{ 'cmp-sec-gap': gates.length }">
        <div class="cmp-h">
          <span class="cmp-n">{{ gates.length ? 2 : 1 }}</span>
          <b>材料评分项逐条比对（{{ scoredCount }} 项）</b>
          <span class="cmp-s">点「依据」查看标准原文与取数说明；办理方式仅展示办理建议</span>
        </div>
        <div class="legend-bar">
          <span class="lg-l">数据来源：</span>
          <span class="lg-i m-chip auto">自动</span>系统读取
          <span class="lg-i m-chip auto2">半自动</span>本人确认
          <span class="lg-i m-chip pick">手动 · 选</span>本人从档案中勾选
          <span class="lg-i m-chip fill">手动 · 补</span>本人补录
          <span class="lg-i m-chip school">学校填</span>教务处提供
          <span class="lg-i m-chip manual">人工评审</span>评审组评分
          <span class="lg-i m-chip tbd">待原文</span>细目待确认
        </div>
        <div v-for="(group, gi) in scoreItems" :key="'sg' + gi" class="cmp-group">
          <div class="cat-band">
            <b>{{ group.category || '未分类' }}</b>
            <span v-if="group.categorySub" class="sub">类小计 <span class="num">{{ group.categorySub }}</span></span>
            <span class="cl"></span>
          </div>
          <div class="table-scroll">
            <table class="cmp-table cmp-table-score">
              <thead><tr><th>评分项</th><th>数据来源</th><th>满分</th><th>材料分</th><th>差距</th><th>办理方式</th><th>操作</th></tr></thead>
              <tbody>
                <tr
                  v-for="row in scoreRows(group, gi)"
                  :key="row.key"
                  :class="row.rowClass"
                  v-show="!row.isBasis || isExpanded(row.bk)"
                >
                  <template v-if="!row.isBasis">
                    <td class="c1">{{ row.item.itemName }}<span v-if="row.isSum" class="tag mut">合计</span></td>
                    <td><span class="m-chip" :class="row.item.dataSource">{{ dataSourceLabel(row.item.dataSource) }}</span></td>
                    <td class="num">{{ row.item.fullScore != null ? row.item.fullScore : '原文未设' }}</td>
                    <td class="num"><b v-if="row.item.score != null">{{ row.item.score }}</b><template v-else>—</template></td>
                    <td class="num" :class="row.item.gap != null && row.item.gap < 0 ? 'negative' : ''">{{ row.item.gap != null ? row.item.gap : '—' }}</td>
                    <td>
                      <span v-if="row.isSum" class="noop">合计项</span>
                      <span v-else-if="!row.item.teacherAction || row.item.teacherAction === 'none'" class="noop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 7"/></svg>无需办理</span>
                      <template v-else>
                        <span class="act-tag">{{ actionLabel(row.item.teacherAction) }}</span>
                        <div v-if="row.item.suggestion && row.item.suggestion !== '—'" class="cmp-sug">{{ row.item.suggestion }}</div>
                      </template>
                    </td>
                    <td class="ops">
                      <div class="row-ops2">
                        <button class="op" type="button" @click="toggleBasis(row.bk)">{{ isExpanded(row.bk) ? '收起' : '依据' }}</button>
                      </div>
                    </td>
                  </template>
                  <td v-else colspan="7">
                    <div class="basis-box">
                      <div v-if="row.item.plainRule" class="bb-item"><span class="tag s">通俗解释</span><span>{{ row.item.plainRule }}</span></div>
                      <div v-if="row.item.howToScore" class="bb-item"><span class="tag s">取数计分</span><span>{{ row.item.howToScore }}</span></div>
                      <div v-if="row.item.standardOriginal" class="bb-item"><span class="tag s">标准原文</span><span v-html="row.item.standardOriginal"></span></div>
                      <div v-if="row.item.dataSourceFrom" class="bb-item"><span class="tag a">数据来源</span><span>{{ row.item.dataSourceFrom }}</span></div>
                      <div v-if="recordRows(row.item.records).list.length" class="bb-item">
                        <span class="tag a">支撑记录</span>
                        <!-- 记录为动态中文键对象，按字段并集渲染成小表格 -->
                        <table class="bb-rec">
                          <thead>
                            <tr>
                              <th v-for="col in recordRows(row.item.records).cols" :key="col">{{ col }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(rc, ri) in recordRows(row.item.records).list" :key="'r' + ri">
                              <td v-for="col in recordRows(row.item.records).cols" :key="col">{{ rc[col] }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-if="gapDetailRows(row.item.gapDetail).length" class="bb-item">
                        <span class="tag o">缺口明细</span>
                        <!-- gapDetail 为固定四键对象（current/deduction/gap/required），按「字段名：值」逐行渲染 -->
                        <span>
                          <span v-for="gd in gapDetailRows(row.item.gapDetail)" :key="gd.label" class="bb-line">
                            <b>{{ gd.label }}</b>：{{ gd.value }}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
/* 数据来源（dataSource）→ 芯片文案，对应结构枚举 auto auto2 pick fill school manual sum tbd */
const DATA_SOURCE_LABEL = {
  auto: '自动',
  auto2: '半自动',
  pick: '手动 · 选',
  fill: '手动 · 补',
  school: '学校填',
  manual: '人工评审',
  sum: '汇总',
  tbd: '待原文'
};

/* 教师办理动作（teacherAction）→ 文案，对应枚举 confirm pick fill none */
const ACTION_LABEL = {
  confirm: '确认归类',
  pick: '勾选档案记录',
  fill: '补录材料'
};

/* 门槛判定（judge）→ 文案：pass 符合 / pending 待确认 / fail 不符合 */
const JUDGE_LABEL = {
  pass: '符合',
  pending: '待确认',
  fail: '不符合'
};

export default {
  name: 'PaneCmp',
  props: {
    /* 分析结果全量结构（来源 8.7 analysisStructure）：{ gates, scoreItems }，逐条比对分两组展示 */
    structure: { type: Object, default: null },
    /* 列表加载中标记 */
    loading: { type: Boolean, default: false }
  },
  data() {
    return {
      /* 「依据」行展开状态（组件内部 local state，不上抛） */
      expanded: {}
    };
  },
  computed: {
    gates() {
      return (this.structure && this.structure.gates) || [];
    },
    scoreItems() {
      return (this.structure && this.structure.scoreItems) || [];
    },
    /* 是否有可渲染数据：门槛或评分项任一非空 */
    hasData() {
      return this.gates.length > 0 || this.scoreItems.length > 0;
    },
    /* 资格门槛条目总数 */
    gateCount() {
      return this.gates.reduce((sum, g) => sum + (g.entries || []).length, 0);
    },
    /* 非复合分合计行的评分项条目数，用于标题计数 */
    scoredCount() {
      let count = 0;
      this.scoreItems.forEach(group => (group.entries || []).forEach(item => {
        if (!this.isSum(item)) count += 1;
      }));
      return count;
    }
  },
  watch: {
    /* 切换目标（structure 整批替换）时收起全部「依据」行 */
    structure() {
      this.expanded = {};
    }
  },
  methods: {
    isSum(item) {
      return Number(item.isSum) === 1;
    },
    dataSourceLabel(key) {
      return DATA_SOURCE_LABEL[key] || key || '—';
    },
    actionLabel(action) {
      return ACTION_LABEL[action] || '办理';
    },
    judgeLabel(judge) {
      return JUDGE_LABEL[judge] || '—';
    },
    /* 依据展开 key：按分组类型加前缀隔离门槛与评分项，优先用骨架条目 id，回退到分组下标 */
    basisKey(type, item, gi, ii) {
      return type + '-' + String(item.standardItemId || item.id || (gi + '-' + ii));
    },
    isExpanded(id) {
      return !!this.expanded[id];
    },
    toggleBasis(id) {
      this.$set(this.expanded, id, !this.expanded[id]);
    },
    /* 门槛分组 → 逐行渲染列表：每个条目产出「主行 + 依据行」两个 tr，避免 template v-for 需要给子元素加 key */
    gateRows(group, gi) {
      const rows = [];
      (group.entries || []).forEach((item, ii) => {
        const bk = this.basisKey('g', item, gi, ii);
        rows.push({ isBasis: false, item, bk, key: 'gr' + gi + '-' + ii });
        rows.push({ isBasis: true, item, bk, key: 'gbasis' + gi + '-' + ii });
      });
      return rows;
    },
    /* 评分项分组 → 逐行渲染列表：主行携带合计行样式，依据行携带 row-basis 样式 */
    scoreRows(group, gi) {
      const rows = [];
      (group.entries || []).forEach((item, ii) => {
        const bk = this.basisKey('s', item, gi, ii);
        const sum = this.isSum(item);
        rows.push({ isBasis: false, isSum: sum, item, bk, rowClass: sum ? 'row-sum' : '', key: 'sr' + gi + '-' + ii });
        rows.push({ isBasis: true, isSum: sum, item, bk, rowClass: 'row-basis', key: 'sbasis' + gi + '-' + ii });
      });
      return rows;
    },
    /* 解析失败或非数组时的文本兜底：字符串/数字直接展示，对象取常见文案键 */
    entryText(entry) {
      if (entry == null) return '';
      if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
      return entry.text || entry.name || entry.fileName || entry.label || JSON.stringify(entry);
    },
    /* 缺口明细：接口为固定四键对象（current现状/deduction扣分说明/gap差距结论/required标准要求），转「字段名：值」行列表；兼容数组与普通文本入参 */
    gapDetailRows(str) {
      const GAP_LABELS = [
        { key: 'current', label: '现状' },
        { key: 'required', label: '标准要求' },
        { key: 'gap', label: '差距结论' },
        { key: 'deduction', label: '扣分说明' }
      ];
      if (!str) return [];
      let parsed = str;
      if (typeof str === 'string') {
        try {
          parsed = JSON.parse(str);
        } catch (e) {
          return [{ label: '', value: str }];
        }
      }
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => ({ label: '', value: this.entryText(entry) })).filter((row) => row.value);
      }
      if (parsed && typeof parsed === 'object') {
        return GAP_LABELS
          .map((meta) => ({ label: meta.label, value: parsed[meta.key] == null ? '' : String(parsed[meta.key]) }))
          .filter((row) => row.value);
      }
      return [{ label: '', value: String(parsed) }];
    },
    /* 支撑记录单元格取值展平：嵌套数组用、连接，对象优先取常见展示键，避免直接 String 出现 [object Object] */
    recordCellText(val) {
      if (val == null) return '';
      if (Array.isArray(val)) {
        return val.map((item) => this.recordCellText(item)).filter((text) => text !== '').join('、');
      }
      if (typeof val === 'object') {
        const picked = val.label != null ? val.label
          : val.name != null ? val.name
            : val.value != null ? val.value
              : val.text != null ? val.text : val.title;
        if (picked != null && typeof picked !== 'object') return String(picked);
        try {
          return JSON.stringify(val);
        } catch (e) {
          return '';
        }
      }
      return String(val);
    },
    /* 支撑记录：records 存的是 JSON 字符串，档案记录字段名为动态中文键，解析为对象行 + 字段并集列；隐藏数据ID/创建时间，值全为空的列不展示 */
    recordRows(input) {
      const hiddenKeys = ['数据ID', '创建时间'];
      let list = input;
      if (typeof input === 'string') {
        try {
          list = JSON.parse(input);
        } catch (e) {
          list = null;
        }
      }
      if (!Array.isArray(list)) return { cols: [], list: [] };
      const rows = list
        .filter((rec) => rec && typeof rec === 'object')
        .map((rec) => {
          const row = {};
          Object.keys(rec).forEach((key) => {
            if (hiddenKeys.indexOf(key) > -1) return;
            row[key] = this.recordCellText(rec[key]);
          });
          return row;
        })
        .filter((row) => Object.keys(row).some((key) => row[key] !== ''));
      const cols = [];
      rows.forEach((row) => Object.keys(row).forEach((key) => {
        if (cols.indexOf(key) < 0) cols.push(key);
      }));
      const visibleCols = cols.filter((col) => rows.some((row) => row[col] !== ''));
      return { cols: visibleCols, list: visibleCols.length ? rows : [] };
    }
  }
};
</script>

<style scoped>
/* 两组比对表格：固定布局。每个分组各自渲染一张独立 table，默认 auto 布局会随各组内容
   动态计算列宽，导致同名各分组表格列宽不一致、跨组对不齐；改为 fixed 并给每类
   表格指定统一百分比列宽，使所有同类型表格列宽完全一致 */
.cmp-table {
  table-layout: fixed;
  width: 100%;
}
.cmp-table th,
.cmp-table td {
  overflow-wrap: break-word;
  word-break: break-word;
}
/* 固定布局下需允许首列换行，避免长文本撑破对齐 */
.cmp-table td.c1 {
  white-space: normal;
}
/* 资格门槛表列宽：条件 / 标准要求 / 本人档案情况 / 判定 / 数据来源 / 办理方式 */
.cmp-table-gate th:nth-child(1) { width: 16%; }
.cmp-table-gate th:nth-child(2) { width: 22%; }
.cmp-table-gate th:nth-child(3) { width: 22%; }
.cmp-table-gate th:nth-child(4) { width: 10%; }
.cmp-table-gate th:nth-child(5) { width: 12%; }
.cmp-table-gate th:nth-child(6) { width: 18%; }
/* 材料评分项表列宽：评分项 / 数据来源 / 满分 / 材料分 / 差距 / 办理方式 / 操作 */
.cmp-table-score th:nth-child(1) { width: 22%; }
.cmp-table-score th:nth-child(2) { width: 12%; }
.cmp-table-score th:nth-child(3) { width: 8%; }
.cmp-table-score th:nth-child(4) { width: 8%; }
.cmp-table-score th:nth-child(5) { width: 8%; }
.cmp-table-score th:nth-child(6) { width: 30%; }
.cmp-table-score th:nth-child(7) { width: 12%; }
.cmp-sug {
  font-size: 11px;
  color: var(--muted);
  margin-top: 5px;
  line-height: 1.6;
}
/* 材料评分项区块：与上方资格门槛区块留出间距 */
.cmp-sec-gap {
  margin-top: 18px;
}
/* 门槛标准要求列：允许换行，避免长文本撑破表格 */
.gate-req {
  white-space: normal;
  min-width: 160px;
}
/* 复合分合计行：浅背景 + 加粗，区别于普通评分项 */
.row-sum {
  background: #f7f9f7;
}
.row-sum td {
  font-weight: 600;
  color: var(--ink);
}
.basis-box .bb-line {
  display: block;
  line-height: 1.7;
}
/* 支撑记录小表格：外层 .table-scroll 的 table-layout:fixed 会继承到本表，需显式 auto 按内容分配列宽 */
.bb-rec {
  table-layout: auto;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 2px;
}
.bb-rec th,
.bb-rec td {
  border: 1px solid var(--line);
  padding: 4px 9px;
  text-align: left;
  line-height: 1.6;
  white-space: normal;
}
.bb-rec th {
  background: #f7f9f8;
  color: var(--muted);
  font-weight: 600;
  white-space: nowrap;
}
/* 办理方式：动作类型标签，纯展示不交互；长文案在固定列宽内换行 */
.act-tag {
  font-size: 10px;
  border-radius: 8px;
  padding: 2px 8px;
  background: #eef3fa;
  color: #4a6a94;
  overflow-wrap: break-word;
}
/* 门槛本人档案情况列：允许换行 */
.gate-val {
  white-space: normal;
  min-width: 150px;
}
/* 门槛判定：图标 + 文案，pass 绿 / pending 橙 / fail 红 */
.g-judge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  white-space: nowrap;
}
.g-judge svg {
  width: 14px;
  height: 14px;
}
.g-judge.pass {
  color: #2e9e5b;
}
.g-judge.pending {
  color: #d98a1f;
}
.g-judge.fail {
  color: #d9534f;
}
/* 门槛数据来源：统一为系统自动判定 */
.g-src {
  display: inline-block;
  font-size: 11px;
  color: #4a6a94;
  background: #eef3fa;
  border-radius: 10px;
  padding: 2px 9px;
  white-space: nowrap;
}
.row-ops2 > .g-act {
  /* flex item 默认 min-width:auto 不收缩到内容宽以下，长建议文案无法换行；置 0 后在列宽内折行 */
  min-width: 0;
  max-width: 100%;
  white-space: normal;
}
/* 门槛办理方式：待补齐动作标签；去除 nowrap，长建议文案限制在列宽内换行 */
.g-act {
  display: inline-block;
  font-size: 11px;
  color: #d98a1f;
  border: 1px solid #f0cfa0;
  border-radius: 8px;
  padding: 2px 9px;
}
/* 办理方式/操作单元格：全局 .ops 的 display:flex 会让 td 脱离表格单元格布局，
   导致该单元格不随行撑高、比其他列矮；此处还原为 table-cell，行内弹性布局交由 .row-ops2 负责 */
.ops {
  display: table-cell;
}
/* 未通过（待确认 / 不符合）门槛行：浅橙底提示 */
.row-gate-warn {
  background: #fdf4e7;
}
</style>
