<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">PORTRAIT DIMENSIONS</div>
        <h1>画像维度配置</h1>
      </div>
      <div class="bar">
        <button class="btn sm" type="button" @click="addDim"><i data-lucide="plus"></i>新增维度</button>
        <button class="btn sm primary" type="button" @click="saveAll"><i data-lucide="save"></i>保存配置</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="info"></i>
      <span>本页是教师端「我的画像 · 六维解析」的<b>唯一配置源</b>，四个环节环环相扣：<b>①维度与档案域 → ②计分参数 → ③事件映射 → ④试算预览</b>。点「保存配置」后，教师端画像页按同一份配置实时算出六维分；该配置同时作为「同辈对标」提示词的字段分类上下文。</span>
    </div>

    <!-- ① 维度与档案域 -->
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="layout-grid"></i>① 维度与档案域</h2>
        <span class="side">共 {{ dims.length }} 个维度</span>
      </div>
      <div v-for="(d, i) in dims" :key="i" class="dim-cfg">
        <div class="dc-head">
          <span class="dc-idx">{{ i + 1 }}</span>
          <input class="dc-name" type="text" v-model="d.n" placeholder="维度名称">
          <span class="dc-base">基准分<input type="number" min="1" v-model.number="d.base"></span>
          <div class="ops" style="margin-left:auto">
            <button class="op" type="button" @click="delDim(i)">删除维度</button>
          </div>
        </div>
        <div class="dc-fields">
          <span v-for="(f, fi) in d.fields" :key="fi" class="dim-fchip">{{ f }}<button type="button" @click="delField(i, fi)">×</button></span>
          <span v-if="!d.fields.length" class="dim-empty">还没有绑定档案域</span>
        </div>
        <div class="dc-add">
          <el-select v-model="addSel[i]" size="mini" placeholder="选择档案域" style="max-width:300px">
            <el-option v-for="opt in fieldOptions(d)" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <button class="btn sm" type="button" @click="addField(i)">添加档案域</button>
        </div>
      </div>
      <div v-if="!dims.length" class="dim-empty">还没有维度，点右上角「新增维度」。</div>
    </div>

    <!-- ② 计分参数 -->
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="sliders-horizontal"></i>② 计分参数</h2>
        <span class="side">单项积分 = 级别权重 × 角色系数 × 时效系数</span>
      </div>
      <div v-for="grp in groups" :key="grp.kind">
        <div class="par-h">
          <span>{{ grp.label }}</span>
          <button class="btn sm" type="button" @click="addPar(grp.kind)"><i data-lucide="plus"></i>新增档位</button>
        </div>
        <div class="par-grid">
          <div v-for="k in parKeys(grp.kind)" :key="k" class="par-item">
            <input class="par-k" type="text" :value="k" @change="renamePar(grp.kind, k, $event.target.value)">
            <input class="par-v" type="number" step="0.1" v-model.number="par[grp.kind][k]">
            <button class="par-x" type="button" @click="delPar(grp.kind, k)">×</button>
          </div>
        </div>
      </div>
      <div class="warn-note" style="margin:14px 0 0">
        <i data-lucide="info"></i>
        <span><b>档位可增删</b>：点档位名可改名，改完自动同步「③ 事件映射」里的同名引用；带 × 可删档位，但<b>被事件引用的档位不允许删除</b>（请先把那些事件改到别的档位），避免静默算成 0 分。默认档位取自真实档案级别体系。</span>
      </div>
    </div>

    <!-- ③ 事件映射 -->
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="git-branch"></i>③ 事件映射</h2>
        <span class="side">共 {{ evmap.length }} 条事件</span>
        <button class="btn sm" type="button" @click="addEvent"><i data-lucide="plus"></i>新增事件</button>
      </div>
      <div class="tbl-wrap pd-ev">
        <el-table :data="evmap" empty-text="还没有事件，点右上角「新增事件」。">
          <el-table-column label="事件类型" min-width="170">
            <template slot-scope="{ row }">
              <input type="text" v-model="row.t">
            </template>
          </el-table-column>
          <el-table-column label="级别" width="130">
            <template slot-scope="{ row }">
              <select v-model="row.lv">
                <option v-for="k in optsWith('lvl', row.lv)" :key="k" :value="k">{{ k }}</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="角色" width="130">
            <template slot-scope="{ row }">
              <select v-model="row.role">
                <option v-for="k in optsWith('role', row.role)" :key="k" :value="k">{{ k }}</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="年份" width="110">
            <template slot-scope="{ row }">
              <input type="number" min="1990" max="2035" v-model.number="row.yr">
            </template>
          </el-table-column>
          <el-table-column label="归属维度" min-width="140">
            <template slot-scope="{ row }">
              <select v-model="row.dim">
                <option value="">未归属</option>
                <option v-for="d in dims" :key="d.n" :value="d.n">{{ d.n }}</option>
              </select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="{ $index }">
              <div class="ops"><button class="op" type="button" @click="delEvent($index)">删除</button></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="warn-note" style="margin:14px 0 0">
        <i data-lucide="info"></i>
        <span>即需求文档 3.4「<b>事件映射矩阵</b>」：每条事件登记「在 L2 算到哪个评分项、在 L3 算到哪个<b>画像维度</b>」。管理员调整维度时只改这张表，不改代码。级别 / 角色下拉的选项来自 ② 计分参数的档位，档位增删后此处自动跟随。</span>
      </div>
    </div>

    <!-- ④ 试算预览 -->
    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="calculator"></i>④ 试算预览</h2>
        <span class="side">样例教师 · 单项积分 = 级别权重 × 角色系数 × 时效系数（当前年 {{ curYear }}）</span>
      </div>
      <div class="tbl-wrap">
        <el-table :data="calcRows" empty-text="暂无试算数据">
          <el-table-column label="维度" min-width="120">
            <template slot-scope="{ row }"><b>{{ row.name }}</b></template>
          </el-table-column>
          <el-table-column label="事件数" width="100" align="right">
            <template slot-scope="{ row }"><span class="pd-num">{{ row.evs }}</span></template>
          </el-table-column>
          <el-table-column label="维度积分" width="110" align="right">
            <template slot-scope="{ row }"><span class="pd-num">{{ row.sum }}</span></template>
          </el-table-column>
          <el-table-column label="维度分（0–100）" width="150" align="right">
            <template slot-scope="{ row }">
              <b>{{ row.score }}</b><span style="color:var(--muted)"> /100</span>
            </template>
          </el-table-column>
          <el-table-column label="取数档案域" min-width="220">
            <template slot-scope="{ row }">
              <span class="pd-fields">{{ row.fields.join('、') || '—' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="warn-note" style="margin:14px 0 0">
        <i data-lucide="triangle-alert"></i>
        <span><b>红线</b>：维度分由规则引擎按档案取值计算，AI 只生成解释文字；每个数字须能指回具体档案域；空域在教师端显示为「待补录」，不给分、不静默跳过。</span>
      </div>
    </div>
  </div>
</template>

<script>
import { DIMS_DEF, PAR_DEF, EV_DEF, PE_DOMAIN } from '../admin-data';

export default {
  name: 'AdminPortraitDimension',
  data() {
    return {
      dims: JSON.parse(JSON.stringify(DIMS_DEF)),
      par: JSON.parse(JSON.stringify(PAR_DEF)),
      evmap: JSON.parse(JSON.stringify(EV_DEF)),
      addSel: {},
      groups: [
        { kind: 'lvl', label: '级别权重' },
        { kind: 'role', label: '角色系数' },
        { kind: 'time', label: '时效系数' }
      ]
    };
  },
  computed: {
    curYear() {
      return new Date().getFullYear();
    },
    domainFields() {
      return Object.values(PE_DOMAIN);
    },
    calcRows() {
      return this.dims.map((d) => {
        const evs = this.evmap.filter((e) => e.dim === d.n);
        let sum = 0;
        evs.forEach((e) => { sum += this.evScoreOne(e); });
        sum = Math.round(sum * 100) / 100;
        const base = Number(d.base) > 0 ? Number(d.base) : 20;
        const score = Math.max(0, Math.min(100, Math.round((sum / base) * 100)));
        return { name: d.n, fields: d.fields || [], evs: evs.length, sum, base, score };
      });
    }
  },
  methods: {
    parKeys(kind) {
      return Object.keys(this.par[kind]);
    },
    optsWith(kind, cur) {
      const ks = this.parKeys(kind);
      if (cur && ks.indexOf(cur) < 0) return ks.concat([cur + '（档位已删除）']);
      return ks;
    },
    fieldOptions(d) {
      return this.domainFields.filter((f) => d.fields.indexOf(f) < 0);
    },
    evTimeKey(yr) {
      const g = this.curYear - (Number(yr) || 0);
      if (g <= 3) return '≤3年';
      if (g <= 5) return '3-5年';
      if (g <= 10) return '5-10年';
      return '>10年';
    },
    evScoreOne(e) {
      const a = Number(this.par.lvl[e.lv]);
      const b = Number(this.par.role[e.role]);
      const c = Number(this.par.time[this.evTimeKey(e.yr)]);
      return (isFinite(a) ? a : 0) * (isFinite(b) ? b : 0) * (isFinite(c) ? c : 0);
    },
    addDim() {
      this.dims.push({ n: '新维度 ' + (this.dims.length + 1), base: 20, fields: [] });
    },
    delDim(i) {
      if (this.dims.length <= 1) { this.showToast('至少保留一个维度'); return; }
      this.dims.splice(i, 1);
    },
    addField(i) {
      const v = this.addSel[i];
      if (!v || !this.dims[i]) return;
      if (this.dims[i].fields.indexOf(v) < 0) this.dims[i].fields.push(v);
      this.$set(this.addSel, i, '');
    },
    delField(i, fi) {
      this.dims[i].fields.splice(fi, 1);
    },
    addPar(kind) {
      const box = this.par[kind];
      const base = { lvl: '新级别', role: '新角色', time: '新时效档' }[kind];
      let name = base; let i = 1;
      while (name in box) { i++; name = base + i; }
      this.$set(box, name, 1);
    },
    renamePar(kind, oldName, newName) {
      const nv = String(newName).trim();
      const box = this.par[kind];
      if (!nv || nv === oldName || nv in box) return;
      const entries = this.parKeys(kind).map((k) => (k === oldName ? [nv, box[oldName]] : [k, box[k]]));
      const next = {};
      entries.forEach((e) => { next[e[0]] = e[1]; });
      this.$set(this.par, kind, next);
      this.evmap.forEach((e) => { if (kind === 'lvl' && e.lv === oldName) e.lv = nv; if (kind === 'role' && e.role === oldName) e.role = nv; });
    },
    delPar(kind, name) {
      const used = kind === 'lvl' ? this.evmap.some((e) => e.lv === name)
        : kind === 'role' ? this.evmap.some((e) => e.role === name)
          : this.evmap.some((e) => this.evTimeKey(e.yr) === name);
      if (used) { this.showToast('档位「' + name + '」被事件引用，不允许删除'); return; }
      this.$delete(this.par[kind], name);
    },
    addEvent() {
      this.evmap.push({ t: '新事件', lv: this.parKeys('lvl')[0], role: this.parKeys('role')[0], yr: this.curYear, dim: this.dims[0] ? this.dims[0].n : '' });
    },
    delEvent(i) {
      this.evmap.splice(i, 1);
    },
    saveAll() {
      if (!this.dims.length) { this.showToast('至少保留一个维度'); return; }
      if (this.dims.some((d) => !String(d.n).trim())) { this.showToast('维度名称不能为空'); return; }
      this.dims.forEach((d) => { d.n = String(d.n).trim(); if (!(Number(d.base) > 0)) d.base = 20; });
      this.showToast('已保存配置 · 教师端画像页按同一份配置实时算出六维分');
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>

<style scoped>
/* ③ 事件映射表为行内编辑：单元格内输入框 / 下拉框贴合行高，风格与原生表格保持一致 */
.pd-ev ::v-deep .el-table td.el-table__cell {
  padding: 6px 8px;
}

.pd-ev input[type='text'],
.pd-ev input[type='number'],
.pd-ev select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 4px 7px;
  font-size: 14px;
  color: var(--ink);
  background: #fff;
  font-family: inherit;
}

.pd-ev input[type='text']:focus,
.pd-ev input[type='number']:focus,
.pd-ev select:focus {
  outline: 0;
  border-color: var(--green-soft);
}

.pd-num {
  font-variant-numeric: tabular-nums;
}

.pd-fields {
  font-size: 11.5px;
  color: var(--muted);
}
</style>
