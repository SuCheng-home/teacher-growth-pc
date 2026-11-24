// 首页大事件、评选活动、档案修改记录与填报任务、画像设置、提示词配置、字典与学年、选人、AI 生成
import { TEACHER_INDEXES, SELF_TEACHER, TEACHER_POOL, OPTIONS, findField } from './archive.js';
import { nowText, daysFromNow, paginate, upsert, removeById, parseTime, nextId } from './utils.js';
import { parsedSkeletonSample } from './vision.js';

/* ---------------- 字典与学年 ---------------- */

export const EVENT_CATEGORIES = [
  { code: 'zcps', name: '职称评审' },
  { code: 'pypx', name: '评优评先' },
  { code: 'jxbs', name: '教学比赛' },
  { code: 'dath', name: '档案填报' },
  { code: 'jyky', name: '教研科研' },
  { code: 'xnsw', name: '校内事务' }
];

const DICTS = {
  113701: EVENT_CATEGORIES,
  113702: [
    { code: 'zc', name: '职称晋升' },
    { code: 'gw', name: '岗位晋级' },
    { code: 'gg', name: '骨干称号' }
  ]
};

export function dictListHandler(params) {
  return (DICTS[String(params && params.constantId)] || []).map(item => ({ ...item, value: item.code, label: item.name }));
}

export const TERM_YEARS = [
  { termCode: '2026', termYear: '2026-2027学年', code: '2026', name: '2026-2027学年', isCurrent: 1 },
  { termCode: '2025', termYear: '2025-2026学年', code: '2025', name: '2025-2026学年', isCurrent: 0 },
  { termCode: '2024', termYear: '2024-2025学年', code: '2024', name: '2024-2025学年', isCurrent: 0 }
];

export function yearListHandler() {
  return TERM_YEARS;
}

/* ---------------- 大事件 ---------------- */

function eventStatus(e) {
  const now = Date.now();
  const start = parseTime(e.eventStartTime);
  const end = parseTime(e.eventEndTime);
  if (!isNaN(end) && end < now) return 1;
  if (!isNaN(start) && start > now) return 3;
  return 2;
}

function event(id, title, start, end, categoryCode, content, termCode = '2026') {
  return { id, title, eventStartTime: start, eventEndTime: end, categoryCode, termCode, content, createTime: '2026-08-30 09:00:00' };
}

const events = [
  event('EV01', '新学期教学常规检查', '2026-09-01 08:00:00', '2026-09-12 17:00:00', 'xnsw', '<p>各教研组于 9 月 12 日前完成教学计划、备课笔记与作业设计的检查与上传。</p>'),
  event('EV02', '2026 年教师节表彰大会', '2026-09-10 14:30:00', '2026-09-10 16:30:00', 'pypx', '<p>表彰 2025-2026 学年度优秀教育工作者、优秀班主任，地点：学校报告厅。</p>'),
  event('EV03', '玄武区教育教学论文评比收稿', '2026-09-20 08:00:00', '2026-10-31 17:00:00', 'jyky', '<p>论文须为本人原创，字数 4000-8000 字，统一通过区教研平台提交。</p>'),
  event('EV04', '南京市中小学地理优质课评比报名', '2026-10-12 08:00:00', '2026-12-10 17:00:00', 'jxbs', '<p>每校限报 1 人，<b>教龄 10 年以内</b>青年教师优先，报名表交教科室。</p>'),
  event('EV05', '2026 年度职称评审材料申报', daysFromNow(-21, 8), daysFromNow(6, 17), 'zcps', '<p>申报一级、高级教师职称的老师，请在档案袋中核对任职年限、继续教育学时与业绩材料，<b>逾期系统将关闭申报</b>。</p><p>材料审核：学校初审 → 区人社复核。</p>'),
  event('EV06', '玄武区第十一批优秀青年教师评选申报', daysFromNow(-8, 8), daysFromNow(11, 17), 'pypx', '<p>评选对象为 35 周岁以下、教龄满 3 年的在岗教师，需提交近三年公开课、竞赛与教科研材料。</p>'),
  event('EV07', '秋季学期教师档案集中填报', daysFromNow(-12, 8), daysFromNow(18, 17), 'dath', '<p>请于截止前补全本学期公开课、论文、获奖与继续教育记录，填报数据将同步至区档案库。</p>'),
  event('EV08', '期末教学质量分析会', '2027-01-18 14:00:00', '2027-01-18 17:00:00', 'xnsw', '<p>各备课组提交学科质量分析报告，教务处汇总后召开分析会。</p>'),
  event('EV09', '玄武区青年教师教学基本功大赛', '2027-03-09 08:00:00', '2027-03-27 17:00:00', 'jxbs', '<p>比赛包括教学设计、课堂教学与粉笔字三项，校内初赛于 3 月上旬举行。</p>'),
  event('EV10', '江苏省「师陶杯」教育科研论文评选', '2027-03-15 08:00:00', '2027-04-30 17:00:00', 'jyky', '<p>由学校教科室统一组织推荐，每人限报 1 篇。</p>'),
  event('EV11', '专业技术岗位等级晋升申报', '2027-05-06 08:00:00', '2027-05-24 17:00:00', 'zcps', '<p>学校根据空余岗位职数组织晋级申报，具体职数以人事处公示为准。</p>')
];

