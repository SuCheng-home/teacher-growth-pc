/**
 * 后台管理（admin v2.0）演示样例数据
 * 来源：admin_v2.0_20260928.html 内联 JS 常量，作为高保真静态演示的默认数据源。
 * 说明：各页面在 data() 中深拷贝使用，避免跨页面互相影响本地编辑状态。
 */

// 愿景分类
export const CATS = [
  { id: 'honor_subj', name: '骨干教师称号（学科）', icon: 'award' },
  { id: 'honor_moral', name: '骨干教师称号（德育）', icon: 'handshake' },
  { id: 'title', name: '职称', icon: 'graduation-cap' },
  { id: 'grade', name: '小岗位', icon: 'layers' },
  { id: 'newstar', name: '教坛新秀', icon: 'sparkles' }
];

// 愿景目标（分类下的可选愿景）
export const GOALS = [
  { cat: 'honor_subj', name: '区优秀青年教师', sort: 10, pre: [], wait: false },
  { cat: 'honor_subj', name: '区学科带头人', sort: 20, pre: ['区优秀青年教师'], wait: false },
  { cat: 'honor_subj', name: '市优秀青年教师', sort: 30, pre: ['区优秀青年教师', '区学科带头人'], wait: false },
  { cat: 'honor_subj', name: '市学科带头人', sort: 40, pre: ['市优秀青年教师'], wait: false },
  { cat: 'honor_moral', name: '区德育优秀青年教师', sort: 10, pre: [], wait: false },
  { cat: 'honor_moral', name: '区德育学科带头人', sort: 20, pre: ['区德育优秀青年教师'], wait: false },
  { cat: 'title', name: '二级教师', sort: 10, pre: [], wait: false },
  { cat: 'title', name: '一级教师', sort: 20, pre: ['二级教师'], wait: false },
  { cat: 'title', name: '高级教师（副高）', sort: 30, pre: ['一级教师'], wait: false },
  { cat: 'title', name: '正高级教师', sort: 40, pre: ['高级教师（副高）'], wait: true },
  { cat: 'grade', name: '十一级', sort: 10, pre: [], wait: false },
  { cat: 'grade', name: '十级', sort: 20, pre: ['十一级'], wait: true },
  { cat: 'grade', name: '九级', sort: 30, pre: ['十级'], wait: false },
  { cat: 'grade', name: '八级', sort: 40, pre: ['九级'], wait: false },
  { cat: 'grade', name: '七级', sort: 50, pre: ['八级'], wait: true },
  { cat: 'grade', name: '六级', sort: 60, pre: ['七级'], wait: false },
  { cat: 'grade', name: '五级', sort: 70, pre: ['六级'], wait: false },
  { cat: 'newstar', name: '教坛新秀', sort: 10, pre: [], wait: true }
];

