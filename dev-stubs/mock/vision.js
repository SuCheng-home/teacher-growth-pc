// 成长愿景：愿景分类与目标、评估标准、教师愿景、AI 分析结果结构、分析报告
import { OPTIONS, SELF_TEACHER, optionText } from './archive.js';
import { nowText, daysFromNow, nextId, upsert, removeById, clone, parseTime } from './utils.js';

export const VISION_CATEGORIES = [
  { code: 'zc', name: '职称晋升' },
  { code: 'gw', name: '岗位晋级' },
  { code: 'gg', name: '骨干称号' }
];

const categoryName = code => (VISION_CATEGORIES.find(c => c.code === code) || {}).name || '';

const BIND_FIELD = {
  zc: { indexName: 'teacher_base', indexLabel: '基本信息', fieldName: 'teacher_base_zc', fieldCode: 'zc', fieldLabel: '专业技术职称', options: OPTIONS.zc },
  gw: { indexName: 'teacher_base', indexLabel: '基本信息', fieldName: 'teacher_base_gw', fieldCode: 'gw', fieldLabel: '专业技术岗位', options: OPTIONS.gw },
  gg: { indexName: 'teacher_honor_2024', indexLabel: '骨干教师称号', fieldName: 'teacher_honor_2024_ch', fieldCode: 'ch', fieldLabel: '骨干教师称号', options: OPTIONS.ch }
};

function goal(id, cat, goalName, optionKey, sortNo, preGoalIds = [], status = 1) {
  const bindField = BIND_FIELD[cat];
  return {
    id,
    categoryCode: cat,
    categoryName: categoryName(cat),
    goalName,
    sortNo,
    preGoalIds,
    indexName: bindField.indexName,
    indexLabel: bindField.indexLabel,
    fieldName: bindField.fieldName,
    fieldCode: bindField.fieldCode,
    fieldLabel: bindField.fieldLabel,
    goalOptionKey: optionKey,
    goalOptionValue: optionText(bindField.options, optionKey),
    status,
    isEnable: 1,
    createTime: '2026-08-26 10:12:00'
  };
}

export const goals = [
  goal('G101', 'zc', '一级教师', '3', 1, []),
  goal('G102', 'zc', '高级教师', '4', 2, ['G101']),
  goal('G103', 'zc', '正高级教师', '5', 3, ['G102']),
  goal('G201', 'gw', '十级岗位', '10', 1, []),
  goal('G202', 'gw', '九级岗位', '9', 2, ['G201']),
  goal('G203', 'gw', '八级岗位', '8', 3, ['G202'], 2),
  goal('G301', 'gg', '区优秀青年教师', '1', 1, []),
  goal('G302', 'gg', '区学科带头人', '2', 2, ['G301']),
  goal('G303', 'gg', '市优秀青年教师', '3', 3, ['G301']),
  goal('G304', 'gg', '市学科带头人', '4', 4, ['G302', 'G303']),
  goal('G305', 'gg', '江苏省特级教师', '5', 5, ['G304'], 2)
];

const goalById = id => goals.find(g => String(g.id) === String(id));

function withPreGoalNames(item) {
  const names = (item.preGoalIds || []).map(id => (goalById(id) || {}).goalName).filter(Boolean);
  return { ...item, preGoalNames: names.join('、') };
}

export function goalListHandler() {
  return VISION_CATEGORIES.map(cat => ({
    categoryCode: cat.code,
    categoryName: cat.name,
    goals: goals
      .filter(g => g.categoryCode === cat.code)
      .sort((a, b) => a.sortNo - b.sortNo)
      .map(withPreGoalNames)
  }));
}

export function saveGoalHandler(data) {
  const payload = { ...data, categoryName: data.categoryName || categoryName(data.categoryCode) };
  if (!Array.isArray(payload.preGoalIds)) {
    payload.preGoalIds = payload.preGoalIds ? String(payload.preGoalIds).split(',').filter(Boolean) : [];
  }
  return withPreGoalNames(upsert(goals, payload, 'G'));
}

export function deleteGoalHandler(params) {
  removeById(goals, params.id);
  return true;
}

/* ---------------- 评估标准 ---------------- */

const file = (fileName, key, fileSize) => ({ fileName, attachmentKey: key, url: '', fileSize, uploadTime: '2026-09-05 15:30:00' });

const PROMPTS = {
  file: '请逐条解析上传的评审文件，将「申报条件」整理为资格门槛（gates，按条件类别分组），将「评分细则」整理为材料评分项（scoreItems，按一级指标分组），保留原文条款编号与分值，输出 JSON。',
  standard: '对照教师档案逐条判断资格门槛：能从档案直接读取的给出 pass/fail；档案缺失或需本人确认的给出 pending，并说明需补充的材料。判定依据须引用档案原始记录。',
  item: '按评分细则逐项计分：说明取数口径、命中的档案记录与得分过程；未达满分的项给出差距类型（数量/级别/缺失/质量/时间窗口）与可执行的补齐建议。',
  report: '基于门槛判定与评分结果生成面向教师本人的分析报告：先给结论，再列主要缺口与补齐路径，语气客观平实，不出具评审结论，不承诺申报结果。'
};