function eventView(e) {
  const cat = EVENT_CATEGORIES.find(c => c.code === e.categoryCode) || {};
  const term = TERM_YEARS.find(t => t.termCode === e.termCode) || {};
  return { ...e, status: eventStatus(e), categoryName: cat.name || '', termYear: term.termYear || '' };
}

export function eventPageHandler(params) {
  const list = events.slice().sort((a, b) => parseTime(a.eventStartTime) - parseTime(b.eventStartTime)).map(eventView);
  return paginate(list, params.currentPage, params.pageSize);
}

export function eventDetailHandler(params) {
  const e = events.find(item => String(item.id) === String(params.id));
  return e ? eventView(e) : null;
}

export function eventSaveHandler(data) {
  const payload = { ...data };
  if (Array.isArray(payload.timeRange)) {
    payload.eventStartTime = payload.eventStartTime || payload.timeRange[0];
    payload.eventEndTime = payload.eventEndTime || payload.timeRange[1];
    delete payload.timeRange;
  }
  return eventView(upsert(events, payload, 'EV'));
}

export function eventDeleteHandler(params) {
  removeById(events, params.id);
  return true;
}

/* ---------------- 评选活动 ---------------- */

const evaluations = [
  { id: 'AC201', title: '玄武区第十一批优秀青年教师评选', status: 1, startTime: daysFromNow(-8, 8), endTime: daysFromNow(11, 17) },
  { id: 'AC202', title: '2026 年南京市中小学地理优质课评比', status: 1, startTime: '2026-10-12 08:00:00', endTime: '2026-12-10 17:00:00' },
  { id: 'AC203', title: '2026 年玄武区教育教学论文评比', status: 4, startTime: '2026-09-20 08:00:00', endTime: '2026-10-31 17:00:00' },
  { id: 'AC204', title: '2027 年江苏省「师陶杯」教育科研论文评选', status: 3, startTime: '2027-03-15 08:00:00', endTime: '2027-04-30 17:00:00' },
  { id: 'AC205', title: '2027 年玄武区青年教师教学基本功大赛', status: 3, startTime: '2027-03-09 08:00:00', endTime: '2027-03-27 17:00:00' },
  { id: 'AC206', title: '2026 年玄武区班主任基本功大赛', status: 2, startTime: '2026-04-01 08:00:00', endTime: '2026-05-15 17:00:00' },
  { id: 'AC207', title: '2027 年校级青年教师赛课（筹备中）', status: 0, startTime: '2027-04-01 08:00:00', endTime: '2027-04-20 17:00:00' }
];

export function evaluationListHandler(params) {
  return paginate(evaluations, params.pageNumber, params.pageSize);
}

/* ---------------- 档案指标、档案数据、修改记录、填报任务 ---------------- */