// 标准列表（分类 + 目标 + 评比文件）
export const STD_LIST = [
  { id: 's1', cat: 'honor_subj', tgt: '区优秀青年教师', name: '玄教〔2025〕30 号 · 第十届玄武区优秀青年教师评选通知', file: '玄教〔2025〕30号 (1).docx', file2: '', wait: false },
  { id: 's2', cat: 'honor_subj', tgt: '区优秀青年教师', name: '区青优推荐材料评审量化评分表（200 分制）', file: '区青优推荐材料评审量化评分表20250318.doc', file2: '', wait: false },
  { id: 's3', cat: 'honor_subj', tgt: '区学科带头人', name: '玄武区学科带头人评选办法', file: '', file2: '', wait: true },
  { id: 's4', cat: 'honor_subj', tgt: '市优秀青年教师', name: '市优秀青年教师评选办法', file: '', file2: '', wait: true },
  { id: 's5', cat: 'honor_subj', tgt: '市学科带头人', name: '市学科带头人评选办法', file: '', file2: '', wait: true },
  { id: 's6', cat: 'honor_moral', tgt: '区德育优秀青年教师', name: '玄武区德育优青评选办法', file: '', file2: '', wait: true },
  { id: 's7', cat: 'honor_moral', tgt: '区德育学科带头人', name: '区德育学科带头人评选办法', file: '', file2: '', wait: true },
  { id: 's8', cat: 'title', tgt: '二级教师', name: '二级教师任职条件', file: '', file2: '', wait: false },
  { id: 's9', cat: 'title', tgt: '一级教师', name: '一级教师岗位任职条件评分细则定稿', file: '一级教师评分细则.doc', file2: '', wait: false },
  { id: 's10', cat: 'title', tgt: '高级教师（副高）', name: '高级教师岗位任职条件评分细则定稿', file: '高级教师评分细则.doc', file2: '', wait: false },
  { id: 's11', cat: 'title', tgt: '正高级教师', name: '正高级教师任职条件', file: '', file2: '', wait: true },
  { id: 's12', cat: 'grade', tgt: '十一级', name: '教师岗位基本任职条件评分细则（11级）', file: '教师岗位基本任职条件评分细则(11级).doc', file2: '', wait: false },
  { id: 's13', cat: 'grade', tgt: '十级', name: '教师岗位基本任职条件评分细则（十级）', file: '', file2: '', wait: true },
  { id: 's14', cat: 'grade', tgt: '九级', name: '教师岗位基本任职条件评分细则（9级）', file: '教师岗位基本任职条件评分细则(9级).doc', file2: '', wait: false },
  { id: 's15', cat: 'grade', tgt: '八级', name: '教师岗位基本任职条件评分细则（8级）', file: '教师岗位基本任职条件评分细则(8级).doc', file2: '', wait: false },
  { id: 's16', cat: 'grade', tgt: '七级', name: '教师岗位基本任职条件评分细则（七级）', file: '', file2: '', wait: true },
  { id: 's17', cat: 'grade', tgt: '六级', name: '教师岗位基本任职条件评分细则（6级）', file: '教师岗位基本任职条件评分细则(6级).doc', file2: '', wait: false },
  { id: 's18', cat: 'grade', tgt: '五级', name: '玄武区中小学教师系列五级教师评比细则（2023版）', file: '五级教师评比细则（2023版）.doc', file2: '', wait: false },
  { id: 's19', cat: 'newstar', tgt: '教坛新秀', name: '教坛新秀评选办法', file: '', file2: '', wait: true }
];

// 分类 id → 名称
export function catName(id) {
  const c = CATS.find((x) => x.id === id);
  return c ? c.name : id;
}

/* ============ 画像维度配置 dims ============ */
// 六维默认（① 维度与档案域）
export const DIMS_DEF = [
  { n: '教学实践', base: 23, fields: ['公开课（学科类）', '讲座（学科类）', '数字化教学类评比', '教学成果奖（学科类）'] },
  { n: '教研科研', base: 20, fields: ['论文发表（学科类）', '论文案例获奖（学科类）', '规划课题或项目研究'] },
  { n: '德育工作', base: 21, fields: ['指导学生获奖', '综合表彰（学科类）', '个人业务获奖'] },
  { n: '示范引领', base: 20, fields: ['指导青年教师（学科类）', '骨干教师荣誉最高称号'] },
  { n: '管理履职', base: 8, fields: ['行政职务', '职级', '岗位等级', '教龄'] },
  { n: '专业研修', base: 8, fields: ['最高学历', '最高学位', '现专业技术职称名称', '当年参与评定的荣誉称号'] }
];
// ② 计分参数默认档位
export const PAR_DEF = {
  lvl: { 校级: 1, 区级: 3, 市级: 6, 省级: 10, 国家级: 15, 高校组织: 3, 核心期刊: 8, 正式刊物: 3, '省级及以上（历史）': 10 },
  role: { 主持: 1, 核心: 0.7, 参与: 0.4, 师徒结对导师: 0.8, 区名特优签约培养导师: 1, 个人课题: 0.7 },
  time: { '≤3年': 1, '3-5年': 0.6, '5-10年': 0.3, '>10年': 0.1 }
};
// ③ 事件映射默认
export const EV_DEF = [
  { t: '公开课（学科类）', lv: '市级', role: '主持', yr: 2025, dim: '教学实践' },
  { t: '公开课（学科类）', lv: '市级', role: '主持', yr: 2024, dim: '教学实践' },
  { t: '讲座（学科类）', lv: '区级', role: '主持', yr: 2025, dim: '教学实践' },
  { t: '数字化教学类评比', lv: '区级', role: '主持', yr: 2024, dim: '教学实践' },
  { t: '教学成果奖（学科类）', lv: '市级', role: '参与', yr: 2023, dim: '教学实践' },
  { t: '规划课题或项目研究', lv: '市级', role: '主持', yr: 2024, dim: '教研科研' },
  { t: '论文案例获奖（学科类）', lv: '市级', role: '主持', yr: 2025, dim: '教研科研' },
  { t: '论文发表（学科类）', lv: '校级', role: '主持', yr: 2025, dim: '教研科研' },
  { t: '指导学生获奖', lv: '区级', role: '主持', yr: 2024, dim: '德育工作' },
  { t: '综合表彰（学科类）', lv: '区级', role: '主持', yr: 2025, dim: '德育工作' },
  { t: '个人业务获奖', lv: '区级', role: '主持', yr: 2025, dim: '德育工作' },
  { t: '指导青年教师（学科类）', lv: '区级', role: '主持', yr: 2024, dim: '示范引领' },
  { t: '骨干教师荣誉最高称号', lv: '区级', role: '主持', yr: 2024, dim: '示范引领' },
  { t: '综合表彰（学科类）', lv: '市级', role: '核心', yr: 2023, dim: '示范引领' },
  { t: '班主任年限', lv: '校级', role: '主持', yr: 2025, dim: '管理履职' },
  { t: '教研组长', lv: '校级', role: '主持', yr: 2024, dim: '管理履职' },
  { t: '行政职务', lv: '校级', role: '主持', yr: 2025, dim: '管理履职' },
  { t: '继续教育学时', lv: '校级', role: '主持', yr: 2025, dim: '专业研修' },
  { t: '最高学历', lv: '校级', role: '主持', yr: 2026, dim: '专业研修' },
  { t: '现专业技术职称名称', lv: '校级', role: '主持', yr: 2026, dim: '专业研修' }
];
// 档案域（事件归属维度可选字段来源）
export const PE_DOMAIN = { basic: '教师基础情况', achievement: '个人业务获奖', openclass: '公开课（学科类）', studentaward: '指导学生获奖', mentor: '指导青年教师（学科类）', teachingaward: '教学成果奖（学科类）', digitalaward: '数字化教学类评比', commendation: '综合表彰（学科类）', project: '规划课题或项目研究', lecture: '讲座（学科类）', paper: '论文发表（学科类）', paperaward: '论文案例获奖（学科类）' };