function standard(id, goalId, standardName, status, compareFiles, attachments, prompts = true) {
  const g = goalById(goalId);
  return {
    id,
    categoryCode: g.categoryCode,
    categoryName: g.categoryName,
    goalId,
    goalName: g.goalName,
    standardName,
    isEnable: 1,
    status,
    compareFile: compareFiles.length ? JSON.stringify(compareFiles) : '',
    attachment: attachments.length ? JSON.stringify(attachments) : '',
    standardCompareFilePrompt: prompts ? PROMPTS.file : '',
    standardComparePrompt: prompts ? PROMPTS.standard : '',
    itemComparePrompt: prompts ? PROMPTS.item : '',
    analysisReportPrompt: prompts ? PROMPTS.report : '',
    standardCompareContent: '',
    createTime: '2026-09-05 15:30:00',
    updateTime: '2026-10-14 09:18:00'
  };
}

export const standards = [
  standard('S101', 'G101', '南京市中小学一级教师职称评审条件（2025年修订）', 3,
    [file('南京市中小学教师一级职称评审条件（2025年修订）.pdf', 'std/2025/zc-yj-tj.pdf', 482113)],
    [file('2026年度中小学教师职称申报工作指南.docx', 'std/2026/zc-guide.docx', 96210)]),
  standard('S102', 'G102', '南京市中小学高级教师职称评审条件（2025年修订）', 3,
    [file('南京市中小学教师高级职称评审条件（2025年修订）.pdf', 'std/2025/zc-gj-tj.pdf', 530981)],
    [file('2026年度中小学教师职称申报工作指南.docx', 'std/2026/zc-guide.docx', 96210)]),
  standard('S103', 'G103', '江苏省中小学正高级教师评审条件（2024版）', 3,
    [file('江苏省中小学正高级教师职称评审条件.pdf', 'std/2024/zc-zg-tj.pdf', 612400)], []),
  standard('S201', 'G201', '玄武区中小学专业技术岗位等级晋升条件（2025）', 3,
    [file('玄武区中小学专业技术岗位等级晋升实施细则（2025）.pdf', 'std/2025/gw-ss.pdf', 318552)],
    [file('岗位等级晋升申报表（样表）.xlsx', 'std/2025/gw-form.xlsx', 22870)]),
  standard('S202', 'G202', '玄武区中小学专业技术岗位等级晋升条件（2025）· 九级', 3,
    [file('玄武区中小学专业技术岗位等级晋升实施细则（2025）.pdf', 'std/2025/gw-ss.pdf', 318552)], []),
  standard('S203', 'G203', '八级岗位晋升条件', 2, [], [], false),
  standard('S301', 'G301', '玄武区优秀青年教师评选条件（2026年）', 3,
    [file('关于开展2026年玄武区优秀青年教师评选工作的通知.pdf', 'std/2026/gg-qyq.pdf', 276340)],
    [file('玄武区优秀青年教师评选量化评分表.xlsx', 'std/2026/gg-qyq-score.xlsx', 31544)]),
  standard('S302', 'G302', '玄武区学科带头人评选条件（2026年）', 3,
    [file('玄武区学科带头人评选办法（2026年修订）.pdf', 'std/2026/gg-qdt.pdf', 301225)], []),
  standard('S303', 'G303', '南京市优秀青年教师评选办法（第十一批）', 1,
    [file('南京市第十一批优秀青年教师评选办法.pdf', 'std/2026/gg-syq.pdf', 355102)], [], false),
  standard('S304', 'G304', '南京市学科带头人评选办法（第十一批）', 3,
    [file('南京市第十一批学科带头人评选办法.pdf', 'std/2026/gg-sdt.pdf', 362890)],
    [file('学科带头人申报材料清单.docx', 'std/2026/gg-sdt-list.docx', 41003)])
];

const standardById = id => standards.find(s => String(s.id) === String(id));

function computeStandardStatus(item) {
  const hasFile = !!item.compareFile && item.compareFile !== '[]';
  if (!hasFile) return 2;
  const allPrompts = item.standardCompareFilePrompt && item.standardComparePrompt && item.itemComparePrompt && item.analysisReportPrompt;
  return allPrompts ? 3 : 1;
}

export function standardListHandler(params) {
  return standards
    .filter(s => !params || !params.goalId || String(s.goalId) === String(params.goalId))
    .filter(s => !params || !params.categoryCode || s.categoryCode === params.categoryCode)
    .map(s => {
      const g = goalById(s.goalId) || {};
      return { ...s, goalName: g.goalName || s.goalName, categoryName: categoryName(s.categoryCode) };
    });
}

export function standardDetailHandler(params) {
  const item = standardById(params.id);
  if (!item) return null;
  const detail = clone(item);
  if (!detail.standardCompareContent) detail.standardCompareContent = JSON.stringify(skeletonOf(item.id));
  return detail;
}

export function standardSaveHandler(data) {
  const payload = { ...data };
  delete payload.compareFileList;
  const g = goalById(payload.goalId) || {};
  payload.goalName = g.goalName || '';
  payload.categoryCode = payload.categoryCode || g.categoryCode;
  payload.categoryName = categoryName(payload.categoryCode);
  const saved = upsert(standards, payload, 'S');
  saved.status = computeStandardStatus(saved);
  return saved;
}