export function teacherIndexListHandler(params) {
  const level = params && params.level !== undefined ? Number(params.level) : null;
  return TEACHER_INDEXES.filter(idx => level === null || idx.level === level);
}

export function teacherDataHandler() {
  return { teacher: JSON.parse(JSON.stringify(SELF_TEACHER)) };
}

const indexMeta = (indexName, fieldCode) => {
  const idx = TEACHER_INDEXES.find(i => i.name === indexName);
  const field = fieldCode ? findField(`${indexName}_${fieldCode}`) : null;
  return { type: field ? 'objectform' : idx.type, label: idx.label, name: idx.name, field: field || {} };
};

const archiveRecords = [
  { id: 'AR11', code: 'AR11', index: indexMeta('teacher_jxjy'), operationType: 'add', afterValue: { mc: '暑期全员培训', xs: 48, nd: '2026' }, approvalStatus: 1, approvalDescribe: '', createTime: daysFromNow(-1, 20, 16) },
  { id: 'AR10', code: 'AR10', index: indexMeta('teacher_base', 'rzrj'), operationType: 'modify', afterValue: '高二(4)班、高二(6)班地理 · 高二(4)班班主任', approvalStatus: 1, approvalDescribe: '', createTime: daysFromNow(-2, 17, 42) },
  { id: 'AR09', code: 'AR09', index: indexMeta('teacher_lw'), operationType: 'add', afterValue: { tm: '地理实践力导向的校园气象站课程设计', jb: '2' }, approvalStatus: 3, approvalDescribe: '缺少获奖证书扫描件，请补充后重新提交', createTime: daysFromNow(-6, 21, 3) },
  { id: 'AR08', code: 'AR08', index: indexMeta('teacher_zhry'), operationType: 'add', afterValue: { mc: '玄武区优秀班主任', jb: '2' }, approvalStatus: 2, approvalDescribe: '', createTime: daysFromNow(-15, 9, 30) },
  { id: 'AR07', code: 'AR07', index: indexMeta('teacher_base', 'xl'), operationType: 'modify', afterValue: '2', approvalStatus: 2, approvalDescribe: '', createTime: daysFromNow(-28, 11, 12) },
  { id: 'AR06', code: 'AR06', index: { type: 'file', label: '教师资格证书', field: {} }, operationType: 'modify', afterValue: 'cert/2021/zg.pdf', approvalStatus: 2, approvalDescribe: '', createTime: daysFromNow(-35, 15, 26) },
  { id: 'AR05', code: 'AR05', index: indexMeta('teacher_gkk'), operationType: 'add', afterValue: { mc: '《城镇化》区级研究课', jb: '2' }, approvalStatus: 2, approvalDescribe: '', createTime: daysFromNow(-60, 10, 8) }
];

export function archiveRecordPageHandler(params) {
  return paginate(archiveRecords, params.currentPage, params.pageSize);
}

export function archiveStatusNumHandler() {
  return {
    pendingNum: archiveRecords.filter(r => r.approvalStatus === 1).length,
    passNum: archiveRecords.filter(r => r.approvalStatus === 2).length + 6,
    backNum: archiveRecords.filter(r => r.approvalStatus === 3).length
  };
}

const archiveTasks = [
  { id: 'TK2026B', code: 'TK2026B', title: '2026 年秋季学期教师档案集中填报', teacherReportStartTime: daysFromNow(-12, 8), teacherReportEndTime: daysFromNow(18, 17), orgType: 3, status: 1 },
  { id: 'TK2026A', code: 'TK2026A', title: '2026 年春季学期教师档案集中填报', teacherReportStartTime: '2026-03-02 08:00:00', teacherReportEndTime: '2026-03-31 17:00:00', orgType: 3, status: 2 },
  { id: 'TK2025B', code: 'TK2025B', title: '2025 年秋季学期教师档案集中填报', teacherReportStartTime: '2025-11-03 08:00:00', teacherReportEndTime: '2025-11-30 17:00:00', orgType: 3, status: 2 }
];

export function archiveTaskPageHandler(params) {
  return paginate(archiveTasks, params.currentPage, params.pageSize);
}

