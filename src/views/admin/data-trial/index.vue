<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">TRIAL RUN</div>
        <h1>试算与校验</h1>
      </div>
      <div class="bar">
        <el-select v-model="teacher" size="small" style="width:260px">
          <el-option v-for="t in teachers" :key="t" :label="t" :value="t" />
        </el-select>
        <button class="btn sm primary" type="button" @click="runTrial"><i data-lucide="play"></i>跑一遍试算</button>
      </div>
    </div>

    <div class="warn-note">
      <i data-lucide="flask-conical"></i>
      <span>发布前必过：用样例教师的<b>真实档案</b>跑一遍规则引擎，人工核对每行「取值」与「得分」是否与档案一致。<b>凡取值与档案不符，就在「档案域绑定」页修绑定，而不是改分数。</b></span>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="play-circle"></i>试算结果 · 朱斌</h2>
        <span class="side">共 {{ rows.length }} 项 · 待核对 {{ diffCount }} 项</span>
      </div>
      <div class="trialbox">
        <div class="r"><span>基础分合计</span><b>{{ baseSum }}</b></div>
        <div class="r"><span>加分合计</span><b>{{ addSum }}</b></div>
        <div class="r"><span>参考总分</span><b>{{ total }}</b></div>
        <div class="r"><span>校验结论</span><b :style="{ color: diffCount ? 'var(--no)' : 'var(--hi)' }">{{ diffCount ? diffCount + ' 项取值与档案不符 · 需核对' : '全部与档案一致' }}</b></div>
      </div>
      <div class="tbl-wrap">
        <el-table :data="rows" empty-text="暂无试算结果">
          <el-table-column label="#" width="60">
            <template slot-scope="{ row }">{{ row.no }}</template>
          </el-table-column>
          <el-table-column label="评分项" min-width="180">
            <template slot-scope="{ row }">
              <div class="item">
                <b>{{ row.name }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="来源分类" width="110">
            <template slot-scope="{ row }">
              <span class="src" :class="'src-' + row.src">{{ SRC_INFO[row.src] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="档案取值" min-width="140">
            <template slot-scope="{ row }">{{ row.val }}</template>
          </el-table-column>
          <el-table-column label="基础分" width="90" align="right">
            <template slot-scope="{ row }">{{ row.base }}</template>
          </el-table-column>
          <el-table-column label="加分" width="90" align="right">
            <template slot-scope="{ row }">{{ row.add }}</template>
          </el-table-column>
          <el-table-column label="得分" width="90" align="right">
            <template slot-scope="{ row }">
              <b>{{ row.base + row.add }}</b>
            </template>
          </el-table-column>
          <el-table-column label="核对" width="160">
            <template slot-scope="{ row }">
              <span v-if="row.ok === '数'" class="tag ok">取值与档案一致</span>
              <span v-else class="tag err">档案缺失 · 需核对</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { TRIAL, SRC_INFO } from '../admin-data';

export default {
  name: 'AdminDataTrial',
  data() {
    return {
      SRC_INFO,
      teachers: ['朱斌（高中地理 · 二级 · 十一级）'],
      teacher: '朱斌（高中地理 · 二级 · 十一级）',
      rows: TRIAL.rows.map((r) => ({ ...r }))
    };
  },
  computed: {
    baseSum() {
      return Number(this.rows.reduce((s, r) => s + r.base, 0).toFixed(1));
    },
    addSum() {
      return Number(this.rows.reduce((s, r) => s + r.add, 0).toFixed(1));
    },
    total() {
      return Number((this.baseSum + this.addSum).toFixed(1));
    },
    diffCount() {
      return this.rows.filter((r) => r.ok !== '数').length;
    }
  },
  methods: {
    runTrial() {
      this.showToast('已按档案跑一遍试算 · 得分与档案逐行核对');
    },
    showToast(msg) {
      this.$message({ message: msg, duration: 2000 });
    }
  }
};
</script>