/* ============ 我的画像设置 ptcfg ============ */
export const PTCFG_SECS = [
  { k: 'goal', n: '目标锚点' }, { k: 'card', n: '画像总览' }, { k: 'dims', n: '六维解析' },
  { k: 'peer', n: '同辈对比' }, { k: 'peerreport', n: '同辈对比报告' }, { k: 'ai', n: '综合研判' }, { k: 'use', n: '下一步动作' }
];
export const PTCFG_DEF = {
  data: { window: '3y', showFresh: true },
  frame: {
    title: '教师发展画像报告',
    sub: 'TEACHER DEVELOPMENT PORTRAIT REPORT',
    headNote: 'AI 生成解读 · 不构成评审结论',
    disclaimer: '<b>免责声明</b>：本报告由系统按既定计分口径与档案数据自动生成，AI 仅参与文字表述，不裁决资格、不修改分值、不出具评审结论。报告中的每一项判定与数据均可回溯至档案原文与标准细则；最终以档案原文及学校、区正式评审结论为准。',
    sections: { goal: true, card: true, dims: true, peer: true, peerreport: true, ai: true, use: true }
  }
};

/* ============ 同辈对标设置 peer ============ */
export const PE_MINE_DEF = [
  { d: 'basic', n: '主教学科', k: 'basic.subject', t: '枚举', disp: '任教信息', sort: 10, def: true },
  { d: 'basic', n: '学段', k: 'basic.stage', t: '枚举', disp: '学段', sort: 20, def: false },
  { d: 'basic', n: '教龄', k: 'basic.teach_years', t: '数字', disp: '教龄段', sort: 30, step: 5, start: 0, def: false },
  { d: 'basic', n: '年龄', k: 'basic.age', t: '数字', disp: '年龄段', sort: 40, step: 5, start: 20, def: false },
  { d: 'basic', n: '性别', k: 'basic.gender', t: '枚举', disp: '性别', sort: 50, def: false },
  { d: 'basic', n: '骨干教师荣誉最高称号', k: 'basic.honor_top', t: '枚举', disp: '骨干称号', sort: 60, def: false },
  { d: 'basic', n: '现专业技术职称名称', k: 'basic.title', t: '枚举', disp: '职称', sort: 70, def: false },
  { d: 'basic', n: '岗位等级', k: 'basic.post_level', t: '枚举', disp: '岗位等级', sort: 80, def: false }
];
export const PE_QUERY_DEF = [
  { d: 'basic', n: '人员状态', k: 'basic.status', t: '枚举', disp: '在线状态', sort: 10 },
  { d: 'basic', n: '是否退休', k: 'basic.retired', t: '布尔', disp: '是否退休', sort: 20, derived: true },
  { d: 'basic', n: '学段', k: 'basic.stage', t: '枚举', disp: '学段', sort: 30 },
  { d: 'basic', n: '主教学科', k: 'basic.subject', t: '枚举', disp: '主教学科', sort: 40 },
  { d: 'basic', n: '教龄', k: 'basic.teach_years', t: '数字', disp: '教龄', sort: 50 },
  { d: 'basic', n: '年龄', k: 'basic.age', t: '数字', disp: '年龄', sort: 60 },
  { d: 'basic', n: '性别', k: 'basic.gender', t: '枚举', disp: '性别', sort: 70 },
  { d: 'basic', n: '现专业技术职称名称', k: 'basic.title', t: '枚举', disp: '现专业技术职称名称', sort: 90 },
  { d: 'basic', n: '岗位等级', k: 'basic.post_level', t: '枚举', disp: '岗位等级', sort: 100 }
];
export const PE_OPS_TEXT = '在线状态 = 在职\n是否退休 = 否\n对象集时间 <= 3年';
export const PE_OUT = [
  { k: 'score', icon: 'percent', title: '（一）综合分位的提示词', side: '组内分位 · 六类等权平均', gen: '请按「六大类」汇总教师档案字段，对每一类分别取组内分位（分位＝我超过组内多少比例的人），再对六类等权平均得到综合分位。\n输出的格式为：{"rank":"前X.X%","n":"组内人数","byDim":{"教学实践":"前X.X%",…}}。\n要求：所有业务数据全部取近三年；对象集先按「在线状态＝在职 且 是否退休＝否 且 对象集时间＜＝3年」过滤。' },
  { k: 'radar', icon: 'radar', title: '（二）雷达图结果的提示词', side: '生成脚本 → AI 提示词', gen: '请把现在的教师档案字段分为六大类，并且把对应的字段绑定到分类中，并且取近三年的业务数据。\n输出的格式为：每一个大类的平均值和当前用户的数值、每个值的前%，返回一个固定格式的json。' },
  { k: 'superior', icon: 'trending-up', title: '（三）强于/弱于组内多数的提示词', side: '阈值 50% 分位', gen: '请以组内 50% 分位为界，把六大类分为两组：分位高于 50% 的归入「强于组内多数」，低于 50% 的归入「弱于组内多数」。\n输出的格式为：{"hi":["类别1","类别2"],"lo":["类别3"]}，并对每一类给出组内分位数值。' },
  { k: 'bench', icon: 'award', title: '（四）组内标杆参考', side: '匿名 · 不出现姓名', gen: '请从组内找出分位最高的 1 个维度，形成「组内标杆参考」文字；再指出我与之接近或低于中位的维度。\n要求：全程匿名，不出现他人姓名、分项得分与档案原文，只给分位区间与强弱项。' },
  { k: 'ai', icon: 'sparkles', title: '（五）同辈 AI 分析', side: '数据陈述 · 附口径', gen: '请基于同辈对标的取数结果写一段分析：先说明圈定条件与组内人数，再给出综合分位与六类分位，最后指出与组内中位差距最大的两个维度。\n要求：只做数据陈述，不使用定性评价词；每个数字都能指回具体档案域。' }
];
// 输出格式配置「模拟测试用户」下拉候选（演示样本，暂无教师取数接口）
export const PE_TEST_USERS = [
  { name: '张伟', subject: '数学' },
  { name: '李静', subject: '语文' },
  { name: '王强', subject: '英语' }
];