export function standardConfigPromptHandler(data) {
  const item = standardById(data.id);
  if (!item) return null;
  Object.assign(item, data, { updateTime: nowText() });
  item.status = computeStandardStatus(item);
  return item;
}

export function standardUpdateCompareContentHandler(data) {
  const item = standardById(data.id);
  if (item) item.standardCompareContent = data.standardCompareContent || '';
  return true;
}

export function standardDeleteHandler(params) {
  removeById(standards, params.id);
  return true;
}

export function standardGoalOptionsHandler(params) {
  return goals
    .filter(g => !params || !params.categoryCode || g.categoryCode === params.categoryCode)
    .sort((a, b) => a.sortNo - b.sortNo);
}

export function teacherGoalOptionsHandler() {
  return standards
    .filter(s => Number(s.status) === 3 && Number(s.isEnable) === 1)
    .map(s => {
      const g = goalById(s.goalId) || {};
      return { id: s.id, goalId: s.goalId, goalName: g.goalName, standardName: s.standardName, categoryCode: s.categoryCode, categoryName: categoryName(s.categoryCode), sortNo: g.sortNo };
    })
    .sort((a, b) => a.categoryCode.localeCompare(b.categoryCode) || a.sortNo - b.sortNo);
}

/* ---------------- 分析结果结构（门槛 + 评分项） ---------------- */

const records = list => JSON.stringify(list);
const gapDetail = (current, required, gap, deduction) => JSON.stringify({ current, required, gap, deduction });

function gate(id, checkItem, requirement, teacherValue, judge, extra = {}) {
  return {
    id,
    standardItemId: id,
    checkItem,
    requirement,
    teacherValue,
    judge,
    dataSource: 'auto',
    dataSourceFrom: '区校同源档案库',
    plainRule: '',
    standardBasis: requirement,
    archiveBasis: teacherValue,
    standardText: [{ itemKey: id.replace(/^[A-Z]+/, '第') + '条', text: requirement }],
    teacherAction: judge === 'pending' ? 'confirm' : 'none',
    fixSuggestion: '',
    records: '',
    ...extra
  };
}

function scoreItem(id, itemName, fullScore, score, extra = {}) {
  return {
    id,
    standardItemId: id,
    itemName,
    fullScore,
    score,
    gap: score === null ? null : score - fullScore,
    gapType: score === null ? 'tbd' : (score >= fullScore ? 'done' : 'num'),
    dataSource: 'auto',
    dataSourceFrom: '区校同源档案库',
    plainRule: '',
    howToScore: '',
    scoreRule: '',
    standardOriginal: '',
    suggestion: '',
    actionTip: '',
    teacherAction: 'none',
    records: '',
    gapDetail: '',
    isSum: 0,
    ...extra
  };
}

function finalize(structure) {
  const gateEntries = structure.gates.reduce((acc, g) => acc.concat(g.entries), []);
  const scoreEntries = structure.scoreItems.reduce((acc, g) => acc.concat(g.entries), []);
  const gateStat = {
    ok: gateEntries.filter(e => e.judge === 'pass').length,
    wait: gateEntries.filter(e => e.judge === 'pending').length,
    no: gateEntries.filter(e => e.judge === 'fail').length
  };
  const scored = scoreEntries.filter(e => e.score !== null && Number(e.isSum) !== 1);
  const conclusionLabel = { 1: '该目标已达成', 2: '具备申报资格', 3: '结论待确认', 4: '暂不具备申报资格' }[structure.conclusion];
  return {
    ...structure,
    gateTotal: gateEntries.length,
    scoreTotal: structure.conclusion === 4 || !scored.length ? null : scored.reduce((a, e) => a + e.score, 0),
    scoreFull: structure.conclusion === 4 || !scored.length ? null : scored.reduce((a, e) => a + e.fullScore, 0),
    sumStat: { conclusionLabel, gateStat }
  };
}

const LW_RECORDS = records(SELF_TEACHER.lw.map(r => ({ 数据ID: r.dataId, 论文题目: r.tm, '刊物/评比名称': r.kw, 级别: optionText(OPTIONS.jb, r.jb), 等第: optionText(OPTIONS.dj, r.dj), 时间: r.sj })));
const KT_RECORDS = records(SELF_TEACHER.kt.map(r => ({ 数据ID: r.dataId, 课题名称: r.mc, 级别: optionText(OPTIONS.jb, r.jb), 本人角色: optionText(OPTIONS.js, r.js), 研究状态: optionText(OPTIONS.zt, r.zt), 立项时间: r.lxsj })));
const GKK_RECORDS = records(SELF_TEACHER.gkk.map(r => ({ 数据ID: r.dataId, '课题/讲座名称': r.mc, 级别: optionText(OPTIONS.jb, r.jb), 类型: optionText(OPTIONS.lx, r.lx), 时间: r.sj })));
const BZR_RECORDS = records(SELF_TEACHER.bzr.map(r => ({ 数据ID: r.dataId, 学期: optionText(OPTIONS.xq, r.xq), 班级: r.bj, 岗位: optionText(OPTIONS.sfbzr, r.sfbzr) })));
const ZDXS_RECORDS = records(SELF_TEACHER.zdxs.map(r => ({ 数据ID: r.dataId, 学生姓名: r.xsxm, 赛事名称: r.ss, 级别: optionText(OPTIONS.jb, r.jb), 等第: optionText(OPTIONS.dj, r.dj), 获奖时间: r.sj })));
const JXJY_RECORDS = records(SELF_TEACHER.jxjy.map(r => ({ 数据ID: r.dataId, 培训项目: r.mc, 学时: r.xs, 年度: r.nd })));
const ZHRY_RECORDS = records(SELF_TEACHER.zhry.map(r => ({ 数据ID: r.dataId, 荣誉名称: r.mc, 级别: optionText(OPTIONS.jb, r.jb), 获得时间: r.hjsj })));

