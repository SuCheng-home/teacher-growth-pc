<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">DATA QUALITY</div>
        <h1>数据质量看板</h1>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="shield-check"></i>关键档案域完备率（样例：朱斌）</h2>
        <span class="side">空域会直接导致「档案缺失」型差距</span>
      </div>
      <div class="tbl-wrap">
        <table class="t">
          <thead>
            <tr><th>档案域</th><th>记录数</th><th>完备率</th><th>影响的评分项</th><th>提示</th></tr>
          </thead>
          <tbody>
            <tr v-for="q in data" :key="q.domain">
              <td class="item"><b>{{ q.domain }}</b></td>
              <td class="num">{{ q.n }}</td>
              <td><span class="tag" :class="covTag(q.cov)">{{ covText(q.cov) }}</span></td>
              <td>{{ q.aff }}</td>
              <td><small>{{ q.tip }}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="warn-note" style="margin-top:14px;margin-bottom:0">
        <i data-lucide="triangle-alert"></i>
        <span><b>实测提示</b>：朱斌档案的<b>论文发表 / 论文案例获奖 / 论著出版</b>三块均为空 → 直接影响「论文、教科研项目」项；该类空域在教师端必须显示为<b>「档案缺失型」差距并给出补齐路径</b>，不得给分、不得静默跳过。</span>
      </div>
    </div>
  </div>
</template>

<script>
import { QDATA } from '../admin-data';

export default {
  name: 'AdminDataQuality',
  data() {
    return {
      data: QDATA.map((q) => ({ ...q }))
    };
  },
  methods: {
    covTag(cov) {
      if (cov === 0) return 'err';
      if (cov < 90) return 'wt';
      return 'ok';
    },
    covText(cov) {
      return cov + '%';
    }
  }
};
</script>