/* ============ 试算与校验 trial ============ */
export const SRC_INFO = { A: 'A 档案自动提取', AB: 'A+B 自动+确认', B: 'B 人工选择', C: 'C 人工填写', D: 'D 学校提供', E: 'E 人工评审', SUM: 'SUM 汇总栏' };
export const SRC_CLS = { A: 'A', 'A+B': 'AB', B: 'B', C: 'C', D: 'D', E: 'E', SUM: 'SUM' };
export const TRIAL = { total: 122.6, base: 90, add: 32.6, rows: [
  { no: 1, name: '思想政治素质和职业道德', src: 'AB', val: '年度考核优秀 2 次 + 综合荣誉 1 项（待确认）', base: 10, add: 7, ok: '数' },
  { no: 2, name: '任职资格', src: 'A', val: '二级教师满 4 年（要求 2 年，超出 2 年）', base: 10, add: 8, ok: '数' },
  { no: 3, name: '教学工作', src: 'A', val: '毕业班 1 届 · 赛课区级二等奖 ×3', base: 30, add: 1, ok: '数' },
  { no: 4, name: '教育与管理', src: 'AB', val: '班主任 5 年 · 年级组长 · 区级表彰 2 项', base: 20, add: 11.6, ok: '数' },
  { no: 5, name: '公开课', src: 'A', val: '校级以上 20 次（区 4 / 省 1）', base: 10, add: 5, ok: '数' },
  { no: 6, name: '论文、教科研项目', src: 'A', val: '课题 2 项在研 · 论文 0 篇', base: 10, add: 0, ok: '差' },
  { no: 7, name: '专业荣誉', src: 'A', val: '无骨干称号', base: 0, add: 0, ok: '差' }
] };