const STRUCTURE_BUILDERS = {
  // 一级教师：门槛基本满足，继续教育学时待确认，材料分缺口集中在教研科研
  S101: () => finalize({
    conclusion: 2,
    summary: '已满足一级教师申报的 5 项资格门槛，继续教育学时 1 项待本人确认；材料分 71 / 100，缺口主要集中在教研科研（论文与课题合计差 12 分），建议优先补齐论文与课题材料后在 2027 年度申报。',
    fixPath: [
      '在档案袋「继续教育」中确认 2026 年暑期全员培训 48 学时，补足 360 学时门槛',
      '2027 年 3 月前完成 1 篇区级及以上获奖或公开发表论文',
      '申请以核心成员身份加入学校区级规划课题',
      '2027 年春学期争取 1 节区级及以上公开课'
    ],
    gates: [
      { group: '基本条件', entries: [
        gate('GA1', '思想政治与师德', '拥护党的路线方针政策，任现职以来师德考核均为合格及以上，无师德失范行为', '2022-2026 年度师德考核均为合格', 'pass', { plainRule: '近几年师德考核没有不合格、没有师德问题即可。' }),
        gate('GA2', '学历与任职年限', '具有硕士学位，取得二级教师职称后从事教育教学工作满 2 年', '硕士研究生；2022-09 取得二级教师，任现职已满 4 年', 'pass', { plainRule: '硕士学历只需在二级教师岗位上干满 2 年。' }),
        gate('GA3', '年度考核', '任现职以来年度考核均为合格及以上', '2022-2025 年度考核：合格、优秀、合格、合格', 'pass')
      ] },
      { group: '任职经历', entries: [
        gate('GA4', '班主任经历', '任现职以来担任班主任或少先队辅导员工作满 1 年', '2023-2026 连续担任班主任 7 个学期', 'pass', { records: BZR_RECORDS }),
        gate('GA5', '继续教育', '任现职以来继续教育学时累计不少于 360 学时', '档案登记 312 学时，2026 年暑期全员培训 48 学时尚未同步', 'pending', {
          dataSource: 'auto2',
          teacherAction: 'confirm',
          fixSuggestion: '在档案袋「继续教育」中确认 2026 年暑期全员培训 48 学时记录，确认后累计 360 学时即可满足',
          records: JXJY_RECORDS
        }),
        gate('GA6', '普通话水平', '普通话水平测试等级达到二级乙等及以上', '二级甲等（2019 年取得）', 'pass')
      ] }
    ],
    scoreItems: [
      { category: '教育教学（40 分）', entries: [
        scoreItem('SA1', '课堂教学', 15, 13, { gapType: 'quality', howToScore: '按近三年课堂教学评价与公开课级别计分：校级展示课 2 分/节，区级 4 分/节，封顶 15 分', standardOriginal: '<b>第十二条</b>　课堂教学：近三年承担公开课、研究课，教学效果良好。', records: GKK_RECORDS, suggestion: '再争取 1 节区级及以上公开课即可拿满', gapDetail: gapDetail('区级研究课 1 节、校级展示课 1 节', '区级及以上公开课 ≥ 2 节', '差 1 节区级公开课', '按级别折算扣 2 分') }),
        scoreItem('SA2', '教学业绩', 15, 12, { gapType: 'quality', dataSource: 'school', dataSourceFrom: '学校教务处质量分析', howToScore: '取近三年所任班级学业质量评价等第：A 档 5 分/年，B 档 4 分/年', suggestion: '保持所任班级学业质量稳定在 A 档', gapDetail: gapDetail('近三年 B、A、B', '三年均为 A 档', '两年为 B 档', '每个 B 档扣 1 分，另扣 1 分') }),
        scoreItem('SA3', '班主任工作', 10, 10, { howToScore: '按担任班主任学期数计分，每学期 2 分，封顶 10 分', records: BZR_RECORDS })
      ] },
      { category: '教研科研（30 分）', entries: [
        scoreItem('SA4', '论文发表与获奖', 12, 6, { gapType: 'num', howToScore: '区级获奖 3 分/篇、市级及以上发表 3 分/篇，封顶 12 分', standardOriginal: '<b>第十五条</b>　任现职以来在区级及以上刊物发表或评比获奖教育教学论文不少于 2 篇。', records: LW_RECORDS, suggestion: '再完成 2 篇区级及以上获奖或公开发表论文', gapDetail: gapDetail('区级二等奖 1 篇、市级刊物发表 1 篇', '≥ 4 篇折算满分', '差 2 篇', '每差 1 篇扣 3 分') }),
        scoreItem('SA5', '课题研究', 10, 4, { gapType: 'level', howToScore: '校级课题主持 4 分，区级核心成员 6 分，区级主持或市级核心成员 10 分', records: KT_RECORDS, suggestion: '以核心成员身份参与区级及以上规划课题', gapDetail: gapDetail('校级课题主持人（在研）', '区级及以上课题核心成员', '课题级别不足', '级别折算扣 6 分') }),
        scoreItem('SA6', '公开课与讲座', 8, 6, { gapType: 'num', howToScore: '区级公开课 4 分/节，校级 2 分/节，封顶 8 分', records: GKK_RECORDS, suggestion: '再开设 1 节校级及以上公开课或专题讲座' })
      ] },
      { category: '专业发展（30 分）', entries: [
        scoreItem('SA7', '指导学生', 10, 8, { gapType: 'level', howToScore: '指导学生获区级一等奖 3 分、市级二等奖 5 分，封顶 10 分', records: ZDXS_RECORDS, suggestion: '指导学生参加市级及以上地理学科竞赛' }),
        scoreItem('SA8', '继续教育', 10, 7, { gapType: 'miss', dataSource: 'auto2', teacherAction: 'confirm', howToScore: '累计学时 ÷ 360 × 10，封顶 10 分', records: JXJY_RECORDS, suggestion: '确认 2026 年暑期全员培训学时后可得满分', gapDetail: gapDetail('已登记 312 学时', '360 学时', '差 48 学时', '按比例扣 3 分') }),
        scoreItem('SA9', '荣誉表彰', 10, 5, { gapType: 'level', howToScore: '校级荣誉 1 分/项，区级 3 分/项，市级及以上 5 分/项', records: ZHRY_RECORDS, suggestion: '争取区级及以上综合荣誉 1 项' })
      ] }
    ]
  }),
  // 十级岗位：现职称不满足岗位聘任条件
  S201: () => finalize({
    conclusion: 4,
    summary: '十级岗位需具备一级教师职称，当前为二级教师，暂不具备晋升资格；岗位年限与年度考核均已满足。建议先完成一级教师职称申报，取得职称后再申报岗位晋级。',
    fixPath: [
      '先申报一级教师职称（当前已具备申报资格）',
      '取得一级教师职称后，关注学校十级岗位空余职数公示',
      '岗位晋级申报时同步提交近三年年度考核结果'
    ],
    gates: [
      { group: '聘任条件', entries: [
        gate('GB1', '现聘岗位年限', '现聘十一级岗位满 3 年', '2021-09 起聘十一级岗位，已满 5 年', 'pass'),
        gate('GB2', '专业技术职称', '具有一级教师及以上职称', '二级教师', 'fail', { fixSuggestion: '先取得一级教师职称，当前已具备一级教师申报资格' }),
        gate('GB3', '年度考核', '近三年年度考核均为合格及以上', '2023-2025 年度考核：优秀、合格、合格', 'pass')
      ] },
      { group: '学校条件', entries: [
        gate('GB4', '岗位职数', '学校十级岗位有空余职数', '学校尚未公示 2027 年度岗位空余职数', 'pending', { dataSource: 'school', dataSourceFrom: '学校人事处', teacherAction: 'none', fixSuggestion: '关注学校人事处岗位空余职数公示' })
      ] }
    ],
    scoreItems: []
  }),
  // 区优秀青年教师：硬性条件基本满足，教学竞赛获奖需本人勾选确认
  S301: () => finalize({
    conclusion: 3,
    summary: '年龄、教龄、职称与公开课 4 项门槛已满足，「近三年区级及以上教学竞赛获奖」在档案中未找到对应记录，需本人确认；材料分 62 / 100，教学竞赛与课题研究是主要缺口。',
    fixPath: [
      '如有区级教学基本功比赛获奖，请在档案袋中勾选对应记录',
      '报名参加 2027 年 3 月玄武区青年教师教学基本功大赛',
      '申报 1 项区级个人课题或加入区级课题组'
    ],
    gates: [
      { group: '基本条件', entries: [
        gate('GC1', '年龄要求', '评选当年不超过 35 周岁', '1996 年出生，2026 年 30 周岁', 'pass'),
        gate('GC2', '教龄要求', '从事教育教学工作满 3 年', '2021-08 参加工作，教龄 5 年', 'pass'),
        gate('GC3', '职称要求', '具有二级教师及以上职称', '二级教师', 'pass')
      ] },
      { group: '业绩条件', entries: [
        gate('GC4', '公开课', '近三年开设区级及以上公开课或研究课不少于 1 节', '2025-04 区级研究课《城镇化》', 'pass', { records: GKK_RECORDS }),
        gate('GC5', '教学竞赛', '近三年获区级及以上教学竞赛（基本功、优质课）奖项', '档案中未找到教学竞赛获奖记录', 'pending', { dataSource: 'pick', teacherAction: 'pick', fixSuggestion: '如有区级及以上教学竞赛获奖，请在档案袋中勾选对应记录；如没有，可报名 2027 年 3 月区基本功大赛' })
      ] }
    ],
    scoreItems: [
      { category: '教学能力（40 分）', entries: [
        scoreItem('SC1', '课堂教学展示', 20, 16, { gapType: 'num', howToScore: '区级公开课 8 分/节、校级 4 分/节，封顶 20 分', records: GKK_RECORDS, suggestion: '再开设 1 节区级公开课' }),
        scoreItem('SC2', '教学竞赛', 20, 8, { gapType: 'miss', dataSource: 'pick', teacherAction: 'pick', howToScore: '区级一等奖 20 分、二等奖 14 分、三等奖 8 分；校级一等奖 8 分', records: ZHRY_RECORDS, suggestion: '参加区级教学基本功或优质课比赛', gapDetail: gapDetail('校级青年教师赛课一等奖', '区级教学竞赛获奖', '缺少区级竞赛成绩', '按校级折算扣 12 分') })
      ] },
      { category: '教科研（30 分）', entries: [
        scoreItem('SC3', '论文', 15, 9, { gapType: 'num', howToScore: '区级获奖 4.5 分/篇、市级发表 4.5 分/篇，封顶 15 分', records: LW_RECORDS, suggestion: '再完成 1 篇区级以上获奖论文' }),
        scoreItem('SC4', '课题', 15, 6, { gapType: 'level', howToScore: '校级主持 6 分，区级主持 15 分', records: KT_RECORDS, suggestion: '申报区级个人课题' })
      ] },
      { category: '育人成效（30 分）', entries: [
        scoreItem('SC5', '班主任工作', 15, 13, { gapType: 'quality', howToScore: '班主任每学期 2 分；获区级优秀班主任加 3 分，封顶 15 分', records: BZR_RECORDS, suggestion: '保持班主任工作并争取班级获评区级先进' }),
        scoreItem('SC6', '指导学生', 15, 10, { gapType: 'level', howToScore: '指导学生获区级一等奖 4 分、市级二等奖 6 分，封顶 15 分', records: ZDXS_RECORDS, suggestion: '指导学生参加市级地理竞赛并争取一等奖' })
      ] }
    ]
  })
};

