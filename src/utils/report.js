/**
 * 分析报告（高保真迁移自 qualification_v2.2_20260928.html 的 rptFp / genReport）
 * 报告不走弹框：生成后内联渲染在「分析报告」页签内，生成即冻结快照，
 * 之后再改评分项，报告内容不回溯变动，只由状态提示「建议重新生成」。
 */

import { NOWPOST, SRC_TYPE } from '@/constants/qualification';

/**
 * 报告状态指纹：总分 + 全部手工改动，用于判断已生成报告是否过期
 * @param {Object} th - scoreTotals 返回的汇总对象
 * @param {Object} ov - 教师改动映射
 * @returns {string}
 */
export function reportFp(th, ov) {
  const keys = Object.keys(ov || {}).sort();
  return th.total + '|' + JSON.stringify(keys.map(k => [k, ov[k]]));
}

/**
 * 生成报告正文 HTML（.rpt 结构，供 v-html 内联渲染与窗口打印）
 * @param {Object} t - 目标定义
 * @param {Object} th - scoreTotals 返回的汇总对象
 * @param {Object} opt - { pullTime 档案数据时点, genTime 报告生成时间, nowpost 当前任职 }
 * @returns {string} HTML 字符串
 */
export function buildReportHtml(t, th, opt) {
  const pullTime = opt.pullTime || '';
  const genTime = opt.genTime || '';
  const nowpost = opt.nowpost || NOWPOST;
  const rows = th.live.map(r => `<tr><td class="c1">${r.it.n}</td><td>${r.it.full != null ? r.it.full : '原文未设'}</td><td><b>${r.score != null ? r.score : '—'}</b></td><td>${SRC_TYPE[r.it.src] || '待原文确认'}</td></tr>`).join('');
  const del = th.delRows.length ? `<h4>被剔除的评分项</h4><table><thead><tr><th>评分项</th><th>原分值</th><th>剔除理由</th></tr></thead><tbody>${th.delRows.map(r => `<tr><td class="c1">${r.it.n}</td><td>${r.score != null ? r.score : '—'}</td><td>${r.reason || '—'}</td></tr>`).join('')}</tbody></table>` : '';
  const edRows = th.editedRows.filter(r => !r.del);
  const ed = edRows.length ? `<h4>本人修改的项</h4><table><thead><tr><th>评分项</th><th>改动</th><th>理由</th></tr></thead><tbody>${edRows.map(r => {
    const ov = r.ov || {};
    const change = (ov.value ? '取值→' + ov.value : '') + ((ov.score !== undefined && ov.score !== '') ? '分值→' + ov.score : '');
    return `<tr><td class="c1">${r.it.n}</td><td>${change}</td><td>${r.reason || '—'}</td></tr>`;
  }).join('')}</tbody></table>` : '';
  const gaps = th.live.filter(r => r.it.gap).sort((a, b) => (a.it.gap || 0) - (b.it.gap || 0)).slice(0, 3)
    .map(r => `<li><b>${r.it.n}</b>：${r.it.gap} 分 —— ${r.it.sug}</li>`).join('') || '<li>各评分项均已达标。</li>';
  const changeNote = (th.delRows.length || edRows.length)
    ? `已按本人改动重算：改动 ${edRows.length} 项、剔除 ${th.delRows.length} 项。`
    : '本页未做任何改动。';
  return `
    <div class="rpt">
      <div class="rpt-hd"><b>${t.name} · 资格预审与材料分分析报告</b>
        <div class="rpt-sub">朱斌（高中地理 · ${nowpost.title} · ${nowpost.grade}岗位）<br>
        目标：${t.name}　|　对应标准：${t.ver}<br>
        档案数据时点：${pullTime}　|　报告生成于：${genTime}</div></div>
      <h4>一、材料分结论</h4>
      <p>系统材料分 <b>${th.total}${th.full ? ' / ' + th.full : ''}</b>（不含人工评审 20 分）。${changeNote}</p>
      <h4>二、逐项得分与数据来源</h4>
      <table><thead><tr><th>评分项</th><th>满分</th><th>材料分</th><th>数据来源</th></tr></thead><tbody>${rows}</tbody></table>
      ${del}${ed}
      <h4>三、主要缺口与下一步</h4>
      <ol style="margin:0;padding-left:20px">${gaps}</ol>
      <div class="disclaimer"><b>免责说明</b>：本报告由系统按标准细则自动计分生成，仅供参考，不构成任何评审结论；资格判定由规则引擎逐条执行，非 AI 推断。最终以标准文件原文、档案原始记录与学校评审结论为准。如发现判定与档案不符，请先在电子档案袋修正数据，再回到本页点「重新拉取并分析」。</div>
    </div>`;
}