/* ============ 数据质量看板 quality ============ */
export const QDATA = [
  { domain: '基本情况', n: 1, cov: 92, aff: '第 2 项 任职资格', tip: '—' },
  { domain: '综合表彰（学科类）', n: 3, cov: 100, aff: '第 1 项 师德 / 第 4 项 表彰', tip: '含 2021、2023 年度考核优秀' },
  { domain: '综合表彰（德育类）', n: 2, cov: 100, aff: '第 1 项 / 第 4 项', tip: '区级 2 项' },
  { domain: '班主任工作经历', n: 3, cov: 100, aff: '第 4 项 教育与管理', tip: '2025 年度 5 年' },
  { domain: '公开课（学科类）', n: 20, cov: 100, aff: '第 5 项 公开课', tip: '区级 4 / 校级 15 / 省级 1' },
  { domain: '讲座', n: 1, cov: 100, aff: '第 5 项', tip: '校级 1 条' },
  { domain: '规划课题或项目研究', n: 2, cov: 100, aff: '第 6 项', tip: '⚠ 均在研、无结项' },
  { domain: '论文发表（学科/德育）', n: 0, cov: 0, aff: '第 6 项', tip: '⚠ 空域 → 档案缺失型差距' },
  { domain: '论文/案例获奖（学科/德育）', n: 0, cov: 0, aff: '第 6 项', tip: '⚠ 空域 → 档案缺失型差距' },
  { domain: '论著出版', n: 0, cov: 0, aff: '第 6 项', tip: '⚠ 空域' },
  { domain: '骨干教师荣誉', n: 0, cov: 0, aff: '第 7 项 专业荣誉', tip: '⚠ 无称号 → 无法取分' },
  { domain: '指导青年教师', n: 2, cov: 100, aff: '加分（若有）', tip: '学科 1 + 德育 1' }
];

/* ============ 发展大事件管理 events ============ */
export const EV_NOW = '2026-10';
export const EV_CATS = ['评选·比赛', '论文·叙事', '课题', '研修·事务'];
export const EV_CAT_CLS = { '评选·比赛': 'ok', '论文·叙事': 'bl', '课题': 'wt', '研修·事务': 'mut' };
export const EV_YEARS = ['2026—2027 学年', '2025—2026 学年', '2027—2028 学年'];
export const EVENTS = [
  { t: '市、区教育叙事信息收集与申报统计', ym: '2026-09', cat: '论文·叙事', yr: '2026—2027 学年', d: '' },
  { t: '市优秀青年教师评选工作', ym: '2026-09', cat: '评选·比赛', yr: '2026—2027 学年', d: '' },
  { t: '常态好课选手推选工作', ym: '2026-10', cat: '评选·比赛', yr: '2026—2027 学年', d: '各学科推选 1—2 名选手参加校级常态好课展示' },
  { t: '“行知杯”比赛的计划制定及申报工作', ym: '2026-11', cat: '评选·比赛', yr: '2026—2027 学年', d: '' },
  { t: '“行知杯”比赛预、决赛', ym: '2026-12', cat: '评选·比赛', yr: '2026—2027 学年', d: '' },
  { t: '骨干教师考核相关工作', ym: '2026-12', cat: '评选·比赛', yr: '2026—2027 学年', d: '' },
  { t: '区教坛新秀等推选工作', ym: '2026-12', cat: '评选·比赛', yr: '2026—2027 学年', d: '' },
  { t: '青优、带头人评选相关工作', ym: '2027-05', cat: '评选·比赛', yr: '2026—2027 学年', d: '' },
  { t: '师陶杯论文评比', ym: '2027-05', cat: '论文·叙事', yr: '2026—2027 学年', d: '' },
  { t: '南京市、玄武杯教育叙事论文征集', ym: '2027-07', cat: '论文·叙事', yr: '2026—2027 学年', d: '' }
];