// 其余标准按「申报条件 + 评分细则」通用骨架生成，用于新增愿景后的分析
function genericStructure(std) {
  const g = goalById(std.goalId) || {};
  const isTitle = g.categoryCode === 'zc';
  return finalize({
    conclusion: 4,
    summary: `「${g.goalName}」对任职年限与前置${isTitle ? '职称' : '称号'}有明确要求，按当前档案暂不具备申报资格。建议先完成前置目标，再按评分细则逐项积累材料。`,
    fixPath: [
      `先完成前置目标：${(g.preGoalIds || []).map(id => (goalById(id) || {}).goalName).filter(Boolean).join(' 或 ') || '前置条件'}`,
      '持续积累区级及以上公开课、论文与课题成果',
      '每学期末核对档案袋记录是否完整'
    ],
    gates: [
      { group: '基本条件', entries: [
        gate('GG1', '师德与年度考核', '任现职以来师德考核与年度考核均为合格及以上', '2022-2025 年度考核均为合格及以上', 'pass'),
        gate('GG2', '前置条件', `具备${(g.preGoalIds || []).map(id => (goalById(id) || {}).goalName).filter(Boolean).join('或') || '前置资格'}`, isTitle ? '二级教师' : '暂无骨干称号', 'fail', { fixSuggestion: '先取得前置职称或称号' }),
        gate('GG3', '任职年限', '取得前置资格后任职满 5 年', '尚未取得前置资格', 'fail')
      ] }
    ],
    scoreItems: [
      { category: '业绩成果', entries: [
        scoreItem('SG1', '课堂教学', 20, 12, { gapType: 'level', records: GKK_RECORDS, suggestion: '争取市级公开课' }),
        scoreItem('SG2', '教育科研', 20, 8, { gapType: 'level', records: LW_RECORDS, suggestion: '主持区级及以上课题' })
      ] }
    ]
  });
}

