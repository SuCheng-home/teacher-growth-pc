<template>
  <div>
    <div class="page-heading">
      <div>
        <div class="eyebrow">REPORT SPEC</div>
        <h1>报告口径</h1>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2><i data-lucide="file-text"></i>报告模板与红线</h2>
        <span class="side">历史报告不覆盖 · 指向生成时的标准版本与数据时点</span>
      </div>
      <div class="rpt-h">报告必含字段</div>
      <table class="rpt">
        <thead><tr><th>字段</th><th>取值</th></tr></thead>
        <tbody>
          <tr v-for="f in fields" :key="f.k"><td>{{ f.k }}</td><td>{{ f.v }}</td></tr>
        </tbody>
      </table>
      <div class="rpt-h">四条红线</div>
      <table class="rpt">
        <tbody>
          <tr v-for="r in redlines" :key="r.k"><td>{{ r.k }}</td><td>{{ r.v }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDataReport',
  data() {
    return {
      fields: [
        { k: '标准版本', v: '如「教师岗位基本任职条件评分细则（11级）· 校标 · 2026 年度」（随标准切换）' },
        { k: '数据时点', v: '档案拉取时间 + 分析完成时间（精确到分）' },
        { k: '逐项依据', v: '每行：档案取值 + 基础分 + 加分 + 得分 + 档案出处' },
        { k: '教师调整留痕', v: '调整后取值/得分 + 理由' },
        { k: '被剔除行', v: '单独列出（不计入参考总分）' },
        { k: '免责', v: '「结果仅供参考，不构成评审结论，以标准文件原文与学校评审结论为准」' }
      ],
      redlines: [
        { k: '① 不盖棺定论', v: '只给「参考分值 + 参考结论」，不给单一总分上限' },
        { k: '② 算分走规则引擎', v: 'AI 只生成解释文字，不参与算分' },
        { k: '③ 来源可指回', v: '每个数字能指回具体档案域与记录' },
        { k: '④ 空域不静默', v: '档案缺数据必须显式标注为差距，不得给分' }
      ]
    };
  }
};
</script>