/* ============ 知识库文件 ai-kb ============ */
export const FL_CATS = { 小岗位: 'src-B', 职称: 'src-C', '骨干称号 · 学科线': 'src-D', '骨干称号 · 德育线': 'src-D' };
export const FILES = [
  { n: '教师岗位基本任职条件评分细则（11级）', cat: '小岗位', lv: '校标', ver: '2026 年度', st: 'cur' },
  { n: '教师岗位基本任职条件评分细则（9级）', cat: '小岗位', lv: '校标', ver: '2026 年度', st: 'cur' },
  { n: '教师岗位基本任职条件评分细则（8级）', cat: '小岗位', lv: '校标', ver: '2026 年度', st: 'cur' },
  { n: '教师岗位基本任职条件评分细则（十级 / 七级）', cat: '小岗位', lv: '校标', ver: '—', st: 'miss' },
  { n: '玄武区中小学教师系列五级教师评比细则', cat: '小岗位', lv: '区标', ver: '2023 版', st: 'cur' },
  { n: '一级教师岗位任职条件评分细则（2026、2027 过渡版定稿）', cat: '职称', lv: '校标', ver: '2026、2027 过渡版', st: 'cur' },
  { n: '高级教师岗位任职条件评分细则定稿', cat: '职称', lv: '校标', ver: '2026、2027 过渡版', st: 'cur' },
  { n: '玄教〔2025〕30 号 · 第十届玄武区优秀青年教师评选通知', cat: '骨干称号 · 学科线', lv: '区标', ver: '第十届', st: 'cur' },
  { n: '区青优推荐材料评审量化评分表（200 分制）', cat: '骨干称号 · 学科线', lv: '区标', ver: '2025 定稿', st: 'cur' },
  { n: '玄武区学科带头人评选办法', cat: '骨干称号 · 学科线', lv: '区标', ver: '届次待补', st: 'wait' },
  { n: '玄武区德育优青评选办法', cat: '骨干称号 · 德育线', lv: '区标', ver: '届次待补', st: 'wait' }
];

/* ============ 提示词配置 ai-prompt ============ */
export const AI_PROMPTS = [
  { k: 'sys', n: '系统提示词', use: '人设与边界：助手是谁、只解释什么、不做什么', ver: 'v1.0', at: '2026-10-06 19:40', hint: '与教师端组件同源。{{pageName}} 由前端按当前页注入。', text: '你是南京市第十三中学「教师发展平台」的助理解释器，当前页面：{{pageName}}。\n你只解释规则口径与页面机制：不裁决资格、不改分数、不出具评审结论、不编造页面中不存在的数据。\n资格判定由规则引擎按标准细则逐条执行，不走模型。\n六维分口径：单项积分 = 级别权重 × 角色系数 × 时效系数；维度分 = 维度积分 ÷ 基准分 × 100（演示口径）。\n用简体中文回答，控制在 120 字以内。' },
  { k: 'intent', n: '意图识别提示词', use: '判「查数据 / 问规则 / 找功能 / 其他」；功能类直接返回跳转引导', ver: 'v1.0', at: '2026-10-07 21:10', hint: '按概要设计 8.1.6 第一步起草。置信度不足时不猜，转入澄清提问。', text: '判断教师问题属于哪一类，只输出 JSON，不要输出任何解释文字：\n- data   查数据\n- rule   问规则\n- nav    找功能\n- other  闲聊或超出平台范围\n\n输出：{"intent":"data|rule|nav|other","navTarget":"页面名或空字符串","confidence":0.0}\n\n规则：置信度低于 0.6 一律按 other 处理并转入澄清提问；不得为了给出答案而猜测意图。' },
  { k: 'extract', n: '参数抽取提示词', use: '查数据时输出结构化参数 JSON，字段名与校端接口 schema 一一对应', ver: 'v1.0', at: '2026-10-07 21:10', hint: '纯提示词 + 前端解析，不依赖工具调用；解析失败即回退澄清。', text: '仅当意图为 data 时执行。把问题转成接口参数，字段名必须与校端接口 schema 完全一致，不得新增或改写字段。\n\n只输出 JSON，不要输出解释文字：\n{"queryType":"self|list","businessStartTime":"YYYY-MM-DD","filters":{"gender":"男","subject":"地理","title":"高级"}}\n\n规则：filters 只能取 schema 允许的字段；取不到就留空，不得凭猜测填写。' },
  { k: 'answer', n: '结构化回答提示词', use: '把接口返回 JSON 解读为数据陈述 + 口径；图表由前端渲染', ver: 'v1.0', at: '2026-10-07 21:10', hint: '模型只做解读，不拼 SQL、不直连数据库。', text: '把接口返回的 JSON 解读给教师看，遵守以下约束：\n- 只陈述数据，不下结论；\n- 每个数字后面附口径：时间范围、样本量、数据时点；\n- 空值显式说明，不得跳过、不得按 0 分处理；\n- 涉及他人数据时只给聚合结果，不出现他人姓名；\n- 不裁决资格、不给排名、不出具评审结论。\n\n输出格式：[数据陈述 1—2 句] + [口径]' }
];