export function structureForStandard(standardId) {
  const builder = STRUCTURE_BUILDERS[standardId];
  if (builder) return builder();
  const std = standardById(standardId);
  return std ? genericStructure(std) : null;
}

const SKELETON_KEYS_DROP = ['teacherValue', 'judge', 'score', 'gap', 'gapType', 'records', 'gapDetail', 'suggestion', 'archiveBasis', 'fixSuggestion', 'actionTip'];

function skeletonOf(standardId) {
  const structure = structureForStandard(standardId);
  if (!structure) return { gates: [], scoreItems: [] };
  const strip = entry => {
    const copy = { ...entry };
    SKELETON_KEYS_DROP.forEach(k => delete copy[k]);
    return copy;
  };
  return {
    gates: structure.gates.map(g => ({ group: g.group, entries: g.entries.map(strip) })),
    scoreItems: structure.scoreItems.map(c => ({ category: c.category, entries: c.entries.map(strip) }))
  };
}

export function parsedSkeletonSample() {
  return skeletonOf('S101');
}

/* ---------------- 教师愿景与分析记录 ---------------- */

const SOURCE_TEXT = { auto: '自动采集档案', auto2: '自动采集 + 本人确认', pick: '本人选取', fill: '本人补录', school: '学校填报', manual: '人工评审' };