/* ---------------- 个人画像 ---------------- */

const scopeOptions = list => JSON.stringify(list);

const profileBinds = [
  { id: 'PI01', bindType: 1, moduleCode: 1, slotCode: 'honor', showLabel: '骨干教师称号', indexName: 'teacher_honor_2024', indexType: 'objectform', indexFieldName: 'teacher_honor_2024_ch', compareMethod: 4, fieldScopeOptions: scopeOptions(OPTIONS.ch), specialOptionKeys: '5', unitLabel: '', sortNo: 1, isEnable: 1 },
  { id: 'PI02', bindType: 2, moduleCode: 1, slotCode: 'title', showLabel: '专业技术职称', indexName: 'teacher_base', indexType: 'objectform', indexFieldName: 'teacher_base_zc', compareMethod: 4, fieldScopeOptions: scopeOptions(OPTIONS.zc), specialOptionKeys: '5', unitLabel: '', sortNo: 2, isEnable: 1 },
  { id: 'PI03', bindType: 3, moduleCode: 1, slotCode: 'grade', showLabel: '专业技术岗位', indexName: 'teacher_base', indexType: 'objectform', indexFieldName: 'teacher_base_gw', compareMethod: 4, fieldScopeOptions: scopeOptions(OPTIONS.gw), specialOptionKeys: '', unitLabel: '', sortNo: 3, isEnable: 1 },
  { id: 'PI04', bindType: 4, moduleCode: 1, slotCode: 'subject', showLabel: '主教学科', indexName: 'teacher_base', indexType: 'objectform', indexFieldName: 'teacher_base_xk', compareMethod: 4, fieldScopeOptions: scopeOptions(OPTIONS.xk), specialOptionKeys: '', unitLabel: '', sortNo: 4, isEnable: 1 },
  { id: 'PI05', bindType: 5, moduleCode: 2, slotCode: 'teachYears', showLabel: '教龄', indexName: 'teacher_base', indexType: 'objectform', indexFieldName: 'teacher_base_jl', compareMethod: 4, fieldScopeOptions: '', specialOptionKeys: '', unitLabel: '年', sortNo: 5, isEnable: 1 },
  { id: 'PI06', bindType: 6, moduleCode: 2, slotCode: 'post', showLabel: '任职任教', indexName: 'teacher_base', indexType: 'objectform', indexFieldName: 'teacher_base_rzrj', compareMethod: 4, fieldScopeOptions: '', specialOptionKeys: '', unitLabel: '', sortNo: 6, isEnable: 1 },
  { id: 'PI07', bindType: 7, moduleCode: 3, slotCode: 'headTeacher', showLabel: '班主任工作', indexName: 'teacher_bzr', indexType: 'arrayform', indexFieldName: 'teacher_bzr_xq', compareMethod: 3, compareFieldName: 'teacher_bzr_xq', timeFieldName: '', fieldScopeOptions: '', specialOptionKeys: '', statConfig: JSON.stringify({ dedupKey: 'teacher_bzr_xq' }), unitLabel: '个学期', sortNo: 7, isEnable: 1 },
  { id: 'PI08', bindType: 8, moduleCode: 3, slotCode: 'guideAward', showLabel: '指导学生获奖', indexName: 'teacher_zdxs', indexType: 'arrayform', indexFieldName: 'teacher_zdxs_ss', compareMethod: 1, fieldScopeOptions: '', specialOptionKeys: '', unitLabel: '项', sortNo: 8, isEnable: 1 },
  { id: 'PI09', bindType: 9, moduleCode: 4, slotCode: 'award', showLabel: '竞赛/获奖', indexName: 'teacher_zhry', indexType: 'arrayform', indexFieldName: 'teacher_zhry_mc', compareMethod: 1, fieldScopeOptions: '', specialOptionKeys: '', unitLabel: '项', sortNo: 9, isEnable: 1 },
  { id: 'PI10', bindType: 10, moduleCode: 1, slotCode: 'political', showLabel: '政治面貌', indexName: 'teacher_base', indexType: 'objectform', indexFieldName: 'teacher_base_zzmm', compareMethod: 4, fieldScopeOptions: scopeOptions(OPTIONS.zzmm), specialOptionKeys: '', unitLabel: '', sortNo: 10, isEnable: 2 }
].map(item => ({ compareFieldName: '', timeFieldName: '', statConfig: '', createTime: '2026-09-03 10:20:00', ...item }));