/* ============ 参数配置 ai-param ============ */
export const AP_DEF = { model: '火山引擎（默认）', refuse: 'strict', temp: 0.3, ctx: 8, max: 1024, topk: 5 };
export const AP_REFUSE = { strict: '严格：无命中即明确拒答并给替代路径', soft: '宽松：允许通用知识作答，须标注「非本平台口径」', off: '不拒答（不推荐）' };

/* ============ 对话审计与用量 ai-audit ============ */
export const AI_AUDIT = [
  { t: '2026-10-07 14:22', role: '教师', q: '我的职称还差什么？', a: '按「一级教师」（2026—2027 过渡版 · 校级标准）：二级教师受聘已满 4 年，1 项待确认；材料分最大缺口在论文论著。', hit: '档案接口 · 个人档案明细', ms: 820, ti: 186, to: 214, sid: 'S-a41f', jump: '' },
  { t: '2026-10-07 14:25', role: '教师', q: '论文评比怎么安排', a: '本学年与论文相关的评比安排：5 月有师陶杯、黄浦杯论文评比；7 月有南京市、玄武杯教育叙事论文征集。', hit: '知识库 · 教科室工作安排（2026—2027 学年）', ms: 640, ti: 142, to: 238, sid: 'S-a41f', jump: '' },
  { t: '2026-10-07 14:31', role: '教师', q: '我想看看我的成长愿景', a: '该问题请到「成长愿景」页查看，已为你打开入口。', hit: '意图路由（不查数据）', ms: 180, ti: 96, to: 42, sid: 'S-a41f', jump: '成长愿景' },
  { t: '2026-10-07 15:02', role: '教研备课组长', q: '地理组骨干教师占比多少', a: '地理组骨干教师 4 人，占 15 人的 26.7%；全校参照线 46.9%。数据时点 2026-09-28 00:55。', hit: '档案接口 · 教师档案明细列表', ms: 1240, ti: 214, to: 326, sid: 'S-b8c2', jump: '' },
  { t: '2026-10-07 15:20', role: '校领导', q: '骨干教师占比多少', a: '骨干教师 112 人，占在职 239 人的 46.9%。数据时点 2026-09-28 00:55。', hit: '档案接口 · 教师档案明细列表', ms: 1080, ti: 168, to: 196, sid: 'S-c07d', jump: '' },
  { t: '2026-10-07 15:41', role: '教师', q: '帮我预测一下今年能不能评上', a: '评审结论由学校评审组按标准作出，本平台不出具评审结论。可到「校级评选」页查看评选安排与材料要求。', hit: '拒答策略（超出平台范围）', ms: 260, ti: 88, to: 96, sid: 'S-a41f', jump: '校级评选' },
  { t: '2026-10-07 16:04', role: '系统管理员', q: '知识库里有哪些标准文件', a: '标准文件 11 份（现行 8 · 待补 2 · 文件缺失 1），覆盖小岗位、职称、骨干称号三条线；历史归档 4 份不纳入引用范围。', hit: '知识库 · 标准库（2026 年度现行版）', ms: 520, ti: 124, to: 158, sid: 'S-d31a', jump: '' }
];
export const AI_AUDIT_DEL = 2;