export const teacherGoals = [];
const analyses = [];
const reports = [];

function bindFieldNameOf(goalId) {
  const g = goalById(goalId) || {};
  return g.fieldName || '';
}

function createTeacherGoal(goalId, standardId, extra = {}) {
  const g = goalById(goalId) || {};
  const s = standardById(standardId) || {};
  const record = {
    id: extra.id || nextId('TG'),
    goalId,
    goalName: g.goalName,
    standardId,
    standardName: s.standardName,
    categoryCode: g.categoryCode,
    categoryName: g.categoryName,
    bindFieldName: bindFieldNameOf(goalId),
    analysisStatus: 1,
    lastAnalysisTime: '',
    pullTime: '',
    createTime: extra.createTime || nowText()
  };
  teacherGoals.push(record);
  return record;
}

function createAnalysis(teacherGoal, analyzeTime, finished = true) {
  const pullTime = analyzeTime;
  const record = {
    id: nextId('AN'),
    teacherGoalId: teacherGoal.id,
    goalId: teacherGoal.goalId,
    goalName: teacherGoal.goalName,
    standardId: teacherGoal.standardId,
    standardName: teacherGoal.standardName,
    status: finished ? 2 : 1,
    startedAt: Date.now(),
    pullTime,
    analyzeTime,
    structure: structureForStandard(teacherGoal.standardId)
  };
  record.analysisId = record.id;
  analyses.push(record);
  if (finished) {
    teacherGoal.analysisStatus = 3;
    teacherGoal.lastAnalysisTime = analyzeTime;
    teacherGoal.pullTime = pullTime;
  } else {
    teacherGoal.analysisStatus = 2;
  }
  return record;
}

function summaryOfAnalysis(a) {
  const s = a.structure || {};
  const stat = (s.sumStat && s.sumStat.gateStat) || {};
  return {
    id: a.id,
    analysisId: a.id,
    teacherGoalId: a.teacherGoalId,
    goalId: a.goalId,
    goalName: a.goalName,
    standardId: a.standardId,
    standardName: a.standardName,
    status: a.status,
    conclusion: s.conclusion,
    gateTotal: s.gateTotal,
    gatePassCount: stat.ok,
    gatePendingCount: stat.wait,
    gateFailCount: stat.no,
    scoreTotal: s.scoreTotal,
    scoreFull: s.scoreFull,
    aiSummary: s.summary,
    fixPath: s.fixPath,
    pullTime: a.pullTime,
    analyzeTime: a.analyzeTime
  };
}

// 预置三条愿景：一级教师 / 十级岗位 / 区优秀青年教师，均已完成一次分析
(function seed() {
  const tg1 = createTeacherGoal('G101', 'S101', { id: 'TG001', createTime: '2026-09-18 08:40:12' });
  const tg2 = createTeacherGoal('G301', 'S301', { id: 'TG002', createTime: '2026-09-18 08:41:30' });
  const tg3 = createTeacherGoal('G201', 'S201', { id: 'TG003', createTime: '2026-10-09 19:05:47' });
  createAnalysis(tg1, daysFromNow(-4, 9, 42));
  createAnalysis(tg2, daysFromNow(-6, 16, 5));
  createAnalysis(tg3, daysFromNow(-12, 20, 31));
  const a1 = analyses[0];
  reports.push(buildReport(tg1, a1, daysFromNow(-4, 9, 50)));
})();

export function myListHandler() {
  return teacherGoals.map(item => ({ ...item }));
}

export function teacherGoalAddHandler(data) {
  const combos = Array.isArray(data) ? data : [data];
  return combos
    .filter(c => c && c.goalId && c.standardId)
    .filter(c => !teacherGoals.some(t => String(t.standardId) === String(c.standardId)))
    .map(c => createTeacherGoal(c.goalId, c.standardId));
}

export function teacherGoalCancelHandler(params) {
  removeById(teacherGoals, params.id);
  return true;
}

const ANALYSIS_DURATION_MS = 6000;
const PROGRESS_STEPS = [
  [10, '正在拉取最新档案数据…'],
  [35, '正在逐条比对资格门槛…'],
  [65, '正在按评分细则计分…'],
  [90, '正在生成差距汇总与补齐路径…']
];

export function startAnalysisHandler(params) {
  const tg = teacherGoals.find(t => String(t.id) === String(params.teacherGoalId));
  if (!tg) return null;
  const record = createAnalysis(tg, '', false);
  return { analysisId: record.id, id: record.id };
}