export function profileBindListHandler(params) {
  return profileBinds
    .filter(b => !params.moduleCode || String(b.moduleCode) === String(params.moduleCode))
    .filter(b => !params.bindType || String(b.bindType) === String(params.bindType))
    .filter(b => !params.isEnable || String(b.isEnable) === String(params.isEnable))
    .slice()
    .sort((a, b) => a.sortNo - b.sortNo);
}

export function profileBindEnabledListHandler() {
  return profileBindListHandler({ isEnable: 1 });
}

export function profileBindSaveHandler(data) {
  return upsert(profileBinds, { isEnable: 1, ...data }, 'PI');
}

export function profileBindDeleteHandler(params) {
  removeById(profileBinds, params.id);
  return true;
}

export function profileBindUpdateEnableHandler(params) {
  const item = profileBinds.find(b => String(b.id) === String(params.id));
  if (item) item.isEnable = Number(params.isEnable);
  return true;
}

export function personalProfileHandler(data) {
  const wanted = (data && data.indexNameList) || [];
  const teacher = JSON.parse(JSON.stringify(SELF_TEACHER));
  if (wanted.length) {
    Object.keys(teacher).forEach(key => {
      if (wanted.indexOf(`teacher_${key}`) < 0) delete teacher[key];
    });
  }
  return { teacherData: { teacher }, bindList: profileBindEnabledListHandler() };
}

const scoreTypes = [
  { id: 'ST1', typeName: '卓越引领型', levelNo: 1, minScore: 90, maxScore: null, typeDesc: '六维发展均衡且多项领先，具备区域示范引领能力', color: '#1f5a4a', isEnable: 1 },
  { id: 'ST2', typeName: '骨干成熟型', levelNo: 2, minScore: 80, maxScore: 90, typeDesc: '教学与教研成果稳定，可承担校级骨干任务', color: '#2f7a5f', isEnable: 1 },
  { id: 'ST3', typeName: '稳步发展型', levelNo: 3, minScore: 65, maxScore: 80, typeDesc: '教学基本功扎实，教研与示范引领仍有提升空间', color: '#5b8f6a', isEnable: 1 },
  { id: 'ST4', typeName: '成长进阶型', levelNo: 4, minScore: 50, maxScore: 65, typeDesc: '处于专业成长关键期，建议聚焦课堂与教研双线突破', color: '#8aa66b', isEnable: 1 },
  { id: 'ST5', typeName: '入职适应型', levelNo: 5, minScore: 0, maxScore: 50, typeDesc: '以站稳讲台为首要目标，配合师徒结对快速成长', color: '#a7a37a', isEnable: 1 }
].map(item => ({ createTime: '2026-09-03 10:30:00', ...item }));

export function scoreTypeListHandler() {
  return scoreTypes.slice().sort((a, b) => a.levelNo - b.levelNo);
}

export function scoreTypeEnabledListHandler() {
  return scoreTypeListHandler().filter(item => Number(item.isEnable) === 1);
}

export function scoreTypeSaveHandler(data) {
  return upsert(scoreTypes, data, 'ST');
}

export function scoreTypeDeleteHandler(params) {
  removeById(scoreTypes, params.id);
  return true;
}

export function scoreTypeUpdateEnableHandler(params) {
  const item = scoreTypes.find(s => String(s.id) === String(params.id));
  if (item) item.isEnable = Number(params.isEnable);
  return true;
}

export function scoreTypeMatchHandler(params) {
  const score = Number(params.score);
  return scoreTypeEnabledListHandler().find(item => score >= Number(item.minScore) && (item.maxScore === null || item.maxScore === '' || score < Number(item.maxScore))) || null;
}

