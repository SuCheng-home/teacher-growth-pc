/**
 * 评分相关纯函数（高保真迁移自 qualification_v2.2_20260928.html <script> 段）
 * 所有函数无 DOM 依赖，可在 pane 组件中直接复用。
 * 注意：原始 demo 使用全局 OV 变量存储教师改动，此处改为参数传入以保持纯函数特性。
 */

import { ICON_OK, ICON_NO, ICON_WAIT, SRC_TYPE, PLAIN, TEACHER_ACT } from '@/constants/qualification';

/* ============ 基础工具 ============ */

/**
 * 生成评分项唯一标识 key
 * @param {string} k - 目标 key（如 'yj'）
 * @param {number} ci - 类目索引
 * @param {number} ii - 项索引
 * @returns {string}
 */
export function ikey(k, ci, ii) {
  return k + ':c' + ci + 'i' + ii;
}

/**
 * 从字符串中提取第一个数字
 * @param {string} str
 * @returns {number|null}
 */
export function subNum(str) {
  const m = String(str || '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

/**
 * 获取评分项的基准分值（优先 item.score，其次取 cat.sub 中的数字）
 * @param {Object} it - 评分项
 * @param {Object} cat - 所属类目
 * @returns {number|null}
 */
export function itemBase(it, cat) {
  return it.score != null ? it.score : subNum(cat.sub);
}

/**
 * 根据 action/src 字段映射出教师需要做的方式
 * @param {Object} it - 评分项
 * @returns {string} 方式标识（auto/auto2/pick/fill/school/manual/tbd/sum）
 */
export function actOf(it) {
  const a = it.action;
  const s = it.src;
  if (a === 'confirm') return 'auto2';
  if (a === 'pick' || a === 'fill') return a;
  if (!a || a === 'none') return (s === 'auto2') ? 'auto2' : (s || 'auto');
  return a;
}

/**
 * 判断该评分项是否需要教师操作
 * @param {Object} it - 评分项
 * @returns {boolean}
 */
export function isTeacherAct(it) {
  return TEACHER_ACT.indexOf(actOf(it)) >= 0;
}

/**
 * 获取评分项的白话说明
 * @param {Object} it - 评分项
 * @returns {string}
 */
export function plainOf(it) {
  return it.plain || PLAIN[it.n] || it.rule || '';
}

/* ============ 数据提取 ============ */

/**
 * 从目标定义中提取全部评分项（展平 cats）
 * @param {Object} t - 目标定义
 * @returns {Array}
 */
export function scoreItems(t) {
  return t.score ? t.score.cats.reduce((a, c) => a.concat(c.items), []) : [];
}

/**
 * 从目标定义中提取全部门槛行（展平 gateGroups）
 * @param {Object} t - 目标定义
 * @returns {Array<{g: string, r: Object}>}
 */
export function gateRows(t) {
  return t.gateGroups ? t.gateGroups.reduce((a, g) => a.concat(g.rows.map(r => ({ g: g.g, r }))), []) : [];
}

/* ============ 评分计算 ============ */

/**
 * 计算每行得分（含教师改动 OV 映射）
 * @param {Object} t - 目标定义
 * @param {string} k - 目标 key
 * @param {Object} ov - 教师改动映射 { [itemId]: {score, value, del, reason} }
 * @returns {Array<Object>} 行数据数组
 */
export function scoreRows(t, k, ov) {
  const rows = [];
  if (!t.score) return rows;
  t.score.cats.forEach((cat, ci) => cat.items.forEach((it, ii) => {
    const id = ikey(k, ci, ii);
    const o = (ov && ov[id]) || {};
    let score = itemBase(it, cat);
    let edited = false;
    if (o.score !== undefined && o.score !== '' && o.score !== null) { score = Number(o.score); edited = true; }
    if (o.value) { edited = true; }
    if (o.del) { edited = true; }
    rows.push({ ci, ii, id, cat, it, ov: o, score, del: !!o.del, edited, reason: o.reason || '' });
  }));
  return rows;
}

/**
 * 汇总计算（总分/满分/行数据/改动行等）
 * @param {Object} t - 目标定义
 * @param {string} k - 目标 key
 * @param {Object} ov - 教师改动映射
 * @returns {Object} { total, full, fullUnknown, rows, live, delRows, editedRows }
 */
export function scoreTotals(t, k, ov) {
  const rows = scoreRows(t, k, ov);
  const live = rows.filter(r => !r.del);
  let total = 0;
  live.forEach(r => { if (r.score != null && !isNaN(r.score)) total += Number(r.score); });
  const fullUnknown = live.some(r => r.it.full == null);
  const full = fullUnknown ? t.score.full : live.reduce((a, r) => a + (r.it.full || 0), 0);
  return {
    total: +total.toFixed(1),
    full,
    fullUnknown,
    rows,
    live,
    delRows: rows.filter(r => r.del),
    editedRows: rows.filter(r => r.edited && !r.del)
  };
}

/* ============ Tab 标签摘要 ============ */

/**
 * 根据 Tab key 和目标定义生成标签上的数字摘要
 * @param {string} k - Tab key（doc/cmp/sum/rpt）
 * @param {Object} t - 目标定义
 * @returns {string}
 */
export function tabBadge(k, t) {
  if (k === 'doc') return (t.docs ? t.docs.length : 0) + ' 份原文';
  if (k === 'cmp') {
    const its = scoreItems(t).filter(x => !x.sum);
    const need = its.filter(isTeacherAct).length;
    const gh = gateRows(t).filter(x => x.r.j !== 'ok').length;
    if (!t.done && !t.score) return gh ? `${gh} 条门槛待处理` : '门槛已核验完成';
    return need ? `${need} 项需本人办理` : `${its.length} 项已核验完成`;
  }
  if (k === 'sum') {
    const gaps = scoreItems(t).filter(x => x.gap && x.gap < 0).length;
    if (!t.done && !t.score) return '路径型差距';
    return gaps ? `缺口 ${gaps} 项` : '无缺口';
  }
  return '';
}

/* ============ HTML 片段生成（供模板 v-html 或 render 函数使用） ============ */

/**
 * 生成门槛判定单元格 HTML
 * @param {string} j - 判定结果（ok/no/wait）
 * @param {string} fix - 修复按钮文字
 * @returns {string} HTML 字符串
 */
export function judgeCell(j, fix) {
  if (j === 'ok') return `<span class="judge ok">${ICON_OK}符合</span>`;
  if (j === 'no') return `<span class="judge no">${ICON_NO}不符合</span>`;
  return `<span class="judge wait">${ICON_WAIT}待确认</span>${fix ? `<button class="fix-btn" data-fix="${fix}">${fix}</button>` : ''}`;
}

/**
 * 生成评分项「依据」展开区 HTML
 * @param {Object} r - scoreRows 返回的行对象
 * @returns {string} HTML 字符串
 */
export function basisHTML(r) {
  const it = r.it;
  const sc = it.src || 'tbd';
  const ov = r.ov || {};
  const mine = (ov.score !== undefined && ov.score !== '') || ov.value || ov.del;
  return `<div class="basis-box">
    <div class="bb-item"><span class="tag o">标准原文</span><span>${it.orig || it.rule}</span></div>
    <div class="bb-item"><span class="tag h">系统判定方式</span><span>${it.how || '—'}</span></div>
    <div class="bb-item"><span class="tag a">数据来源</span><span><span class="src-chip ${sc}">${SRC_TYPE[sc] || '待原文确认'}</span>\u3000${it.from || ''}</span></div>
    <div class="bb-item"><span class="tag r">本次取数结果</span><span>${(it.recs && it.recs.length) ? `<ul class="rec-list">${it.recs.map(x => `<li>${x}</li>`).join('')}</ul>` : '暂无记录'}</span></div>
    ${ov.del ? `<div class="bb-item"><span class="tag r">本人改动</span><span>已剔除本项${ov.reason ? '：' + ov.reason : ''}</span></div>` : mine ? `<div class="bb-item"><span class="tag r">本人改动</span><span>${ov.value ? `取值改为「${ov.value}」；` : ''}${(ov.score !== undefined && ov.score !== '') ? `分值改为 ${ov.score}；` : ''}理由：${ov.reason || '—'}</span></div>` : ''}
  </div>`;
}