function progressOf(record) {
  if (record.status !== 1) return { progress: 100, progressText: '分析完成', isFinished: true };
  const elapsed = Date.now() - record.startedAt;
  if (elapsed >= ANALYSIS_DURATION_MS) {
    const time = nowText();
    record.status = 2;
    record.analyzeTime = time;
    record.pullTime = time;
    const tg = teacherGoals.find(t => String(t.id) === String(record.teacherGoalId));
    if (tg) {
      tg.analysisStatus = 3;
      tg.lastAnalysisTime = time;
      tg.pullTime = time;
    }
    return { progress: 100, progressText: '分析完成', isFinished: true };
  }
  const pct = Math.round((elapsed / ANALYSIS_DURATION_MS) * 100);
  const step = PROGRESS_STEPS.filter(s => pct >= s[0]).pop() || [pct, '分析任务已创建，正在排队…'];
  return { progress: Math.max(5, pct), progressText: step[1], isFinished: false };
}

export function analysisResultHandler(params) {
  const record = analyses.find(a => String(a.id) === String(params.analysisId));
  if (!record) return null;
  const progress = progressOf(record);
  return { analysisId: record.id, status: record.status, errorMsg: '', ...progress };
}

const findAnalysis = id => analyses.find(a => String(a.id) === String(id));

export function analysisDetailHandler(params) {
  const record = findAnalysis(params.analysisId);
  return record ? summaryOfAnalysis(record) : null;
}

export function analysisLatestHandler(params) {
  const list = analyses.filter(a => String(a.teacherGoalId) === String(params.teacherGoalId) && a.status === 2);
  if (!list.length) return null;
  list.sort((a, b) => parseTime(b.analyzeTime) - parseTime(a.analyzeTime));
  return summaryOfAnalysis(list[0]);
}

export function analysisStructureHandler(params) {
  const record = findAnalysis(params.analysisId);
  return record ? clone(record.structure) : null;
}

export function gateListHandler(params) {
  const record = findAnalysis(params.analysisId);
  if (!record) return [];
  return record.structure.gates.reduce((acc, g) => acc.concat(g.entries.map(e => ({ ...e, groupName: g.group }))), []);
}

export function itemListHandler(params) {
  const record = findAnalysis(params.analysisId);
  if (!record) return [];
  return record.structure.scoreItems.reduce((acc, g) => acc.concat(g.entries.map(e => ({ ...e, categoryName: g.category }))), []);
}

/* ---------------- 标准管理 · 模拟分析 ---------------- */

const mockTasks = {};

export function mockAnalysisHandler(params) {
  const mockId = nextId('MK');
  mockTasks[mockId] = { createdAt: Date.now(), standardId: params.standardId, analysisType: Number(params.analysisType) };
  return { mockId };
}

export function mockResultHandler(params) {
  const task = mockTasks[params.mockId];
  if (!task) return { isFinished: true, status: 3, errorMsg: '模拟分析任务不存在或已过期' };
  if (Date.now() - task.createdAt < 4000) return { isFinished: false, status: 1 };
  const structure = structureForStandard(task.standardId) || { gates: [], scoreItems: [] };
  const mockResult = task.analysisType === 1
    ? { gates: structure.gates, scoreItems: [] }
    : { gates: [], scoreItems: structure.scoreItems };
  return { isFinished: true, status: 2, mockResult };
}

/* ---------------- 分析报告 ---------------- */

function buildReport(tg, analysis, generateTime) {
  const s = analysis.structure;
  const entries = s.scoreItems.reduce((acc, c) => acc.concat(c.entries), []);
  const content = {
    goalName: tg.goalName,
    standardName: tg.standardName,
    teacherName: SELF_TEACHER.base.xm,
    conclusion: s.conclusion,
    conclusionLabel: s.sumStat.conclusionLabel,
    scoreTotal: s.scoreTotal,
    scoreFull: s.scoreFull,
    scoreExcludeNote: entries.some(e => e.dataSource === 'school') ? '含学校填报的教学业绩项' : '',
    itemDetails: entries.map(e => ({ itemName: e.itemName, fullScore: e.fullScore, score: e.score, validScore: e.score, dataSource: SOURCE_TEXT[e.dataSource] || '自动采集档案' })),
    excludedItems: [],
    editedItems: [],
    gaps: entries
      .filter(e => e.score !== null && e.score < e.fullScore)
      .map(e => ({ itemName: e.itemName, gap: e.score - e.fullScore, suggestion: e.suggestion }))
      .sort((a, b) => a.gap - b.gap),
    fixPath: s.fixPath,
    pullTime: analysis.pullTime
  };
  return {
    id: nextId('RP'),
    teacherGoalId: tg.id,
    reportContent: JSON.stringify(content),
    generateTime,
    pullTime: analysis.pullTime,
    expired: false
  };
}

export function reportGenerateHandler(params) {
  const tg = teacherGoals.find(t => String(t.id) === String(params.teacherGoalId));
  if (!tg) return null;
  const latest = analysisLatestHandler({ teacherGoalId: tg.id });
  if (!latest) return null;
  const report = buildReport(tg, findAnalysis(latest.id), nowText());
  reports.push(report);
  return report;
}

export function reportLatestHandler(params) {
  const list = reports.filter(r => String(r.teacherGoalId) === String(params.teacherGoalId));
  return list.length ? list[list.length - 1] : null;
}