let showSet = {
  id: 'PS01',
  reportTitle: '教师发展画像报告',
  reportEyebrow: 'TEACHER DEVELOPMENT PORTRAIT REPORT',
  reportHeader: 'AI 生成解读 · 不构成评审结论',
  disclaimer: '<b>免责声明</b>：本报告由系统按既定计分口径与档案数据自动生成，AI 仅参与文字表述，不裁决资格、不修改分值、不出具评审结论。报告中的每一项判定与数据均可回溯至档案原文与标准细则；最终以档案原文及学校、区正式评审结论为准。',
  updateTime: '2026-10-21 15:12:00'
};

export function showSetGetHandler() {
  return showSet;
}

export function showSetSaveHandler(data) {
  showSet = { ...showSet, ...data, updateTime: nowText() };
  return showSet;
}

/* ---------------- AI 提示词配置 ---------------- */

const promptConfigs = [
  { id: 'PC01', promptType: 'vision_analysis', promptName: '成长愿景 · 资格预审分析', promptContent: '你是区校教师发展中心的资格预审助手。请严格依据评审标准原文与教师档案逐条判断，不臆测、不补全档案中不存在的材料。', version: 'v1.4', isEnable: 1 },
  { id: 'PC02', promptType: 'portrait_report', promptName: '个人画像 · 报告解读', promptContent: '请基于六维统计与同辈分位，为教师本人生成发展画像解读：先说优势，再说短板，最后给出 2-3 条可执行建议。', version: 'v1.2', isEnable: 1 },
  { id: 'PC03', promptType: 'peer_summary', promptName: '同辈对标 · AI 小结', promptContent: '请用平实的语言解释教师在同辈组内的相对位置，说明对比口径，不对教师进行排名评价。', version: 'v1.1', isEnable: 1 },
  { id: 'PC04', promptType: 'assistant', promptName: 'AI 助手 · 通用问答', promptContent: '你是教师成长平台的 AI 助手，回答须引用平台数据来源；涉及资格与评审结论的问题，提示以正式评审为准。', version: 'v2.0', isEnable: 1 }
].map(item => ({ updateTime: '2026-10-08 11:00:00', ...item }));

export function promptListHandler(params) {
  return promptConfigs.filter(p => !params.promptType || p.promptType === params.promptType);
}

export function promptGetByTypeHandler(params) {
  return promptConfigs.find(p => p.promptType === params.promptType) || null;
}

export function promptSaveHandler(data) {
  return upsert(promptConfigs, data, 'PC');
}

export function promptDeleteHandler(params) {
  removeById(promptConfigs, params.id);
  return true;
}

/* ---------------- 选人 ---------------- */

const maskPhone = p => String(p).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

export function teacherPageHandler(params) {
  const keyword = (params.name || '').trim();
  const list = TEACHER_POOL
    .filter(t => !keyword || t.userName.indexOf(keyword) > -1)
    .map(t => ({
      id: t.id,
      userName: t.userName,
      trueName: t.userName,
      name: t.userName,
      cardId: t.cardId,
      enCardId: 'enc_' + t.cardId,
      phoneNumber: maskPhone(t.phoneNumber),
      avatar: '',
      unitName: '南京市第十三中学'
    }));
  return paginate(list, params.pageNumber, params.pageSize);
}

/* ---------------- AI 生成 ---------------- */

export function aiGenerateHandler(data) {
  const payload = data || {};
  if (payload.output_format === 'json') {
    return { output: parsedSkeletonSample(), conversationId: nextId('CV') };
  }
  const base = String(payload.user_input || '').trim();
  const text = [
    '【角色】你是区校教师发展中心的评审辅助分析员。',
    '【任务】' + (base || '依据评审标准与教师档案完成逐条分析。'),
    '【约束】只依据标准原文与档案记录作答；档案缺失时明确标注「待本人确认」，不臆测补全。',
    '【输出】按资格门槛 → 评分项 → 补齐建议的顺序输出，语言平实，避免使用结论性评审用语。'
  ].join('\n');
  return { text, output: text, conversationId: nextId('CV') };
}
